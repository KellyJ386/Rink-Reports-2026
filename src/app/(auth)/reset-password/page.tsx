'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)

    try {
      const params = new URLSearchParams(window.location.search)
      const token = params.get('token')

      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.message || 'Failed to reset password')
        return
      }

      setSuccess(true)
    } catch {
      setError('Unable to connect. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-navy-dark px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-navy dark:text-white">Max Facility</h1>
          <p className="text-wolf-grey mt-1">Set New Password</p>
        </div>

        <div className="card">
          {success ? (
            <div className="text-center py-4">
              <p className="text-action-green font-medium mb-2">Password Reset!</p>
              <p className="text-sm text-wolf-grey mb-4">
                Your password has been updated successfully.
              </p>
              <Link href="/login" className="btn-primary inline-block">
                Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-alert-red/10 text-alert-red px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
              <Input
                label="New Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                required
                minLength={8}
              />
              <Input
                label="Confirm Password"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Confirm your password"
                required
              />
              <Button type="submit" className="w-full" loading={loading}>
                Reset Password
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
