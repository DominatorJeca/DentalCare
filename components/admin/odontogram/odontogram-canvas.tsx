"use client"

import { ToothSVG } from "./tooth-svg"
import { CONDITIONS } from "./condition-palette"
import type { ToothData, ToothCondition, ToothMark } from "@/types"

const Q1 = [18, 17, 16, 15, 14, 13, 12, 11]
const Q2 = [21, 22, 23, 24, 25, 26, 27, 28]
const Q3 = [38, 37, 36, 35, 34, 33, 32, 31]
const Q4 = [41, 42, 43, 44, 45, 46, 47, 48]

interface OdontogramCanvasProps {
  teethData: ToothData[]
  selectedCondition: ToothCondition | null
  eraseMode: boolean
  onToothChange: (updated: ToothData) => void
  onNoConditionClick?: () => void
  toothSize?: number
}

export function OdontogramCanvas({
  teethData,
  selectedCondition,
  eraseMode,
  onToothChange,
  onNoConditionClick,
  toothSize = 44,
}: OdontogramCanvasProps) {
  function getToothData(num: number): ToothData {
    return teethData.find((t) => t.tooth_number === num) ?? {
      tooth_number: num,
      conditions: [],
    }
  }

  function handleSurfaceClick(toothNumber: number, surface: ToothMark["surface"]) {
    const tooth = getToothData(toothNumber)

    // Modo borrador: limpia todas las condiciones del diente
    if (eraseMode) {
      const hasWhole = tooth.conditions.some((c) => c.surface === "whole")

      const newConditions = hasWhole ? [] : tooth.conditions.filter((c) => c.surface !== surface)
      if (newConditions.length === tooth.conditions.length) return
      onToothChange({ ...tooth, conditions: newConditions })
      return
    }

    if (!selectedCondition) { onNoConditionClick?.(); return }

    const conditionOpt = CONDITIONS.find((c) => c.condition === selectedCondition)!
    const targetSurface: ToothMark["surface"] = conditionOpt.whole ? "whole" : surface

    const existingIdx = tooth.conditions.findIndex(
      (m) => m.surface === targetSurface && m.condition === selectedCondition
    )

    let newConditions: ToothMark[]
    if (existingIdx >= 0) {
      newConditions = tooth.conditions.filter((_, i) => i !== existingIdx)
    } else {
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
      <div className={`flex gap-0.5 ${eraseMode ? "cursor-cell" : ""}`}>
        {teeth.map((num) => {
          const tooth = getToothData(num)
          return (
            <ToothSVG
              key={num}
              toothNumber={num}
              marks={tooth.conditions}
              size={toothSize}
              numberPosition={pos}
              eraseMode={eraseMode}
              onSurfaceClick={(surface) => handleSurfaceClick(num, surface)}
            />
          )
        })}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-1 select-none">
      <div className="flex gap-1">
        {renderRow(Q1, "top")}
        <div className="w-px self-stretch bg-border mx-1" />
        {renderRow(Q2, "top")}
      </div>
      <div className="w-full border-t border-dashed border-border/60 my-0.5" />
      <div className="flex gap-1">
        {renderRow(Q3, "bottom")}
        <div className="w-px self-stretch bg-border mx-1" />
        {renderRow(Q4, "bottom")}
      </div>
    </div>
  )
}
