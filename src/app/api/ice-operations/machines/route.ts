import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

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

    const { data: equipment, error } = await supabase
      .from('equipment')
      .select('id, name, type')
      .eq('facility_id', profile.facility_id)
      .eq('is_active', true)
      .order('name', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const machines = (equipment ?? []).map((e) => ({
      value: e.id,
      label: e.name,
    }))

    return NextResponse.json(machines)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
