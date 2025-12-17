#!/usr/bin/env bun
/**
 * Fetch admission statistics (수시) from adiga.kr for all universities.
 *
 * Usage:
 *   bun scripts/adiga-susi/fetch.ts [options]
 *
 * Options:
 *   --dry-run           Parse and show results without saving to DB
 *   --university <name> Process single university by name
 *   --delay <ms>        Delay between requests in ms (default: 1000)
 *   --help              Show this help message
 */

import { config } from "dotenv";
config({ path: ".env" });

import { db } from "@/lib/db";
import { university, admissionStatistic } from "@/lib/db/schema";
import { and, eq, isNotNull } from "drizzle-orm";
import { nanoid } from "nanoid";
import { ADIGA_CONFIG } from "./config";
import { parseAdmissionHtml, printSummary, type AdmissionRecord } from "./parse-html";

// Parse CLI arguments
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const helpFlag = args.includes("--help");
const universityIndex = args.indexOf("--university");
const universityFilter = universityIndex !== -1 ? args[universityIndex + 1] : null;
const delayIndex = args.indexOf("--delay");
const delay = delayIndex !== -1 ? parseInt(args[delayIndex + 1], 10) : 1000;

function printHelp(): void {
  console.log(`
Fetch admission statistics (수시) from adiga.kr for all universities.

Usage:
  bun scripts/adiga-susi/fetch.ts [options]

Options:
  --dry-run           Parse and show results without saving to DB
  --university <name> Process single university by name
  --delay <ms>        Delay between requests in ms (default: 1000)
  --help              Show this help message

Examples:
  bun scripts/adiga-susi/fetch.ts --dry-run
  bun scripts/adiga-susi/fetch.ts --university "서울대학교"
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

async function saveRecords(
  universityId: string,
  records: AdmissionRecord[]
): Promise<{ inserted: number; skipped: number }> {
  let inserted = 0;
  let skipped = 0;
  const now = new Date();

  for (const record of records) {
    try {
      const result = await db
        .insert(admissionStatistic)
        .values({
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
        })
        .onConflictDoNothing();

      // Check if row was actually inserted (rowCount is 1 if inserted, 0 if skipped)
      if (result.rowCount && result.rowCount > 0) {
        inserted++;
      } else {
        skipped++;
      }
    } catch (error) {
      // Handle unique constraint violation as skip
      skipped++;
    }
  }

  return { inserted, skipped };
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main(): Promise<void> {
  if (helpFlag) {
    printHelp();
    process.exit(0);
  }

  console.log("=== Adiga.kr 수시 Admission Data Fetcher ===\n");

  if (dryRun) {
    console.log("** DRY RUN MODE - No data will be saved **\n");
  }

  // Fetch universities with adigaCode
  let query = db
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
  let totalSkipped = 0;
  let totalRecords = 0;

  for (let i = 0; i < filteredUniversities.length; i++) {
    const univ = filteredUniversities[i];
    console.log(
      `[${i + 1}/${filteredUniversities.length}] Processing: ${univ.name} (code: ${univ.adigaCode})`
    );

    try {
      // Fetch HTML data
      const html = await fetchAdmissionData(univ.adigaCode!);

      // Parse records
      const records = parseAdmissionHtml(html);
      console.log(`  Parsed ${records.length} records`);

      if (records.length > 0) {
        totalRecords += records.length;

        if (dryRun) {
          // Just print summary in dry run mode
          const byType: Record<string, number> = {};
          for (const r of records) {
            byType[r.admissionType] = (byType[r.admissionType] || 0) + 1;
          }
          for (const [type, count] of Object.entries(byType)) {
            console.log(`    - ${type}: ${count}`);
          }
        } else {
          // Save to database
          const { inserted, skipped } = await saveRecords(univ.id, records);
          console.log(`  Inserted: ${inserted}, Skipped (duplicates): ${skipped}`);
          totalInserted += inserted;
          totalSkipped += skipped;
        }
      }

      // Delay before next request (except for last one)
      if (i < filteredUniversities.length - 1) {
        await sleep(delay);
      }
    } catch (error) {
      console.error(`  Error: ${error instanceof Error ? error.message : error}`);
    }
  }

  // Final summary
  console.log("\n=== Final Summary ===");
  console.log(`Universities processed: ${filteredUniversities.length}`);
  console.log(`Total records parsed: ${totalRecords}`);
  if (!dryRun) {
    console.log(`Total inserted: ${totalInserted}`);
    console.log(`Total skipped (duplicates): ${totalSkipped}`);
  }
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
