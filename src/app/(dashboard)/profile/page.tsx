'use client'

import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'

export default function ProfilePage() {
  return (
    <div>
      <Breadcrumbs items={[{ label: 'Profile & Settings' }]} />

      <h1 className="text-2xl font-bold text-navy dark:text-white mb-6 px-4">
        Profile & Settings
      </h1>

      <div className="px-4 max-w-2xl space-y-6">
        {/* Profile Info */}
        <div className="card space-y-4">
          <h2 className="text-lg font-semibold">Profile Information</h2>
          <Input label="Full Name" defaultValue="John Doe" />
          <Input label="Email" type="email" defaultValue="john@facility.com" readOnly />
          <Input label="Role" value="Facility Admin" readOnly />
          <Button>Update Profile</Button>
        </div>

        {/* Change Password */}
        <div className="card space-y-4">
          <h2 className="text-lg font-semibold">Change Password</h2>
          <Input label="Current Password" type="password" />
          <Input label="New Password" type="password" />
          <Input label="Confirm New Password" type="password" />
          <Button>Change Password</Button>
        </div>

        {/* Notification Preferences */}
        <div className="card space-y-4">
          <h2 className="text-lg font-semibold">Notification Preferences</h2>

          {[
            'Out-of-Range Readings',
            'New Incidents',
            'Shift Reminders',
            'Shift Swap Requests',
            'Open Shifts',
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between py-2">
              <span className="text-sm">{item}</span>
              <div className="flex gap-4">
                <label className="flex items-center gap-1 text-xs">
                  <input type="checkbox" defaultChecked className="w-4 h-4" /> In-App
                </label>
                <label className="flex items-center gap-1 text-xs">
                  <input type="checkbox" defaultChecked={i < 2} className="w-4 h-4" /> Email
                </label>
                <label className="flex items-center gap-1 text-xs">
                  <input type="checkbox" className="w-4 h-4" /> SMS
                </label>
              </div>
            </div>
          ))}

          <Button>Save Preferences</Button>
        </div>

        {/* Session */}
        <div className="card">
          <Button variant="danger">Sign Out</Button>
        </div>
      </div>
    </div>
  )
}
