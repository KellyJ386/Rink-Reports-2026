'use client'

import { useState } from 'react'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { RinkDiagram } from '@/components/diagrams/RinkDiagram'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'

// Mock rinks
const RINKS = [
  { value: 'rink-a', label: 'Rink A - Main' },
  { value: 'rink-b', label: 'Rink B - Practice' },
]

// Mock measurement points
const INITIAL_POINTS = [
  { id: '1', number: 1, xPercent: 10, yPercent: 15, value: undefined as number | undefined },
  { id: '2', number: 2, xPercent: 10, yPercent: 50 },
  { id: '3', number: 3, xPercent: 10, yPercent: 85 },
  { id: '4', number: 4, xPercent: 25, yPercent: 15, value: 1.25 },
  { id: '5', number: 5, xPercent: 25, yPercent: 50, value: 1.5 },
  { id: '6', number: 6, xPercent: 25, yPercent: 85, value: 0.75 },
  { id: '7', number: 7, xPercent: 40, yPercent: 15, value: 1.8 },
  { id: '8', number: 8, xPercent: 40, yPercent: 50, value: 1.1 },
  { id: '9', number: 9, xPercent: 40, yPercent: 85, value: 1.3 },
  { id: '10', number: 10, xPercent: 55, yPercent: 15, value: 1.6 },
  { id: '11', number: 11, xPercent: 55, yPercent: 50 },
  { id: '12', number: 12, xPercent: 55, yPercent: 85, value: 2.1 },
  { id: '13', number: 13, xPercent: 70, yPercent: 15, value: 1.45 },
  { id: '14', number: 14, xPercent: 70, yPercent: 50, value: 1.2 },
  { id: '15', number: 15, xPercent: 70, yPercent: 85 },
  { id: '16', number: 16, xPercent: 85, yPercent: 15, value: 1.0 },
  { id: '17', number: 17, xPercent: 85, yPercent: 50, value: 1.65 },
  { id: '18', number: 18, xPercent: 85, yPercent: 85, value: 0.9 },
]

export default function IceDepthPage() {
  const [selectedRink, setSelectedRink] = useState('rink-a')
  const [points, setPoints] = useState(INITIAL_POINTS)
  const [selectedPoint, setSelectedPoint] = useState<typeof INITIAL_POINTS[0] | null>(null)
  const [manualValue, setManualValue] = useState('')

  function handlePointClick(point: typeof INITIAL_POINTS[0]) {
    setSelectedPoint(point)
    setManualValue(point.value?.toString() || '')
  }

  function handleSaveReading() {
    if (!selectedPoint || !manualValue) return
    const value = parseFloat(manualValue)
    if (isNaN(value)) return

    setPoints((prev) =>
      prev.map((p) =>
        p.id === selectedPoint.id ? { ...p, value } : p
      )
    )
    setSelectedPoint(null)
    setManualValue('')
  }

  async function handleSubmitAll() {
    // Would POST to /api/ice-depth
    alert('All readings submitted!')
  }

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Ice Depth Management' }]} />

      <div className="flex items-center justify-between mb-6 px-4">
        <h1 className="text-2xl font-bold text-navy dark:text-white">
          Ice Depth Management
        </h1>
      </div>

      {/* Rink Selector */}
      <div className="px-4 mb-6 max-w-xs">
        <Select
          label="Select Rink"
          options={RINKS}
          value={selectedRink}
          onChange={(e) => setSelectedRink(e.target.value)}
        />
      </div>

      {/* Rink Diagram */}
      <div className="px-4">
        <RinkDiagram
          points={points}
          onPointClick={handlePointClick}
        />
      </div>

      {/* Submit All */}
      <div className="px-4 mt-6">
        <Button onClick={handleSubmitAll} size="lg">
          Submit All Readings
        </Button>
      </div>

      {/* Measurement Entry Modal */}
      <Modal
        open={!!selectedPoint}
        onClose={() => setSelectedPoint(null)}
        title={`Point #${selectedPoint?.number}`}
        size="sm"
      >
        <div className="space-y-4">
          <Button variant="secondary" className="w-full" onClick={() => alert('Bluetooth pairing would activate')}>
            Read from Caliper (Bluetooth)
          </Button>

          <div className="text-center text-sm text-wolf-grey">or enter manually</div>

          <Input
            label="Ice Depth (inches)"
            type="number"
            step="0.01"
            min="0"
            max="10"
            value={manualValue}
            onChange={(e) => setManualValue(e.target.value)}
            placeholder='e.g., 1.25'
          />

          {selectedPoint?.value !== undefined && (
            <p className="text-sm text-wolf-grey">
              Last reading: {selectedPoint.value}&quot;
            </p>
          )}

          <div className="flex gap-3">
            <Button onClick={handleSaveReading} className="flex-1">
              Save
            </Button>
            <Button variant="secondary" onClick={() => setSelectedPoint(null)} className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
