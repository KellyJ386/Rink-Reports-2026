'use client'

import { useCallback, useEffect, useState } from 'react'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'

interface NotificationPref {
  label: string
  key: string
  inApp: boolean
  email: boolean
  sms: boolean
}

const DEFAULT_PREFS: NotificationPref[] = [
  { label: 'Out-of-Range Readings', key: 'out_of_range', inApp: true, email: true, sms: false },
  { label: 'New Incidents', key: 'new_incidents', inApp: true, email: true, sms: false },
  { label: 'Shift Reminders', key: 'shift_reminders', inApp: true, email: false, sms: false },
  { label: 'Shift Swap Requests', key: 'swap_requests', inApp: true, email: false, sms: false },
  { label: 'Open Shifts', key: 'open_shifts', inApp: true, email: false, sms: false },
]

export default function ProfilePage() {
  const { user, profile, signOut } = useAuth()
  const { addToast } = useToast()

  // Profile form state
  const [fullName, setFullName] = useState('')
  const [position, setPosition] = useState('')
  const [saving, setSaving] = useState(false)

  // Password form state
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)

  // Notification preferences
  const [prefs, setPrefs] = useState<NotificationPref[]>(DEFAULT_PREFS)

  // Populate from profile
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name ?? '')
      setPosition(profile.position ?? '')
    }
  }, [profile])

  const handleUpdateProfile = useCallback(async () => {
    if (!fullName.trim()) {
      addToast('Name is required', 'error')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: fullName.trim(), position: position.trim() || undefined }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Failed to update profile')
      }
      addToast('Profile updated', 'success')
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed to update profile', 'error')
    } finally {
      setSaving(false)
    }
  }, [fullName, position, addToast])

  const handleChangePassword = useCallback(async () => {
    if (newPassword.length < 8) {
      addToast('Password must be at least 8 characters', 'error')
      return
    }
    if (newPassword !== confirmPassword) {
      addToast('Passwords do not match', 'error')
      return
    }
    setChangingPassword(true)
    try {
      const res = await fetch('/api/profile/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword, confirmPassword }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Failed to change password')
      }
      setNewPassword('')
      setConfirmPassword('')
      addToast('Password changed successfully', 'success')
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed to change password', 'error')
    } finally {
      setChangingPassword(false)
    }
  }, [newPassword, confirmPassword, addToast])

  const togglePref = useCallback((key: string, channel: 'inApp' | 'email' | 'sms') => {
    setPrefs((prev) =>
      prev.map((p) => (p.key === key ? { ...p, [channel]: !p[channel] } : p))
    )
  }, [])

  const handleSavePreferences = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferences: prefs }),
      })
      if (!res.ok) {
        throw new Error('Failed to save preferences')
      }
      addToast('Preferences saved', 'success')
    } catch {
      addToast('Failed to save preferences', 'error')
    }
  }, [prefs, addToast])

  const handleSignOut = useCallback(async () => {
    await signOut()
    window.location.href = '/login'
  }, [signOut])

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Profile & Settings' }]} />

      <h1 className="text-2xl font-bold text-navy dark:text-white mb-6 px-4">
        Profile & Settings
      </h1>

      <div className="px-4 max-w-2xl space-y-6">
        {/* Profile Info */}
        <div className="card space-y-4">
          <h2 className="text-lg font-semibold dark:text-white">Profile Information</h2>
          <Input
            label="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
          <Input
            label="Position"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            placeholder="e.g. Operations Manager"
          />
          <Input
            label="Email"
            type="email"
            value={user?.email ?? ''}
            readOnly
          />
          <Input
            label="Role"
            value={profile?.role ?? ''}
            readOnly
          />
          <Button onClick={handleUpdateProfile} loading={saving}>
            Update Profile
          </Button>
        </div>

        {/* Change Password */}
        <div className="card space-y-4">
          <h2 className="text-lg font-semibold dark:text-white">Change Password</h2>
          <Input
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Minimum 8 characters"
          />
          <Input
            label="Confirm New Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <Button onClick={handleChangePassword} loading={changingPassword}>
            Change Password
          </Button>
        </div>

        {/* Notification Preferences */}
        <div className="card space-y-4">
          <h2 className="text-lg font-semibold dark:text-white">Notification Preferences</h2>

          {prefs.map((pref) => (
            <div key={pref.key} className="flex items-center justify-between py-2">
              <span className="text-sm dark:text-gray-200">{pref.label}</span>
              <div className="flex gap-4">
                <label className="flex items-center gap-1 text-xs dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={pref.inApp}
                    onChange={() => togglePref(pref.key, 'inApp')}
                    className="w-4 h-4"
                  />
                  In-App
                </label>
                <label className="flex items-center gap-1 text-xs dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={pref.email}
                    onChange={() => togglePref(pref.key, 'email')}
                    className="w-4 h-4"
                  />
                  Email
                </label>
                <label className="flex items-center gap-1 text-xs dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={pref.sms}
                    onChange={() => togglePref(pref.key, 'sms')}
                    className="w-4 h-4"
                  />
                  SMS
                </label>
              </div>
            </div>
          ))}

          <Button onClick={handleSavePreferences}>Save Preferences</Button>
        </div>

        {/* Sign Out */}
        <div className="card">
          <Button variant="danger" onClick={handleSignOut}>
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  )
}
