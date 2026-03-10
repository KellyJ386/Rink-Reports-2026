'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      setSent(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-navy-dark px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-navy dark:text-white">
            Max Facility
          </h1>
          <p className="text-wolf-grey mt-1">Reset Your Password</p>
        </div>

        <div className="card">
          {sent ? (
            <div className="text-center py-4">
              <p className="text-action-green font-medium mb-2">Email Sent!</p>
              <p className="text-sm text-wolf-grey mb-4">
                If an account exists for {email}, you will receive a password reset link.
              </p>
              <Link href="/login" className="text-navy dark:text-action-green hover:underline text-sm">
                Back to login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-sm text-wolf-grey">
                Enter your email address and we&apos;ll send you a link to reset your password.
              </p>
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@facility.com"
                required
              />
              <Button type="submit" className="w-full" loading={loading}>
                Send Reset Link
              </Button>
              <div className="text-center">
                <Link href="/login" className="text-sm text-navy dark:text-action-green hover:underline">
                  Back to login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
