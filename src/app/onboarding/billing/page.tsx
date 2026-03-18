'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'

export default function OnboardingBillingPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleCheckout() {
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

      // Redirect to Stripe Checkout
      window.location.href = data.url
    } catch {
      setError('Unable to connect to billing. Please try again.')
      setLoading(false)
    }
  }

  const currentStep = 3

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-navy-dark px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-navy dark:text-white">
            Max Facility
          </h1>
          <p className="text-wolf-grey mt-1">Rink Reports</p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                s === currentStep
                  ? 'bg-navy text-white'
                  : s < currentStep
                    ? 'bg-action-green text-white'
                    : 'bg-gray-200 text-gray-500'
              }`}
            >
              {s}
            </div>
          ))}
        </div>

        {/* Billing Card */}
        <div className="card">
          <h2 className="text-xl font-semibold text-navy dark:text-white mb-4">
            Choose Your Plan
          </h2>

          {error && (
            <div className="bg-alert-red/10 text-alert-red px-4 py-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          {/* Plan Details */}
          <div className="border border-action-green rounded-lg p-6 mb-6">
            <div className="flex items-baseline justify-between mb-2">
              <h3 className="text-lg font-semibold text-navy dark:text-white">
                Rink Reports Pro
              </h3>
              <span className="text-xs font-medium bg-action-green/10 text-action-green px-2 py-1 rounded-full">
                Single Facility
              </span>
            </div>

            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-3xl font-bold text-navy dark:text-white">$79.99</span>
              <span className="text-wolf-grey">/month</span>
            </div>

            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-action-green flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                All operational modules included
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-action-green flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Unlimited staff accounts
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-action-green flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Offline-first mobile access
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-action-green flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                PDF and Excel report exports
              </li>
            </ul>
          </div>

          <div className="bg-action-green/10 text-action-green text-sm text-center px-4 py-2 rounded-lg mb-4">
            14-day free trial - no charge today
          </div>

          <Button
            className="w-full"
            loading={loading}
            onClick={handleCheckout}
          >
            Start Free Trial
          </Button>

          <p className="text-xs text-wolf-grey text-center mt-4">
            You will be redirected to Stripe for secure payment setup.
            Your card will not be charged during the trial period.
          </p>
        </div>
      </div>
    </div>
  )
}
