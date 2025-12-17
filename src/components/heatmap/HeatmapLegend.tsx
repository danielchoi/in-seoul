import { ZONE_COLORS } from "@/lib/types/heatmap.types";

/**
 * Legend showing the color zones for the heatmap
 * Server Component - no client interactivity needed
 */
export function HeatmapLegend() {
  const legendItems = [
    { ...ZONE_COLORS.SAFE_DEEP, description: "안전권 (margin ≥1.5)" },
    { ...ZONE_COLORS.SAFE_INDIGO, description: "안전권 (margin ≥1.0)" },
    { ...ZONE_COLORS.SAFE_SOFT, description: "안전권 (margin ≥0.5)" },
    { ...ZONE_COLORS.SAFE_PALE, description: "안전권 (margin <0.5)" },
    { ...ZONE_COLORS.TARGET, description: "적정권" },
    { ...ZONE_COLORS.REACH_WARM, description: "상향 (within 0.5)" },
    { ...ZONE_COLORS.REACH_LIGHT, description: "상향 (>0.5 above)" },
  ];

  return (
    <div className="flex flex-wrap gap-3 p-4 bg-muted/30 rounded-lg">
      <span className="text-sm font-medium text-muted-foreground mr-2">
        범례:
      </span>
      {legendItems.map((item, index) => (
        <div key={index} className="flex items-center gap-1.5">
          <div
            className="w-4 h-4 rounded border border-border/50"
            style={{ backgroundColor: item.color }}
          />
          <span className="text-xs text-muted-foreground">
            {item.description}
          </span>
        </div>
      ))}
    </div>
  );
}
