import { db, Transaction } from "@/lib/db";
import { admissionStatistic, university } from "@/lib/db/schema";
import { eq, and, inArray, isNotNull, asc } from "drizzle-orm";
import type {
  AdmissionStatisticRow,
  UniversityOption,
} from "@/lib/types/heatmap.types";

export const heatmapRepository = {
  /**
   * Find admission statistics for given universities and year
   * Joins with university table for names
   */
  async findStatisticsByUniversities(
    universityIds: string[],
    year: number,
    tx?: Transaction
  ): Promise<AdmissionStatisticRow[]> {
    if (universityIds.length === 0) {
      return [];
    }

    const executor = tx ?? db;

    const results = await executor
      .select({
        id: admissionStatistic.id,
        universityId: admissionStatistic.universityId,
        universityName: university.name,
        universityShortName: university.shortName,
        departmentName: admissionStatistic.departmentName,
        admissionType: admissionStatistic.admissionType,
        year: admissionStatistic.year,
        cut50: admissionStatistic.cut50,
        cut70: admissionStatistic.cut70,
        cut100: admissionStatistic.cut100,
        subjects: admissionStatistic.subjects,
      })
      .from(admissionStatistic)
      .innerJoin(university, eq(admissionStatistic.universityId, university.id))
      .where(
        and(
          inArray(admissionStatistic.universityId, universityIds),
          eq(admissionStatistic.year, year),
          eq(admissionStatistic.isActive, true),
          eq(university.isActive, true),
          // Only include rows with cut data
          isNotNull(admissionStatistic.cut50),
          isNotNull(admissionStatistic.cut70)
        )
      )
      .orderBy(
        asc(university.name),
        asc(admissionStatistic.admissionType),
        asc(admissionStatistic.departmentName)
      );

    return results;
  },

  /**
   * Find all active universities for the dropdown selector
   */
  async findAllActiveUniversities(
    tx?: Transaction
  ): Promise<UniversityOption[]> {
    const executor = tx ?? db;

    const results = await executor
      .select({
        id: university.id,
        name: university.name,
        shortName: university.shortName,
      })
      .from(university)
      .where(eq(university.isActive, true))
      .orderBy(asc(university.name));

    return results;
  },

  /**
   * Get available years from admission statistics
   */
  async findAvailableYears(tx?: Transaction): Promise<number[]> {
    const executor = tx ?? db;

    const results = await executor
      .selectDistinct({ year: admissionStatistic.year })
      .from(admissionStatistic)
      .where(eq(admissionStatistic.isActive, true))
      .orderBy(admissionStatistic.year);

    return results.map((r) => r.year);
  },
};
