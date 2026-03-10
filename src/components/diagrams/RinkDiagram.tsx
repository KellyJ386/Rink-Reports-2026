'use client'

import { useState } from 'react'
import clsx from 'clsx'

interface MeasurementPoint {
  id: string
  number: number
  xPercent: number
  yPercent: number
  value?: number
  color?: string
}

interface RinkDiagramProps {
  points: MeasurementPoint[]
  onPointClick: (point: MeasurementPoint) => void
  greenRange?: { min: number; max: number }
  yellowRange?: { min: number; max: number }
  redRange?: { min: number; max: number }
  centerLogoUrl?: string
}

function getPointColor(
  value: number | undefined,
  green: { min: number; max: number },
  yellow: { min: number; max: number },
  red: { min: number; max: number }
): string {
  if (value === undefined) return '#A5ACAF' // Wolf grey - no reading
  if (value >= green.min && value <= green.max) return '#69BE28'
  if (value >= yellow.min && value <= yellow.max) return '#FFB800'
  if (value >= red.min && value <= red.max) return '#D32F2F'
  return '#A5ACAF'
}

export function RinkDiagram({
  points,
  onPointClick,
  greenRange = { min: 1.0, max: 1.74 },
  yellowRange = { min: 1.75, max: 3.5 },
  redRange = { min: 0, max: 0.99 },
  centerLogoUrl,
}: RinkDiagramProps) {
  return (
    <div className="relative w-full max-w-3xl mx-auto">
      <svg
        viewBox="0 0 400 170"
        className="w-full h-auto border-2 border-gray-300 rounded-lg bg-white"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Rink outline with rounded corners (USA Hockey) */}
        <rect
          x="5" y="5" width="390" height="160" rx="28" ry="28"
          fill="#E8F4FD" stroke="#002244" strokeWidth="2"
        />

        {/* Center line */}
        <line x1="200" y1="5" x2="200" y2="165" stroke="#D32F2F" strokeWidth="2" />

        {/* Center circle */}
        <circle cx="200" cy="85" r="25" fill="none" stroke="#0066CC" strokeWidth="1.5" />

        {/* Blue lines */}
        <line x1="130" y1="5" x2="130" y2="165" stroke="#0066CC" strokeWidth="2" />
        <line x1="270" y1="5" x2="270" y2="165" stroke="#0066CC" strokeWidth="2" />

        {/* Goal creases */}
        <rect x="15" y="70" width="4" height="30" fill="#D32F2F" stroke="#002244" strokeWidth="1" rx="1" />
        <path d="M 19 70 Q 35 85 19 100" fill="none" stroke="#D32F2F" strokeWidth="1.5" />

        <rect x="381" y="70" width="4" height="30" fill="#D32F2F" stroke="#002244" strokeWidth="1" rx="1" />
        <path d="M 381 70 Q 365 85 381 100" fill="none" stroke="#D32F2F" strokeWidth="1.5" />

        {/* Face-off circles */}
        <circle cx="80" cy="50" r="15" fill="none" stroke="#D32F2F" strokeWidth="1" />
        <circle cx="80" cy="120" r="15" fill="none" stroke="#D32F2F" strokeWidth="1" />
        <circle cx="320" cy="50" r="15" fill="none" stroke="#D32F2F" strokeWidth="1" />
        <circle cx="320" cy="120" r="15" fill="none" stroke="#D32F2F" strokeWidth="1" />

        {/* Face-off dots */}
        <circle cx="80" cy="50" r="3" fill="#D32F2F" />
        <circle cx="80" cy="120" r="3" fill="#D32F2F" />
        <circle cx="320" cy="50" r="3" fill="#D32F2F" />
        <circle cx="320" cy="120" r="3" fill="#D32F2F" />
        <circle cx="200" cy="85" r="3" fill="#0066CC" />

        {/* Neutral zone dots */}
        <circle cx="155" cy="50" r="2" fill="#D32F2F" />
        <circle cx="155" cy="120" r="2" fill="#D32F2F" />
        <circle cx="245" cy="50" r="2" fill="#D32F2F" />
        <circle cx="245" cy="120" r="2" fill="#D32F2F" />

        {/* Measurement points */}
        {points.map((point) => {
          const cx = (point.xPercent / 100) * 390 + 5
          const cy = (point.yPercent / 100) * 160 + 5
          const color = getPointColor(point.value, greenRange, yellowRange, redRange)

          return (
            <g
              key={point.id}
              onClick={() => onPointClick(point)}
              className="cursor-pointer"
              role="button"
              aria-label={`Point ${point.number}${point.value !== undefined ? `: ${point.value}"` : ''}`}
            >
              <circle cx={cx} cy={cy} r="10" fill={color} stroke="#002244" strokeWidth="1.5" opacity="0.9" />
              <text
                x={cx}
                y={cy + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="white"
                fontSize="8"
                fontWeight="bold"
              >
                {point.number}
              </text>
              {point.value !== undefined && (
                <text
                  x={cx}
                  y={cy + 16}
                  textAnchor="middle"
                  fill="#002244"
                  fontSize="7"
                  fontWeight="600"
                >
                  {point.value}&quot;
                </text>
              )}
            </g>
          )
        })}
      </svg>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-3 text-sm">
        <span className="flex items-center gap-1">
          <span className="w-4 h-4 rounded-full bg-action-green inline-block" />
          Optimal ({greenRange.min}&quot;-{greenRange.max}&quot;)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-4 h-4 rounded-full bg-alert-yellow inline-block" />
          Too Thick ({yellowRange.min}&quot;-{yellowRange.max}&quot;)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-4 h-4 rounded-full bg-alert-red inline-block" />
          Too Thin ({redRange.min}&quot;-{redRange.max}&quot;)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-4 h-4 rounded-full bg-wolf-grey inline-block" />
          No Reading
        </span>
      </div>
    </div>
  )
}
