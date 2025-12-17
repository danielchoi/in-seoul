import type { AdmissionTypeColumn as AdmissionTypeColumnType } from "@/lib/types/heatmap.types";
import { DepartmentRow } from "./DepartmentRow";

interface AdmissionTypeColumnProps {
  column: AdmissionTypeColumnType;
  userGPA: number;
  isLast?: boolean;
}

/**
 * Sub-column showing admission type with its department list
 */
export function AdmissionTypeColumn({
  column,
  userGPA,
  isLast = false,
}: AdmissionTypeColumnProps) {
  // Format admission type - remove "수시 " prefix for brevity
  const formattedType = column.admissionType.replace(/^수시\s*/, "");

  return (
    <div
      className={`flex flex-col min-w-[260px] max-w-[300px] ${
        !isLast ? "border-r border-border" : ""
      }`}
    >
      {/* Admission Type Header */}
      <div className="px-3 py-2 bg-muted/30 border-b border-border">
        <div className="text-sm font-medium text-center truncate">
          {formattedType}
        </div>
      </div>

      {/* Department List */}
      <div className="flex-1 overflow-y-auto max-h-[500px]">
        {column.departments.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            데이터 없음
          </div>
        ) : (
          column.departments.map((dept, index) => (
            <DepartmentRow
              key={`${dept.departmentName}-${index}`}
              department={dept}
              userGPA={userGPA}
            />
          ))
        )}
      </div>

      {/* Footer - department count */}
      <div className="px-3 py-1.5 bg-muted/20 border-t border-border text-xs text-muted-foreground text-center">
        {column.departments.length}개 학과
      </div>
    </div>
  );
}
