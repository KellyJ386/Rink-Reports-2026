import posthog from 'posthog-js'

let posthogInitialized = false

export function initPostHog() {
  if (typeof window === 'undefined' || posthogInitialized) return

  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST

  if (!key) return

  posthog.init(key, {
    api_host: host || 'https://app.posthog.com',
    capture_pageview: true,
    capture_pageleave: true,
  })
  posthogInitialized = true
}

export function trackEvent(event: string, properties?: Record<string, unknown>) {
  if (typeof window === 'undefined') return
  posthog.capture(event, properties)
}

export function identifyUser(userId: string, properties?: Record<string, unknown>) {
  if (typeof window === 'undefined') return
  posthog.identify(userId, properties)
}

export { posthog }
