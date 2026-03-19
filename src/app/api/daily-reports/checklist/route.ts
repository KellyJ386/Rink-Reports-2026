import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createChecklistItemSchema } from '@/lib/validations/daily-reports'

export async function GET(request: Request) {
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

    const { searchParams } = new URL(request.url)
    const tabId = searchParams.get('tab_id')
    const checklistType = searchParams.get('checklist_type')

    if (!tabId) {
      return NextResponse.json(
        { error: 'tab_id query parameter is required' },
        { status: 400 }
      )
    }

    let query = supabase
      .from('checklist_items')
      .select('*')
      .eq('tab_id', tabId)
      .eq('facility_id', profile.facility_id)
      .order('sort_order', { ascending: true })

    if (checklistType) {
      query = query.eq('checklist_type', checklistType)
    }

    const { data: items, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: items })
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
    const parsed = createChecklistItemSchema.safeParse(body)
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

    const { data: item, error } = await supabase
      .from('checklist_items')
      .insert({
        tab_id: parsed.data.tab_id,
        facility_id: parsed.data.facility_id,
        text: parsed.data.text,
        checklist_type: parsed.data.checklist_type,
        sort_order: parsed.data.sort_order,
        recurrence: parsed.data.recurrence,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: item }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
