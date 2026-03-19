import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const supabase = createServerSupabaseClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('facility_id').eq('id', user.id).single()
  if (!profile?.facility_id) return NextResponse.json({ error: 'No facility found' }, { status: 400 })

  const { searchParams } = new URL(request.url)
  const templateId = searchParams.get('template_id')

  if (!templateId) {
    return NextResponse.json({ error: 'template_id query parameter is required' }, { status: 400 })
  }

  // Get all points for the template, then fetch the latest reading for each
  const { data: points, error: pointsError } = await supabase
    .from('ice_depth_points')
    .select('id, point_number, x_percent, y_percent, label')
    .eq('template_id', templateId)
    .order('point_number', { ascending: true })

  if (pointsError) return NextResponse.json({ error: pointsError.message }, { status: 500 })
  if (!points || points.length === 0) {
    return NextResponse.json({ latest_readings: [] })
  }

  const pointIds = points.map((p) => p.id)

  // Fetch the most recent reading per point using distinct on
  const { data: readings, error: readingsError } = await supabase
    .from('ice_depth_readings')
    .select('*')
    .in('point_id', pointIds)
    .eq('facility_id', profile.facility_id)
    .order('point_id', { ascending: true })
    .order('created_at', { ascending: false })

  if (readingsError) return NextResponse.json({ error: readingsError.message }, { status: 500 })

  // Reduce to latest reading per point
  const readingsList = readings ?? []
  const latestByPoint = new Map<string, (typeof readingsList)[number]>()
  for (const reading of readingsList) {
    if (!latestByPoint.has(reading.point_id)) {
      latestByPoint.set(reading.point_id, reading)
    }
  }

  // Merge point info with latest reading
  const latestReadings = points.map((point) => ({
    ...point,
    latest_reading: latestByPoint.get(point.id) ?? null,
  }))

  return NextResponse.json({ latest_readings: latestReadings })
}
