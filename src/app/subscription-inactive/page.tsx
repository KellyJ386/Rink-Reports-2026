'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'

export default function SubscriptionInactivePage() {
  const { signOut, facility } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const status = facility?.subscription_status ?? 'inactive'

  async function handleReactivate() {
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/billing/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to start checkout')
        setLoading(false)
        return
      }

      window.location.href = data.url
    } catch {
      setError('Unable to connect to billing. Please try again.')
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
          <p className="text-wolf-grey mt-1">Rink Reports</p>
        </div>

        <div className="card text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-alert-yellow/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-alert-yellow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>

          <h2 className="text-xl font-semibold text-navy dark:text-white mb-2">
            Subscription {status === 'cancelled' ? 'Cancelled' : 'Past Due'}
          </h2>

          <p className="text-wolf-grey text-sm mb-6">
            {status === 'cancelled'
              ? 'Your subscription has been cancelled. Reactivate to regain access to your facility data.'
              : 'Your payment method needs to be updated. Please update your billing information to continue.'}
          </p>

          {error && (
            <div className="bg-alert-red/10 text-alert-red px-4 py-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <Button className="w-full" onClick={handleReactivate} loading={loading}>
              {status === 'cancelled' ? 'Reactivate Subscription' : 'Update Payment'}
            </Button>

            <button
              onClick={() => signOut()}
              className="w-full text-sm text-wolf-grey hover:text-navy dark:hover:text-white transition-colors py-2"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
