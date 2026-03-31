import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PUBLIC_PATHS = [
  '/login',
  '/forgot-password',
  '/reset-password',
  '/onboarding',
  '/api/billing/webhook',
  '/api/hubspot',
]

const BILLING_EXEMPT_PATHS = [
  '/onboarding',
  '/api/billing',
  '/api/profile',
  '/subscription-inactive',
]

function isPublicPath(pathname: string): boolean {
  return (
    pathname === '/' ||
    PUBLIC_PATHS.some((p) => pathname.startsWith(p))
  )
}

function isBillingExempt(pathname: string): boolean {
  return BILLING_EXEMPT_PATHS.some((p) => pathname.startsWith(p))
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options as Record<string, unknown>)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // Redirect unauthenticated users to login (except public pages)
  if (!user && !isPublicPath(pathname)) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Redirect authenticated users away from login to dashboard
  if (user && pathname.startsWith('/login')) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // Update last_active_at for authenticated users (throttled via cookie)
  if (user && !pathname.startsWith('/api/')) {
    const lastPing = request.cookies.get('rr_last_active')?.value
    const now = Date.now()
    // Only update every 5 minutes to avoid excessive writes
    if (!lastPing || now - parseInt(lastPing, 10) > 5 * 60 * 1000) {
      supabase
        .from('profiles')
        .update({ last_active_at: new Date().toISOString() })
        .eq('id', user.id)
        .then(() => {})
      supabaseResponse.cookies.set('rr_last_active', now.toString(), {
        maxAge: 300,
        httpOnly: true,
        sameSite: 'lax',
      })
    }
  }

  // Subscription guard: check if facility has active subscription
  // Skip for API routes (they handle auth themselves), public paths, and billing-exempt paths
  if (
    user &&
    !pathname.startsWith('/api/') &&
    !isPublicPath(pathname) &&
    !isBillingExempt(pathname)
  ) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('facility_id')
      .eq('id', user.id)
      .single()

    if (profile?.facility_id) {
      const { data: facility } = await supabase
        .from('facilities')
        .select('subscription_status')
        .eq('id', profile.facility_id)
        .single()

      // Block access if subscription is cancelled or past_due
      if (
        facility?.subscription_status &&
        !['active', 'trialing', 'pending'].includes(facility.subscription_status)
      ) {
        const url = request.nextUrl.clone()
        url.pathname = '/subscription-inactive'
        return NextResponse.redirect(url)
      }
    }
  }

  return supabaseResponse
}
