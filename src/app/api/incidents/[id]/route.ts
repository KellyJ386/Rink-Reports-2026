import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { updateIncidentSchema } from '@/lib/validations/incidents'

const MANAGER_AND_ABOVE = ['super_admin', 'facility_admin', 'manager']

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('facility_id')
      .eq('id', user.id)
      .single()
    if (!profile?.facility_id) {
      return NextResponse.json({ error: 'No facility found' }, { status: 400 })
    }

    const { data: incident, error } = await supabase
      .from('incidents')
      .select('*')
      .eq('id', params.id)
      .eq('facility_id', profile.facility_id)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!incident) {
      return NextResponse.json({ error: 'Incident not found' }, { status: 404 })
    }

    return NextResponse.json({ data: incident })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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
    if (!profile?.facility_id) {
      return NextResponse.json({ error: 'No facility found' }, { status: 400 })
    }

    // Fetch the existing incident to check ownership and facility isolation
    const { data: existing, error: fetchError } = await supabase
      .from('incidents')
      .select('reported_by, facility_id')
      .eq('id', params.id)
      .eq('facility_id', profile.facility_id)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Incident not found' }, { status: 404 })
    }

    // Only the original reporter or manager+ can update
    const isReporter = existing.reported_by === user.id
    const isManagerOrAbove = MANAGER_AND_ABOVE.includes(profile.role)
    if (!isReporter && !isManagerOrAbove) {
      return NextResponse.json(
        { error: 'You do not have permission to update this incident' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const parsed = updateIncidentSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { data: incident, error } = await supabase
      .from('incidents')
      .update({
        ...parsed.data,
        updated_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .eq('facility_id', profile.facility_id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: incident })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
