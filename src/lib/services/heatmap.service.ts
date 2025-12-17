import { heatmapRepository } from "@/lib/repositories/heatmap.repository";
import type {
  HeatmapData,
  UniversityGroup,
  AdmissionTypeColumn,
  DepartmentEntry,
  ZoneColor,
  UniversityOption,
  AdmissionStatisticRow,
} from "@/lib/types/heatmap.types";
import { ZONE_COLORS } from "@/lib/types/heatmap.types";

/**
 * Calculate the color zone for a cell based on user's GPA vs cut values
 *
 * Zone logic:
 * - Safe (Indigo): GPA < cut_50 (user is better than 50th percentile)
 * - Target (Gray-Indigo): cut_50 <= GPA < cut_70
 * - Reach (Gray): GPA >= cut_70 (user is worse than 70th percentile)
 *
 * Within Safe zone, color intensity based on margin (cut_50 - GPA)
 */
export function calculateCellColor(
  userGPA: number,
  cut50: number | null,
  cut70: number | null
): ZoneColor {
  // No data case
  if (cut50 === null || cut70 === null) {
    return ZONE_COLORS.NO_DATA;
  }

  // Lower GPA is better (1등급 = best)
  if (userGPA < cut50) {
    // Safe zone - calculate margin
    const margin = cut50 - userGPA;

    if (margin >= 1.5) {
      return ZONE_COLORS.SAFE_DEEP;
    } else if (margin >= 1.0) {
      return ZONE_COLORS.SAFE_INDIGO;
    } else if (margin >= 0.5) {
      return ZONE_COLORS.SAFE_SOFT;
    } else {
      return ZONE_COLORS.SAFE_PALE;
    }
  } else if (userGPA < cut70) {
    // Target zone
    return ZONE_COLORS.TARGET;
  } else {
    // Reach zone - calculate distance above cut_70
    const distance = userGPA - cut70;

    if (distance <= 0.5) {
      return ZONE_COLORS.REACH_WARM;
    } else {
      return ZONE_COLORS.REACH_LIGHT;
    }
  }
}

/**
 * Transform raw database rows into grouped heatmap data
 * Structure: University > Admission Type > Departments
 */
function transformToHeatmapData(
  rows: AdmissionStatisticRow[],
  year: number
): HeatmapData {
  if (rows.length === 0) {
    return { universityGroups: [], year };
  }

  // Group by university, then by admission type
  const universityMap = new Map<
    string,
    {
      universityId: string;
      universityName: string;
      shortName: string | null;
      admissionTypes: Map<string, DepartmentEntry[]>;
    }
  >();

  for (const row of rows) {
    // Get or create university entry
    if (!universityMap.has(row.universityId)) {
      universityMap.set(row.universityId, {
        universityId: row.universityId,
        universityName: row.universityName,
        shortName: row.universityShortName,
        admissionTypes: new Map(),
      });
    }

    const university = universityMap.get(row.universityId)!;

    // Get or create admission type entry
    if (!university.admissionTypes.has(row.admissionType)) {
      university.admissionTypes.set(row.admissionType, []);
    }

    const cut50 = row.cut50 ? parseFloat(row.cut50) : null;
    const cut70 = row.cut70 ? parseFloat(row.cut70) : null;

    university.admissionTypes.get(row.admissionType)!.push({
      departmentName: row.departmentName,
      cut50,
      cut70,
      subjects: row.subjects,
    });
  }

  // Build university groups array
  const universityGroups: UniversityGroup[] = Array.from(universityMap.values()).map(
    (uni) => {
      // Build admission type columns
      const admissionTypes: AdmissionTypeColumn[] = Array.from(
        uni.admissionTypes.entries()
      ).map(([admissionType, departments]) => {
        // Sort departments by cut_50 (descending - higher cut first = more likely entry)
        // Higher cut value means less competitive, so user is more likely to get in
        const sortedDepartments = [...departments].sort((a, b) => {
          const aCut = a.cut50 ?? 0;
          const bCut = b.cut50 ?? 0;
          return bCut - aCut; // Descending order
        });

        return {
          admissionType,
          departments: sortedDepartments,
        };
      });

      // Sort admission types alphabetically
      admissionTypes.sort((a, b) =>
        a.admissionType.localeCompare(b.admissionType)
      );

      return {
        universityId: uni.universityId,
        universityName: uni.universityName,
        shortName: uni.shortName,
        admissionTypes,
      };
    }
  );

  // Sort university groups by name
  universityGroups.sort((a, b) => a.universityName.localeCompare(b.universityName));

  return { universityGroups, year };
}

export const heatmapService = {
  /**
   * Get heatmap data for the given universities and year
   */
  async getHeatmapData(
    universityIds: string[],
    year: number
  ): Promise<HeatmapData> {
    if (universityIds.length === 0) {
      return { universityGroups: [], year };
    }

    const statistics = await heatmapRepository.findStatisticsByUniversities(
      universityIds,
      year
    );

    return transformToHeatmapData(statistics, year);
  },

  /**
   * Get all active universities for the selector
   */
  async getActiveUniversities(): Promise<UniversityOption[]> {
    return heatmapRepository.findAllActiveUniversities();
  },

  /**
   * Get available years from the database
   */
  async getAvailableYears(): Promise<number[]> {
    return heatmapRepository.findAvailableYears();
  },

  /**
   * Calculate cell color based on user's GPA
   * Exported for use in components
   */
  calculateCellColor,
};
