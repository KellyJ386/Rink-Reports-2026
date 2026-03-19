import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

/**
 * GET /api/dashboard/alerts
 *
 * Returns alert/badge counts per module for the dashboard grid.
 * Counts unread notifications grouped by their `type` field,
 * which maps to module IDs (e.g. "refrigeration", "incidents", "air-quality").
 */
export async function GET() {
  const supabase = createServerSupabaseClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get the user's facility_id
  const { data: profile } = await supabase
    .from('profiles')
    .select('facility_id')
    .eq('id', user.id)
    .single()

  if (!profile?.facility_id) {
    return NextResponse.json({ counts: {} })
  }

  const facilityId = profile.facility_id

  // Count unread notifications per type (type maps to module id)
  const { data: notifications } = await supabase
    .from('notifications')
    .select('type')
    .eq('user_id', user.id)
    .eq('read', false)

  const counts: Record<string, number> = {}
  if (notifications) {
    for (const n of notifications) {
      counts[n.type] = (counts[n.type] ?? 0) + 1
    }
  }

  // Also count active refrigeration alerts
  const { count: refAlertCount } = await supabase
    .from('refrigeration_alerts')
    .select('*', { count: 'exact', head: true })
    .eq('facility_id', facilityId)
    .eq('resolved', false)

  if (refAlertCount && refAlertCount > 0) {
    counts['refrigeration'] = (counts['refrigeration'] ?? 0) + refAlertCount
  }

  // Count today's unresolved air quality exceedances
  const today = new Date().toISOString().split('T')[0]
  const { count: aqAlertCount } = await supabase
    .from('air_quality_readings')
    .select('*', { count: 'exact', head: true })
    .eq('facility_id', facilityId)
    .eq('has_exceedance', true)
    .gte('recorded_at', `${today}T00:00:00`)

  if (aqAlertCount && aqAlertCount > 0) {
    counts['air-quality'] = (counts['air-quality'] ?? 0) + aqAlertCount
  }

  return NextResponse.json({ counts })
}
