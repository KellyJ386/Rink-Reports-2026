'use client'

import { useState } from 'react'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Checkbox'
import { Icon } from '@/components/ui/Icons'
import clsx from 'clsx'

// Mock data - would come from API based on facility config
const TABS = [
  { id: '1', name: 'Front Desk', complete: true },
  { id: '2', name: 'Zamboni Log', complete: false },
  { id: '3', name: 'Skate Rental', complete: false },
  { id: '4', name: 'Pro Shop', complete: true },
  { id: '5', name: 'Concessions', complete: false },
  { id: '6', name: 'Learn to Skate', complete: false },
  { id: '7', name: 'Janitorial', complete: false },
  { id: '8', name: 'Maintenance', complete: true },
  { id: '9', name: 'Locker Rooms', complete: false },
  { id: '10', name: 'Parking', complete: false },
]

type ChecklistType = 'OPENING' | 'CLOSING' | 'DAILY_OPS'

const CHECKLIST_LABELS: Record<ChecklistType, string> = {
  OPENING: 'Opening',
  CLOSING: 'Closing',
  DAILY_OPS: 'Daily Operations',
}

// Mock checklist items
const MOCK_ITEMS = [
  { id: '1', text: 'Unlock main entrance doors', checked: true, checkedBy: 'John D.', timestamp: '6:02 AM' },
  { id: '2', text: 'Turn on lobby lights and signage', checked: true, checkedBy: 'John D.', timestamp: '6:03 AM' },
  { id: '3', text: 'Boot up POS system and verify connectivity', checked: false, checkedBy: null, timestamp: null },
  { id: '4', text: 'Check voicemail and respond to messages', checked: false, checkedBy: null, timestamp: null },
  { id: '5', text: 'Verify cash drawer count', checked: false, checkedBy: null, timestamp: null },
  { id: '6', text: 'Review daily schedule and special events', checked: false, checkedBy: null, timestamp: null },
  { id: '7', text: 'Set out wet floor signs if needed', checked: false, checkedBy: null, timestamp: null },
  { id: '8', text: 'Turn on music/PA system', checked: false, checkedBy: null, timestamp: null },
]

export default function DailyReportsPage() {
  const [selectedTab, setSelectedTab] = useState<string | null>(null)
  const [selectedType, setSelectedType] = useState<ChecklistType | null>(null)
  const [items, setItems] = useState(MOCK_ITEMS)
  const [notes, setNotes] = useState('')
  const [showTypeSelector, setShowTypeSelector] = useState(false)

  const selectedTabData = TABS.find((t) => t.id === selectedTab)

  function handleTabClick(tabId: string) {
    setSelectedTab(tabId)
    setShowTypeSelector(true)
    setSelectedType(null)
  }

  function handleTypeSelect(type: ChecklistType) {
    setSelectedType(type)
    setShowTypeSelector(false)
    // Reset items for new selection
    setItems(MOCK_ITEMS.map((item) => ({ ...item, checked: false, checkedBy: null, timestamp: null })))
  }

  function handleCheck(itemId: string) {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              checked: !item.checked,
              checkedBy: item.checked ? null : 'Current User',
              timestamp: item.checked ? null : new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
            }
          : item
      )
    )
  }

  async function handleSave() {
    // Would POST to /api/daily-reports
    alert('Checklist saved!')
  }

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Daily Reports' }]} />

      <h1 className="text-2xl font-bold text-navy dark:text-white mb-6 px-4">
        Daily Reports
      </h1>

      {/* Tab Selection */}
      {!selectedType && (
        <>
          <div className="overflow-x-auto pb-2 px-4">
            <div className="flex gap-2 min-w-max">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={clsx(
                    'flex items-center gap-2 px-4 py-3 rounded-lg border min-h-touch whitespace-nowrap transition-colors',
                    selectedTab === tab.id
                      ? 'bg-navy text-white border-navy'
                      : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:border-navy'
                  )}
                >
                  {tab.complete && <Icon name="check" size={16} className="text-action-green" />}
                  {tab.name}
                </button>
              ))}
            </div>
          </div>

          {/* Type Selector Dropdown */}
          {showTypeSelector && selectedTabData && (
            <div className="mt-4 px-4">
              <p className="text-sm text-wolf-grey mb-2">
                Select checklist type for <strong>{selectedTabData.name}</strong>:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {(Object.entries(CHECKLIST_LABELS) as [ChecklistType, string][]).map(([type, label]) => (
                  <button
                    key={type}
                    onClick={() => handleTypeSelect(type)}
                    className="btn-secondary text-center"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Checklist View */}
      {selectedType && selectedTabData && (
        <div className="px-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              {selectedTabData.name} - {CHECKLIST_LABELS[selectedType]}
            </h2>
            <button
              onClick={() => setSelectedType(null)}
              className="text-sm text-navy dark:text-action-green hover:underline"
            >
              Back to tabs
            </button>
          </div>

          {/* Date selector */}
          <div className="mb-4">
            <input
              type="date"
              defaultValue={new Date().toISOString().split('T')[0]}
              className="form-input max-w-xs"
            />
          </div>

          {/* Checklist items */}
          <div className="card space-y-1">
            {items.map((item) => (
              <Checkbox
                key={item.id}
                label={item.text}
                checked={item.checked}
                onChange={() => handleCheck(item.id)}
                timestamp={item.timestamp || undefined}
                checkedBy={item.checkedBy || undefined}
              />
            ))}
          </div>

          {/* Notes */}
          <div className="mt-4">
            <label className="form-label">Notes (optional)</label>
            <textarea
              className="form-input min-h-[80px]"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes..."
            />
          </div>

          {/* Save */}
          <div className="mt-4">
            <Button onClick={handleSave} size="lg" className="w-full sm:w-auto">
              Save Checklist
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
