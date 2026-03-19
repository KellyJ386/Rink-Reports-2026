import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAvailabilitySchema } from '@/lib/validations/scheduling'

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
    const userId = searchParams.get('user_id')

    const targetUserId = userId ?? user.id

    // Non-managers can only view their own availability
    const managerRoles = ['super_admin', 'facility_admin', 'manager']
    if (targetUserId !== user.id && !managerRoles.includes(profile.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions to view other users\' availability' },
        { status: 403 }
      )
    }

    const { data: availability, error } = await supabase
      .from('availability')
      .select('*')
      .eq('facility_id', profile.facility_id)
      .eq('user_id', targetUserId)
      .order('day_of_week', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: availability })
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
      .select('facility_id')
      .eq('id', user.id)
      .single()
    if (!profile?.facility_id) {
      return NextResponse.json({ error: 'No facility found' }, { status: 400 })
    }

    const body = await request.json()
    const parsed = createAvailabilitySchema.safeParse(body)
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

    // Upsert availability for the given day_of_week
    const { data: availability, error } = await supabase
      .from('availability')
      .upsert(
        {
          facility_id: parsed.data.facility_id,
          user_id: user.id,
          day_of_week: parsed.data.day_of_week,
          start_time: parsed.data.start_time,
          end_time: parsed.data.end_time,
          is_available: parsed.data.is_available,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'facility_id,user_id,day_of_week',
        }
      )
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: availability }, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
