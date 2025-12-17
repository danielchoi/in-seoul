import type { UniversityGroup as UniversityGroupType } from "@/lib/types/heatmap.types";
import { AdmissionTypeColumn } from "./AdmissionTypeColumn";

interface UniversityGroupProps {
  group: UniversityGroupType;
  userGPA: number;
}

/**
 * University group with header and admission type sub-columns
 */
export function UniversityGroup({ group, userGPA }: UniversityGroupProps) {
  return (
    <div className="flex flex-col border border-border rounded-lg overflow-hidden bg-card">
      {/* University Header */}
      <div className="px-4 py-3 bg-muted/70 border-b border-border">
        <div className="font-bold text-base">
          {group.shortName || group.universityName}
        </div>
        {group.shortName && (
          <div className="text-xs text-muted-foreground">
            {group.universityName}
          </div>
        )}
      </div>

      {/* Admission Type Sub-columns */}
      <div className="flex">
        {group.admissionTypes.map((admissionType, index) => (
          <AdmissionTypeColumn
            key={admissionType.admissionType}
            column={admissionType}
            userGPA={userGPA}
            isLast={index === group.admissionTypes.length - 1}
          />
        ))}
      </div>
    </div>
  );
}
