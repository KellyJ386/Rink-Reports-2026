'use client'

import { useState } from 'react'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Modal } from '@/components/ui/Modal'
import { Icon } from '@/components/ui/Icons'
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

// Mock users
const MOCK_USERS = [
  { id: '1', name: 'John Doe', email: 'john@facility.com', role: 'FACILITY_ADMIN', lastActive: '2 hours ago' },
  { id: '2', name: 'Sarah Miller', email: 'sarah@facility.com', role: 'MANAGER', lastActive: '1 day ago' },
  { id: '3', name: 'Mike Roberts', email: 'mike@facility.com', role: 'STAFF', lastActive: '3 hours ago' },
  { id: '4', name: 'Lisa Kim', email: 'lisa@facility.com', role: 'SUPERVISOR', lastActive: '5 hours ago' },
]

const ROLE_OPTIONS = [
  { value: 'FACILITY_ADMIN', label: 'Facility Admin' },
  { value: 'MANAGER', label: 'Manager' },
  { value: 'SUPERVISOR', label: 'Supervisor' },
  { value: 'STAFF', label: 'Staff/Operator' },
  { value: 'READ_ONLY', label: 'Read-Only' },
]

// Mock modules
const MODULE_TOGGLES = [
  { id: 'daily-reports', name: 'Daily Reports', enabled: true },
  { id: 'ice-depth', name: 'Ice Depth Management', enabled: true },
  { id: 'ice-operations', name: 'Ice Operations', enabled: true },
  { id: 'scheduling', name: 'Employee Scheduling', enabled: true },
  { id: 'incidents', name: 'Incident Reporting', enabled: true },
  { id: 'refrigeration', name: 'Refrigeration Plant', enabled: true },
  { id: 'air-quality', name: 'Air Quality', enabled: false },
  { id: 'communication', name: 'Communication', enabled: false },
]

export default function AdminPage() {
  const [activeSection, setActiveSection] = useState<AdminSection>('facility')
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [modules, setModules] = useState(MODULE_TOGGLES)

  function toggleModule(moduleId: string) {
    setModules((prev) =>
      prev.map((m) => (m.id === moduleId ? { ...m, enabled: !m.enabled } : m))
    )
  }

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Admin Control Center' }]} />

      <h1 className="text-2xl font-bold text-navy dark:text-white mb-6 px-4">
        Admin Control Center
      </h1>

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
          {/* Facility Settings */}
          {activeSection === 'facility' && (
            <div className="card space-y-4">
              <h2 className="text-lg font-semibold">Facility Settings</h2>
              <Input label="Facility Name" defaultValue="City Recreation Center" />
              <Input label="Address" defaultValue="123 Main Street, Anytown, ST 12345" />
              <Select
                label="Time Zone"
                options={[
                  { value: 'America/New_York', label: 'Eastern Time' },
                  { value: 'America/Chicago', label: 'Central Time' },
                  { value: 'America/Denver', label: 'Mountain Time' },
                  { value: 'America/Los_Angeles', label: 'Pacific Time' },
                ]}
                value="America/New_York"
              />

              <h3 className="font-medium mt-6">Operating Hours</h3>
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                <div key={day} className="grid grid-cols-3 gap-2 items-center">
                  <span className="text-sm">{day}</span>
                  <Input type="time" defaultValue="06:00" />
                  <Input type="time" defaultValue="23:00" />
                </div>
              ))}

              <Button className="mt-4">Save Settings</Button>
            </div>
          )}

          {/* Rink Configuration */}
          {activeSection === 'rinks' && (
            <div className="card space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Rink Configuration</h2>
                <Button variant="secondary" size="sm">+ Add Rink</Button>
              </div>

              {['Rink A - Main', 'Rink B - Practice'].map((rink, i) => (
                <div key={i} className="border rounded-lg p-4 space-y-3">
                  <Input label="Rink Name" defaultValue={rink} />
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Length (ft)" type="number" defaultValue="200" />
                    <Input label="Width (ft)" type="number" defaultValue="85" />
                  </div>
                  <h4 className="text-sm font-medium">Ice Depth Thresholds (inches)</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs text-action-green font-medium">Green (Optimal)</label>
                      <div className="flex gap-1">
                        <Input type="number" step="0.01" defaultValue="1.00" placeholder="Min" />
                        <Input type="number" step="0.01" defaultValue="1.74" placeholder="Max" />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-alert-yellow font-medium">Yellow (Too Thick)</label>
                      <div className="flex gap-1">
                        <Input type="number" step="0.01" defaultValue="1.75" placeholder="Min" />
                        <Input type="number" step="0.01" defaultValue="3.50" placeholder="Max" />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-alert-red font-medium">Red (Too Thin)</label>
                      <div className="flex gap-1">
                        <Input type="number" step="0.01" defaultValue="0.00" placeholder="Min" />
                        <Input type="number" step="0.01" defaultValue="0.99" placeholder="Max" />
                      </div>
                    </div>
                  </div>
                  <Button size="sm">Configure Measurement Points</Button>
                </div>
              ))}

              <Button>Save Rink Settings</Button>
            </div>
          )}

          {/* User Management */}
          {activeSection === 'users' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">User Management</h2>
                <Button onClick={() => setShowInviteModal(true)}>+ Invite User</Button>
              </div>

              <div className="space-y-2">
                {MOCK_USERS.map((user) => (
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
              </div>
            </div>
          )}

          {/* Module Settings */}
          {activeSection === 'modules' && (
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

              <Button>Save Module Settings</Button>
            </div>
          )}

          {/* Equipment Setup */}
          {activeSection === 'equipment' && (
            <div className="card space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Equipment Setup</h2>
                <Button variant="secondary" size="sm">+ Add Equipment</Button>
              </div>

              <h3 className="font-medium">Machines (Resurfacers)</h3>
              {['Zamboni #1 (Gas)', 'Zamboni #2 (Electric)'].map((name, i) => (
                <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                  <span>{name}</span>
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm">Edit</Button>
                    <Button variant="secondary" size="sm">Circle Check Items</Button>
                  </div>
                </div>
              ))}

              <h3 className="font-medium mt-4">Compressors & Pumps</h3>
              {['Compressor #1 - Rink A', 'Compressor #2 - Rink A', 'Glycol Pump - Main'].map((name, i) => (
                <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                  <span>{name}</span>
                  <Button variant="secondary" size="sm">Configure Readings</Button>
                </div>
              ))}
            </div>
          )}

          {/* Threshold Settings */}
          {activeSection === 'thresholds' && (
            <div className="card space-y-4">
              <h2 className="text-lg font-semibold">Alert Thresholds</h2>

              <h3 className="font-medium">Air Quality</h3>
              {[
                { label: 'CO (PPM)', max: '25' },
                { label: 'CO2 (PPM)', max: '5000' },
                { label: 'NO2 (PPM)', max: '0.1' },
                { label: 'Humidity (%)', max: '65' },
              ].map((item, i) => (
                <div key={i} className="grid grid-cols-3 gap-2 items-center">
                  <span className="text-sm">{item.label}</span>
                  <Input type="number" step="0.01" placeholder="Min" />
                  <Input type="number" step="0.01" defaultValue={item.max} placeholder="Max" />
                </div>
              ))}

              <Button className="mt-4">Save Thresholds</Button>
            </div>
          )}

          {/* Notifications */}
          {activeSection === 'notifications' && (
            <div className="card space-y-4">
              <h2 className="text-lg font-semibold">Notification Settings</h2>

              {[
                'Out-of-Range Reading',
                'Incident Submitted',
                'Shift Reminder',
                'Shift Swap Request',
                'Open Shift Available',
              ].map((trigger, i) => (
                <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="text-sm">{trigger}</span>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-1 text-xs">
                      <input type="checkbox" defaultChecked className="w-4 h-4" /> In-App
                    </label>
                    <label className="flex items-center gap-1 text-xs">
                      <input type="checkbox" defaultChecked={i < 2} className="w-4 h-4" /> Email
                    </label>
                    <label className="flex items-center gap-1 text-xs">
                      <input type="checkbox" defaultChecked={i === 0} className="w-4 h-4" /> SMS
                    </label>
                  </div>
                </div>
              ))}

              <Button>Save Notification Settings</Button>
            </div>
          )}

          {/* Data Retention */}
          {activeSection === 'retention' && (
            <div className="card space-y-4">
              <h2 className="text-lg font-semibold">Data Retention</h2>

              <Input label="Standard Data Retention (years)" type="number" defaultValue="3" min="1" max="10" />
              <Input label="Incident Data Retention (years)" type="number" defaultValue="7" min="1" max="20" />

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <span className="font-medium">Archive Mode</span>
                  <p className="text-sm text-wolf-grey">Enable for seasonal facility closures</p>
                </div>
                <div className="w-12 h-7 bg-wolf-grey rounded-full cursor-pointer">
                  <div className="w-5 h-5 bg-white rounded-full shadow-sm translate-x-1 mt-1" />
                </div>
              </div>

              <Button>Save Retention Settings</Button>
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
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setShowInviteModal(false) }}>
          <Input label="Email Address" type="email" placeholder="user@facility.com" required />
          <Input label="Full Name" placeholder="John Doe" required />
          <Select label="Role" options={ROLE_OPTIONS} placeholder="Select role" />
          <Button type="submit" className="w-full">Send Invitation</Button>
        </form>
      </Modal>
    </div>
  )
}
