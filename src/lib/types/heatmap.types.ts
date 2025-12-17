/**
 * Type definitions for the 수시 (early admission) heatmap feature
 */

// ============================================================================
// Database Result Types
// ============================================================================

/**
 * Raw statistics from admission_statistic table joined with university
 */
export interface AdmissionStatisticRow {
  id: string;
  universityId: string;
  universityName: string;
  universityShortName: string | null;
  departmentName: string;
  admissionType: string;
  year: number;
  cut50: string | null; // NUMERIC comes as string from DB
  cut70: string | null;
  subjects: string | null;
}

/**
 * University for selector dropdown
 */
export interface UniversityOption {
  id: string;
  name: string;
  shortName: string | null;
}

// ============================================================================
// Heatmap Data Types (Column-based structure, grouped by university)
// ============================================================================

/**
 * Department entry within a sub-column
 * Each sub-column has its own list of departments, sorted by cut_50
 */
export interface DepartmentEntry {
  departmentName: string;
  cut50: number | null;
  cut70: number | null;
  subjects: string | null;
}

/**
 * Sub-column = Admission Type with its own department list
 */
export interface AdmissionTypeColumn {
  admissionType: string;
  departments: DepartmentEntry[]; // sorted by cut_50 (ascending)
}

/**
 * University group containing multiple admission type sub-columns
 */
export interface UniversityGroup {
  universityId: string;
  universityName: string;
  shortName: string | null;
  admissionTypes: AdmissionTypeColumn[];
}

/**
 * Complete heatmap data structure
 * Array of university groups, each containing admission type sub-columns
 */
export interface HeatmapData {
  universityGroups: UniversityGroup[];
  year: number;
}

// ============================================================================
// Color Zone Types
// ============================================================================

/**
 * Zone classification based on user's GPA vs cut values
 */
export type ZoneType = "safe" | "target" | "reach";

/**
 * Color information for a cell
 */
export interface ZoneColor {
  zone: ZoneType;
  color: string; // background color HEX
  textColor: string; // text color for contrast
  label: string; // human-readable label
}

/**
 * Color definitions by zone and margin
 */
export const ZONE_COLORS = {
  // Safe zone (GPA < cut_50) - by margin
  SAFE_DEEP: {
    zone: "safe" as const,
    color: "#2E2F6F",
    textColor: "#FFFFFF",
    label: "Very Safe (margin ≥1.5)",
  },
  SAFE_INDIGO: {
    zone: "safe" as const,
    color: "#3C4A8A",
    textColor: "#FFFFFF",
    label: "Safe (margin ≥1.0)",
  },
  SAFE_SOFT: {
    zone: "safe" as const,
    color: "#5A6FA3",
    textColor: "#FFFFFF",
    label: "Likely Safe (margin ≥0.5)",
  },
  SAFE_PALE: {
    zone: "safe" as const,
    color: "#7F95B8",
    textColor: "#FFFFFF",
    label: "Just Safe (margin <0.5)",
  },

  // Target zone (cut_50 ≤ GPA < cut_70)
  TARGET: {
    zone: "target" as const,
    color: "#A8AFBC",
    textColor: "#1F2937",
    label: "Target Zone",
  },

  // Reach zone (GPA ≥ cut_70)
  REACH_WARM: {
    zone: "reach" as const,
    color: "#C2C0BD",
    textColor: "#1F2937",
    label: "Uncertain (within 0.5)",
  },
  REACH_LIGHT: {
    zone: "reach" as const,
    color: "#D8D6D3",
    textColor: "#1F2937",
    label: "Unlikely (>0.5 above)",
  },

  // No data
  NO_DATA: {
    zone: "reach" as const,
    color: "#F3F4F6",
    textColor: "#9CA3AF",
    label: "No Data",
  },
} as const;

// ============================================================================
// Filter Types
// ============================================================================

/**
 * URL search params for heatmap filters
 */
export interface HeatmapFilters {
  gpa: number;
  universityIds: string[];
  year: number;
}

/**
 * Default filter values
 */
export const DEFAULT_FILTERS: HeatmapFilters = {
  gpa: 3.0,
  universityIds: [],
  year: 2025,
};
