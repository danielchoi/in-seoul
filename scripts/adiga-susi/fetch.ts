#!/usr/bin/env bun
/**
 * Fetch admission statistics (수시) from adiga.kr for all universities.
 * Interactive comparison-based flow for reviewing and saving data.
 *
 * Usage:
 *   bun scripts/adiga-susi/fetch.ts [options]
 *
 * Options:
 *   --university <name> Process single university by name
 *   --delay <ms>        Delay between requests in ms (default: 1000)
 *   --help              Show this help message
 */

import { config } from "dotenv";
config({ path: ".env" });

import * as readline from "readline";
import { db } from "@/lib/db";
import { university, admissionStatistic } from "@/lib/db/schema";
import { and, eq, isNotNull, inArray, count } from "drizzle-orm";
import { nanoid } from "nanoid";
import { ADIGA_CONFIG } from "./config";
import { parseAdmissionHtml, type AdmissionRecord } from "./parse-html";
import { parseWithRetry as parseWithLLM } from "./parse-llm";

// Parse CLI arguments
const args = process.argv.slice(2);
const helpFlag = args.includes("--help");
const universityIndex = args.indexOf("--university");
const universityFilter = universityIndex !== -1 ? args[universityIndex + 1] : null;
const delayIndex = args.indexOf("--delay");
const delay = delayIndex !== -1 ? parseInt(args[delayIndex + 1] ?? "1000", 10) : 1000;

// Readline interface for user input
let rl: readline.Interface | null = null;

function createReadline(): readline.Interface {
  if (!rl) {
    rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }
  return rl;
}

function closeReadline(): void {
  if (rl) {
    rl.close();
    rl = null;
  }
}

async function prompt(question: string): Promise<string> {
  const reader = createReadline();
  return new Promise((resolve) => {
    reader.question(question, (answer) => {
      resolve(answer.trim().toLowerCase());
    });
  });
}

function printHelp(): void {
  console.log(`
Fetch admission statistics (수시) from adiga.kr for all universities.
Interactive comparison-based flow for reviewing and saving data.

Usage:
  bun scripts/adiga-susi/fetch.ts [options]

Options:
  --university <name> Process single university by name
  --delay <ms>        Delay between requests in ms (default: 1000)
  --help              Show this help message

Examples:
  bun scripts/adiga-susi/fetch.ts
  bun scripts/adiga-susi/fetch.ts --university "경희대"
  bun scripts/adiga-susi/fetch.ts --delay 2000
`);
}

async function fetchAdmissionData(adigaCode: string): Promise<string> {
  const formData = new URLSearchParams({
    _csrf: ADIGA_CONFIG.csrfToken,
    ...ADIGA_CONFIG.formParams,
    unvCd: adigaCode,
  });

  const response = await fetch(ADIGA_CONFIG.endpoint, {
    method: "POST",
    headers: {
      ...ADIGA_CONFIG.headers,
      Cookie: ADIGA_CONFIG.cookies,
      "X-CSRF-TOKEN": ADIGA_CONFIG.csrfToken,
    },
    body: formData.toString(),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.text();
}

interface TypeStats {
  admissionType: string;
  count: number;
}

async function getDbStats(
  universityId: string,
  years: number[]
): Promise<TypeStats[]> {
  const result = await db
    .select({
      admissionType: admissionStatistic.admissionType,
      count: count(),
    })
    .from(admissionStatistic)
    .where(
      and(
        eq(admissionStatistic.universityId, universityId),
        inArray(admissionStatistic.year, years)
      )
    )
    .groupBy(admissionStatistic.admissionType)
    .orderBy(admissionStatistic.admissionType);

  return result.map((r) => ({
    admissionType: r.admissionType,
    count: Number(r.count),
  }));
}

function getParsedStats(records: AdmissionRecord[]): TypeStats[] {
  const byType: Record<string, number> = {};
  for (const r of records) {
    const type = r.admissionType || "(empty)";
    byType[type] = (byType[type] || 0) + 1;
  }

  return Object.entries(byType)
    .map(([admissionType, count]) => ({ admissionType, count }))
    .sort((a, b) => a.admissionType.localeCompare(b.admissionType));
}

function printComparison(dbStats: TypeStats[], parsedStats: TypeStats[]): void {
  const dbTotal = dbStats.reduce((sum, s) => sum + s.count, 0);
  const parsedTotal = parsedStats.reduce((sum, s) => sum + s.count, 0);

  console.log("\n  ┌─────────────────────────────────────────────────────────────────┐");
  console.log("  │                    COMPARISON: DB vs PARSED                     │");
  console.log("  ├─────────────────────────────────────────────────────────────────┤");

  // Print DB stats
  console.log(`  │ 📦 DATABASE (${dbStats.length} types, ${dbTotal} records):`);
  if (dbStats.length === 0) {
    console.log("  │    (empty)");
  } else {
    for (const s of dbStats) {
      console.log(`  │    - ${s.admissionType}: ${s.count}`);
    }
  }

  console.log("  │");

  // Print Parsed stats
  console.log(`  │ 📝 PARSED (${parsedStats.length} types, ${parsedTotal} records):`);
  if (parsedStats.length === 0) {
    console.log("  │    (empty)");
  } else {
    for (const s of parsedStats) {
      console.log(`  │    - ${s.admissionType}: ${s.count}`);
    }
  }

  console.log("  └─────────────────────────────────────────────────────────────────┘");
}

async function deleteExistingRecords(
  universityId: string,
  years: number[]
): Promise<number> {
  const result = await db
    .delete(admissionStatistic)
    .where(
      and(
        eq(admissionStatistic.universityId, universityId),
        inArray(admissionStatistic.year, years)
      )
    );
  return (result as unknown as { rowCount: number }).rowCount;
}

async function saveRecords(
  universityId: string,
  records: AdmissionRecord[]
): Promise<{ inserted: number; deleted: number }> {
  const now = new Date();

  // Get unique years from records
  const years = [...new Set(records.map((r) => r.year))];

  // Delete existing records for this university + years (replace strategy)
  const deleted = await deleteExistingRecords(universityId, years);

  // Insert all new records
  const values = records.map((record) => ({
    id: nanoid(),
    universityId,
    departmentName: record.departmentName,
    admissionType: record.admissionType,
    year: record.year,
    quota: record.quota,
    competitionRate: record.competitionRate?.toString() ?? null,
    waitlistRank: record.waitlistRank,
    cut50: record.cut50,
    cut70: record.cut70,
    subjects: record.subjects,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  }));

  await db.insert(admissionStatistic).values(values);

  return { inserted: records.length, deleted };
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

type Action = "save" | "llm" | "skip" | "quit";

async function askAction(afterLLM: boolean = false): Promise<Action> {
  const options = afterLLM
    ? "[S]ave / [N]ext / [Q]uit"
    : "[S]ave parsed / [L]LM parse / [N]ext / [Q]uit";

  const answer = await prompt(`\n  ${options}: `);

  switch (answer) {
    case "s":
    case "save":
      return "save";
    case "l":
    case "llm":
      return afterLLM ? "skip" : "llm"; // L not valid after LLM
    case "n":
    case "next":
    case "skip":
      return "skip";
    case "q":
    case "quit":
    case "exit":
      return "quit";
    default:
      console.log("  Invalid option. Please try again.");
      return askAction(afterLLM);
  }
}

async function main(): Promise<void> {
  if (helpFlag) {
    printHelp();
    process.exit(0);
  }

  console.log("=== Adiga.kr 수시 Admission Data Fetcher ===");
  console.log("Interactive mode - review each university before saving\n");

  // Fetch universities with adigaCode
  const query = db
    .select()
    .from(university)
    .where(and(isNotNull(university.adigaCode), eq(university.isActive, true)));

  const universities = await query;

  // Filter by name if specified
  const filteredUniversities = universityFilter
    ? universities.filter((u) => u.name.includes(universityFilter))
    : universities;

  if (filteredUniversities.length === 0) {
    console.log("No universities found with adigaCode.");
    if (universityFilter) {
      console.log(`Filter: "${universityFilter}"`);
    }
    process.exit(1);
  }

  console.log(`Found ${filteredUniversities.length} universities to process.`);
  console.log(`Delay between requests: ${delay}ms\n`);

  let totalInserted = 0;
  let totalDeleted = 0;
  let totalSkipped = 0;

  try {
    for (let i = 0; i < filteredUniversities.length; i++) {
      const univ = filteredUniversities[i]!;
      console.log(
        `\n[${"=".repeat(60)}]`
      );
      console.log(
        `[${i + 1}/${filteredUniversities.length}] ${univ.name} (code: ${univ.adigaCode})`
      );
      console.log(`[${"=".repeat(60)}]`);

      try {
        // Fetch HTML data
        console.log("  Fetching data from adiga.kr...");
        const html = await fetchAdmissionData(univ.adigaCode!);

        // Parse with rule-based parser
        console.log("  Parsing with rule-based parser...");
        let records = parseAdmissionHtml(html);
        let usedLLM = false;

        // Get stats
        const years = [...new Set(records.map((r) => r.year))];
        const dbStats = await getDbStats(univ.id, years.length > 0 ? years : [2025]);
        const parsedStats = getParsedStats(records);

        // Show comparison
        printComparison(dbStats, parsedStats);

        // Ask user what to do
        let action = await askAction(false);

        // Handle LLM request
        if (action === "llm") {
          console.log("\n  Running LLM parser (this may take a moment)...");
          records = await parseWithLLM(html, { universityName: univ.name });
          usedLLM = true;

          // Show updated stats
          const llmStats = getParsedStats(records);
          console.log("\n  📊 LLM RESULT:");
          console.log(`     ${llmStats.length} types, ${records.length} records`);
          for (const s of llmStats) {
            console.log(`     - ${s.admissionType}: ${s.count}`);
          }

          // Ask again
          action = await askAction(true);
        }

        // Handle action
        if (action === "quit") {
          console.log("\n  Quitting...");
          break;
        }

        if (action === "skip") {
          console.log(`  ⏭️  Skipped ${univ.name}`);
          totalSkipped++;
          continue;
        }

        if (action === "save") {
          const label = usedLLM ? "LLM" : "rule-based";
          const { inserted, deleted } = await saveRecords(univ.id, records);
          console.log(`  ✅ Saved ${inserted} records (deleted ${deleted} old) [${label}]`);
          totalInserted += inserted;
          totalDeleted += deleted;
        }

        // Delay before next request (except for last one)
        if (i < filteredUniversities.length - 1) {
          await sleep(delay);
        }
      } catch (error) {
        console.error(`  ❌ Error: ${error instanceof Error ? error.message : error}`);
        const answer = await prompt("  Continue to next? [Y/n]: ");
        if (answer === "n" || answer === "no") {
          break;
        }
      }
    }
  } finally {
    closeReadline();
  }

  // Final summary
  console.log("\n" + "=".repeat(60));
  console.log("                    FINAL SUMMARY");
  console.log("=".repeat(60));
  console.log(`Universities processed: ${filteredUniversities.length}`);
  console.log(`Total inserted: ${totalInserted}`);
  console.log(`Total deleted: ${totalDeleted}`);
  console.log(`Total skipped: ${totalSkipped}`);
}

main().catch((error) => {
  closeReadline();
  console.error("Fatal error:", error);
  process.exit(1);
});
