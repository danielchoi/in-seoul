import type { HeatmapData } from "@/lib/types/heatmap.types";
import { UniversityGroup } from "./UniversityGroup";

interface HeatmapGridProps {
  data: HeatmapData;
  userGPA: number;
}

/**
 * Main heatmap grid component
 * Displays university groups horizontally with horizontal scroll
 */
export function HeatmapGrid({ data, userGPA }: HeatmapGridProps) {
  if (data.universityGroups.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        대학을 선택해주세요
      </div>
    );
  }

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-4 min-w-min">
        {data.universityGroups.map((group) => (
          <UniversityGroup
            key={group.universityId}
            group={group}
            userGPA={userGPA}
          />
        ))}
      </div>
    </div>
  );
}
