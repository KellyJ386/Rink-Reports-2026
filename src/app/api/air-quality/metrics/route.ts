import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createServerSupabaseClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('facility_id').eq('id', user.id).single()
  if (!profile?.facility_id) return NextResponse.json({ error: 'No facility found' }, { status: 400 })

  const { data: metrics, error } = await supabase
    .from('air_quality_metrics')
    .select(`
      id,
      name,
      unit,
      warning_low,
      warning_high,
      critical_low,
      critical_high
    `)
    .eq('facility_id', profile.facility_id)
    .order('name', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ metrics })
}
