'use client'

import { useState } from 'react'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import clsx from 'clsx'

type ViewMode = 'entry' | 'history'

interface EquipmentItem {
  id: string
  name: string
  type: string
  lastReading: string | null
  status: 'ok' | 'warning' | 'none'
}

const EQUIPMENT: EquipmentItem[] = [
  { id: '1', name: 'Compressor #1 - Rink A', type: 'compressor', lastReading: '2 hours ago', status: 'ok' },
  { id: '2', name: 'Compressor #2 - Rink A', type: 'compressor', lastReading: '2 hours ago', status: 'warning' },
  { id: '3', name: 'Compressor #3 - Rink B', type: 'compressor', lastReading: '4 hours ago', status: 'ok' },
  { id: '4', name: 'Glycol Pump - Main', type: 'pump', lastReading: '2 hours ago', status: 'ok' },
  { id: '5', name: 'Brine Pump - Rink A', type: 'pump', lastReading: null, status: 'none' },
  { id: '6', name: 'Condenser Unit #1', type: 'condenser', lastReading: '3 hours ago', status: 'ok' },
]

// Mock reading types for a compressor
const COMPRESSOR_FIELDS = [
  { id: 'head-pressure', label: 'Head Pressure', unit: 'PSI', min: 150, max: 250 },
  { id: 'suction-pressure', label: 'Suction Pressure', unit: 'PSI', min: 20, max: 60 },
  { id: 'brine-temp', label: 'Brine Temperature', unit: '°F', min: 15, max: 30 },
  { id: 'condenser-temp', label: 'Condenser Temperature', unit: '°F', min: 70, max: 105 },
  { id: 'oil-level', label: 'Oil Level', unit: '', min: null, max: null },
]

export default function RefrigerationPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('entry')
  const [selectedEquipment, setSelectedEquipment] = useState<string | null>(null)
  const [readings, setReadings] = useState<Record<string, string>>({})

  const equipment = EQUIPMENT.find((e) => e.id === selectedEquipment)

  function handleReadingChange(fieldId: string, value: string) {
    setReadings((prev) => ({ ...prev, [fieldId]: value }))
  }

  function isOutOfRange(fieldId: string): boolean {
    const field = COMPRESSOR_FIELDS.find((f) => f.id === fieldId)
    const value = parseFloat(readings[fieldId])
    if (!field || isNaN(value) || field.min === null) return false
    return value < field.min || value > field.max!
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    alert('Reading saved!')
    setSelectedEquipment(null)
    setReadings({})
  }

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Refrigeration Plant Logs' }]} />

      <div className="flex items-center justify-between mb-6 px-4">
        <h1 className="text-2xl font-bold text-navy dark:text-white">
          Refrigeration Plant Logs
        </h1>
        <div className="flex gap-1">
          <button
            onClick={() => setViewMode('entry')}
            className={clsx('px-4 py-2 rounded-lg text-sm min-h-touch', viewMode === 'entry' ? 'bg-navy text-white' : 'bg-gray-100')}
          >
            Enter Readings
          </button>
          <button
            onClick={() => setViewMode('history')}
            className={clsx('px-4 py-2 rounded-lg text-sm min-h-touch', viewMode === 'history' ? 'bg-navy text-white' : 'bg-gray-100')}
          >
            History
          </button>
        </div>
      </div>

      {viewMode === 'entry' && !selectedEquipment && (
        <div className="px-4 space-y-3 max-w-2xl">
          <p className="text-sm text-wolf-grey mb-4">Select equipment to enter readings:</p>
          {EQUIPMENT.map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedEquipment(item.id)}
              className="card w-full text-left flex items-center justify-between hover:shadow-md transition-shadow"
            >
              <div>
                <div className="font-medium">{item.name}</div>
                <div className="text-sm text-wolf-grey capitalize">{item.type}</div>
              </div>
              <div className="text-right">
                <div className={clsx(
                  'text-xs font-medium px-2 py-1 rounded-full',
                  item.status === 'ok' && 'bg-action-green/10 text-action-green',
                  item.status === 'warning' && 'bg-alert-red/10 text-alert-red',
                  item.status === 'none' && 'bg-gray-100 text-wolf-grey',
                )}>
                  {item.status === 'ok' && 'Normal'}
                  {item.status === 'warning' && 'Out of Range'}
                  {item.status === 'none' && 'No Reading'}
                </div>
                {item.lastReading && (
                  <div className="text-xs text-wolf-grey mt-1">{item.lastReading}</div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {viewMode === 'entry' && selectedEquipment && equipment && (
        <div className="px-4 max-w-2xl">
          <button
            onClick={() => setSelectedEquipment(null)}
            className="text-sm text-navy dark:text-action-green hover:underline mb-4"
          >
            &larr; Back to equipment list
          </button>

          <form onSubmit={handleSubmit} className="card space-y-4">
            <h2 className="text-lg font-semibold">{equipment.name}</h2>

            {COMPRESSOR_FIELDS.map((field) => (
              <div key={field.id}>
                {field.id === 'oil-level' ? (
                  <Select
                    label={field.label}
                    options={[
                      { value: 'ok', label: 'OK' },
                      { value: 'low', label: 'Low' },
                      { value: 'add', label: 'Add' },
                    ]}
                    placeholder="Select level"
                    value={readings[field.id] || ''}
                    onChange={(e) => handleReadingChange(field.id, e.target.value)}
                  />
                ) : (
                  <div>
                    <Input
                      label={`${field.label} (${field.unit})`}
                      type="number"
                      step="0.1"
                      value={readings[field.id] || ''}
                      onChange={(e) => handleReadingChange(field.id, e.target.value)}
                      placeholder={`${field.min} - ${field.max} ${field.unit}`}
                      error={isOutOfRange(field.id) ? `Out of range! Expected ${field.min}-${field.max} ${field.unit}` : undefined}
                    />
                  </div>
                )}
              </div>
            ))}

            <div>
              <label className="form-label">Notes (optional)</label>
              <textarea className="form-input min-h-[60px]" placeholder="Add any notes..." />
            </div>

            <Button type="submit" size="lg">Save Reading</Button>
          </form>
        </div>
      )}

      {viewMode === 'history' && (
        <div className="px-4 max-w-4xl">
          <div className="flex gap-3 mb-4">
            <Select
              options={[{ value: '', label: 'All Equipment' }, ...EQUIPMENT.map((e) => ({ value: e.id, label: e.name }))]}
              className="max-w-[300px]"
            />
            <Input type="date" className="max-w-[180px]" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2">Equipment</th>
                  <th className="text-left py-3 px-2">Time</th>
                  <th className="text-left py-3 px-2">Head PSI</th>
                  <th className="text-left py-3 px-2">Suction PSI</th>
                  <th className="text-left py-3 px-2">Brine °F</th>
                  <th className="text-left py-3 px-2">Operator</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="py-3 px-2">Compressor #1</td>
                  <td className="py-3 px-2">10:00 AM</td>
                  <td className="py-3 px-2">195</td>
                  <td className="py-3 px-2">35</td>
                  <td className="py-3 px-2">22</td>
                  <td className="py-3 px-2">John D.</td>
                </tr>
                <tr className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="py-3 px-2">Compressor #2</td>
                  <td className="py-3 px-2">10:05 AM</td>
                  <td className="py-3 px-2 text-alert-red font-medium">275</td>
                  <td className="py-3 px-2">42</td>
                  <td className="py-3 px-2">24</td>
                  <td className="py-3 px-2">John D.</td>
                </tr>
                <tr className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="py-3 px-2">Compressor #1</td>
                  <td className="py-3 px-2">8:00 AM</td>
                  <td className="py-3 px-2">200</td>
                  <td className="py-3 px-2">38</td>
                  <td className="py-3 px-2">21</td>
                  <td className="py-3 px-2">Sarah M.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
