'use client'

import { useState } from 'react'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Modal } from '@/components/ui/Modal'
import clsx from 'clsx'

type ViewMode = 'entry' | 'history'

const LOCATIONS = [
  { value: 'ice-level', label: 'Ice Level' },
  { value: 'stands', label: 'Stands' },
  { value: 'lobby', label: 'Lobby' },
  { value: 'zamboni-room', label: 'Zamboni Room' },
]

const METRICS = [
  { id: 'co', label: 'Carbon Monoxide (CO)', unit: 'PPM', maxThreshold: 25 },
  { id: 'co2', label: 'Carbon Dioxide (CO2)', unit: 'PPM', maxThreshold: 5000 },
  { id: 'no2', label: 'Nitrogen Dioxide (NO2)', unit: 'PPM', maxThreshold: 0.1 },
  { id: 'humidity', label: 'Humidity', unit: '%', maxThreshold: 65 },
  { id: 'temperature', label: 'Temperature', unit: '°F', maxThreshold: null },
]

// Mock history
const MOCK_HISTORY = [
  { id: '1', date: '2026-03-10', time: '10:00 AM', location: 'Ice Level', co: '5', co2: '800', no2: '0.02', humidity: '55', temp: '58', user: 'John D.' },
  { id: '2', date: '2026-03-10', time: '8:00 AM', location: 'Stands', co: '3', co2: '600', no2: '0.01', humidity: '52', temp: '62', user: 'Sarah M.' },
  { id: '3', date: '2026-03-09', time: '4:00 PM', location: 'Ice Level', co: '28', co2: '1200', no2: '0.08', humidity: '58', temp: '56', user: 'John D.' },
]

export default function AirQualityPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('entry')
  const [readings, setReadings] = useState<Record<string, string>>({})
  const [showReportModal, setShowReportModal] = useState(false)

  function handleReadingChange(metricId: string, value: string) {
    setReadings((prev) => ({ ...prev, [metricId]: value }))
  }

  function isOutOfRange(metricId: string): boolean {
    const metric = METRICS.find((m) => m.id === metricId)
    const value = parseFloat(readings[metricId])
    if (!metric || isNaN(value) || metric.maxThreshold === null) return false
    return value > metric.maxThreshold
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    alert('Air quality reading saved!')
    setReadings({})
  }

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Air Quality Monitoring' }]} />

      <div className="flex items-center justify-between mb-6 px-4 flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-navy dark:text-white">
          Air Quality Monitoring
        </h1>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setShowReportModal(true)}>
            Generate Report
          </Button>
          <div className="flex gap-1">
            <button
              onClick={() => setViewMode('entry')}
              className={clsx('px-4 py-2 rounded-lg text-sm min-h-touch', viewMode === 'entry' ? 'bg-navy text-white' : 'bg-gray-100')}
            >
              New Reading
            </button>
            <button
              onClick={() => setViewMode('history')}
              className={clsx('px-4 py-2 rounded-lg text-sm min-h-touch', viewMode === 'history' ? 'bg-navy text-white' : 'bg-gray-100')}
            >
              History
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'entry' && (
        <form onSubmit={handleSubmit} className="px-4 max-w-2xl">
          <div className="card space-y-4">
            <Select
              label="Reading Location"
              options={LOCATIONS}
              placeholder="Select location"
            />

            <Input
              label="Date & Time"
              type="datetime-local"
              defaultValue={new Date().toISOString().slice(0, 16)}
            />

            <hr className="my-2" />

            {METRICS.map((metric) => (
              <Input
                key={metric.id}
                label={`${metric.label} (${metric.unit})`}
                type="number"
                step={metric.id === 'no2' ? '0.01' : '1'}
                value={readings[metric.id] || ''}
                onChange={(e) => handleReadingChange(metric.id, e.target.value)}
                placeholder={metric.maxThreshold ? `Max: ${metric.maxThreshold} ${metric.unit}` : `Enter ${metric.unit}`}
                error={isOutOfRange(metric.id)
                  ? `Exceeds safe threshold of ${METRICS.find(m => m.id === metric.id)?.maxThreshold} ${metric.unit}!`
                  : undefined}
              />
            ))}

            <div>
              <label className="form-label">Notes (optional)</label>
              <textarea className="form-input min-h-[60px]" placeholder="Add any notes..." />
            </div>

            <Button type="submit" size="lg">Save Reading</Button>
          </div>
        </form>
      )}

      {viewMode === 'history' && (
        <div className="px-4 max-w-4xl">
          <div className="flex gap-3 mb-4">
            <Select options={[{ value: '', label: 'All Locations' }, ...LOCATIONS]} className="max-w-[200px]" />
            <Input type="date" className="max-w-[180px]" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2">Date</th>
                  <th className="text-left py-3 px-2">Location</th>
                  <th className="text-left py-3 px-2">CO (PPM)</th>
                  <th className="text-left py-3 px-2">CO2 (PPM)</th>
                  <th className="text-left py-3 px-2">NO2 (PPM)</th>
                  <th className="text-left py-3 px-2">Humidity %</th>
                  <th className="text-left py-3 px-2">Temp °F</th>
                  <th className="text-left py-3 px-2">By</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_HISTORY.map((row) => (
                  <tr key={row.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="py-3 px-2">{row.date} {row.time}</td>
                    <td className="py-3 px-2">{row.location}</td>
                    <td className={clsx('py-3 px-2', parseInt(row.co) > 25 && 'text-alert-red font-medium')}>{row.co}</td>
                    <td className="py-3 px-2">{row.co2}</td>
                    <td className="py-3 px-2">{row.no2}</td>
                    <td className="py-3 px-2">{row.humidity}</td>
                    <td className="py-3 px-2">{row.temp}</td>
                    <td className="py-3 px-2">{row.user}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Report Generation Modal */}
      <Modal
        open={showReportModal}
        onClose={() => setShowReportModal(false)}
        title="Generate Compliance Report"
      >
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert('Report generated!'); setShowReportModal(false) }}>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Start Date" type="date" />
            <Input label="End Date" type="date" defaultValue={new Date().toISOString().split('T')[0]} />
          </div>
          <Select
            label="Format"
            options={[
              { value: 'pdf', label: 'PDF' },
              { value: 'csv', label: 'CSV' },
              { value: 'xlsx', label: 'Excel (.xlsx)' },
            ]}
          />
          <Select
            label="Location Filter"
            options={[{ value: '', label: 'All Locations' }, ...LOCATIONS]}
          />
          <Button type="submit" className="w-full">Generate Report</Button>
        </form>
      </Modal>
    </div>
  )
}
