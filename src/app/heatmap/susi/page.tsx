import { Suspense } from "react";
import { heatmapService } from "@/lib/services/heatmap.service";
import {
  HeatmapFilters,
  HeatmapGrid,
  HeatmapLegend,
  parseFiltersFromSearchParams,
} from "@/components/heatmap";
import { Skeleton } from "@/components/ui/skeleton";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export const metadata = {
  title: "수시 히트맵 | In Seoul",
  description: "대학별 수시 전형 내신 컷 히트맵",
};

export default async function SusiHeatmapPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const urlSearchParams = new URLSearchParams();

  // Convert searchParams to URLSearchParams
  Object.entries(params).forEach(([key, value]) => {
    if (typeof value === "string") {
      urlSearchParams.set(key, value);
    }
  });

  const filters = parseFiltersFromSearchParams(urlSearchParams);

  // Fetch universities for the selector
  const universities = await heatmapService.getActiveUniversities();

  // Fetch heatmap data based on filters
  const heatmapData = await heatmapService.getHeatmapData(
    filters.universityIds,
    filters.year
  );

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">수시 내신 히트맵</h1>
        <p className="text-muted-foreground">
          내신 등급을 입력하고 대학을 선택하여 합격 가능성을 확인하세요.
          색상이 진할수록 합격 가능성이 높습니다.
        </p>
      </div>

      {/* Filters */}
      <Suspense fallback={<FiltersSkeleton />}>
        <HeatmapFilters
          universities={universities}
          initialFilters={filters}
        />
      </Suspense>

      {/* Legend */}
      <HeatmapLegend />

      {/* Heatmap Grid */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {filters.year}학년도 수시 전형
          </h2>
          {heatmapData.universityGroups.length > 0 && (
            <span className="text-sm text-muted-foreground">
              {heatmapData.universityGroups.length}개 대학
            </span>
          )}
        </div>
        <HeatmapGrid data={heatmapData} userGPA={filters.gpa} />
      </div>

      {/* Info */}
      <div className="text-xs text-muted-foreground space-y-1">
        <p>* 셀에 표시된 숫자는 70% 컷 (적정권) 등급입니다.</p>
        <p>* 데이터는 전년도 입시 결과 기준입니다.</p>
        <p>* 마우스를 올리면 50% 컷 (안전권) 등급도 확인할 수 있습니다.</p>
      </div>
    </div>
  );
}

function FiltersSkeleton() {
  return (
    <div className="space-y-6 p-4 bg-card border border-border rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-6 w-full" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </div>
  );
}
