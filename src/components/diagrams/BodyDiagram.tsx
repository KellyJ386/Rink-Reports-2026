'use client'

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

/** Anatomical body outline paths shared between front and back views */
function BodyOutline({ view }: { view: 'front' | 'back' }) {
  const strokeColor = 'currentColor'
  return (
    <g
      fill="none"
      stroke={strokeColor}
      strokeWidth="0.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-gray-400 dark:text-gray-500"
    >
      {/* Head */}
      <ellipse cx="50" cy="8" rx="6" ry="7" />

      {/* Neck */}
      <path d="M 46 14 L 46 18 M 54 14 L 54 18" />

      {/* Shoulders */}
      <path d="M 46 18 C 44 18, 36 19, 30 22" />
      <path d="M 54 18 C 56 18, 64 19, 70 22" />

      {/* Torso */}
      <path d="M 30 22 L 28 25 L 27 30 L 28 36 L 30 42 L 34 47 L 38 50" />
      <path d="M 70 22 L 72 25 L 73 30 L 72 36 L 70 42 L 66 47 L 62 50" />

      {/* Waist / Hips */}
      <path d="M 38 50 C 40 52, 46 53, 50 53 C 54 53, 60 52, 62 50" />

      {/* Left arm */}
      <path d="M 30 22 C 28 24, 26 30, 24 36 C 22 42, 20 48, 18 54 L 16 58" />
      <path d="M 28 25 C 26 28, 24 34, 22 40 C 20 46, 18 52, 16 58" />

      {/* Right arm */}
      <path d="M 70 22 C 72 24, 74 30, 76 36 C 78 42, 80 48, 82 54 L 84 58" />
      <path d="M 72 25 C 74 28, 76 34, 78 40 C 80 46, 82 52, 84 58" />

      {/* Hands */}
      <ellipse cx="15" cy="60" rx="3" ry="3.5" />
      <ellipse cx="85" cy="60" rx="3" ry="3.5" />

      {/* Left leg */}
      <path d="M 38 50 L 40 58 L 42 66 L 42 72 L 41 80 L 41 88 L 40 94" />
      <path d="M 50 53 L 48 58 L 46 66 L 46 72 L 45 80 L 45 88 L 44 94" />

      {/* Right leg */}
      <path d="M 62 50 L 60 58 L 58 66 L 58 72 L 59 80 L 59 88 L 60 94" />
      <path d="M 50 53 L 52 58 L 54 66 L 54 72 L 55 80 L 55 88 L 56 94" />

      {/* Feet */}
      <ellipse cx="42" cy="96" rx="3.5" ry="2.5" />
      <ellipse cx="58" cy="96" rx="3.5" ry="2.5" />

      {/* View-specific details */}
      {view === 'front' && (
        <>
          {/* Collar bones */}
          <path d="M 46 20 C 44 21, 38 22, 34 21" strokeWidth="0.4" />
          <path d="M 54 20 C 56 21, 62 22, 66 21" strokeWidth="0.4" />
        </>
      )}
      {view === 'back' && (
        <>
          {/* Spine line */}
          <path d="M 50 18 L 50 50" strokeWidth="0.3" strokeDasharray="1,1.5" />
          {/* Shoulder blades */}
          <ellipse cx="42" cy="28" rx="5" ry="6" strokeWidth="0.3" strokeDasharray="1,1" />
          <ellipse cx="58" cy="28" rx="5" ry="6" strokeWidth="0.3" strokeDasharray="1,1" />
        </>
      )}
    </g>
  )
}

export function BodyDiagram({ view, regions, selectedRegions, onRegionToggle }: BodyDiagramProps) {
  return (
    <div className="relative">
      <h3 className="text-center font-medium mb-2 text-sm text-wolf-grey dark:text-gray-400">
        {view === 'front' ? 'Front View' : 'Back View'}
      </h3>
      <svg
        viewBox="0 0 100 100"
        className="w-full max-w-[250px] mx-auto"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label={`Body diagram ${view} view for marking injury locations`}
      >
        {/* Anatomical body outline */}
        <BodyOutline view={view} />

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
                rx="1.5"
                fill={isSelected ? '#D32F2F' : 'transparent'}
                opacity={isSelected ? 0.35 : 0}
                stroke={isSelected ? '#D32F2F' : 'transparent'}
                strokeWidth="0.6"
                className="cursor-pointer transition-all duration-150 hover:fill-alert-red/15 hover:stroke-alert-red hover:opacity-100"
                onClick={() => onRegionToggle(region.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onRegionToggle(region.id)
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label={`${region.label}${isSelected ? ' (selected)' : ''}`}
                aria-pressed={isSelected}
              />
              {/* Selection indicator dot */}
              {isSelected && (
                <circle
                  cx={region.x}
                  cy={region.y}
                  r="1.5"
                  fill="#D32F2F"
                  className="pointer-events-none"
                />
              )}
              {/* Region label (visible on hover via CSS group) */}
            </g>
          )
        })}
      </svg>
    </div>
  )
}
