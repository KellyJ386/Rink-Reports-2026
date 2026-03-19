import { NextResponse } from 'next/server'
import { tagInactiveContacts } from '@/lib/hubspot'

/**
 * CRON endpoint: Tag contacts inactive for 30+ days as "At Risk" in HubSpot.
 * Configure in Vercel Cron or external scheduler to run daily.
 *
 * Protected by CRON_SECRET header to prevent unauthorized access.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const tagged = await tagInactiveContacts(30)
    return NextResponse.json({ tagged, timestamp: new Date().toISOString() })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[HubSpot Inactivity Check] Error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
