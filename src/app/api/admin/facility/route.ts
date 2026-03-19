import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database'

const updateFacilitySchema = z.object({
  name: z.string().min(1).max(255).optional(),
  address: z.string().min(1).max(500).optional(),
  city: z.string().min(1).max(100).optional(),
  state: z.string().min(1).max(100).optional(),
  zip: z.string().min(1).max(20).optional(),
  timezone: z.string().min(1).max(100).optional(),
  facility_type: z.string().min(1).max(100).optional(),
  rink_count: z.number().int().min(1).max(20).optional(),
  data_retention_years: z.number().int().min(1).max(20).optional(),
  phone: z.string().max(30).optional(),
  email: z.string().email().optional(),
})

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()
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

    const { data: facility, error } = await supabase
      .from('facilities')
      .select('*')
      .eq('id', profile.facility_id)
      .single()

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch facility settings' }, { status: 500 })
    }

    return NextResponse.json(facility)
  } catch (error) {
    console.error('GET /api/admin/facility error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createServerSupabaseClient()
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
    const parsed = updateFacilitySchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { facility_type: _ft, rink_count: _rc, email: _em, ...validFields } = parsed.data
    const updatePayload: Database['public']['Tables']['facilities']['Update'] = {
      updated_at: new Date().toISOString(),
    }
    if (validFields.name !== undefined) updatePayload.name = validFields.name
    if (validFields.address !== undefined) updatePayload.address = validFields.address
    if (validFields.city !== undefined) updatePayload.city = validFields.city
    if (validFields.state !== undefined) updatePayload.state = validFields.state
    if (validFields.zip !== undefined) updatePayload.zip = validFields.zip
    if (validFields.timezone !== undefined) updatePayload.timezone = validFields.timezone
    if (validFields.data_retention_years !== undefined) updatePayload.data_retention_years = validFields.data_retention_years
    if (validFields.phone !== undefined) updatePayload.phone = validFields.phone

    const { data: facility, error } = await supabase
      .from('facilities')
      .update(updatePayload)
      .eq('id', profile.facility_id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: 'Failed to update facility settings' }, { status: 500 })
    }

    return NextResponse.json(facility)
  } catch (error) {
    console.error('PUT /api/admin/facility error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
