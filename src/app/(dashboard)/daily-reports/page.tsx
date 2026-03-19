'use client'

import { useState, useEffect, useCallback } from 'react'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Checkbox'
import { Icon } from '@/components/ui/Icons'
import { useAuth } from '@/hooks/useAuth'
import { useOfflineSync } from '@/hooks/useOfflineSync'
import { useFormDraft } from '@/hooks/useFormDraft'
import clsx from 'clsx'

type ChecklistType = 'OPENING' | 'CLOSING' | 'DAILY_OPS'

const CHECKLIST_LABELS: Record<ChecklistType, string> = {
  OPENING: 'Opening',
  CLOSING: 'Closing',
  DAILY_OPS: 'Daily Operations',
}

interface Tab {
  id: string
  name: string
  complete: boolean
}

interface ChecklistItem {
  id: string
  text: string
  checked: boolean
  checkedBy: string | null
  timestamp: string | null
}

export default function DailyReportsPage() {
  const { profile } = useAuth()
  const { isOnline, pendingCount, submitWithOfflineSupport } = useOfflineSync()
  const { saveDraft, loadDraft, clearDraft } = useFormDraft()

  const [tabs, setTabs] = useState<Tab[]>([])
  const [loadingTabs, setLoadingTabs] = useState(true)
  const [selectedTab, setSelectedTab] = useState<string | null>(null)
  const [selectedType, setSelectedType] = useState<ChecklistType | null>(null)
  const [items, setItems] = useState<ChecklistItem[]>([])
  const [loadingItems, setLoadingItems] = useState(false)
  const [notes, setNotes] = useState('')
  const [showTypeSelector, setShowTypeSelector] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const selectedTabData = tabs.find((t) => t.id === selectedTab)

  // Fetch tabs on mount
  useEffect(() => {
    async function fetchTabs() {
      try {
        setLoadingTabs(true)
        const res = await fetch('/api/daily-reports/tabs')
        if (!res.ok) throw new Error('Failed to load tabs')
        const data = await res.json()
        setTabs(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load tabs')
      } finally {
        setLoadingTabs(false)
      }
    }
    fetchTabs()
  }, [])

  // Fetch checklist items when tab + type + date are selected
  const fetchItems = useCallback(async (tabId: string, type: ChecklistType, date: string) => {
    try {
      setLoadingItems(true)
      setError(null)

      const [itemsRes, entriesRes] = await Promise.all([
        fetch(`/api/daily-reports/checklist?tab_id=${tabId}&checklist_type=${type}`),
        fetch(`/api/daily-reports/entries?date=${date}&tab_id=${tabId}`),
      ])

      if (!itemsRes.ok) throw new Error('Failed to load checklist items')
      const checklistData = await itemsRes.json()

      let entriesData: Record<string, { checked_by: string; timestamp: string }> = {}
      if (entriesRes.ok) {
        const entries = await entriesRes.json()
        entries.forEach((entry: { item_id: string; checked_by: string; timestamp: string }) => {
          entriesData[entry.item_id] = { checked_by: entry.checked_by, timestamp: entry.timestamp }
        })
      }

      const merged: ChecklistItem[] = checklistData.map((item: { id: string; text: string }) => ({
        id: item.id,
        text: item.text,
        checked: !!entriesData[item.id],
        checkedBy: entriesData[item.id]?.checked_by ?? null,
        timestamp: entriesData[item.id]?.timestamp ?? null,
      }))

      setItems(merged)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load items')
    } finally {
      setLoadingItems(false)
    }
  }, [])

  // Load draft for notes when tab/type/date selection changes
  useEffect(() => {
    if (!selectedTab || !selectedType || !selectedDate) return
    const draftKey = `daily-reports-${selectedTab}-${selectedType}-${selectedDate}`
    loadDraft(draftKey).then((draft) => {
      if (draft && typeof draft.notes === 'string') {
        setNotes(draft.notes)
      }
    })
  }, [selectedTab, selectedType, selectedDate, loadDraft])

  // Save draft on notes change
  useEffect(() => {
    if (!selectedTab || !selectedType || !selectedDate) return
    const draftKey = `daily-reports-${selectedTab}-${selectedType}-${selectedDate}`
    saveDraft(draftKey, { notes })
  }, [notes, selectedTab, selectedType, selectedDate, saveDraft])

  function handleTabClick(tabId: string) {
    setSelectedTab(tabId)
    setShowTypeSelector(true)
    setSelectedType(null)
  }

  function handleTypeSelect(type: ChecklistType) {
    setSelectedType(type)
    setShowTypeSelector(false)
    if (selectedTab) {
      fetchItems(selectedTab, type, selectedDate)
    }
  }

  async function handleCheck(itemId: string) {
    const item = items.find((i) => i.id === itemId)
    if (!item) return

    const newChecked = !item.checked

    // Optimistic update
    setItems((prev) =>
      prev.map((i) =>
        i.id === itemId
          ? {
              ...i,
              checked: newChecked,
              checkedBy: newChecked ? (profile?.full_name ?? 'Current User') : null,
              timestamp: newChecked ? new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : null,
            }
          : i
      )
    )

    try {
      const res = await submitWithOfflineSupport('/api/daily-reports/entries', 'POST', {
        tab_id: selectedTab,
        item_id: itemId,
        checked: newChecked,
        date: selectedDate,
      })
      if (res && !res.ok) throw new Error('Failed to save entry')
      if (!res) {
        // Saved offline, keep the optimistic update
      }
    } catch (err) {
      // Revert on error
      setItems((prev) =>
        prev.map((i) =>
          i.id === itemId
            ? { ...i, checked: !newChecked, checkedBy: item.checkedBy, timestamp: item.timestamp }
            : i
        )
      )
      setError(err instanceof Error ? err.message : 'Failed to save entry')
    }
  }

  async function handleSave() {
    try {
      setSaving(true)
      setError(null)
      const res = await submitWithOfflineSupport('/api/daily-reports/entries', 'POST', {
        tab_id: selectedTab,
        checklist_type: selectedType,
        date: selectedDate,
        notes,
        items: items.map((i) => ({ id: i.id, checked: i.checked })),
      })
      if (res && !res.ok) throw new Error('Failed to save checklist')
      if (!res) {
        setSuccessMsg('Saved offline - will sync when reconnected')
      } else {
        setSuccessMsg('Checklist saved successfully!')
      }
      const draftKey = `daily-reports-${selectedTab}-${selectedType}-${selectedDate}`
      await clearDraft(draftKey)
      setTimeout(() => setSuccessMsg(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save checklist')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Daily Reports' }]} />

      <h1 className="text-2xl font-bold text-navy dark:text-white mb-6 px-4">
        Daily Reports
      </h1>

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
      {loadingTabs && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy" />
        </div>
      )}

      {/* Tab Selection */}
      {!loadingTabs && !selectedType && (
        <>
          <div className="overflow-x-auto pb-2 px-4">
            <div className="flex gap-2 min-w-max">
              {tabs.map((tab) => (
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
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value)
                if (selectedTab && selectedType) {
                  fetchItems(selectedTab, selectedType, e.target.value)
                }
              }}
              className="form-input max-w-xs"
            />
          </div>

          {/* Loading items */}
          {loadingItems ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-navy" />
            </div>
          ) : (
            <>
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
                <Button onClick={handleSave} size="lg" className="w-full sm:w-auto" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Checklist'}
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
