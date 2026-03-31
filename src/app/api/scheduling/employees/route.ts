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

    const { data: employees, error } = await supabase
      .from('profiles')
      .select('id, full_name, role, position')
      .eq('facility_id', profile.facility_id)
      .eq('is_active', true)
      .order('full_name', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const result = (employees ?? []).map((e) => ({
      value: e.id,
      label: e.full_name,
    }))

    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
