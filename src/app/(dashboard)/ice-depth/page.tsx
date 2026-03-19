'use client'

import { useState, useEffect } from 'react'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { RinkDiagram } from '@/components/diagrams/RinkDiagram'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { useAuth } from '@/hooks/useAuth'
import { useOfflineSync } from '@/hooks/useOfflineSync'

interface Template {
  id: string
  name: string
}

interface MeasurementPoint {
  id: string
  number: number
  xPercent: number
  yPercent: number
  value?: number
}

export default function IceDepthPage() {
  const { profile } = useAuth()
  const { isOnline, pendingCount, submitWithOfflineSupport } = useOfflineSync()

  const [templates, setTemplates] = useState<Template[]>([])
  const [loadingTemplates, setLoadingTemplates] = useState(true)
  const [selectedRink, setSelectedRink] = useState('')
  const [points, setPoints] = useState<MeasurementPoint[]>([])
  const [loadingPoints, setLoadingPoints] = useState(false)
  const [selectedPoint, setSelectedPoint] = useState<MeasurementPoint | null>(null)
  const [manualValue, setManualValue] = useState('')
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Fetch templates on mount
  useEffect(() => {
    async function fetchTemplates() {
      try {
        setLoadingTemplates(true)
        const res = await fetch('/api/ice-depth/templates')
        if (!res.ok) throw new Error('Failed to load rink templates')
        const data = await res.json()
        setTemplates(data)
        if (data.length > 0) {
          setSelectedRink(data[0].id)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load templates')
      } finally {
        setLoadingTemplates(false)
      }
    }
    fetchTemplates()
  }, [])

  // Fetch latest readings when rink changes
  useEffect(() => {
    if (!selectedRink) return

    async function fetchReadings() {
      try {
        setLoadingPoints(true)
        setError(null)
        const res = await fetch(`/api/ice-depth/readings/latest?template_id=${selectedRink}`)
        if (!res.ok) throw new Error('Failed to load readings')
        const data = await res.json()
        setPoints(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load readings')
      } finally {
        setLoadingPoints(false)
      }
    }
    fetchReadings()
  }, [selectedRink])

  function handlePointClick(point: MeasurementPoint) {
    setSelectedPoint(point)
    setManualValue(point.value?.toString() || '')
  }

  async function handleSaveReading() {
    if (!selectedPoint || !manualValue) return
    const value = parseFloat(manualValue)
    if (isNaN(value)) return

    try {
      setSaving(true)
      setError(null)

      const res = await submitWithOfflineSupport('/api/ice-depth/readings', 'POST', {
        template_id: selectedRink,
        point_id: selectedPoint.id,
        value,
      })

      if (res && !res.ok) throw new Error('Failed to save reading')

      setPoints((prev) =>
        prev.map((p) =>
          p.id === selectedPoint.id ? { ...p, value } : p
        )
      )
      setSelectedPoint(null)
      setManualValue('')
      if (!res) {
        setSuccessMsg('Saved offline - will sync when reconnected')
      } else {
        setSuccessMsg('Reading saved!')
      }
      setTimeout(() => setSuccessMsg(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save reading')
    } finally {
      setSaving(false)
    }
  }

  async function handleSubmitAll() {
    try {
      setSubmitting(true)
      setError(null)

      const readingsToSubmit = points
        .filter((p) => p.value !== undefined)
        .map((p) => ({ point_id: p.id, value: p.value }))

      const res = await submitWithOfflineSupport('/api/ice-depth/readings', 'POST', {
        template_id: selectedRink,
        readings: readingsToSubmit,
        submit_all: true,
      })

      if (res && !res.ok) throw new Error('Failed to submit readings')
      if (!res) {
        setSuccessMsg('Saved offline - will sync when reconnected')
      } else {
        setSuccessMsg('All readings submitted successfully!')
      }
      setTimeout(() => setSuccessMsg(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit readings')
    } finally {
      setSubmitting(false)
    }
  }

  const rinkOptions = templates.map((t) => ({ value: t.id, label: t.name }))

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Ice Depth Management' }]} />

      <div className="flex items-center justify-between mb-6 px-4">
        <h1 className="text-2xl font-bold text-navy dark:text-white">
          Ice Depth Management
        </h1>
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
      {loadingTemplates ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy" />
        </div>
      ) : (
        <>
          {/* Rink Selector */}
          <div className="px-4 mb-6 max-w-xs">
            <Select
              label="Select Rink"
              options={rinkOptions}
              value={selectedRink}
              onChange={(e) => setSelectedRink(e.target.value)}
            />
          </div>

          {/* Rink Diagram */}
          <div className="px-4">
            {loadingPoints ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-navy" />
              </div>
            ) : (
              <RinkDiagram
                points={points}
                onPointClick={handlePointClick}
              />
            )}
          </div>

          {/* Submit All */}
          <div className="px-4 mt-6">
            <Button onClick={handleSubmitAll} size="lg" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit All Readings'}
            </Button>
          </div>
        </>
      )}

      {/* Measurement Entry Modal */}
      <Modal
        open={!!selectedPoint}
        onClose={() => setSelectedPoint(null)}
        title={`Point #${selectedPoint?.number}`}
        size="sm"
      >
        <div className="space-y-4">
          <Button variant="secondary" className="w-full" onClick={() => setError('Bluetooth pairing not yet available')}>
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
            <Button onClick={handleSaveReading} className="flex-1" disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
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
