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

    const { data: templates, error } = await supabase
      .from('ice_depth_templates')
      .select('id, name')
      .eq('facility_id', profile.facility_id)
      .order('name', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const rinks = (templates ?? []).map((t) => ({
      value: t.id,
      label: t.name,
    }))

    return NextResponse.json(rinks)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
