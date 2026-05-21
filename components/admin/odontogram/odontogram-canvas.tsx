"use client"

import { ToothSVG } from "./tooth-svg"
import { CONDITIONS } from "./condition-palette"
import type { ToothData, ToothCondition, ToothMark } from "@/types"

// FDI quadrant layout
// Upper arch: Q1 (18→11) | Q2 (21→28)   — number shown above
// Lower arch: Q3 (38→31) | Q4 (41→48)   — number shown below

const Q1 = [18, 17, 16, 15, 14, 13, 12, 11]
const Q2 = [21, 22, 23, 24, 25, 26, 27, 28]
const Q3 = [38, 37, 36, 35, 34, 33, 32, 31]
const Q4 = [41, 42, 43, 44, 45, 46, 47, 48]

interface OdontogramCanvasProps {
  teethData: ToothData[]
  selectedCondition: ToothCondition | null
  onToothChange: (updated: ToothData) => void
  toothSize?: number
}

export function OdontogramCanvas({
  teethData,
  selectedCondition,
  onToothChange,
  toothSize = 36,
}: OdontogramCanvasProps) {
  function getToothData(num: number): ToothData {
    return teethData.find((t) => t.tooth_number === num) ?? {
      tooth_number: num,
      conditions: [],
    }
  }

  function handleSurfaceClick(
    toothNumber: number,
    surface: ToothMark["surface"]
  ) {
    if (!selectedCondition) return

    const tooth = getToothData(toothNumber)
    const conditionOpt = CONDITIONS.find((c) => c.condition === selectedCondition)!
    const targetSurface: ToothMark["surface"] = conditionOpt.whole ? "whole" : surface

    // Toggle: if same condition already on this surface, remove it
    const existingIdx = tooth.conditions.findIndex(
      (m) => m.surface === targetSurface && m.condition === selectedCondition
    )

    let newConditions: ToothMark[]
    if (existingIdx >= 0) {
      // Remove the condition
      newConditions = tooth.conditions.filter((_, i) => i !== existingIdx)
    } else {
      // Remove any other condition on the same surface, then add
      const filtered = tooth.conditions.filter((m) => m.surface !== targetSurface)
      newConditions = [
        ...filtered,
        { surface: targetSurface, condition: selectedCondition, color: conditionOpt.color },
      ]
    }

    onToothChange({ ...tooth, conditions: newConditions })
  }

  function renderRow(teeth: number[], pos: "top" | "bottom") {
    return (
      <div className="flex gap-0.5">
        {teeth.map((num) => {
          const tooth = getToothData(num)
          return (
            <ToothSVG
              key={num}
              toothNumber={num}
              marks={tooth.conditions}
              size={toothSize}
              numberPosition={pos}
              onSurfaceClick={(surface) => handleSurfaceClick(num, surface)}
            />
          )
        })}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-1 select-none">
      {/* Upper arch */}
      <div className="flex gap-1">
        {renderRow(Q1, "top")}
        <div className="w-px self-stretch bg-border mx-1" />
        {renderRow(Q2, "top")}
      </div>

      {/* Midline separator */}
      <div className="w-full border-t border-dashed border-border/60 my-0.5" />

      {/* Lower arch */}
      <div className="flex gap-1">
        {renderRow(Q3, "bottom")}
        <div className="w-px self-stretch bg-border mx-1" />
        {renderRow(Q4, "bottom")}
      </div>
    </div>
  )
}
