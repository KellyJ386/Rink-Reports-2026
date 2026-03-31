import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerSupabaseClient } from '@/lib/supabase/server'

const updateThresholdsSchema = z.object({
  thresholds: z.array(z.object({
    id: z.string().uuid(),
    min: z.string(),
    max: z.string(),
  })),
})

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('facility_id, role')
      .eq('id', user.id)
      .single()
    if (!profile || !['facility_admin', 'super_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    if (!profile.facility_id) {
      return NextResponse.json({ error: 'No facility found' }, { status: 400 })
    }

    const { data: metrics, error } = await supabase
      .from('air_quality_metrics')
      .select('id, name, unit, min_threshold, max_threshold')
      .eq('facility_id', profile.facility_id)
      .eq('is_active', true)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const thresholds = (metrics ?? []).map((m) => ({
      id: m.id,
      label: `${m.name} (${m.unit})`,
      min: m.min_threshold?.toString() ?? '',
      max: m.max_threshold?.toString() ?? '',
      unit: m.unit,
    }))

    return NextResponse.json(thresholds)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('facility_id, role')
      .eq('id', user.id)
      .single()
    if (!profile || !['facility_admin', 'super_admin'].includes(profile.role) || !profile.facility_id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const parsed = updateThresholdsSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    for (const threshold of parsed.data.thresholds) {
      const minVal = parseFloat(threshold.min)
      const maxVal = parseFloat(threshold.max)

      const { error } = await supabase
        .from('air_quality_metrics')
        .update({
          min_threshold: isNaN(minVal) ? null : minVal,
          max_threshold: isNaN(maxVal) ? null : maxVal,
        })
        .eq('id', threshold.id)
        .eq('facility_id', profile.facility_id)

      if (error) {
        return NextResponse.json({ error: `Failed to update threshold: ${error.message}` }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
