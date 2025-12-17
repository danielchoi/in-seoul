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

  // Find the index where userGPA crosses the cut70 threshold
  // Departments are sorted by cut70 descending, so we find the first department
  // where userGPA >= cut70 (reach zone)
  const cut70DividerIndex = column.departments.findIndex(
    (dept) => dept.cut70 !== null && userGPA >= dept.cut70
  );

  // Find the index where userGPA crosses the cut100 threshold
  const cut100DividerIndex = column.departments.findIndex(
    (dept) => dept.cut100 !== null && userGPA >= dept.cut100
  );

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
            <div key={`${dept.departmentName}-${index}`}>
              {/* Visual divider at cut70 threshold */}
              {index === cut70DividerIndex && (
                <div className="relative py-1 bg-muted/50">
                  <div className="absolute inset-x-0 top-1/2 border-t-2 border-dashed border-orange-400" />
                  <div className="relative text-center">
                    <span className="px-2 text-[10px] font-medium text-orange-600 bg-muted/50">
                      70% 컷
                    </span>
                  </div>
                </div>
              )}
              {/* Visual divider at cut100 threshold */}
              {index === cut100DividerIndex && cut100DividerIndex !== cut70DividerIndex && (
                <div className="relative py-1 bg-muted/50">
                  <div className="absolute inset-x-0 top-1/2 border-t-2 border-dashed border-red-400" />
                  <div className="relative text-center">
                    <span className="px-2 text-[10px] font-medium text-red-600 bg-muted/50">
                      예상 100% 컷
                    </span>
                  </div>
                </div>
              )}
              <DepartmentRow department={dept} userGPA={userGPA} />
            </div>
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
