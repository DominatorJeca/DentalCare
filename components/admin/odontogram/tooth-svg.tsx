"use client"

import type { ToothMark, ToothSurface } from "@/types"

type Surface = ToothSurface | "whole"

interface ToothSVGProps {
  toothNumber: number
  marks: ToothMark[]
  onSurfaceClick?: (surface: Surface) => void
  size?: number
  numberPosition?: "top" | "bottom"
}

// viewBox 0 0 40 40 — five clickable zones
const SURFACE_DEFS: { key: ToothSurface; d: string }[] = [
  { key: "buccal",   d: "M0,0 L40,0 L28,12 L12,12 Z" },
  { key: "lingual",  d: "M0,40 L40,40 L28,28 L12,28 Z" },
  { key: "mesial",   d: "M0,0 L12,12 L12,28 L0,40 Z" },
  { key: "distal",   d: "M40,0 L28,12 L28,28 L40,40 Z" },
  { key: "occlusal", d: "M12,12 L28,12 L28,28 L12,28 Z" },
]

export function ToothSVG({
  toothNumber,
  marks,
  onSurfaceClick,
  size = 40,
  numberPosition = "top",
}: ToothSVGProps) {
  const wholeMark = [...marks].reverse().find((m) => m.surface === "whole")

  function getSurfaceColor(surface: ToothSurface): string {
    if (wholeMark) return wholeMark.color
    const mark = [...marks].reverse().find((m) => m.surface === surface)
    return mark?.color ?? "transparent"
  }

  const label = (
    <span className="text-[9px] leading-none font-mono text-muted-foreground select-none">
      {toothNumber}
    </span>
  )

  const isWhole = !!wholeMark
  const showX =
    isWhole &&
    (wholeMark.condition === "extraccion" || wholeMark.condition === "ausente")

  return (
    <div className="flex flex-col items-center gap-px">
      {numberPosition === "top" && label}
      <svg
        viewBox="0 0 40 40"
        width={size}
        height={size}
        style={{ display: "block" }}
        className={onSurfaceClick ? "cursor-pointer" : undefined}
      >
        <rect x="0" y="0" width="40" height="40" fill="white" />

        {SURFACE_DEFS.map(({ key, d }) => (
          <path
            key={key}
            d={d}
            fill={getSurfaceColor(key)}
            stroke="#9ca3af"
            strokeWidth="0.75"
            style={{ transition: "filter 0.1s" }}
            className={onSurfaceClick ? "hover:brightness-90" : undefined}
            onClick={() => onSurfaceClick?.(key)}
          />
        ))}

        {/* outer border */}
        <rect
          x="0.375"
          y="0.375"
          width="39.25"
          height="39.25"
          fill="none"
          stroke="#374151"
          strokeWidth="0.75"
        />

        {showX && (
          <>
            <line
              x1="5" y1="5" x2="35" y2="35"
              stroke={wholeMark.color}
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <line
              x1="35" y1="5" x2="5" y2="35"
              stroke={wholeMark.color}
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </>
        )}
      </svg>
      {numberPosition === "bottom" && label}
    </div>
  )
}
