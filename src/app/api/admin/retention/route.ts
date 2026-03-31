import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerSupabaseClient } from '@/lib/supabase/server'

const updateRetentionSchema = z.object({
  standard_years: z.number().int().min(1).max(10),
  incident_years: z.number().int().min(1).max(20),
  archive_mode: z.boolean(),
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

    const { data: facility, error } = await supabase
      .from('facilities')
      .select('data_retention_years, incident_retention_years, is_archived')
      .eq('id', profile.facility_id)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      standard_years: facility?.data_retention_years ?? 3,
      incident_years: facility?.incident_retention_years ?? 7,
      archive_mode: facility?.is_archived ?? false,
    })
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
    const parsed = updateRetentionSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('facilities')
      .update({
        data_retention_years: parsed.data.standard_years,
        incident_retention_years: parsed.data.incident_years,
        is_archived: parsed.data.archive_mode,
      })
      .eq('id', profile.facility_id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
