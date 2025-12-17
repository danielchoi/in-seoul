"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { GpaSlider } from "./GpaSlider";
import { UniversitySelector } from "./UniversitySelector";
import type { UniversityOption, HeatmapFilters as FilterValues } from "@/lib/types/heatmap.types";

const DEBOUNCE_DELAY = 500; // 0.5 seconds

interface HeatmapFiltersProps {
  universities: UniversityOption[];
  initialFilters: FilterValues;
}

/**
 * Filter controls for the heatmap
 * Client Component - manages URL state for filters with debouncing
 */
export function HeatmapFilters({
  universities,
  initialFilters,
}: HeatmapFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Local state for immediate UI updates
  const [localGpa, setLocalGpa] = useState(initialFilters.gpa);
  const [localUniversityIds, setLocalUniversityIds] = useState(initialFilters.universityIds);

  // Refs for debounce timers
  const gpaTimerRef = useRef<NodeJS.Timeout | null>(null);
  const universityTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync local state when URL params change (e.g., browser back/forward)
  useEffect(() => {
    setLocalGpa(initialFilters.gpa);
    setLocalUniversityIds(initialFilters.universityIds);
  }, [initialFilters.gpa, initialFilters.universityIds]);

  /**
   * Update URL with new filter values
   */
  const updateUrl = (updates: Partial<FilterValues>) => {
    const params = new URLSearchParams(searchParams.toString());

    if (updates.gpa !== undefined) {
      params.set("gpa", updates.gpa.toString());
    }

    if (updates.universityIds !== undefined) {
      if (updates.universityIds.length === 0) {
        params.delete("universities");
      } else {
        params.set("universities", updates.universityIds.join(","));
      }
    }

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  /**
   * Handle GPA change with debouncing
   */
  const handleGpaChange = (gpa: number) => {
    // Update local state immediately for responsive UI
    setLocalGpa(gpa);

    // Clear existing timer
    if (gpaTimerRef.current) {
      clearTimeout(gpaTimerRef.current);
    }

    // Set new debounced update
    gpaTimerRef.current = setTimeout(() => {
      updateUrl({ gpa });
    }, DEBOUNCE_DELAY);
  };

  /**
   * Handle university selection change with debouncing
   */
  const handleUniversitiesChange = (universityIds: string[]) => {
    // Update local state immediately for responsive UI
    setLocalUniversityIds(universityIds);

    // Clear existing timer
    if (universityTimerRef.current) {
      clearTimeout(universityTimerRef.current);
    }

    // Set new debounced update
    universityTimerRef.current = setTimeout(() => {
      updateUrl({ universityIds });
    }, DEBOUNCE_DELAY);
  };

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (gpaTimerRef.current) clearTimeout(gpaTimerRef.current);
      if (universityTimerRef.current) clearTimeout(universityTimerRef.current);
    };
  }, []);

  return (
    <div className="space-y-6 p-4 bg-card border border-border rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GpaSlider value={localGpa} onChange={handleGpaChange} />
        <UniversitySelector
          universities={universities}
          selectedIds={localUniversityIds}
          onChange={handleUniversitiesChange}
        />
      </div>
      {isPending && (
        <div className="text-sm text-muted-foreground animate-pulse">
          업데이트 중...
        </div>
      )}
    </div>
  );
}
