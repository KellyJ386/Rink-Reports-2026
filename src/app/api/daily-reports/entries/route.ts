import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createChecklistEntrySchema } from '@/lib/validations/daily-reports'

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
    const date = searchParams.get('date')
    const tabId = searchParams.get('tab_id')

    if (!date) {
      return NextResponse.json(
        { error: 'date query parameter is required (YYYY-MM-DD)' },
        { status: 400 }
      )
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(date)) {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 }
      )
    }

    let query = supabase
      .from('checklist_entries')
      .select('*, checklist_items(*)')
      .eq('facility_id', profile.facility_id)
      .eq('date', date)

    if (tabId) {
      query = query.eq('checklist_items.tab_id', tabId)
    }

    const { data: entries, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: entries })
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
    const parsed = createChecklistEntrySchema.safeParse(body)
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

    const today = new Date().toISOString().split('T')[0]

    const { data: entry, error } = await supabase
      .from('checklist_entries')
      .upsert(
        {
          checklist_item_id: parsed.data.item_id,
          facility_id: parsed.data.facility_id,
          checked: parsed.data.checked,
          notes: parsed.data.notes ?? null,
          user_id: user.id,
          checked_at: new Date().toISOString(),
          date: today,
        },
        {
          onConflict: 'checklist_item_id,date',
        }
      )
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: entry }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
