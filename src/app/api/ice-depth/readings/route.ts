import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createReadingSchema } from '@/lib/validations/ice-depth'

export async function GET(request: Request) {
  const supabase = createServerSupabaseClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('facility_id').eq('id', user.id).single()
  if (!profile?.facility_id) return NextResponse.json({ error: 'No facility found' }, { status: 400 })

  const { searchParams } = new URL(request.url)
  const templateId = searchParams.get('template_id')
  const startDate = searchParams.get('start_date')
  const endDate = searchParams.get('end_date')

  if (!templateId) {
    return NextResponse.json({ error: 'template_id query parameter is required' }, { status: 400 })
  }

  let query = supabase
    .from('ice_depth_readings')
    .select('*')
    .eq('template_id', templateId)
    .eq('facility_id', profile.facility_id)
    .order('recorded_at', { ascending: false })

  if (startDate) {
    query = query.gte('recorded_at', startDate)
  }
  if (endDate) {
    query = query.lte('recorded_at', endDate)
  }

  const { data: readings, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ readings })
}

export async function POST(request: Request) {
  const supabase = createServerSupabaseClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('facility_id').eq('id', user.id).single()
  if (!profile?.facility_id) return NextResponse.json({ error: 'No facility found' }, { status: 400 })

  const body = await request.json()
  const parsed = createReadingSchema.safeParse({ ...body, facility_id: profile.facility_id })
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
  }

  const { data: reading, error } = await supabase
    .from('ice_depth_readings')
    .insert({
      ...parsed.data,
      recorded_by: user.id,
      recorded_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ reading }, { status: 201 })
}
