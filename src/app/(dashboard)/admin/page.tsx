'use client'

import { useState, useEffect, useCallback } from 'react'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Modal } from '@/components/ui/Modal'
import { Icon } from '@/components/ui/Icons'
import { useAuth } from '@/hooks/useAuth'
import clsx from 'clsx'

type AdminSection =
  | 'facility'
  | 'rinks'
  | 'users'
  | 'modules'
  | 'equipment'
  | 'thresholds'
  | 'notifications'
  | 'retention'

const SECTIONS: { id: AdminSection; label: string; icon: string }[] = [
  { id: 'facility', label: 'Facility Settings', icon: 'settings' },
  { id: 'rinks', label: 'Rink Configuration', icon: 'snowflake' },
  { id: 'users', label: 'User Management', icon: 'user' },
  { id: 'modules', label: 'Module Settings', icon: 'clipboard-list' },
  { id: 'equipment', label: 'Equipment Setup', icon: 'thermometer' },
  { id: 'thresholds', label: 'Threshold Settings', icon: 'alert-triangle' },
  { id: 'notifications', label: 'Notifications', icon: 'bell' },
  { id: 'retention', label: 'Data Retention', icon: 'calendar' },
]

const ROLE_OPTIONS = [
  { value: 'FACILITY_ADMIN', label: 'Facility Admin' },
  { value: 'MANAGER', label: 'Manager' },
  { value: 'SUPERVISOR', label: 'Supervisor' },
  { value: 'STAFF', label: 'Staff/Operator' },
  { value: 'READ_ONLY', label: 'Read-Only' },
]

const TIMEZONE_OPTIONS = [
  { value: 'America/New_York', label: 'Eastern Time' },
  { value: 'America/Chicago', label: 'Central Time' },
  { value: 'America/Denver', label: 'Mountain Time' },
  { value: 'America/Los_Angeles', label: 'Pacific Time' },
]

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

interface FacilitySettings {
  name: string
  address: string
  timezone: string
  operating_hours: Record<string, { open: string; close: string }>
}

interface RinkConfig {
  id: string
  name: string
  length: number
  width: number
  thresholds: {
    green_min: number
    green_max: number
    yellow_min: number
    yellow_max: number
    red_min: number
    red_max: number
  }
}

interface User {
  id: string
  name: string
  email: string
  role: string
  lastActive: string
  is_active: boolean
}

interface ModuleToggle {
  id: string
  name: string
  enabled: boolean
}

interface EquipmentItem {
  id: string
  name: string
  type: string
  category: string
}

interface ThresholdSetting {
  id: string
  label: string
  min: string
  max: string
  unit: string
}

interface NotificationSetting {
  id: string
  trigger: string
  in_app: boolean
  email: boolean
  sms: boolean
}

interface RetentionSettings {
  standard_years: number
  incident_years: number
  archive_mode: boolean
}

export default function AdminPage() {
  const { profile } = useAuth()

  const [activeSection, setActiveSection] = useState<AdminSection>('facility')
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Data state
  const [facility, setFacility] = useState<FacilitySettings | null>(null)
  const [rinks, setRinks] = useState<RinkConfig[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [modules, setModules] = useState<ModuleToggle[]>([])
  const [equipmentList, setEquipmentList] = useState<EquipmentItem[]>([])
  const [thresholds, setThresholds] = useState<ThresholdSetting[]>([])
  const [notifications, setNotifications] = useState<NotificationSetting[]>([])
  const [retention, setRetention] = useState<RetentionSettings | null>(null)

  // Invite form
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteName, setInviteName] = useState('')
  const [inviteRole, setInviteRole] = useState('')
  const [inviting, setInviting] = useState(false)

  // Fetch data for current section
  const fetchSectionData = useCallback(async (section: AdminSection) => {
    try {
      setLoading(true)
      setError(null)

      switch (section) {
        case 'facility': {
          const res = await fetch('/api/admin/facility')
          if (!res.ok) throw new Error('Failed to load facility settings')
          const data = await res.json()
          setFacility(data)
          break
        }
        case 'rinks': {
          const res = await fetch('/api/admin/rinks')
          if (!res.ok) throw new Error('Failed to load rink configuration')
          const data = await res.json()
          setRinks(data)
          break
        }
        case 'users': {
          const res = await fetch('/api/admin/users')
          if (!res.ok) throw new Error('Failed to load users')
          const data = await res.json()
          setUsers(data)
          break
        }
        case 'modules': {
          const res = await fetch('/api/admin/modules')
          if (!res.ok) throw new Error('Failed to load module settings')
          const data = await res.json()
          setModules(data)
          break
        }
        case 'equipment': {
          const res = await fetch('/api/admin/equipment')
          if (!res.ok) throw new Error('Failed to load equipment')
          const data = await res.json()
          setEquipmentList(data)
          break
        }
        case 'thresholds': {
          const res = await fetch('/api/admin/thresholds')
          if (!res.ok) throw new Error('Failed to load thresholds')
          const data = await res.json()
          setThresholds(data)
          break
        }
        case 'notifications': {
          const res = await fetch('/api/admin/notifications')
          if (!res.ok) throw new Error('Failed to load notification settings')
          const data = await res.json()
          setNotifications(data)
          break
        }
        case 'retention': {
          const res = await fetch('/api/admin/retention')
          if (!res.ok) throw new Error('Failed to load retention settings')
          const data = await res.json()
          setRetention(data)
          break
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSectionData(activeSection)
  }, [activeSection, fetchSectionData])

  async function handleSaveSection(endpoint: string, body: unknown) {
    try {
      setSaving(true)
      setError(null)

      const res = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => null)
        throw new Error(errData?.error || 'Failed to save settings')
      }

      setSuccessMsg('Settings saved successfully!')
      setTimeout(() => setSuccessMsg(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  function toggleModule(moduleId: string) {
    setModules((prev) =>
      prev.map((m) => (m.id === moduleId ? { ...m, enabled: !m.enabled } : m))
    )
  }

  async function handleInviteUser(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    try {
      setInviting(true)

      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inviteEmail,
          full_name: inviteName,
          role: inviteRole,
        }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => null)
        throw new Error(errData?.error || 'Failed to invite user')
      }

      setSuccessMsg('User invited successfully!')
      setTimeout(() => setSuccessMsg(null), 3000)
      setShowInviteModal(false)
      setInviteEmail('')
      setInviteName('')
      setInviteRole('')
      fetchSectionData('users')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to invite user')
    } finally {
      setInviting(false)
    }
  }

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Admin Control Center' }]} />

      <h1 className="text-2xl font-bold text-navy dark:text-white mb-6 px-4">
        Admin Control Center
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

      <div className="flex flex-col lg:flex-row gap-6 px-4">
        {/* Section Navigation */}
        <nav className="lg:w-64 flex-shrink-0">
          <div className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
            {SECTIONS.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={clsx(
                  'flex items-center gap-2 px-4 py-3 rounded-lg text-left whitespace-nowrap min-h-touch transition-colors',
                  activeSection === section.id
                    ? 'bg-navy text-white'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                )}
              >
                <Icon name={section.icon} size={18} />
                <span className="text-sm">{section.label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Section Content */}
        <div className="flex-1 max-w-3xl">
          {/* Loading state */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy" />
            </div>
          )}

          {/* Facility Settings */}
          {!loading && activeSection === 'facility' && facility && (
            <div className="card space-y-4">
              <h2 className="text-lg font-semibold">Facility Settings</h2>
              <Input
                label="Facility Name"
                value={facility.name}
                onChange={(e) => setFacility({ ...facility, name: e.target.value })}
              />
              <Input
                label="Address"
                value={facility.address}
                onChange={(e) => setFacility({ ...facility, address: e.target.value })}
              />
              <Select
                label="Time Zone"
                options={TIMEZONE_OPTIONS}
                value={facility.timezone}
                onChange={(e) => setFacility({ ...facility, timezone: e.target.value })}
              />

              <h3 className="font-medium mt-6">Operating Hours</h3>
              {DAYS_OF_WEEK.map((day) => (
                <div key={day} className="grid grid-cols-3 gap-2 items-center">
                  <span className="text-sm">{day}</span>
                  <Input
                    type="time"
                    value={facility.operating_hours?.[day.toLowerCase()]?.open || '06:00'}
                    onChange={(e) =>
                      setFacility({
                        ...facility,
                        operating_hours: {
                          ...facility.operating_hours,
                          [day.toLowerCase()]: {
                            ...facility.operating_hours?.[day.toLowerCase()],
                            open: e.target.value,
                          },
                        },
                      })
                    }
                  />
                  <Input
                    type="time"
                    value={facility.operating_hours?.[day.toLowerCase()]?.close || '23:00'}
                    onChange={(e) =>
                      setFacility({
                        ...facility,
                        operating_hours: {
                          ...facility.operating_hours,
                          [day.toLowerCase()]: {
                            ...facility.operating_hours?.[day.toLowerCase()],
                            close: e.target.value,
                          },
                        },
                      })
                    }
                  />
                </div>
              ))}

              <Button className="mt-4" onClick={() => handleSaveSection('/api/admin/facility', facility)} disabled={saving}>
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          )}

          {/* Rink Configuration */}
          {!loading && activeSection === 'rinks' && (
            <div className="card space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Rink Configuration</h2>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={async () => {
                    try {
                      const res = await fetch('/api/admin/rinks', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name: 'New Rink', length: 200, width: 85 }),
                      })
                      if (res.ok) fetchSectionData('rinks')
                    } catch {
                      setError('Failed to add rink')
                    }
                  }}
                >
                  + Add Rink
                </Button>
              </div>

              {rinks.map((rink) => (
                <div key={rink.id} className="border rounded-lg p-4 space-y-3">
                  <Input
                    label="Rink Name"
                    value={rink.name}
                    onChange={(e) =>
                      setRinks((prev) => prev.map((r) => r.id === rink.id ? { ...r, name: e.target.value } : r))
                    }
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Length (ft)"
                      type="number"
                      value={rink.length.toString()}
                      onChange={(e) =>
                        setRinks((prev) => prev.map((r) => r.id === rink.id ? { ...r, length: parseInt(e.target.value) || 0 } : r))
                      }
                    />
                    <Input
                      label="Width (ft)"
                      type="number"
                      value={rink.width.toString()}
                      onChange={(e) =>
                        setRinks((prev) => prev.map((r) => r.id === rink.id ? { ...r, width: parseInt(e.target.value) || 0 } : r))
                      }
                    />
                  </div>
                  <h4 className="text-sm font-medium">Ice Depth Thresholds (inches)</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs text-action-green font-medium">Green (Optimal)</label>
                      <div className="flex gap-1">
                        <Input
                          type="number"
                          step="0.01"
                          value={rink.thresholds?.green_min?.toString() || '1.00'}
                          onChange={(e) =>
                            setRinks((prev) => prev.map((r) => r.id === rink.id ? { ...r, thresholds: { ...r.thresholds, green_min: parseFloat(e.target.value) } } : r))
                          }
                          placeholder="Min"
                        />
                        <Input
                          type="number"
                          step="0.01"
                          value={rink.thresholds?.green_max?.toString() || '1.74'}
                          onChange={(e) =>
                            setRinks((prev) => prev.map((r) => r.id === rink.id ? { ...r, thresholds: { ...r.thresholds, green_max: parseFloat(e.target.value) } } : r))
                          }
                          placeholder="Max"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-alert-yellow font-medium">Yellow (Too Thick)</label>
                      <div className="flex gap-1">
                        <Input
                          type="number"
                          step="0.01"
                          value={rink.thresholds?.yellow_min?.toString() || '1.75'}
                          onChange={(e) =>
                            setRinks((prev) => prev.map((r) => r.id === rink.id ? { ...r, thresholds: { ...r.thresholds, yellow_min: parseFloat(e.target.value) } } : r))
                          }
                          placeholder="Min"
                        />
                        <Input
                          type="number"
                          step="0.01"
                          value={rink.thresholds?.yellow_max?.toString() || '3.50'}
                          onChange={(e) =>
                            setRinks((prev) => prev.map((r) => r.id === rink.id ? { ...r, thresholds: { ...r.thresholds, yellow_max: parseFloat(e.target.value) } } : r))
                          }
                          placeholder="Max"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-alert-red font-medium">Red (Too Thin)</label>
                      <div className="flex gap-1">
                        <Input
                          type="number"
                          step="0.01"
                          value={rink.thresholds?.red_min?.toString() || '0.00'}
                          onChange={(e) =>
                            setRinks((prev) => prev.map((r) => r.id === rink.id ? { ...r, thresholds: { ...r.thresholds, red_min: parseFloat(e.target.value) } } : r))
                          }
                          placeholder="Min"
                        />
                        <Input
                          type="number"
                          step="0.01"
                          value={rink.thresholds?.red_max?.toString() || '0.99'}
                          onChange={(e) =>
                            setRinks((prev) => prev.map((r) => r.id === rink.id ? { ...r, thresholds: { ...r.thresholds, red_max: parseFloat(e.target.value) } } : r))
                          }
                          placeholder="Max"
                        />
                      </div>
                    </div>
                  </div>
                  <Button size="sm">Configure Measurement Points</Button>
                </div>
              ))}

              <Button onClick={() => handleSaveSection('/api/admin/rinks', { rinks })} disabled={saving}>
                {saving ? 'Saving...' : 'Save Rink Settings'}
              </Button>
            </div>
          )}

          {/* User Management */}
          {!loading && activeSection === 'users' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">User Management</h2>
                <Button onClick={() => setShowInviteModal(true)}>+ Invite User</Button>
              </div>

              <div className="space-y-2">
                {users.map((user) => (
                  <div key={user.id} className="card flex items-center justify-between">
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-wolf-grey">{user.email}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium capitalize">
                        {user.role.replace(/_/g, ' ').toLowerCase()}
                      </div>
                      <div className="text-xs text-wolf-grey">Active {user.lastActive}</div>
                    </div>
                  </div>
                ))}
                {users.length === 0 && (
                  <p className="text-sm text-wolf-grey text-center py-8">No users found.</p>
                )}
              </div>
            </div>
          )}

          {/* Module Settings */}
          {!loading && activeSection === 'modules' && (
            <div className="card space-y-4">
              <h2 className="text-lg font-semibold">Module Settings</h2>
              <p className="text-sm text-wolf-grey">Enable or disable modules for your facility.</p>

              <div className="space-y-2">
                {modules.map((mod) => (
                  <label key={mod.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                    <span>{mod.name}</span>
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={mod.enabled}
                        onChange={() => toggleModule(mod.id)}
                        className="sr-only"
                      />
                      <div className={clsx(
                        'w-12 h-7 rounded-full transition-colors',
                        mod.enabled ? 'bg-action-green' : 'bg-wolf-grey'
                      )}>
                        <div className={clsx(
                          'w-5 h-5 bg-white rounded-full shadow-sm transition-transform mt-1',
                          mod.enabled ? 'translate-x-6' : 'translate-x-1'
                        )} />
                      </div>
                    </div>
                  </label>
                ))}
              </div>

              <Button onClick={() => handleSaveSection('/api/admin/modules', { modules })} disabled={saving}>
                {saving ? 'Saving...' : 'Save Module Settings'}
              </Button>
            </div>
          )}

          {/* Equipment Setup */}
          {!loading && activeSection === 'equipment' && (
            <div className="card space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Equipment Setup</h2>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={async () => {
                    try {
                      const res = await fetch('/api/admin/equipment', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name: 'New Equipment', type: 'other', category: 'other' }),
                      })
                      if (res.ok) fetchSectionData('equipment')
                    } catch {
                      setError('Failed to add equipment')
                    }
                  }}
                >
                  + Add Equipment
                </Button>
              </div>

              {/* Group by category */}
              {(() => {
                const machineEquip = equipmentList.filter((e) => e.category === 'machine' || e.type === 'resurfacer')
                const refrigEquip = equipmentList.filter((e) => e.category === 'refrigeration' || e.type === 'compressor' || e.type === 'pump' || e.type === 'condenser')
                const otherEquip = equipmentList.filter((e) => !machineEquip.includes(e) && !refrigEquip.includes(e))

                return (
                  <>
                    {machineEquip.length > 0 && (
                      <>
                        <h3 className="font-medium">Machines (Resurfacers)</h3>
                        {machineEquip.map((item) => (
                          <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <span>{item.name}</span>
                            <div className="flex gap-2">
                              <Button variant="secondary" size="sm">Edit</Button>
                              <Button variant="secondary" size="sm">Circle Check Items</Button>
                            </div>
                          </div>
                        ))}
                      </>
                    )}

                    {refrigEquip.length > 0 && (
                      <>
                        <h3 className="font-medium mt-4">Compressors & Pumps</h3>
                        {refrigEquip.map((item) => (
                          <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <span>{item.name}</span>
                            <Button variant="secondary" size="sm">Configure Readings</Button>
                          </div>
                        ))}
                      </>
                    )}

                    {otherEquip.length > 0 && (
                      <>
                        <h3 className="font-medium mt-4">Other Equipment</h3>
                        {otherEquip.map((item) => (
                          <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <span>{item.name}</span>
                            <Button variant="secondary" size="sm">Edit</Button>
                          </div>
                        ))}
                      </>
                    )}

                    {equipmentList.length === 0 && (
                      <p className="text-sm text-wolf-grey text-center py-4">No equipment configured.</p>
                    )}
                  </>
                )
              })()}
            </div>
          )}

          {/* Threshold Settings */}
          {!loading && activeSection === 'thresholds' && (
            <div className="card space-y-4">
              <h2 className="text-lg font-semibold">Alert Thresholds</h2>

              <h3 className="font-medium">Air Quality</h3>
              {thresholds.map((item) => (
                <div key={item.id} className="grid grid-cols-3 gap-2 items-center">
                  <span className="text-sm">{item.label}</span>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Min"
                    value={item.min}
                    onChange={(e) =>
                      setThresholds((prev) => prev.map((t) => t.id === item.id ? { ...t, min: e.target.value } : t))
                    }
                  />
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Max"
                    value={item.max}
                    onChange={(e) =>
                      setThresholds((prev) => prev.map((t) => t.id === item.id ? { ...t, max: e.target.value } : t))
                    }
                  />
                </div>
              ))}

              <Button className="mt-4" onClick={() => handleSaveSection('/api/admin/thresholds', { thresholds })} disabled={saving}>
                {saving ? 'Saving...' : 'Save Thresholds'}
              </Button>
            </div>
          )}

          {/* Notifications */}
          {!loading && activeSection === 'notifications' && (
            <div className="card space-y-4">
              <h2 className="text-lg font-semibold">Notification Settings</h2>

              {notifications.map((notif) => (
                <div key={notif.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="text-sm">{notif.trigger}</span>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-1 text-xs">
                      <input
                        type="checkbox"
                        checked={notif.in_app}
                        onChange={() =>
                          setNotifications((prev) => prev.map((n) => n.id === notif.id ? { ...n, in_app: !n.in_app } : n))
                        }
                        className="w-4 h-4"
                      /> In-App
                    </label>
                    <label className="flex items-center gap-1 text-xs">
                      <input
                        type="checkbox"
                        checked={notif.email}
                        onChange={() =>
                          setNotifications((prev) => prev.map((n) => n.id === notif.id ? { ...n, email: !n.email } : n))
                        }
                        className="w-4 h-4"
                      /> Email
                    </label>
                    <label className="flex items-center gap-1 text-xs">
                      <input
                        type="checkbox"
                        checked={notif.sms}
                        onChange={() =>
                          setNotifications((prev) => prev.map((n) => n.id === notif.id ? { ...n, sms: !n.sms } : n))
                        }
                        className="w-4 h-4"
                      /> SMS
                    </label>
                  </div>
                </div>
              ))}

              <Button onClick={() => handleSaveSection('/api/admin/notifications', { notifications })} disabled={saving}>
                {saving ? 'Saving...' : 'Save Notification Settings'}
              </Button>
            </div>
          )}

          {/* Data Retention */}
          {!loading && activeSection === 'retention' && retention && (
            <div className="card space-y-4">
              <h2 className="text-lg font-semibold">Data Retention</h2>

              <Input
                label="Standard Data Retention (years)"
                type="number"
                min="1"
                max="10"
                value={retention.standard_years.toString()}
                onChange={(e) => setRetention({ ...retention, standard_years: parseInt(e.target.value) || 3 })}
              />
              <Input
                label="Incident Data Retention (years)"
                type="number"
                min="1"
                max="20"
                value={retention.incident_years.toString()}
                onChange={(e) => setRetention({ ...retention, incident_years: parseInt(e.target.value) || 7 })}
              />

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <span className="font-medium">Archive Mode</span>
                  <p className="text-sm text-wolf-grey">Enable for seasonal facility closures</p>
                </div>
                <div
                  className={clsx(
                    'w-12 h-7 rounded-full cursor-pointer transition-colors',
                    retention.archive_mode ? 'bg-action-green' : 'bg-wolf-grey'
                  )}
                  onClick={() => setRetention({ ...retention, archive_mode: !retention.archive_mode })}
                >
                  <div className={clsx(
                    'w-5 h-5 bg-white rounded-full shadow-sm transition-transform mt-1',
                    retention.archive_mode ? 'translate-x-6' : 'translate-x-1'
                  )} />
                </div>
              </div>

              <Button onClick={() => handleSaveSection('/api/admin/retention', retention)} disabled={saving}>
                {saving ? 'Saving...' : 'Save Retention Settings'}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Invite User Modal */}
      <Modal
        open={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        title="Invite User"
      >
        <form className="space-y-4" onSubmit={handleInviteUser}>
          <Input
            label="Email Address"
            type="email"
            placeholder="user@facility.com"
            required
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
          />
          <Input
            label="Full Name"
            placeholder="John Doe"
            required
            value={inviteName}
            onChange={(e) => setInviteName(e.target.value)}
          />
          <Select
            label="Role"
            options={ROLE_OPTIONS}
            placeholder="Select role"
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value)}
          />
          <Button type="submit" className="w-full" disabled={inviting}>
            {inviting ? 'Sending...' : 'Send Invitation'}
          </Button>
        </form>
      </Modal>
    </div>
  )
}
