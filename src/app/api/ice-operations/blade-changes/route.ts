import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createBladeChangeSchema } from '@/lib/validations/ice-operations'

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('facility_id')
      .eq('id', user.id)
      .single()

    if (profileError || !profile || !profile.facility_id) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    const { data, error } = await supabase
      .from('blade_changes')
      .select('*')
      .eq('facility_id', profile.facility_id)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ data })
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

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('facility_id')
      .eq('id', user.id)
      .single()

    if (profileError || !profile || !profile.facility_id) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const parsed = createBladeChangeSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    if (parsed.data.facility_id !== profile.facility_id) {
      return NextResponse.json(
        { error: 'Facility mismatch' },
        { status: 403 }
      )
    }

    const { blade_type: _bt, reason: _r, ...bladeChangeData } = parsed.data

    const { data, error } = await supabase
      .from('blade_changes')
      .insert({
        facility_id: bladeChangeData.facility_id,
        equipment_id: bladeChangeData.equipment_id,
        notes: bladeChangeData.notes ?? null,
        user_id: user.id,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
