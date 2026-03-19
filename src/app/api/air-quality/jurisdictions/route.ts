import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createServerSupabaseClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: jurisdictions, error } = await supabase
    .from('air_quality_jurisdictions')
    .select(`
      id,
      name,
      state_code,
      air_quality_jurisdiction_thresholds (
        metric_id,
        warning_min,
        warning_max,
        critical_min,
        critical_max,
        air_quality_metrics (
          name,
          unit
        )
      )
    `)
    .order('name', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ jurisdictions })
}
