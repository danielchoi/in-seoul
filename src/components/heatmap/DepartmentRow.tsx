import type { DepartmentEntry, ZoneColor } from "@/lib/types/heatmap.types";
import { calculateCellColor } from "@/lib/services/heatmap.service";

interface DepartmentRowProps {
  department: DepartmentEntry;
  userGPA: number;
}

/**
 * Single department row within a column
 * Shows department name + 70% cut value with color background
 */
export function DepartmentRow({ department, userGPA }: DepartmentRowProps) {
  const zoneColor: ZoneColor = calculateCellColor(
    userGPA,
    department.cut50,
    department.cut70,
    department.cut100
  );

  const displayValue = department.cut70?.toFixed(2) ?? "-";

  return (
    <div
      className="flex items-center justify-between px-3 py-2 border-b border-border/30 last:border-b-0"
      style={{
        backgroundColor: zoneColor.color,
        color: zoneColor.textColor,
      }}
      title={`50% cut: ${department.cut50?.toFixed(2) ?? "N/A"} | 70% cut: ${department.cut70?.toFixed(2) ?? "N/A"} | 100% cut: ${department.cut100?.toFixed(2) ?? "N/A"}\n${zoneColor.label}`}
    >
      <span className="text-sm truncate flex-1 mr-2">
        {department.departmentName}
      </span>
      <span className="text-sm font-semibold tabular-nums whitespace-nowrap">
        {displayValue}
      </span>
    </div>
  );
}
