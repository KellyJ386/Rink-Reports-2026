import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

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
    const equipmentId = searchParams.get('equipment_id')

    let query = supabase
      .from('circle_check_items')
      .select('id, text, sort_order')
      .eq('facility_id', profile.facility_id)
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (equipmentId) {
      query = query.eq('equipment_id', equipmentId)
    }

    const { data: items, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(items ?? [])
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
