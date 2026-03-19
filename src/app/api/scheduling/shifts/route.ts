import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createShiftSchema } from '@/lib/validations/scheduling'

const MANAGER_ROLES = ['super_admin', 'facility_admin', 'manager']

export async function GET(request: Request) {
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

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')

    let query = supabase
      .from('shifts')
      .select('*')
      .eq('facility_id', profile.facility_id)
      .order('start_time', { ascending: true })

    if (startDate) {
      query = query.gte('start_time', startDate)
    }
    if (endDate) {
      query = query.lte('end_time', endDate)
    }

    const { data: shifts, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: shifts })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
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

    if (!MANAGER_ROLES.includes(profile.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions. Manager role or above required.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const parsed = createShiftSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    if (parsed.data.facility_id !== profile.facility_id) {
      return NextResponse.json(
        { error: 'Facility ID mismatch' },
        { status: 403 }
      )
    }

    const { data: shift, error } = await supabase
      .from('shifts')
      .insert({
        facility_id: parsed.data.facility_id,
        user_id: parsed.data.user_id,
        position_id: parsed.data.position_id,
        start_time: parsed.data.start_time,
        end_time: parsed.data.end_time,
        notes: parsed.data.notes,
        created_by: user.id,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: shift }, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
