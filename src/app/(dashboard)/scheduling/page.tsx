'use client'

import { useState } from 'react'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import clsx from 'clsx'

type CalendarView = 'day' | 'week' | 'month'

// Mock shift data
const SHIFT_TYPES = [
  { value: 'zamboni', label: 'Zamboni Operator', color: 'bg-cyan-600' },
  { value: 'front-desk', label: 'Front Desk', color: 'bg-purple-600' },
  { value: 'skate-guard', label: 'Skate Guard', color: 'bg-blue-600' },
  { value: 'maintenance', label: 'Maintenance', color: 'bg-orange-600' },
  { value: 'concessions', label: 'Concessions', color: 'bg-pink-600' },
]

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const HOURS = Array.from({ length: 16 }, (_, i) => i + 6) // 6 AM to 9 PM

interface Shift {
  id: string
  employee: string
  type: string
  typeColor: string
  day: number
  startHour: number
  endHour: number
  isOpen?: boolean
}

const MOCK_SHIFTS: Shift[] = [
  { id: '1', employee: 'John D.', type: 'Zamboni Operator', typeColor: 'bg-cyan-600', day: 1, startHour: 6, endHour: 14 },
  { id: '2', employee: 'Sarah M.', type: 'Front Desk', typeColor: 'bg-purple-600', day: 1, startHour: 8, endHour: 16 },
  { id: '3', employee: 'Mike R.', type: 'Skate Guard', typeColor: 'bg-blue-600', day: 2, startHour: 10, endHour: 18 },
  { id: '4', employee: 'Open Shift', type: 'Concessions', typeColor: 'bg-pink-600', day: 3, startHour: 12, endHour: 20, isOpen: true },
  { id: '5', employee: 'Lisa K.', type: 'Maintenance', typeColor: 'bg-orange-600', day: 4, startHour: 6, endHour: 14 },
  { id: '6', employee: 'John D.', type: 'Zamboni Operator', typeColor: 'bg-cyan-600', day: 5, startHour: 14, endHour: 22 },
]

export default function SchedulingPage() {
  const [view, setView] = useState<CalendarView>('week')
  const [showCreateModal, setShowCreateModal] = useState(false)

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

      {/* View Toggle */}
      <div className="flex gap-1 px-4 mb-4">
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

      {/* Week View */}
      {view === 'week' && (
        <div className="px-4 overflow-x-auto">
          <div className="min-w-[700px]">
            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {DAYS.map((day, i) => (
                <div key={day} className="text-center text-sm font-medium text-wolf-grey py-2">
                  <div>{day}</div>
                  <div className="text-lg text-navy dark:text-white">{10 + i}</div>
                </div>
              ))}
            </div>

            {/* Shift blocks */}
            <div className="grid grid-cols-7 gap-1" style={{ minHeight: '400px' }}>
              {DAYS.map((_, dayIndex) => (
                <div key={dayIndex} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-1 space-y-1">
                  {MOCK_SHIFTS
                    .filter((s) => s.day === dayIndex)
                    .map((shift) => (
                      <div
                        key={shift.id}
                        className={clsx(
                          'rounded-lg p-2 text-white text-xs cursor-pointer hover:opacity-80',
                          shift.typeColor,
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
      {view === 'day' && (
        <div className="px-4">
          <div className="card">
            <h3 className="font-semibold mb-4">Monday, March 11</h3>
            <div className="space-y-2">
              {MOCK_SHIFTS
                .filter((s) => s.day === 1)
                .map((shift) => (
                  <div key={shift.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div className={clsx('w-3 h-10 rounded-full', shift.typeColor)} />
                    <div className="flex-1">
                      <div className="font-medium">{shift.employee}</div>
                      <div className="text-sm text-wolf-grey">{shift.type}</div>
                    </div>
                    <div className="text-sm text-wolf-grey">
                      {shift.startHour}:00 - {shift.endHour}:00
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Month View */}
      {view === 'month' && (
        <div className="px-4">
          <div className="grid grid-cols-7 gap-1">
            {DAYS.map((day) => (
              <div key={day} className="text-center text-sm font-medium text-wolf-grey py-2">
                {day}
              </div>
            ))}
            {Array.from({ length: 35 }, (_, i) => {
              const dayNum = i - 5 // offset for March starting on Saturday
              const isCurrentMonth = dayNum >= 1 && dayNum <= 31
              const shiftCount = MOCK_SHIFTS.filter((s) => s.day === (dayNum % 7)).length
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

      {/* Create Shift Modal */}
      <Modal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Shift"
      >
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setShowCreateModal(false) }}>
          <Input label="Date" type="date" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Start Time" type="time" />
            <Input label="End Time" type="time" />
          </div>
          <Select
            label="Position"
            options={SHIFT_TYPES}
            placeholder="Select position"
          />
          <Select
            label="Assign Employee"
            options={[
              { value: 'john', label: 'John D.' },
              { value: 'sarah', label: 'Sarah M.' },
              { value: 'mike', label: 'Mike R.' },
              { value: 'lisa', label: 'Lisa K.' },
            ]}
            placeholder="Select employee (or leave open)"
          />
          <Input label="Notes (optional)" placeholder="Add notes..." />
          <div className="flex gap-3">
            <Button type="submit" className="flex-1">Create Shift</Button>
            <Button variant="secondary" onClick={() => setShowCreateModal(false)} className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
