"use client";

import { useState } from "react";
import { ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { UniversityOption } from "@/lib/types/heatmap.types";

interface UniversitySelectorProps {
  universities: UniversityOption[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

/**
 * Multi-select dropdown for universities
 */
export function UniversitySelector({
  universities,
  selectedIds,
  onChange,
}: UniversitySelectorProps) {
  const [open, setOpen] = useState(false);

  const handleToggle = (id: string) => {
    const newIds = selectedIds.includes(id)
      ? selectedIds.filter((i) => i !== id)
      : [...selectedIds, id];
    onChange(newIds);
  };

  const handleSelectAll = () => {
    if (selectedIds.length === universities.length) {
      onChange([]);
    } else {
      onChange(universities.map((u) => u.id));
    }
  };

  const selectedCount = selectedIds.length;
  const displayText =
    selectedCount === 0
      ? "대학 선택..."
      : selectedCount === 1
        ? universities.find((u) => u.id === selectedIds[0])?.shortName ||
          universities.find((u) => u.id === selectedIds[0])?.name ||
          "1개 선택"
        : `${selectedCount}개 대학 선택`;

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">대학 선택</label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {displayText}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start">
          <Command>
            <CommandInput placeholder="대학 검색..." />
            <CommandList>
              <CommandEmpty>검색 결과가 없습니다</CommandEmpty>
              <CommandGroup>
                {/* Select All option */}
                <CommandItem onSelect={handleSelectAll} className="font-medium">
                  <Checkbox
                    checked={
                      selectedIds.length === universities.length &&
                      universities.length > 0
                    }
                    className="mr-2"
                  />
                  전체 선택
                  {selectedIds.length > 0 && (
                    <span className="ml-auto text-xs text-muted-foreground">
                      ({selectedIds.length}/{universities.length})
                    </span>
                  )}
                </CommandItem>
                {/* University list */}
                {universities.map((university) => (
                  <CommandItem
                    key={university.id}
                    value={university.name}
                    onSelect={() => handleToggle(university.id)}
                  >
                    <Checkbox
                      checked={selectedIds.includes(university.id)}
                      className="mr-2"
                    />
                    {university.shortName || university.name}
                    {university.shortName && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        {university.name}
                      </span>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
