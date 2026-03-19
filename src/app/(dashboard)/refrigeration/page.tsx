'use client'

import { useState, useEffect, useCallback } from 'react'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { useAuth } from '@/hooks/useAuth'
import { useOfflineSync } from '@/hooks/useOfflineSync'
import { useFormDraft } from '@/hooks/useFormDraft'
import clsx from 'clsx'

type ViewMode = 'entry' | 'history'

interface EquipmentItem {
  id: string
  name: string
  type: string
  lastReading: string | null
  status: 'ok' | 'warning' | 'none'
}

interface ReadingField {
  id: string
  label: string
  unit: string
  min: number | null
  max: number | null
  input_type?: string
  options?: { value: string; label: string }[]
}

interface HistoryRow {
  id: string
  equipment_name: string
  timestamp: string
  readings: Record<string, string | number>
  operator: string
}

export default function RefrigerationPage() {
  const { profile } = useAuth()
  const { isOnline, pendingCount, submitWithOfflineSupport } = useOfflineSync()
  const { saveDraft, loadDraft, clearDraft } = useFormDraft()

  const [viewMode, setViewMode] = useState<ViewMode>('entry')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Equipment list
  const [equipment, setEquipment] = useState<EquipmentItem[]>([])
  const [selectedEquipment, setSelectedEquipment] = useState<string | null>(null)

  // Reading fields for selected equipment
  const [readingFields, setReadingFields] = useState<ReadingField[]>([])
  const [loadingFields, setLoadingFields] = useState(false)
  const [readings, setReadings] = useState<Record<string, string>>({})
  const [readingNotes, setReadingNotes] = useState('')

  // History
  const [historyRows, setHistoryRows] = useState<HistoryRow[]>([])
  const [historyEquipmentFilter, setHistoryEquipmentFilter] = useState('')
  const [historyDateFilter, setHistoryDateFilter] = useState('')
  const [loadingHistory, setLoadingHistory] = useState(false)

  const selectedEquipmentData = equipment.find((e) => e.id === selectedEquipment)

  // Fetch equipment on mount
  useEffect(() => {
    async function fetchEquipment() {
      try {
        setLoading(true)
        const res = await fetch('/api/refrigeration/equipment')
        if (!res.ok) throw new Error('Failed to load equipment')
        const data = await res.json()
        setEquipment(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load equipment')
      } finally {
        setLoading(false)
      }
    }
    fetchEquipment()
  }, [])

  // Fetch reading fields when equipment is selected
  useEffect(() => {
    if (!selectedEquipment) return

    async function fetchFields() {
      try {
        setLoadingFields(true)
        setError(null)
        const res = await fetch(`/api/refrigeration/equipment/${selectedEquipment}/fields`)
        if (!res.ok) throw new Error('Failed to load reading fields')
        const data = await res.json()
        setReadingFields(data)
        // Load draft for this equipment if available
        const draft = await loadDraft(`refrigeration-${selectedEquipment}`)
        if (draft) {
          setReadings((draft.readings as Record<string, string>) || {})
          setReadingNotes((draft.readingNotes as string) || '')
        } else {
          setReadings({})
          setReadingNotes('')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load reading fields')
      } finally {
        setLoadingFields(false)
      }
    }
    fetchFields()
  }, [selectedEquipment, loadDraft])

  // Save draft on reading changes
  useEffect(() => {
    if (!selectedEquipment) return
    saveDraft(`refrigeration-${selectedEquipment}`, {
      readings,
      readingNotes,
    })
  }, [readings, readingNotes, selectedEquipment, saveDraft])

  // Fetch history
  const fetchHistory = useCallback(async () => {
    try {
      setLoadingHistory(true)
      const params = new URLSearchParams()
      if (historyEquipmentFilter) params.set('equipment_id', historyEquipmentFilter)
      if (historyDateFilter) params.set('date', historyDateFilter)

      const res = await fetch(`/api/refrigeration/readings?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to load reading history')
      const data = await res.json()
      setHistoryRows(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load history')
    } finally {
      setLoadingHistory(false)
    }
  }, [historyEquipmentFilter, historyDateFilter])

  useEffect(() => {
    if (viewMode === 'history') {
      fetchHistory()
    }
  }, [viewMode, fetchHistory])

  function handleReadingChange(fieldId: string, value: string) {
    setReadings((prev) => ({ ...prev, [fieldId]: value }))
  }

  function isOutOfRange(fieldId: string): boolean {
    const field = readingFields.find((f) => f.id === fieldId)
    const value = parseFloat(readings[fieldId])
    if (!field || isNaN(value) || field.min === null) return false
    return value < field.min || value > (field.max ?? Infinity)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    try {
      setSubmitting(true)

      const submitBody = {
        equipment_id: selectedEquipment,
        readings: Object.entries(readings).map(([field_id, value]) => ({
          field_id,
          value,
        })),
        notes: readingNotes,
      }

      const res = await submitWithOfflineSupport('/api/refrigeration/readings', 'POST', submitBody)

      if (res === null) {
        // Saved offline
        setSuccessMsg('Saved offline - will sync when reconnected.')
        setTimeout(() => setSuccessMsg(null), 5000)
        await clearDraft(`refrigeration-${selectedEquipment}`)
        setSelectedEquipment(null)
        setReadings({})
        setReadingNotes('')
        return
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => null)
        throw new Error(errData?.error || 'Failed to save reading')
      }

      setSuccessMsg('Reading saved successfully!')
      setTimeout(() => setSuccessMsg(null), 3000)
      await clearDraft(`refrigeration-${selectedEquipment}`)
      setSelectedEquipment(null)
      setReadings({})
      setReadingNotes('')

      // Refresh equipment list to update last reading times
      const equipRes = await fetch('/api/refrigeration/equipment')
      if (equipRes.ok) {
        const data = await equipRes.json()
        setEquipment(data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save reading')
    } finally {
      setSubmitting(false)
    }
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

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy" />
        </div>
      )}

      {!loading && viewMode === 'entry' && !selectedEquipment && (
        <div className="px-4 space-y-3 max-w-2xl">
          <p className="text-sm text-wolf-grey mb-4">Select equipment to enter readings:</p>
          {equipment.map((item) => (
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

      {!loading && viewMode === 'entry' && selectedEquipment && selectedEquipmentData && (
        <div className="px-4 max-w-2xl">
          <button
            onClick={() => setSelectedEquipment(null)}
            className="text-sm text-navy dark:text-action-green hover:underline mb-4"
          >
            &larr; Back to equipment list
          </button>

          {loadingFields ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-navy" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="card space-y-4">
              <h2 className="text-lg font-semibold">{selectedEquipmentData.name}</h2>

              {readingFields.map((field) => (
                <div key={field.id}>
                  {field.input_type === 'select' && field.options ? (
                    <Select
                      label={field.label}
                      options={field.options}
                      placeholder="Select level"
                      value={readings[field.id] || ''}
                      onChange={(e) => handleReadingChange(field.id, e.target.value)}
                    />
                  ) : (
                    <div>
                      <Input
                        label={`${field.label}${field.unit ? ` (${field.unit})` : ''}`}
                        type="number"
                        step="0.1"
                        value={readings[field.id] || ''}
                        onChange={(e) => handleReadingChange(field.id, e.target.value)}
                        placeholder={field.min !== null && field.max !== null ? `${field.min} - ${field.max} ${field.unit}` : `Enter ${field.unit}`}
                        error={isOutOfRange(field.id) ? `Out of range! Expected ${field.min}-${field.max} ${field.unit}` : undefined}
                      />
                    </div>
                  )}
                </div>
              ))}

              <div>
                <label className="form-label">Notes (optional)</label>
                <textarea
                  className="form-input min-h-[60px]"
                  placeholder="Add any notes..."
                  value={readingNotes}
                  onChange={(e) => setReadingNotes(e.target.value)}
                />
              </div>

              <Button type="submit" size="lg" disabled={submitting}>
                {submitting ? 'Saving...' : 'Save Reading'}
              </Button>
            </form>
          )}
        </div>
      )}

      {viewMode === 'history' && (
        <div className="px-4 max-w-4xl">
          <div className="flex gap-3 mb-4">
            <Select
              options={[{ value: '', label: 'All Equipment' }, ...equipment.map((e) => ({ value: e.id, label: e.name }))]}
              className="max-w-[300px]"
              value={historyEquipmentFilter}
              onChange={(e) => setHistoryEquipmentFilter(e.target.value)}
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
                    <th className="text-left py-3 px-2">Equipment</th>
                    <th className="text-left py-3 px-2">Time</th>
                    {readingFields.length > 0
                      ? readingFields.slice(0, 4).map((f) => (
                          <th key={f.id} className="text-left py-3 px-2">{f.label}</th>
                        ))
                      : (
                        <>
                          <th className="text-left py-3 px-2">Head PSI</th>
                          <th className="text-left py-3 px-2">Suction PSI</th>
                          <th className="text-left py-3 px-2">Brine °F</th>
                        </>
                      )}
                    <th className="text-left py-3 px-2">Operator</th>
                  </tr>
                </thead>
                <tbody>
                  {historyRows.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-wolf-grey text-sm">
                        No readings found.
                      </td>
                    </tr>
                  )}
                  {historyRows.map((row) => (
                    <tr key={row.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="py-3 px-2">{row.equipment_name}</td>
                      <td className="py-3 px-2">{row.timestamp}</td>
                      {readingFields.length > 0
                        ? readingFields.slice(0, 4).map((f) => {
                            const val = row.readings[f.id]
                            const numVal = typeof val === 'string' ? parseFloat(val) : val
                            const outOfRange = f.min !== null && f.max !== null && typeof numVal === 'number' && !isNaN(numVal) && (numVal < f.min || numVal > f.max)
                            return (
                              <td key={f.id} className={clsx('py-3 px-2', outOfRange && 'text-alert-red font-medium')}>
                                {val ?? '-'}
                              </td>
                            )
                          })
                        : Object.values(row.readings).slice(0, 3).map((val, i) => (
                            <td key={i} className="py-3 px-2">{val ?? '-'}</td>
                          ))
                      }
                      <td className="py-3 px-2">{row.operator}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
