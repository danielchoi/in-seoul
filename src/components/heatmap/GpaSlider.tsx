"use client";

import { Slider } from "@/components/ui/slider";

interface GpaSliderProps {
  value: number;
  onChange: (value: number) => void;
}

/**
 * GPA slider for selecting user's grade (1-9 scale, lower is better)
 */
export function GpaSlider({ value, onChange }: GpaSliderProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">내신 등급</label>
        <span className="text-lg font-semibold tabular-nums">
          {value.toFixed(1)}
        </span>
      </div>
      <Slider
        value={[value]}
        onValueChange={(values) => onChange(values[0])}
        min={1}
        max={9}
        step={0.1}
        className="w-full"
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>1등급 (최상)</span>
        <span>9등급</span>
      </div>
    </div>
  );
}
