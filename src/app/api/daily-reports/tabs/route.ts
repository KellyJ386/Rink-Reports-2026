import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createTabSchema } from '@/lib/validations/daily-reports'

const MAX_TABS_PER_FACILITY = 15

export async function GET() {
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

    const { data: tabs, error } = await supabase
      .from('daily_report_tabs')
      .select('*')
      .eq('facility_id', profile.facility_id)
      .order('sort_order', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: tabs })
  } catch (error) {
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
    const parsed = createTabSchema.safeParse(body)
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

    const { count, error: countError } = await supabase
      .from('daily_report_tabs')
      .select('*', { count: 'exact', head: true })
      .eq('facility_id', profile.facility_id)

    if (countError) {
      return NextResponse.json({ error: countError.message }, { status: 500 })
    }

    if (count !== null && count >= MAX_TABS_PER_FACILITY) {
      return NextResponse.json(
        { error: `Maximum of ${MAX_TABS_PER_FACILITY} tabs per facility reached` },
        { status: 400 }
      )
    }

    const { data: tab, error } = await supabase
      .from('daily_report_tabs')
      .insert({
        facility_id: parsed.data.facility_id,
        name: parsed.data.name,
        sort_order: parsed.data.sort_order,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: tab }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
