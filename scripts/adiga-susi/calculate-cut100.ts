#!/usr/bin/env bun
/**
 * Calculate and populate cut100 (estimated 100th percentile) for admission statistics.
 *
 * Formula:
 *   cut100 = cut70 + (spread * baseMultiplier * compFactor * waitlistFactor)
 *
 * Where:
 *   - spread = cut70 - cut50
 *   - baseMultiplier = 0.8 (tail compression factor)
 *   - compFactor = based on relative competition vs school average (5 levels)
 *   - waitlistFactor = 1 + (waitlistRatio * 0.1)
 *
 * Usage:
 *   bun scripts/adiga-susi/calculate-cut100.ts [options]
 *
 * Options:
 *   --dry-run           Calculate and show results without saving to DB
 *   --university <name> Process single university by name
 *   --help              Show this help message
 */

import { config } from "dotenv";
config({ path: ".env" });

import { db } from "@/lib/db";
import { university, admissionStatistic } from "@/lib/db/schema";
import { eq, isNotNull, and, avg } from "drizzle-orm";

// ============================================================================
// Configuration - Adjust these values to tune the estimation
// ============================================================================

const CONFIG = {
  // Base multiplier: tail typically compresses (< 1.0) rather than extends linearly
  baseMultiplier: 0.8,

  // Competition factor thresholds (relative to school average)
  // Higher competition = tighter tail (lower factor)
  compFactorLevels: [
    { threshold: 1.5, factor: 0.85 },   // much higher than avg → very tight
    { threshold: 1.25, factor: 0.90 },  // higher than avg → tight
    { threshold: 0.80, factor: 1.00 },  // around avg → normal
    { threshold: 0.50, factor: 1.10 },  // lower than avg → wider
    { threshold: 0, factor: 1.15 },     // much lower than avg → very wide
  ],

  // Waitlist factor coefficient
  // waitlistFactor = 1 + (waitlistRatio * coefficient)
  // Higher waitlist movement = extended tail
  waitlistCoefficient: 0.1,
  waitlistRatioCap: 3, // Cap waitlist ratio at 3x quota
};

// ============================================================================
// CLI Arguments
// ============================================================================

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const helpFlag = args.includes("--help");
const universityIndex = args.indexOf("--university");
const universityFilter = universityIndex !== -1 ? args[universityIndex + 1] : null;

function printHelp(): void {
  console.log(`
Calculate and populate cut100 (estimated 100th percentile) for admission statistics.

Usage:
  bun scripts/adiga-susi/calculate-cut100.ts [options]

Options:
  --dry-run           Calculate and show results without saving to DB
  --university <name> Process single university by name
  --help              Show this help message

Examples:
  bun scripts/adiga-susi/calculate-cut100.ts --dry-run
  bun scripts/adiga-susi/calculate-cut100.ts --university "서울대학교"
  bun scripts/adiga-susi/calculate-cut100.ts

Configuration (edit CONFIG in script):
  baseMultiplier: ${CONFIG.baseMultiplier}
  waitlistCoefficient: ${CONFIG.waitlistCoefficient}
  waitlistRatioCap: ${CONFIG.waitlistRatioCap}
`);
}

// ============================================================================
// Core Calculation Logic
// ============================================================================

function getCompFactor(relativeComp: number): number {
  for (const level of CONFIG.compFactorLevels) {
    if (relativeComp > level.threshold) {
      return level.factor;
    }
  }
  return CONFIG.compFactorLevels[CONFIG.compFactorLevels.length - 1]!.factor;
}

interface CalculationInput {
  cut50: number;
  cut70: number;
  competitionRate: number | null;
  quota: number | null;
  waitlistRank: number | null;
  schoolAvgCompetition: number;
}

interface CalculationResult {
  cut100: number;
  details: {
    spread: number;
    relativeComp: number;
    compFactor: number;
    waitlistRatio: number;
    waitlistFactor: number;
  };
}

function calculateCut100(input: CalculationInput): CalculationResult {
  const { cut50, cut70, competitionRate, quota, waitlistRank, schoolAvgCompetition } = input;

  const spread = cut70 - cut50;

  // Relative competition: compare to school average
  const comp = competitionRate ?? schoolAvgCompetition;
  const relativeComp = schoolAvgCompetition > 0 ? comp / schoolAvgCompetition : 1;

  // Competition factor (5 levels)
  const compFactor = getCompFactor(relativeComp);

  // Waitlist factor
  const safeQuota = Math.max(quota ?? 1, 1);
  const waitlistRatio = Math.min((waitlistRank ?? 0) / safeQuota, CONFIG.waitlistRatioCap);
  const waitlistFactor = 1 + waitlistRatio * CONFIG.waitlistCoefficient;

  // Final calculation
  const cut100 = cut70 + spread * CONFIG.baseMultiplier * compFactor * waitlistFactor;

  return {
    cut100: Math.round(cut100 * 100) / 100, // Round to 2 decimal places
    details: {
      spread,
      relativeComp: Math.round(relativeComp * 100) / 100,
      compFactor,
      waitlistRatio: Math.round(waitlistRatio * 100) / 100,
      waitlistFactor: Math.round(waitlistFactor * 100) / 100,
    },
  };
}

// ============================================================================
// Database Operations
// ============================================================================

async function getSchoolAvgCompetition(universityId: string): Promise<number> {
  const result = await db
    .select({ avg: avg(admissionStatistic.competitionRate) })
    .from(admissionStatistic)
    .where(
      and(
        eq(admissionStatistic.universityId, universityId),
        isNotNull(admissionStatistic.competitionRate)
      )
    );

  return parseFloat(result[0]?.avg ?? "5") || 5; // Default to 5 if no data
}

async function updateCut100(id: string, cut100: number): Promise<void> {
  await db
    .update(admissionStatistic)
    .set({
      cut100: cut100.toString(),
      updatedAt: new Date(),
    })
    .where(eq(admissionStatistic.id, id));
}

// ============================================================================
// Main
// ============================================================================

async function main(): Promise<void> {
  if (helpFlag) {
    printHelp();
    process.exit(0);
  }

  console.log("=== Cut100 Calculator ===\n");

  if (dryRun) {
    console.log("** DRY RUN MODE - No data will be saved **\n");
  }

  // Fetch universities
  const universities = await db.select().from(university).where(eq(university.isActive, true));

  // Filter by name if specified
  const filteredUniversities = universityFilter
    ? universities.filter((u) => u.name.includes(universityFilter))
    : universities;

  if (filteredUniversities.length === 0) {
    console.log("No universities found.");
    if (universityFilter) {
      console.log(`Filter: "${universityFilter}"`);
    }
    process.exit(1);
  }

  console.log(`Processing ${filteredUniversities.length} universities.\n`);

  let totalProcessed = 0;
  let totalUpdated = 0;
  let totalSkipped = 0;

  for (const univ of filteredUniversities) {
    console.log(`[${univ.name}]`);

    // Get school average competition
    const schoolAvgCompetition = await getSchoolAvgCompetition(univ.id);
    console.log(`  School avg competition: ${schoolAvgCompetition.toFixed(2)}`);

    // Fetch admission statistics with valid cut50 and cut70
    const stats = await db
      .select()
      .from(admissionStatistic)
      .where(
        and(
          eq(admissionStatistic.universityId, univ.id),
          isNotNull(admissionStatistic.cut50),
          isNotNull(admissionStatistic.cut70)
        )
      );

    if (stats.length === 0) {
      console.log("  No records with cut50 and cut70 found.\n");
      continue;
    }

    let updated = 0;
    let skipped = 0;

    for (const stat of stats) {
      const cut50 = parseFloat(stat.cut50!);
      const cut70 = parseFloat(stat.cut70!);

      // Skip if cut50 or cut70 is invalid
      if (isNaN(cut50) || isNaN(cut70) || cut50 <= 0 || cut70 <= 0) {
        skipped++;
        continue;
      }

      // Skip if cut70 < cut50 (invalid data)
      if (cut70 < cut50) {
        skipped++;
        continue;
      }

      const result = calculateCut100({
        cut50,
        cut70,
        competitionRate: stat.competitionRate ? parseFloat(stat.competitionRate) : null,
        quota: stat.quota,
        waitlistRank: stat.waitlistRank,
        schoolAvgCompetition,
      });

      if (dryRun) {
        // Show sample calculations (first 3 per university)
        if (updated < 3) {
          console.log(`  ${stat.departmentName} (${stat.admissionType}):`);
          console.log(`    cut50=${cut50}, cut70=${cut70} → cut100=${result.cut100}`);
          console.log(
            `    compFactor=${result.details.compFactor}, waitlistFactor=${result.details.waitlistFactor}`
          );
        }
      } else {
        await updateCut100(stat.id, result.cut100);
      }

      updated++;
    }

    console.log(`  Processed: ${updated}, Skipped: ${skipped}\n`);
    totalProcessed += stats.length;
    totalUpdated += updated;
    totalSkipped += skipped;
  }

  // Final summary
  console.log("=== Final Summary ===");
  console.log(`Universities processed: ${filteredUniversities.length}`);
  console.log(`Total records: ${totalProcessed}`);
  console.log(`Updated: ${totalUpdated}`);
  console.log(`Skipped (invalid data): ${totalSkipped}`);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
