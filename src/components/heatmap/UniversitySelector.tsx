"use client";

import { useState } from "react";
import { ChevronsUpDown, X } from "lucide-react";
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

const MAX_SELECTIONS = 5;

interface UniversitySelectorProps {
  universities: UniversityOption[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

/**
 * Multi-select dropdown for universities (max 5)
 */
export function UniversitySelector({
  universities,
  selectedIds,
  onChange,
}: UniversitySelectorProps) {
  const [open, setOpen] = useState(false);

  const handleToggle = (id: string) => {
    const isSelected = selectedIds.includes(id);
    if (isSelected) {
      onChange(selectedIds.filter((i) => i !== id));
    } else if (selectedIds.length < MAX_SELECTIONS) {
      onChange([...selectedIds, id]);
    }
  };

  const handleClear = () => {
    onChange([]);
  };

  const selectedCount = selectedIds.length;
  const isMaxReached = selectedCount >= MAX_SELECTIONS;
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
            <div className="flex items-center border-b">
              <CommandInput placeholder="대학 검색..." className="border-0" />
            </div>
            {/* Header with count and clear button */}
            <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/50">
              <span className="text-xs text-muted-foreground">
                {selectedCount}/{MAX_SELECTIONS}개 선택
                {isMaxReached && " (최대)"}
              </span>
              {selectedCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClear}
                  className="h-6 px-2 text-xs"
                >
                  <X className="h-3 w-3 mr-1" />
                  초기화
                </Button>
              )}
            </div>
            <CommandList>
              <CommandEmpty>검색 결과가 없습니다</CommandEmpty>
              <CommandGroup>
                {/* University list */}
                {universities.map((university) => {
                  const isSelected = selectedIds.includes(university.id);
                  const isDisabled = !isSelected && isMaxReached;
                  return (
                    <CommandItem
                      key={university.id}
                      value={university.name}
                      onSelect={() => handleToggle(university.id)}
                      disabled={isDisabled}
                      className={isDisabled ? "opacity-50" : ""}
                    >
                      <Checkbox
                        checked={isSelected}
                        disabled={isDisabled}
                        className="mr-2"
                      />
                      {university.shortName || university.name}
                      {university.shortName && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          {university.name}
                        </span>
                      )}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
