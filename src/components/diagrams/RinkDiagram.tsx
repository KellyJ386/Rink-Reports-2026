'use client'

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

/** Hash marks for a face-off circle at (cx, cy) with radius r */
function FaceOffCircleMarks({ cx, cy }: { cx: number; cy: number }) {
  const r = 15
  // Hash marks at 4 positions around circle (L-shaped)
  const hashLen = 4
  const hashOff = 2 // offset from circle edge
  return (
    <g stroke="#D32F2F" strokeWidth="0.8" fill="none">
      {/* Top-left hash */}
      <line x1={cx - r - hashOff} y1={cy - hashLen} x2={cx - r - hashOff} y2={cy + hashLen} />
      <line x1={cx - r - hashOff} y1={cy - hashLen} x2={cx - r + 1} y2={cy - hashLen} />
      <line x1={cx - r - hashOff} y1={cy + hashLen} x2={cx - r + 1} y2={cy + hashLen} />
      {/* Top-right hash */}
      <line x1={cx + r + hashOff} y1={cy - hashLen} x2={cx + r + hashOff} y2={cy + hashLen} />
      <line x1={cx + r + hashOff} y1={cy - hashLen} x2={cx + r - 1} y2={cy - hashLen} />
      <line x1={cx + r + hashOff} y1={cy + hashLen} x2={cx + r - 1} y2={cy + hashLen} />
    </g>
  )
}

export function RinkDiagram({
  points,
  onPointClick,
  greenRange = { min: 1.0, max: 1.74 },
  yellowRange = { min: 1.75, max: 3.5 },
  redRange = { min: 0, max: 0.99 },
}: RinkDiagramProps) {
  return (
    <div className="relative w-full max-w-3xl mx-auto">
      <svg
        viewBox="0 0 400 170"
        className="w-full h-auto border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Ice rink diagram with measurement points"
      >
        {/* Rink outline – USA Hockey 200ft x 85ft with rounded corners */}
        <rect
          x="5" y="5" width="390" height="160" rx="28" ry="28"
          fill="#E8F4FD" stroke="#002244" strokeWidth="2"
          className="dark:fill-[#1a2a3a]"
        />

        {/* Center red line */}
        <line x1="200" y1="5" x2="200" y2="165" stroke="#D32F2F" strokeWidth="2.5" />

        {/* Center circle */}
        <circle cx="200" cy="85" r="25" fill="none" stroke="#0066CC" strokeWidth="1.5" />
        <circle cx="200" cy="85" r="3" fill="#0066CC" />

        {/* Blue lines */}
        <line x1="130" y1="5" x2="130" y2="165" stroke="#0066CC" strokeWidth="2.5" />
        <line x1="270" y1="5" x2="270" y2="165" stroke="#0066CC" strokeWidth="2.5" />

        {/* === Left goal (home) === */}
        {/* Goal posts */}
        <rect x="14" y="73" width="4" height="24" fill="#D32F2F" stroke="#002244" strokeWidth="0.8" rx="1" />
        {/* Goal crease */}
        <path d="M 18 73 Q 32 85 18 97" fill="rgba(135,206,250,0.3)" stroke="#D32F2F" strokeWidth="1.2" />
        {/* Trapezoid behind goal */}
        <path d="M 5 62 L 14 68 L 14 102 L 5 108" fill="none" stroke="#D32F2F" strokeWidth="0.8" strokeDasharray="2,2" />

        {/* === Right goal (away) === */}
        <rect x="382" y="73" width="4" height="24" fill="#D32F2F" stroke="#002244" strokeWidth="0.8" rx="1" />
        <path d="M 382 73 Q 368 85 382 97" fill="rgba(135,206,250,0.3)" stroke="#D32F2F" strokeWidth="1.2" />
        <path d="M 395 62 L 386 68 L 386 102 L 395 108" fill="none" stroke="#D32F2F" strokeWidth="0.8" strokeDasharray="2,2" />

        {/* Referee crease (center ice) */}
        <path d="M 200 165 Q 206 158 212 165" fill="none" stroke="#D32F2F" strokeWidth="0.8" />

        {/* === Face-off circles with hash marks === */}
        {/* Left zone top */}
        <circle cx="80" cy="50" r="15" fill="none" stroke="#D32F2F" strokeWidth="1" />
        <circle cx="80" cy="50" r="2.5" fill="#D32F2F" />
        <FaceOffCircleMarks cx={80} cy={50} />

        {/* Left zone bottom */}
        <circle cx="80" cy="120" r="15" fill="none" stroke="#D32F2F" strokeWidth="1" />
        <circle cx="80" cy="120" r="2.5" fill="#D32F2F" />
        <FaceOffCircleMarks cx={80} cy={120} />

        {/* Right zone top */}
        <circle cx="320" cy="50" r="15" fill="none" stroke="#D32F2F" strokeWidth="1" />
        <circle cx="320" cy="50" r="2.5" fill="#D32F2F" />
        <FaceOffCircleMarks cx={320} cy={50} />

        {/* Right zone bottom */}
        <circle cx="320" cy="120" r="15" fill="none" stroke="#D32F2F" strokeWidth="1" />
        <circle cx="320" cy="120" r="2.5" fill="#D32F2F" />
        <FaceOffCircleMarks cx={320} cy={120} />

        {/* Neutral zone face-off dots */}
        <circle cx="155" cy="50" r="2" fill="#D32F2F" />
        <circle cx="155" cy="120" r="2" fill="#D32F2F" />
        <circle cx="245" cy="50" r="2" fill="#D32F2F" />
        <circle cx="245" cy="120" r="2" fill="#D32F2F" />

        {/* === Measurement points === */}
        {points.map((point) => {
          const cx = (point.xPercent / 100) * 390 + 5
          const cy = (point.yPercent / 100) * 160 + 5
          const color = getPointColor(point.value, greenRange, yellowRange, redRange)

          return (
            <g
              key={point.id}
              onClick={() => onPointClick(point)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onPointClick(point)
                }
              }}
              className="cursor-pointer"
              role="button"
              tabIndex={0}
              aria-label={`Measurement point ${point.number}${point.value !== undefined ? `, depth: ${point.value} inches` : ', no reading'}`}
            >
              {/* Hover ring */}
              <circle
                cx={cx} cy={cy} r="13"
                fill="transparent" stroke="transparent" strokeWidth="2"
                className="transition-all duration-150 hover:stroke-navy dark:hover:stroke-white"
              />
              {/* Point circle */}
              <circle
                cx={cx} cy={cy} r="10"
                fill={color} stroke="#002244" strokeWidth="1.5"
                opacity="0.9"
                className="transition-transform duration-150 hover:scale-110"
                style={{ transformOrigin: `${cx}px ${cy}px` }}
              />
              {/* Point number */}
              <text
                x={cx}
                y={cy + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="white"
                fontSize="8"
                fontWeight="bold"
                className="pointer-events-none select-none"
              >
                {point.number}
              </text>
              {/* Value label below point */}
              {point.value !== undefined && (
                <text
                  x={cx}
                  y={cy + 16}
                  textAnchor="middle"
                  fill="#002244"
                  fontSize="7"
                  fontWeight="600"
                  className="pointer-events-none select-none dark:fill-gray-200"
                >
                  {point.value}&quot;
                </text>
              )}
            </g>
          )
        })}
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-3 text-sm dark:text-gray-200">
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded-full bg-action-green inline-block" />
          Optimal ({greenRange.min}&quot;–{greenRange.max}&quot;)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded-full bg-alert-yellow inline-block" />
          Too Thick ({yellowRange.min}&quot;–{yellowRange.max}&quot;)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded-full bg-alert-red inline-block" />
          Too Thin ({redRange.min}&quot;–{redRange.max}&quot;)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded-full bg-wolf-grey inline-block" />
          No Reading
        </span>
      </div>
    </div>
  )
}
