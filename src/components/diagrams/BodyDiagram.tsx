'use client'

import clsx from 'clsx'

interface BodyRegionData {
  id: string
  label: string
  x: number
  y: number
  w: number
  h: number
}

interface BodyDiagramProps {
  view: 'front' | 'back'
  regions: BodyRegionData[]
  selectedRegions: string[]
  onRegionToggle: (regionId: string) => void
}

export function BodyDiagram({ view, regions, selectedRegions, onRegionToggle }: BodyDiagramProps) {
  return (
    <div className="relative">
      <h3 className="text-center font-medium mb-2 text-sm text-wolf-grey">
        {view === 'front' ? 'Front View' : 'Back View'}
      </h3>
      <svg
        viewBox="0 0 100 100"
        className="w-full max-w-[250px] mx-auto"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Body outline */}
        <g fill="none" stroke="#A5ACAF" strokeWidth="0.5">
          {/* Head */}
          <circle cx="50" cy="10" r="7" />
          {/* Neck */}
          <line x1="50" y1="17" x2="50" y2="20" />
          {/* Torso */}
          <path d="M 38 20 L 38 48 L 62 48 L 62 20 Z" />
          {/* Shoulders */}
          <line x1="38" y1="22" x2="28" y2="25" />
          <line x1="62" y1="22" x2="72" y2="25" />
          {/* Arms */}
          <path d="M 28 25 L 25 40 L 22 53 L 18 60" />
          <path d="M 72 25 L 75 40 L 78 53 L 82 60" />
          {/* Legs */}
          <path d="M 38 48 L 42 70 L 42 88 L 40 95" />
          <path d="M 62 48 L 58 70 L 58 88 L 60 95" />
          {/* Hips */}
          <path d="M 38 48 Q 50 52 62 48" />
        </g>

        {/* Clickable regions */}
        {regions.map((region) => {
          const isSelected = selectedRegions.includes(region.id)
          return (
            <g key={region.id}>
              <rect
                x={region.x - region.w / 2}
                y={region.y - region.h / 2}
                width={region.w}
                height={region.h}
                rx="1"
                fill={isSelected ? '#D32F2F' : 'transparent'}
                opacity={isSelected ? 0.4 : 0}
                stroke={isSelected ? '#D32F2F' : 'transparent'}
                strokeWidth="0.5"
                className="cursor-pointer hover:fill-alert-red/20 hover:stroke-alert-red transition-colors"
                onClick={() => onRegionToggle(region.id)}
                role="button"
                aria-label={`${region.label}${isSelected ? ' (selected)' : ''}`}
              />
              {isSelected && (
                <circle
                  cx={region.x}
                  cy={region.y}
                  r="1.5"
                  fill="#D32F2F"
                />
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}
