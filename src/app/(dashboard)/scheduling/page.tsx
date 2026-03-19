'use client'

import { useState, useEffect, useCallback } from 'react'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { useAuth } from '@/hooks/useAuth'
import clsx from 'clsx'

type CalendarView = 'day' | 'week' | 'month'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

interface ShiftType {
  value: string
  label: string
  color: string
}

interface Shift {
  id: string
  employee: string
  employee_id: string
  type: string
  typeColor: string
  day: number
  date: string
  startHour: number
  endHour: number
  isOpen?: boolean
}

interface Employee {
  value: string
  label: string
}

interface SwapRequest {
  id: string
  from_employee: string
  to_employee: string
  shift_date: string
  shift_type: string
  status: 'pending' | 'approved' | 'denied'
  created_at: string
}

export default function SchedulingPage() {
  const { profile } = useAuth()

  const [view, setView] = useState<CalendarView>('week')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Data
  const [shifts, setShifts] = useState<Shift[]>([])
  const [shiftTypes, setShiftTypes] = useState<ShiftType[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [swapRequests, setSwapRequests] = useState<SwapRequest[]>([])

  // Week navigation
  const [weekStartDate, setWeekStartDate] = useState(() => {
    const now = new Date()
    const dayOfWeek = now.getDay()
    const start = new Date(now)
    start.setDate(now.getDate() - dayOfWeek)
    return start.toISOString().split('T')[0]
  })

  // Create shift form state
  const [newShiftDate, setNewShiftDate] = useState('')
  const [newShiftStart, setNewShiftStart] = useState('')
  const [newShiftEnd, setNewShiftEnd] = useState('')
  const [newShiftType, setNewShiftType] = useState('')
  const [newShiftEmployee, setNewShiftEmployee] = useState('')
  const [newShiftNotes, setNewShiftNotes] = useState('')

  // Compute week date range
  const getWeekRange = useCallback((startDateStr: string) => {
    const start = new Date(startDateStr + 'T00:00:00')
    const end = new Date(start)
    end.setDate(start.getDate() + 6)
    return {
      start_date: start.toISOString().split('T')[0],
      end_date: end.toISOString().split('T')[0],
    }
  }, [])

  // Fetch shift types and employees on mount
  useEffect(() => {
    async function fetchOptions() {
      try {
        const [typesRes, employeesRes] = await Promise.all([
          fetch('/api/scheduling/shift-types'),
          fetch('/api/scheduling/employees'),
        ])

        if (typesRes.ok) {
          const data = await typesRes.json()
          setShiftTypes(data)
        }
        if (employeesRes.ok) {
          const data = await employeesRes.json()
          setEmployees(data)
        }
      } catch {
        // Non-critical
      }
    }
    fetchOptions()
  }, [])

  // Fetch shifts for current week
  const fetchShifts = useCallback(async () => {
    try {
      setLoading(true)
      const { start_date, end_date } = getWeekRange(weekStartDate)
      const res = await fetch(`/api/scheduling/shifts?start_date=${start_date}&end_date=${end_date}`)
      if (!res.ok) throw new Error('Failed to load shifts')
      const data = await res.json()
      setShifts(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load shifts')
    } finally {
      setLoading(false)
    }
  }, [weekStartDate, getWeekRange])

  useEffect(() => {
    fetchShifts()
  }, [fetchShifts])

  // Fetch swap requests
  useEffect(() => {
    async function fetchSwaps() {
      try {
        const res = await fetch('/api/scheduling/swaps')
        if (res.ok) {
          const data = await res.json()
          setSwapRequests(data)
        }
      } catch {
        // Non-critical
      }
    }
    fetchSwaps()
  }, [])

  function navigateWeek(direction: number) {
    const current = new Date(weekStartDate + 'T00:00:00')
    current.setDate(current.getDate() + direction * 7)
    setWeekStartDate(current.toISOString().split('T')[0])
  }

  function getWeekDayDates(): { day: string; date: number; fullDate: string }[] {
    const start = new Date(weekStartDate + 'T00:00:00')
    return DAYS.map((day, i) => {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      return {
        day,
        date: d.getDate(),
        fullDate: d.toISOString().split('T')[0],
      }
    })
  }

  async function handleCreateShift(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    try {
      setSubmitting(true)
      const res = await fetch('/api/scheduling/shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: newShiftDate,
          start_time: newShiftStart,
          end_time: newShiftEnd,
          shift_type_id: newShiftType,
          employee_id: newShiftEmployee || null,
          notes: newShiftNotes,
        }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => null)
        throw new Error(errData?.error || 'Failed to create shift')
      }

      setSuccessMsg('Shift created successfully!')
      setTimeout(() => setSuccessMsg(null), 3000)
      setShowCreateModal(false)
      setNewShiftDate('')
      setNewShiftStart('')
      setNewShiftEnd('')
      setNewShiftType('')
      setNewShiftEmployee('')
      setNewShiftNotes('')
      fetchShifts()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create shift')
    } finally {
      setSubmitting(false)
    }
  }

  const weekDayDates = getWeekDayDates()

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Employee Scheduling' }]} />

      <div className="flex items-center justify-between mb-6 px-4 flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-navy dark:text-white">
          Employee Scheduling
        </h1>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setShowCreateModal(true)}>
            + Create Shift
          </Button>
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

      {/* View Toggle */}
      <div className="flex items-center gap-4 px-4 mb-4">
        <div className="flex gap-1">
          {(['day', 'week', 'month'] as CalendarView[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={clsx(
                'px-4 py-2 rounded-lg font-medium capitalize min-h-touch',
                view === v ? 'bg-navy text-white' : 'bg-gray-100 dark:bg-gray-800'
              )}
            >
              {v}
            </button>
          ))}
        </div>

        {view === 'week' && (
          <div className="flex items-center gap-2 text-sm">
            <button onClick={() => navigateWeek(-1)} className="px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
              &larr;
            </button>
            <span className="text-wolf-grey">
              {weekDayDates[0]?.fullDate} - {weekDayDates[6]?.fullDate}
            </span>
            <button onClick={() => navigateWeek(1)} className="px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
              &rarr;
            </button>
          </div>
        )}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy" />
        </div>
      )}

      {/* Week View */}
      {!loading && view === 'week' && (
        <div className="px-4 overflow-x-auto">
          <div className="min-w-[700px]">
            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDayDates.map((dayInfo) => (
                <div key={dayInfo.fullDate} className="text-center text-sm font-medium text-wolf-grey py-2">
                  <div>{dayInfo.day}</div>
                  <div className="text-lg text-navy dark:text-white">{dayInfo.date}</div>
                </div>
              ))}
            </div>

            {/* Shift blocks */}
            <div className="grid grid-cols-7 gap-1" style={{ minHeight: '400px' }}>
              {weekDayDates.map((dayInfo) => (
                <div key={dayInfo.fullDate} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-1 space-y-1">
                  {shifts
                    .filter((s) => s.date === dayInfo.fullDate || s.day === new Date(dayInfo.fullDate + 'T00:00:00').getDay())
                    .map((shift) => (
                      <div
                        key={shift.id}
                        className={clsx(
                          'rounded-lg p-2 text-white text-xs cursor-pointer hover:opacity-80',
                          shift.typeColor || 'bg-cyan-600',
                          shift.isOpen && 'border-2 border-dashed border-white/50'
                        )}
                      >
                        <div className="font-semibold truncate">{shift.employee}</div>
                        <div className="opacity-80">{shift.type}</div>
                        <div className="opacity-70">
                          {shift.startHour > 12 ? shift.startHour - 12 : shift.startHour}
                          {shift.startHour >= 12 ? 'PM' : 'AM'} -
                          {shift.endHour > 12 ? shift.endHour - 12 : shift.endHour}
                          {shift.endHour >= 12 ? 'PM' : 'AM'}
                        </div>
                        {shift.isOpen && (
                          <div className="mt-1 text-yellow-200 font-medium">OPEN</div>
                        )}
                      </div>
                    ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Day View */}
      {!loading && view === 'day' && (
        <div className="px-4">
          <div className="card">
            <h3 className="font-semibold mb-4">
              {new Date(weekStartDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </h3>
            <div className="space-y-2">
              {shifts
                .filter((s) => s.date === weekStartDate || s.day === new Date(weekStartDate + 'T00:00:00').getDay())
                .map((shift) => (
                  <div key={shift.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div className={clsx('w-3 h-10 rounded-full', shift.typeColor || 'bg-cyan-600')} />
                    <div className="flex-1">
                      <div className="font-medium">{shift.employee}</div>
                      <div className="text-sm text-wolf-grey">{shift.type}</div>
                    </div>
                    <div className="text-sm text-wolf-grey">
                      {shift.startHour}:00 - {shift.endHour}:00
                    </div>
                  </div>
                ))}
              {shifts.filter((s) => s.date === weekStartDate || s.day === new Date(weekStartDate + 'T00:00:00').getDay()).length === 0 && (
                <p className="text-sm text-wolf-grey py-4 text-center">No shifts scheduled for this day.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Month View */}
      {!loading && view === 'month' && (
        <div className="px-4">
          <div className="grid grid-cols-7 gap-1">
            {DAYS.map((day) => (
              <div key={day} className="text-center text-sm font-medium text-wolf-grey py-2">
                {day}
              </div>
            ))}
            {Array.from({ length: 35 }, (_, i) => {
              const monthStart = new Date(weekStartDate + 'T00:00:00')
              monthStart.setDate(1)
              const startOffset = monthStart.getDay()
              const dayNum = i - startOffset + 1
              const daysInMonth = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0).getDate()
              const isCurrentMonth = dayNum >= 1 && dayNum <= daysInMonth

              const dateStr = isCurrentMonth
                ? `${monthStart.getFullYear()}-${String(monthStart.getMonth() + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`
                : ''
              const shiftCount = shifts.filter((s) => s.date === dateStr).length

              return (
                <div
                  key={i}
                  className={clsx(
                    'min-h-[80px] rounded-lg p-2 text-sm',
                    isCurrentMonth
                      ? 'bg-gray-50 dark:bg-gray-900'
                      : 'bg-gray-100/50 dark:bg-gray-900/50 text-wolf-grey'
                  )}
                >
                  {isCurrentMonth && (
                    <>
                      <div className="font-medium">{dayNum}</div>
                      {shiftCount > 0 && (
                        <div className="text-xs text-action-green mt-1">
                          {shiftCount} shift{shiftCount !== 1 ? 's' : ''}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Pending Swap Requests */}
      {swapRequests.length > 0 && (
        <div className="px-4 mt-6 max-w-2xl">
          <h3 className="font-semibold mb-3">Pending Swap Requests</h3>
          <div className="space-y-2">
            {swapRequests
              .filter((sr) => sr.status === 'pending')
              .map((sr) => (
                <div key={sr.id} className="card flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">
                      {sr.from_employee} &rarr; {sr.to_employee}
                    </div>
                    <div className="text-xs text-wolf-grey">
                      {sr.shift_date} - {sr.shift_type}
                    </div>
                  </div>
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-alert-yellow/10 text-alert-yellow-dark">
                    Pending
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Create Shift Modal */}
      <Modal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Shift"
      >
        <form className="space-y-4" onSubmit={handleCreateShift}>
          <Input
            label="Date"
            type="date"
            value={newShiftDate}
            onChange={(e) => setNewShiftDate(e.target.value)}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Time"
              type="time"
              value={newShiftStart}
              onChange={(e) => setNewShiftStart(e.target.value)}
              required
            />
            <Input
              label="End Time"
              type="time"
              value={newShiftEnd}
              onChange={(e) => setNewShiftEnd(e.target.value)}
              required
            />
          </div>
          <Select
            label="Position"
            options={shiftTypes}
            placeholder="Select position"
            value={newShiftType}
            onChange={(e) => setNewShiftType(e.target.value)}
          />
          <Select
            label="Assign Employee"
            options={employees}
            placeholder="Select employee (or leave open)"
            value={newShiftEmployee}
            onChange={(e) => setNewShiftEmployee(e.target.value)}
          />
          <Input
            label="Notes (optional)"
            placeholder="Add notes..."
            value={newShiftNotes}
            onChange={(e) => setNewShiftNotes(e.target.value)}
          />
          <div className="flex gap-3">
            <Button type="submit" className="flex-1" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Shift'}
            </Button>
            <Button variant="secondary" onClick={() => setShowCreateModal(false)} className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
