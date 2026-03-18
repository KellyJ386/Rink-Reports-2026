'use client'

import { useState } from 'react'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Checkbox } from '@/components/ui/Checkbox'
import clsx from 'clsx'

type Tab = 'ice-cut' | 'blade-change' | 'edging' | 'circle-check'

const TABS: { id: Tab; label: string }[] = [
  { id: 'ice-cut', label: 'Ice Cut' },
  { id: 'blade-change', label: 'Blade Change' },
  { id: 'edging', label: 'Edging' },
  { id: 'circle-check', label: 'Circle Check' },
]

const RINKS = [
  { value: 'rink-a', label: 'Rink A - Main' },
  { value: 'rink-b', label: 'Rink B - Practice' },
]

const MACHINES = [
  { value: 'z1', label: 'Zamboni #1 (Gas)' },
  { value: 'z2', label: 'Zamboni #2 (Electric)' },
]

// Mock circle check items
const CIRCLE_CHECK_ITEMS = [
  'Blade condition', 'Tire pressure/condition', 'Hydraulic fluid level',
  'All lights working', 'Mirrors clean and adjusted', 'Wash water tank level',
  'Snow tank empty', 'Conditioner cloth condition', 'Horn/backup alarm working',
  'Seat belt condition', 'Battery charge level', 'Coolant level',
  'Oil level', 'Board brush condition', 'Steering responsiveness',
]

export default function IceOperationsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('ice-cut')
  const [circleCheckResults, setCircleCheckResults] = useState<Record<number, { passed: boolean; notes: string }>>(
    Object.fromEntries(CIRCLE_CHECK_ITEMS.map((_, i) => [i, { passed: true, notes: '' }]))
  )

  function handleCircleCheckToggle(index: number) {
    setCircleCheckResults((prev) => ({
      ...prev,
      [index]: { ...prev[index], passed: !prev[index].passed },
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    alert(`${activeTab} saved!`)
  }

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Ice Operations' }]} />

      <h1 className="text-2xl font-bold text-navy dark:text-white mb-6 px-4">
        Ice Operations
      </h1>

      {/* Tab Bar */}
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
              <Input label="Date & Time" type="datetime-local" defaultValue={new Date().toISOString().slice(0, 16)} />
              <Input label="Operator" value="Current User" readOnly />
              <Select label="Rink" options={RINKS} placeholder="Select rink" />
              <Select label="Machine" options={MACHINES} placeholder="Select machine" />
              <Input label="Machine Hours" type="number" step="0.1" placeholder="e.g., 1234.5" />
              <Input label="Ice Taken (inches)" type="number" step="0.01" placeholder="e.g., 0.25" />
              <Input label="Water Used (gallons)" type="number" step="1" placeholder="e.g., 150" />
            </div>
            <div>
              <label className="form-label">Notes (optional)</label>
              <textarea className="form-input min-h-[80px]" placeholder="Add any notes..." />
            </div>
            <Button type="submit" size="lg">Save Ice Cut</Button>
          </form>
        )}

        {/* Blade Change Form */}
        {activeTab === 'blade-change' && (
          <form onSubmit={handleSubmit} className="card space-y-4 max-w-2xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Date & Time" type="datetime-local" defaultValue={new Date().toISOString().slice(0, 16)} />
              <Input label="Operator" value="Current User" readOnly />
              <Select label="Machine" options={MACHINES} placeholder="Select machine" />
            </div>
            <div>
              <label className="form-label">Notes (optional)</label>
              <textarea className="form-input min-h-[80px]" placeholder="Add any notes..." />
            </div>
            <Button type="submit" size="lg">Save Blade Change</Button>
          </form>
        )}

        {/* Edging Form */}
        {activeTab === 'edging' && (
          <form onSubmit={handleSubmit} className="card space-y-4 max-w-2xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Date & Time" type="datetime-local" defaultValue={new Date().toISOString().slice(0, 16)} />
              <Input label="Operator" value="Current User" readOnly />
              <Select label="Rink" options={RINKS} placeholder="Select rink" />
            </div>
            <div>
              <label className="form-label">Notes (optional)</label>
              <textarea className="form-input min-h-[80px]" placeholder="Add any notes..." />
            </div>
            <Button type="submit" size="lg">Save Edging Log</Button>
          </form>
        )}

        {/* Circle Check */}
        {activeTab === 'circle-check' && (
          <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
            <div className="card">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <Select label="Machine" options={MACHINES} placeholder="Select machine" />
                <Select label="Fuel Type" options={[{ value: 'gas', label: 'Gas' }, { value: 'electric', label: 'Electric' }]} />
              </div>

              <h3 className="font-semibold mb-3">Inspection Checklist</h3>
              <div className="space-y-2">
                {CIRCLE_CHECK_ITEMS.map((item, i) => (
                  <div key={i}>
                    <Checkbox
                      label={item}
                      checked={circleCheckResults[i]?.passed}
                      onChange={() => handleCircleCheckToggle(i)}
                    />
                    {!circleCheckResults[i]?.passed && (
                      <div className="ml-9 mt-1 mb-2">
                        <textarea
                          className="form-input min-h-[60px] text-sm border-alert-red"
                          placeholder="Describe the issue..."
                          value={circleCheckResults[i]?.notes || ''}
                          onChange={(e) =>
                            setCircleCheckResults((prev) => ({
                              ...prev,
                              [i]: { ...prev[i], notes: e.target.value },
                            }))
                          }
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <Button type="submit" size="lg">Submit Circle Check</Button>
          </form>
        )}
      </div>
    </div>
  )
}
