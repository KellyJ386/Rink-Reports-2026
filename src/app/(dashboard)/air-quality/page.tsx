'use client'

import { useState, useEffect, useCallback } from 'react'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Modal } from '@/components/ui/Modal'
import { useAuth } from '@/hooks/useAuth'
import { useOfflineSync } from '@/hooks/useOfflineSync'
import { useFormDraft } from '@/hooks/useFormDraft'
import clsx from 'clsx'

type ViewMode = 'entry' | 'history'

interface LocationOption {
  value: string
  label: string
}

interface Metric {
  id: string
  label: string
  unit: string
  maxThreshold: number | null
  step?: string
}

interface HistoryRow {
  id: string
  date: string
  time: string
  location: string
  readings: Record<string, string | number>
  user: string
}

interface Jurisdiction {
  value: string
  label: string
}

export default function AirQualityPage() {
  const { profile } = useAuth()
  const { isOnline, pendingCount, submitWithOfflineSupport } = useOfflineSync()
  const { saveDraft, loadDraft, clearDraft } = useFormDraft()

  const [viewMode, setViewMode] = useState<ViewMode>('entry')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [showReportModal, setShowReportModal] = useState(false)
  const [generatingReport, setGeneratingReport] = useState(false)

  // Data
  const [locations, setLocations] = useState<LocationOption[]>([])
  const [metrics, setMetrics] = useState<Metric[]>([])
  const [jurisdictions, setJurisdictions] = useState<Jurisdiction[]>([])

  // Form state
  const [readings, setReadings] = useState<Record<string, string>>({})
  const [selectedLocation, setSelectedLocation] = useState('')
  const [dateTime, setDateTime] = useState(new Date().toISOString().slice(0, 16))
  const [entryNotes, setEntryNotes] = useState('')

  // History state
  const [historyRows, setHistoryRows] = useState<HistoryRow[]>([])
  const [historyLocationFilter, setHistoryLocationFilter] = useState('')
  const [historyDateFilter, setHistoryDateFilter] = useState('')
  const [loadingHistory, setLoadingHistory] = useState(false)

  // Report modal state
  const [reportStartDate, setReportStartDate] = useState('')
  const [reportEndDate, setReportEndDate] = useState(new Date().toISOString().split('T')[0])
  const [reportFormat, setReportFormat] = useState('pdf')
  const [reportLocation, setReportLocation] = useState('')

  // Load draft on mount
  useEffect(() => {
    async function restoreDraft() {
      const draft = await loadDraft('air-quality-entry')
      if (draft) {
        if (draft.readings) setReadings(draft.readings as Record<string, string>)
        if (draft.selectedLocation) setSelectedLocation(draft.selectedLocation as string)
        if (draft.dateTime) setDateTime(draft.dateTime as string)
        if (draft.entryNotes) setEntryNotes(draft.entryNotes as string)
      }
    }
    restoreDraft()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Save draft on field changes
  useEffect(() => {
    saveDraft('air-quality-entry', {
      readings,
      selectedLocation,
      dateTime,
      entryNotes,
    })
  }, [readings, selectedLocation, dateTime, entryNotes, saveDraft])

  // Fetch metrics, locations, and jurisdictions on mount
  useEffect(() => {
    async function fetchConfig() {
      try {
        setLoading(true)
        const [metricsRes, jurisdictionsRes] = await Promise.all([
          fetch('/api/air-quality/metrics'),
          fetch('/api/air-quality/jurisdictions'),
        ])

        if (metricsRes.ok) {
          const data = await metricsRes.json()
          // The metrics API may return locations as well
          if (data.metrics) {
            setMetrics(data.metrics)
            setLocations(data.locations || [])
          } else {
            setMetrics(data)
          }
        }

        if (jurisdictionsRes.ok) {
          const data = await jurisdictionsRes.json()
          setJurisdictions(data)
        }

        // Fetch locations separately if not included in metrics
        const locRes = await fetch('/api/air-quality/locations')
        if (locRes.ok) {
          const locData = await locRes.json()
          if (locData.length > 0) {
            setLocations(locData)
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load configuration')
        // Set fallback locations if API fails
        if (locations.length === 0) {
          setLocations([
            { value: 'ice-level', label: 'Ice Level' },
            { value: 'stands', label: 'Stands' },
            { value: 'lobby', label: 'Lobby' },
            { value: 'zamboni-room', label: 'Zamboni Room' },
          ])
        }
      } finally {
        setLoading(false)
      }
    }
    fetchConfig()
  }, [])

  // Fetch history
  const fetchHistory = useCallback(async () => {
    try {
      setLoadingHistory(true)
      const params = new URLSearchParams()
      if (historyLocationFilter) params.set('location', historyLocationFilter)
      if (historyDateFilter) params.set('date', historyDateFilter)

      const res = await fetch(`/api/air-quality/readings?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to load readings history')
      const data = await res.json()
      setHistoryRows(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load history')
    } finally {
      setLoadingHistory(false)
    }
  }, [historyLocationFilter, historyDateFilter])

  useEffect(() => {
    if (viewMode === 'history') {
      fetchHistory()
    }
  }, [viewMode, fetchHistory])

  function handleReadingChange(metricId: string, value: string) {
    setReadings((prev) => ({ ...prev, [metricId]: value }))
  }

  function isOutOfRange(metricId: string): boolean {
    const metric = metrics.find((m) => m.id === metricId)
    const value = parseFloat(readings[metricId])
    if (!metric || isNaN(value) || metric.maxThreshold === null) return false
    return value > metric.maxThreshold
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    try {
      setSubmitting(true)

      const submitBody = {
        location: selectedLocation,
        date_time: dateTime,
        readings: Object.entries(readings).map(([metric_id, value]) => ({
          metric_id,
          value: parseFloat(value),
        })),
        notes: entryNotes,
      }

      const res = await submitWithOfflineSupport('/api/air-quality/readings', 'POST', submitBody)

      if (res === null) {
        // Saved offline
        setSuccessMsg('Saved offline - will sync when reconnected.')
        setTimeout(() => setSuccessMsg(null), 5000)
        await clearDraft('air-quality-entry')
        setReadings({})
        setSelectedLocation('')
        setDateTime(new Date().toISOString().slice(0, 16))
        setEntryNotes('')
        return
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => null)
        throw new Error(errData?.error || 'Failed to save reading')
      }

      setSuccessMsg('Air quality reading saved successfully!')
      setTimeout(() => setSuccessMsg(null), 3000)
      await clearDraft('air-quality-entry')
      setReadings({})
      setSelectedLocation('')
      setDateTime(new Date().toISOString().slice(0, 16))
      setEntryNotes('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save reading')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleGenerateReport(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    try {
      setGeneratingReport(true)

      const res = await fetch('/api/air-quality/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          start_date: reportStartDate,
          end_date: reportEndDate,
          format: reportFormat,
          location: reportLocation || null,
        }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => null)
        throw new Error(errData?.error || 'Failed to generate report')
      }

      // Handle file download
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `air-quality-report.${reportFormat}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      setShowReportModal(false)
      setSuccessMsg('Report generated and downloaded!')
      setTimeout(() => setSuccessMsg(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate report')
    } finally {
      setGeneratingReport(false)
    }
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

      {/* Offline indicator */}
      {!isOnline && (
        <div className="mx-4 mb-4 p-3 bg-alert-yellow/10 text-alert-yellow-dark rounded-lg text-sm flex items-center gap-2">
          <span>You are offline. Changes will be saved and synced when reconnected.</span>
          {pendingCount > 0 && <span className="font-medium">({pendingCount} pending)</span>}
        </div>
      )}

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

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy" />
        </div>
      )}

      {!loading && viewMode === 'entry' && (
        <form onSubmit={handleSubmit} className="px-4 max-w-2xl">
          <div className="card space-y-4">
            <Select
              label="Reading Location"
              options={locations}
              placeholder="Select location"
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
            />

            <Input
              label="Date & Time"
              type="datetime-local"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
            />

            <hr className="my-2" />

            {metrics.map((metric) => (
              <Input
                key={metric.id}
                label={`${metric.label} (${metric.unit})`}
                type="number"
                step={metric.step || (metric.id === 'no2' ? '0.01' : '1')}
                value={readings[metric.id] || ''}
                onChange={(e) => handleReadingChange(metric.id, e.target.value)}
                placeholder={metric.maxThreshold ? `Max: ${metric.maxThreshold} ${metric.unit}` : `Enter ${metric.unit}`}
                error={isOutOfRange(metric.id)
                  ? `Exceeds safe threshold of ${metric.maxThreshold} ${metric.unit}!`
                  : undefined}
              />
            ))}

            <div>
              <label className="form-label">Notes (optional)</label>
              <textarea
                className="form-input min-h-[60px]"
                placeholder="Add any notes..."
                value={entryNotes}
                onChange={(e) => setEntryNotes(e.target.value)}
              />
            </div>

            <Button type="submit" size="lg" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Reading'}
            </Button>
          </div>
        </form>
      )}

      {!loading && viewMode === 'history' && (
        <div className="px-4 max-w-4xl">
          <div className="flex gap-3 mb-4">
            <Select
              options={[{ value: '', label: 'All Locations' }, ...locations]}
              className="max-w-[200px]"
              value={historyLocationFilter}
              onChange={(e) => setHistoryLocationFilter(e.target.value)}
            />
            <Input
              type="date"
              className="max-w-[180px]"
              value={historyDateFilter}
              onChange={(e) => setHistoryDateFilter(e.target.value)}
            />
          </div>

          {loadingHistory ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2">Date</th>
                    <th className="text-left py-3 px-2">Location</th>
                    {metrics.map((m) => (
                      <th key={m.id} className="text-left py-3 px-2">{m.label.split('(')[0].trim()} ({m.unit})</th>
                    ))}
                    <th className="text-left py-3 px-2">By</th>
                  </tr>
                </thead>
                <tbody>
                  {historyRows.length === 0 && (
                    <tr>
                      <td colSpan={metrics.length + 3} className="py-8 text-center text-wolf-grey text-sm">
                        No readings found.
                      </td>
                    </tr>
                  )}
                  {historyRows.map((row) => (
                    <tr key={row.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="py-3 px-2">{row.date} {row.time}</td>
                      <td className="py-3 px-2">{row.location}</td>
                      {metrics.map((m) => {
                        const val = row.readings[m.id]
                        const numVal = typeof val === 'string' ? parseFloat(val) : val
                        const outOfRange = m.maxThreshold !== null && typeof numVal === 'number' && !isNaN(numVal) && numVal > m.maxThreshold
                        return (
                          <td key={m.id} className={clsx('py-3 px-2', outOfRange && 'text-alert-red font-medium')}>
                            {val ?? '-'}
                          </td>
                        )
                      })}
                      <td className="py-3 px-2">{row.user}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Report Generation Modal */}
      <Modal
        open={showReportModal}
        onClose={() => setShowReportModal(false)}
        title="Generate Compliance Report"
      >
        <form className="space-y-4" onSubmit={handleGenerateReport}>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              value={reportStartDate}
              onChange={(e) => setReportStartDate(e.target.value)}
              required
            />
            <Input
              label="End Date"
              type="date"
              value={reportEndDate}
              onChange={(e) => setReportEndDate(e.target.value)}
              required
            />
          </div>
          <Select
            label="Format"
            options={[
              { value: 'pdf', label: 'PDF' },
              { value: 'csv', label: 'CSV' },
              { value: 'xlsx', label: 'Excel (.xlsx)' },
            ]}
            value={reportFormat}
            onChange={(e) => setReportFormat(e.target.value)}
          />
          <Select
            label="Location Filter"
            options={[{ value: '', label: 'All Locations' }, ...locations]}
            value={reportLocation}
            onChange={(e) => setReportLocation(e.target.value)}
          />
          {jurisdictions.length > 0 && (
            <Select
              label="Jurisdiction"
              options={jurisdictions}
              placeholder="Select jurisdiction (optional)"
            />
          )}
          <Button type="submit" className="w-full" disabled={generatingReport}>
            {generatingReport ? 'Generating...' : 'Generate Report'}
          </Button>
        </form>
      </Modal>
    </div>
  )
}
