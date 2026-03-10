'use client'

import { useState } from 'react'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { BodyDiagram } from '@/components/diagrams/BodyDiagram'
import { BODY_REGIONS_FRONT, BODY_REGIONS_BACK } from '@/lib/constants'
import clsx from 'clsx'

type ViewMode = 'form' | 'history'

const LOCATIONS = [
  { value: 'rink-surface', label: 'Rink Surface' },
  { value: 'stands', label: 'Stands/Seating' },
  { value: 'lobby', label: 'Lobby' },
  { value: 'locker-room', label: 'Locker Room' },
  { value: 'parking', label: 'Parking Lot' },
  { value: 'concessions', label: 'Concessions Area' },
  { value: 'pro-shop', label: 'Pro Shop' },
  { value: 'other', label: 'Other' },
]

// Mock history
const MOCK_HISTORY = [
  { id: '1', type: 'ACCIDENT', date: '2026-03-09', time: '14:30', location: 'Rink Surface', description: 'Patron fell while skating, struck knee on ice', injuredName: 'Jane Smith', submittedBy: 'John D.' },
  { id: '2', type: 'INCIDENT', date: '2026-03-08', time: '09:15', location: 'Lobby', description: 'Water leak from ceiling near entrance', injuredName: null, submittedBy: 'Sarah M.' },
  { id: '3', type: 'ACCIDENT', date: '2026-03-05', time: '16:45', location: 'Locker Room', description: 'Staff member slipped on wet floor', injuredName: 'Mike R.', submittedBy: 'Mike R.' },
]

export default function IncidentsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('form')
  const [incidentType, setIncidentType] = useState('')
  const [selectedBodyParts, setSelectedBodyParts] = useState<string[]>([])

  function toggleBodyPart(id: string) {
    setSelectedBodyParts((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    alert('Incident report submitted!')
  }

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Incident Reporting' }]} />

      <div className="flex items-center justify-between mb-6 px-4">
        <h1 className="text-2xl font-bold text-navy dark:text-white">
          Incident Reporting
        </h1>
        <div className="flex gap-1">
          <button
            onClick={() => setViewMode('form')}
            className={clsx('px-4 py-2 rounded-lg text-sm min-h-touch', viewMode === 'form' ? 'bg-navy text-white' : 'bg-gray-100')}
          >
            New Report
          </button>
          <button
            onClick={() => setViewMode('history')}
            className={clsx('px-4 py-2 rounded-lg text-sm min-h-touch', viewMode === 'history' ? 'bg-navy text-white' : 'bg-gray-100')}
          >
            History
          </button>
        </div>
      </div>

      {viewMode === 'form' ? (
        <form onSubmit={handleSubmit} className="px-4 space-y-6 max-w-3xl">
          <div className="card space-y-4">
            <h2 className="text-lg font-semibold">Report Details</h2>

            <Select
              label="Incident Type"
              options={[
                { value: 'INCIDENT', label: 'Incident (no injury)' },
                { value: 'ACCIDENT', label: 'Accident (injury involved)' },
              ]}
              placeholder="Select type"
              value={incidentType}
              onChange={(e) => setIncidentType(e.target.value)}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Date" type="date" defaultValue={new Date().toISOString().split('T')[0]} />
              <Input label="Time" type="time" defaultValue={new Date().toTimeString().slice(0, 5)} />
            </div>

            <Select label="Location" options={LOCATIONS} placeholder="Select location" />

            <div>
              <label className="form-label">Description</label>
              <textarea
                className="form-input min-h-[120px]"
                placeholder="Describe what happened in detail..."
                required
              />
            </div>
          </div>

          {/* Accident-specific fields */}
          {incidentType === 'ACCIDENT' && (
            <div className="card space-y-4">
              <h2 className="text-lg font-semibold">Injury Details</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Injured Party Name" placeholder="Full name" />
                <Select
                  label="Injured Party Type"
                  options={[
                    { value: 'PATRON', label: 'Patron' },
                    { value: 'STAFF', label: 'Staff' },
                  ]}
                  placeholder="Select type"
                />
              </div>

              {/* Body Diagram */}
              <div>
                <label className="form-label mb-2">Mark Injury Location(s)</label>
                <p className="text-sm text-wolf-grey mb-3">
                  Tap on the body diagram to mark injury locations.
                  {selectedBodyParts.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedBodyParts([])}
                      className="ml-2 text-alert-red hover:underline"
                    >
                      Clear all
                    </button>
                  )}
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <BodyDiagram
                    view="front"
                    regions={BODY_REGIONS_FRONT as unknown as { id: string; label: string; x: number; y: number; w: number; h: number }[]}
                    selectedRegions={selectedBodyParts}
                    onRegionToggle={toggleBodyPart}
                  />
                  <BodyDiagram
                    view="back"
                    regions={BODY_REGIONS_BACK as unknown as { id: string; label: string; x: number; y: number; w: number; h: number }[]}
                    selectedRegions={selectedBodyParts}
                    onRegionToggle={toggleBodyPart}
                  />
                </div>
                {selectedBodyParts.length > 0 && (
                  <div className="mt-2 text-sm text-wolf-grey">
                    Selected: {selectedBodyParts.map((p) => p.replace(/_/g, ' ')).join(', ')}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="card space-y-4">
            <Input label="Witnesses" placeholder="Names of any witnesses" />
          </div>

          <Button type="submit" size="lg" className="w-full sm:w-auto">
            Submit Report
          </Button>
        </form>
      ) : (
        /* History View */
        <div className="px-4">
          {/* Filters */}
          <div className="flex gap-3 mb-4 flex-wrap">
            <Select
              options={[
                { value: '', label: 'All Types' },
                { value: 'INCIDENT', label: 'Incidents' },
                { value: 'ACCIDENT', label: 'Accidents' },
              ]}
              className="max-w-[200px]"
            />
            <Input type="date" className="max-w-[180px]" />
            <Input placeholder="Search..." className="max-w-[250px]" />
          </div>

          {/* List */}
          <div className="space-y-3">
            {MOCK_HISTORY.map((item) => (
              <div key={item.id} className="card flex items-start gap-4 cursor-pointer hover:shadow-md transition-shadow">
                <div className={clsx(
                  'w-2 h-full min-h-[60px] rounded-full flex-shrink-0',
                  item.type === 'ACCIDENT' ? 'bg-alert-red' : 'bg-alert-yellow'
                )} />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={clsx(
                      'text-xs font-medium px-2 py-0.5 rounded-full',
                      item.type === 'ACCIDENT' ? 'bg-alert-red/10 text-alert-red' : 'bg-alert-yellow/10 text-alert-yellow-dark'
                    )}>
                      {item.type}
                    </span>
                    <span className="text-sm text-wolf-grey">{item.date} at {item.time}</span>
                  </div>
                  <p className="text-sm mb-1">{item.description}</p>
                  <div className="flex gap-4 text-xs text-wolf-grey">
                    <span>Location: {item.location}</span>
                    {item.injuredName && <span>Injured: {item.injuredName}</span>}
                    <span>By: {item.submittedBy}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
