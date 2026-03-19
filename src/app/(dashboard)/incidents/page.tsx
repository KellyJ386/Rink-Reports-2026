'use client'

import { useState, useEffect, useCallback } from 'react'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { BodyDiagram } from '@/components/diagrams/BodyDiagram'
import { BODY_REGIONS_FRONT, BODY_REGIONS_BACK } from '@/lib/constants'
import { useAuth } from '@/hooks/useAuth'
import clsx from 'clsx'

type ViewMode = 'form' | 'history'

interface LocationOption {
  value: string
  label: string
}

interface HistoryItem {
  id: string
  type: string
  date: string
  time: string
  location: string
  description: string
  injuredName: string | null
  submittedBy: string
}

export default function IncidentsPage() {
  const { profile } = useAuth()

  const [viewMode, setViewMode] = useState<ViewMode>('form')
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Form state
  const [incidentType, setIncidentType] = useState('')
  const [incidentDate, setIncidentDate] = useState(new Date().toISOString().split('T')[0])
  const [incidentTime, setIncidentTime] = useState(new Date().toTimeString().slice(0, 5))
  const [incidentLocation, setIncidentLocation] = useState('')
  const [description, setDescription] = useState('')
  const [injuredName, setInjuredName] = useState('')
  const [injuredPartyType, setInjuredPartyType] = useState('')
  const [witnesses, setWitnesses] = useState('')
  const [selectedBodyParts, setSelectedBodyParts] = useState<string[]>([])

  // History state
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [historyFilter, setHistoryFilter] = useState('')
  const [historyDateFilter, setHistoryDateFilter] = useState('')
  const [historySearch, setHistorySearch] = useState('')

  // Location options from API
  const [locations, setLocations] = useState<LocationOption[]>([])

  // Fetch locations on mount
  useEffect(() => {
    async function fetchLocations() {
      try {
        const res = await fetch('/api/incidents/locations')
        if (res.ok) {
          const data = await res.json()
          setLocations(data)
        }
      } catch {
        // Use fallback locations
        setLocations([
          { value: 'rink-surface', label: 'Rink Surface' },
          { value: 'stands', label: 'Stands/Seating' },
          { value: 'lobby', label: 'Lobby' },
          { value: 'locker-room', label: 'Locker Room' },
          { value: 'parking', label: 'Parking Lot' },
          { value: 'concessions', label: 'Concessions Area' },
          { value: 'pro-shop', label: 'Pro Shop' },
          { value: 'other', label: 'Other' },
        ])
      }
    }
    fetchLocations()
  }, [])

  // Fetch history
  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (historyFilter) params.set('type', historyFilter)
      if (historyDateFilter) params.set('date', historyDateFilter)
      if (historySearch) params.set('search', historySearch)

      const res = await fetch(`/api/incidents?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to load incident history')
      const data = await res.json()
      setHistory(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load history')
    } finally {
      setLoading(false)
    }
  }, [historyFilter, historyDateFilter, historySearch])

  useEffect(() => {
    if (viewMode === 'history') {
      fetchHistory()
    }
  }, [viewMode, fetchHistory])

  function toggleBodyPart(id: string) {
    setSelectedBodyParts((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    )
  }

  function resetForm() {
    setIncidentType('')
    setIncidentDate(new Date().toISOString().split('T')[0])
    setIncidentTime(new Date().toTimeString().slice(0, 5))
    setIncidentLocation('')
    setDescription('')
    setInjuredName('')
    setInjuredPartyType('')
    setWitnesses('')
    setSelectedBodyParts([])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    try {
      setSubmitting(true)

      const body: Record<string, unknown> = {
        type: incidentType,
        date: incidentDate,
        time: incidentTime,
        location: incidentLocation,
        description,
        witnesses,
      }

      if (incidentType === 'ACCIDENT') {
        body.injured_name = injuredName
        body.injured_party_type = injuredPartyType
        body.body_parts = selectedBodyParts
      }

      const res = await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => null)
        throw new Error(errData?.error || 'Failed to submit report')
      }

      setSuccessMsg('Incident report submitted successfully!')
      setTimeout(() => setSuccessMsg(null), 3000)
      resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit report')
    } finally {
      setSubmitting(false)
    }
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

      {/* Error / Success messages */}
      {error && (
        <div className="mx-4 mb-4 p-3 bg-alert-red/10 text-alert-red rounded-lg text-sm">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">Dismiss</button>
        </div>
      )}
      {successMsg && (
        <div className="mx-4 mb-4 p-3 bg-action-green/10 text-action-green rounded-lg text-sm">
          {successMsg}
        </div>
      )}

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
              <Input
                label="Date"
                type="date"
                value={incidentDate}
                onChange={(e) => setIncidentDate(e.target.value)}
              />
              <Input
                label="Time"
                type="time"
                value={incidentTime}
                onChange={(e) => setIncidentTime(e.target.value)}
              />
            </div>

            <Select
              label="Location"
              options={locations}
              placeholder="Select location"
              value={incidentLocation}
              onChange={(e) => setIncidentLocation(e.target.value)}
            />

            <div>
              <label className="form-label">Description</label>
              <textarea
                className="form-input min-h-[120px]"
                placeholder="Describe what happened in detail..."
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          {/* Accident-specific fields */}
          {incidentType === 'ACCIDENT' && (
            <div className="card space-y-4">
              <h2 className="text-lg font-semibold">Injury Details</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Injured Party Name"
                  placeholder="Full name"
                  value={injuredName}
                  onChange={(e) => setInjuredName(e.target.value)}
                />
                <Select
                  label="Injured Party Type"
                  options={[
                    { value: 'PATRON', label: 'Patron' },
                    { value: 'STAFF', label: 'Staff' },
                  ]}
                  placeholder="Select type"
                  value={injuredPartyType}
                  onChange={(e) => setInjuredPartyType(e.target.value)}
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
            <Input
              label="Witnesses"
              placeholder="Names of any witnesses"
              value={witnesses}
              onChange={(e) => setWitnesses(e.target.value)}
            />
          </div>

          <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Report'}
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
              value={historyFilter}
              onChange={(e) => setHistoryFilter(e.target.value)}
            />
            <Input
              type="date"
              className="max-w-[180px]"
              value={historyDateFilter}
              onChange={(e) => setHistoryDateFilter(e.target.value)}
            />
            <Input
              placeholder="Search..."
              className="max-w-[250px]"
              value={historySearch}
              onChange={(e) => setHistorySearch(e.target.value)}
            />
          </div>

          {/* Loading */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy" />
            </div>
          ) : (
            /* List */
            <div className="space-y-3">
              {history.length === 0 && (
                <p className="text-sm text-wolf-grey text-center py-8">No incidents found.</p>
              )}
              {history.map((item) => (
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
          )}
        </div>
      )}
    </div>
  )
}
