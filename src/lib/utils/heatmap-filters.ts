import type { HeatmapFilters } from "@/lib/types/heatmap.types";
import { DEFAULT_FILTERS } from "@/lib/types/heatmap.types";

/**
 * Parse filters from URL search params
 * This is a server-safe utility function
 */
export function parseFiltersFromSearchParams(
  searchParams: URLSearchParams
): HeatmapFilters {
  const gpaParam = searchParams.get("gpa");
  const universitiesParam = searchParams.get("universities");
  const yearParam = searchParams.get("year");

  let gpa = DEFAULT_FILTERS.gpa;
  if (gpaParam) {
    const parsed = parseFloat(gpaParam);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= 9) {
      gpa = parsed;
    }
  }

  let universityIds: string[] = [];
  if (universitiesParam) {
    universityIds = universitiesParam.split(",").filter(Boolean);
  }

  let year = DEFAULT_FILTERS.year;
  if (yearParam) {
    const parsed = parseInt(yearParam, 10);
    if (!isNaN(parsed) && parsed >= 2020 && parsed <= 2030) {
      year = parsed;
    }
  }

  return { gpa, universityIds, year };
}
