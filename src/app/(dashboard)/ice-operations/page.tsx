'use client'

import { useState, useEffect, useCallback } from 'react'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Checkbox } from '@/components/ui/Checkbox'
import { useAuth } from '@/hooks/useAuth'
import clsx from 'clsx'

type Tab = 'ice-cut' | 'blade-change' | 'edging' | 'circle-check'

const TABS: { id: Tab; label: string }[] = [
  { id: 'ice-cut', label: 'Ice Cut' },
  { id: 'blade-change', label: 'Blade Change' },
  { id: 'edging', label: 'Edging' },
  { id: 'circle-check', label: 'Circle Check' },
]

interface RinkOption {
  value: string
  label: string
}

interface MachineOption {
  value: string
  label: string
}

interface CircleCheckItem {
  id: string
  text: string
}

interface IceCutRecord {
  id: string
  date: string
  operator: string
  rink: string
  machine: string
  machine_hours: number
  ice_taken: number
  water_used: number
  notes: string
}

interface BladeChangeRecord {
  id: string
  date: string
  operator: string
  machine: string
  notes: string
}

interface EdgingRecord {
  id: string
  date: string
  operator: string
  rink: string
  notes: string
}

interface CircleCheckRecord {
  id: string
  date: string
  operator: string
  machine: string
  passed_count: number
  total_count: number
}

export default function IceOperationsPage() {
  const { profile } = useAuth()

  const [activeTab, setActiveTab] = useState<Tab>('ice-cut')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Shared options
  const [rinks, setRinks] = useState<RinkOption[]>([])
  const [machines, setMachines] = useState<MachineOption[]>([])

  // Circle check
  const [circleCheckItems, setCircleCheckItems] = useState<CircleCheckItem[]>([])
  const [circleCheckResults, setCircleCheckResults] = useState<Record<string, { passed: boolean; notes: string }>>({})

  // Form state
  const [selectedRink, setSelectedRink] = useState('')
  const [selectedMachine, setSelectedMachine] = useState('')
  const [dateTime, setDateTime] = useState(new Date().toISOString().slice(0, 16))
  const [machineHours, setMachineHours] = useState('')
  const [iceTaken, setIceTaken] = useState('')
  const [waterUsed, setWaterUsed] = useState('')
  const [notes, setNotes] = useState('')
  const [fuelType, setFuelType] = useState('')

  // History
  const [iceCutHistory, setIceCutHistory] = useState<IceCutRecord[]>([])
  const [bladeChangeHistory, setBladeChangeHistory] = useState<BladeChangeRecord[]>([])
  const [edgingHistory, setEdgingHistory] = useState<EdgingRecord[]>([])
  const [circleCheckHistory, setCircleCheckHistory] = useState<CircleCheckRecord[]>([])

  // Fetch rinks and machines on mount
  useEffect(() => {
    async function fetchOptions() {
      try {
        setLoading(true)
        const [rinksRes, machinesRes] = await Promise.all([
          fetch('/api/ice-operations/rinks'),
          fetch('/api/ice-operations/machines'),
        ])

        if (rinksRes.ok) {
          const data = await rinksRes.json()
          setRinks(data)
        }
        if (machinesRes.ok) {
          const data = await machinesRes.json()
          setMachines(data)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load options')
      } finally {
        setLoading(false)
      }
    }
    fetchOptions()
  }, [])

  // Fetch circle check items when that tab is selected
  useEffect(() => {
    if (activeTab !== 'circle-check') return

    async function fetchCircleCheckItems() {
      try {
        setLoading(true)
        const res = await fetch('/api/ice-operations/circle-check/items')
        if (!res.ok) throw new Error('Failed to load circle check items')
        const data: CircleCheckItem[] = await res.json()
        setCircleCheckItems(data)
        setCircleCheckResults(
          Object.fromEntries(data.map((item) => [item.id, { passed: true, notes: '' }]))
        )
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load circle check items')
      } finally {
        setLoading(false)
      }
    }
    fetchCircleCheckItems()
  }, [activeTab])

  // Fetch recent records for current tab
  const fetchHistory = useCallback(async (tab: Tab) => {
    try {
      const res = await fetch(`/api/ice-operations/${tab}?limit=20`)
      if (!res.ok) return
      const data = await res.json()

      switch (tab) {
        case 'ice-cut':
          setIceCutHistory(data)
          break
        case 'blade-change':
          setBladeChangeHistory(data)
          break
        case 'edging':
          setEdgingHistory(data)
          break
        case 'circle-check':
          setCircleCheckHistory(data)
          break
      }
    } catch {
      // History fetch is non-critical
    }
  }, [])

  useEffect(() => {
    fetchHistory(activeTab)
  }, [activeTab, fetchHistory])

  function handleCircleCheckToggle(itemId: string) {
    setCircleCheckResults((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], passed: !prev[itemId].passed },
    }))
  }

  function resetForm() {
    setSelectedRink('')
    setSelectedMachine('')
    setDateTime(new Date().toISOString().slice(0, 16))
    setMachineHours('')
    setIceTaken('')
    setWaterUsed('')
    setNotes('')
    setFuelType('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    try {
      setSubmitting(true)

      let endpoint = ''
      let body: Record<string, unknown> = {}

      switch (activeTab) {
        case 'ice-cut':
          endpoint = '/api/ice-operations/ice-cut'
          body = {
            date_time: dateTime,
            rink_id: selectedRink,
            machine_id: selectedMachine,
            machine_hours: parseFloat(machineHours) || 0,
            ice_taken: parseFloat(iceTaken) || 0,
            water_used: parseInt(waterUsed) || 0,
            notes,
          }
          break
        case 'blade-change':
          endpoint = '/api/ice-operations/blade-change'
          body = {
            date_time: dateTime,
            machine_id: selectedMachine,
            notes,
          }
          break
        case 'edging':
          endpoint = '/api/ice-operations/edging'
          body = {
            date_time: dateTime,
            rink_id: selectedRink,
            notes,
          }
          break
        case 'circle-check':
          endpoint = '/api/ice-operations/circle-check'
          body = {
            date_time: dateTime,
            machine_id: selectedMachine,
            fuel_type: fuelType,
            items: Object.entries(circleCheckResults).map(([id, result]) => ({
              item_id: id,
              passed: result.passed,
              notes: result.notes,
            })),
          }
          break
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => null)
        throw new Error(errData?.error || `Failed to save ${activeTab}`)
      }

      setSuccessMsg(`${TABS.find((t) => t.id === activeTab)?.label} saved successfully!`)
      setTimeout(() => setSuccessMsg(null), 3000)
      resetForm()
      fetchHistory(activeTab)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSubmitting(false)
    }
  }

  const operatorName = profile?.full_name ?? 'Current User'

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Ice Operations' }]} />

      <h1 className="text-2xl font-bold text-navy dark:text-white mb-6 px-4">
        Ice Operations
      </h1>

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

      {/* Tab Bar */}
      {!loading && (
        <>
          <div className="flex gap-1 px-4 mb-6 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  'px-4 py-2 rounded-lg font-medium whitespace-nowrap min-h-touch transition-colors',
                  activeTab === tab.id
                    ? 'bg-navy text-white'
                    : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="px-4">
            {/* Ice Cuts Form */}
            {activeTab === 'ice-cut' && (
              <form onSubmit={handleSubmit} className="card space-y-4 max-w-2xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Date & Time"
                    type="datetime-local"
                    value={dateTime}
                    onChange={(e) => setDateTime(e.target.value)}
                  />
                  <Input label="Operator" value={operatorName} readOnly />
                  <Select
                    label="Rink"
                    options={rinks}
                    placeholder="Select rink"
                    value={selectedRink}
                    onChange={(e) => setSelectedRink(e.target.value)}
                  />
                  <Select
                    label="Machine"
                    options={machines}
                    placeholder="Select machine"
                    value={selectedMachine}
                    onChange={(e) => setSelectedMachine(e.target.value)}
                  />
                  <Input
                    label="Machine Hours"
                    type="number"
                    step="0.1"
                    placeholder="e.g., 1234.5"
                    value={machineHours}
                    onChange={(e) => setMachineHours(e.target.value)}
                  />
                  <Input
                    label="Ice Taken (inches)"
                    type="number"
                    step="0.01"
                    placeholder="e.g., 0.25"
                    value={iceTaken}
                    onChange={(e) => setIceTaken(e.target.value)}
                  />
                  <Input
                    label="Water Used (gallons)"
                    type="number"
                    step="1"
                    placeholder="e.g., 150"
                    value={waterUsed}
                    onChange={(e) => setWaterUsed(e.target.value)}
                  />
                </div>
                <div>
                  <label className="form-label">Notes (optional)</label>
                  <textarea
                    className="form-input min-h-[80px]"
                    placeholder="Add any notes..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
                <Button type="submit" size="lg" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save Ice Cut'}
                </Button>
              </form>
            )}

            {/* Blade Change Form */}
            {activeTab === 'blade-change' && (
              <form onSubmit={handleSubmit} className="card space-y-4 max-w-2xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Date & Time"
                    type="datetime-local"
                    value={dateTime}
                    onChange={(e) => setDateTime(e.target.value)}
                  />
                  <Input label="Operator" value={operatorName} readOnly />
                  <Select
                    label="Machine"
                    options={machines}
                    placeholder="Select machine"
                    value={selectedMachine}
                    onChange={(e) => setSelectedMachine(e.target.value)}
                  />
                </div>
                <div>
                  <label className="form-label">Notes (optional)</label>
                  <textarea
                    className="form-input min-h-[80px]"
                    placeholder="Add any notes..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
                <Button type="submit" size="lg" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save Blade Change'}
                </Button>
              </form>
            )}

            {/* Edging Form */}
            {activeTab === 'edging' && (
              <form onSubmit={handleSubmit} className="card space-y-4 max-w-2xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Date & Time"
                    type="datetime-local"
                    value={dateTime}
                    onChange={(e) => setDateTime(e.target.value)}
                  />
                  <Input label="Operator" value={operatorName} readOnly />
                  <Select
                    label="Rink"
                    options={rinks}
                    placeholder="Select rink"
                    value={selectedRink}
                    onChange={(e) => setSelectedRink(e.target.value)}
                  />
                </div>
                <div>
                  <label className="form-label">Notes (optional)</label>
                  <textarea
                    className="form-input min-h-[80px]"
                    placeholder="Add any notes..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
                <Button type="submit" size="lg" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save Edging Log'}
                </Button>
              </form>
            )}

            {/* Circle Check */}
            {activeTab === 'circle-check' && (
              <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
                <div className="card">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <Select
                      label="Machine"
                      options={machines}
                      placeholder="Select machine"
                      value={selectedMachine}
                      onChange={(e) => setSelectedMachine(e.target.value)}
                    />
                    <Select
                      label="Fuel Type"
                      options={[{ value: 'gas', label: 'Gas' }, { value: 'electric', label: 'Electric' }]}
                      value={fuelType}
                      onChange={(e) => setFuelType(e.target.value)}
                    />
                  </div>

                  <h3 className="font-semibold mb-3">Inspection Checklist</h3>
                  <div className="space-y-2">
                    {circleCheckItems.map((item) => (
                      <div key={item.id}>
                        <Checkbox
                          label={item.text}
                          checked={circleCheckResults[item.id]?.passed}
                          onChange={() => handleCircleCheckToggle(item.id)}
                        />
                        {!circleCheckResults[item.id]?.passed && (
                          <div className="ml-9 mt-1 mb-2">
                            <textarea
                              className="form-input min-h-[60px] text-sm border-alert-red"
                              placeholder="Describe the issue..."
                              value={circleCheckResults[item.id]?.notes || ''}
                              onChange={(e) =>
                                setCircleCheckResults((prev) => ({
                                  ...prev,
                                  [item.id]: { ...prev[item.id], notes: e.target.value },
                                }))
                              }
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <Button type="submit" size="lg" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Circle Check'}
                </Button>
              </form>
            )}
          </div>
        </>
      )}
    </div>
  )
}
