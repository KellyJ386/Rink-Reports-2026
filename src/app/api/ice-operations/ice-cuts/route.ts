import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createIceCutSchema } from '@/lib/validations/ice-operations'

export async function GET(request: Request) {
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

    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')

    let query = supabase
      .from('ice_cuts')
      .select('*')
      .eq('facility_id', profile.facility_id)
      .order('created_at', { ascending: false })

    if (date) {
      query = query
        .gte('created_at', `${date}T00:00:00`)
        .lte('created_at', `${date}T23:59:59`)
    }

    const { data, error } = await query

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
    const parsed = createIceCutSchema.safeParse(body)

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

    const { data, error } = await supabase
      .from('ice_cuts')
      .insert({
        ...parsed.data,
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
