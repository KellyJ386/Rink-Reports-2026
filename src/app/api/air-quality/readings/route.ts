import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createReadingSchema } from '@/lib/validations/air-quality'

export async function GET(request: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('facility_id').eq('id', user.id).single()
  if (!profile?.facility_id) return NextResponse.json({ error: 'No facility found' }, { status: 400 })

  const { searchParams } = new URL(request.url)
  const startDate = searchParams.get('start_date')
  const endDate = searchParams.get('end_date')

  let query = supabase
    .from('air_quality_readings')
    .select('*')
    .eq('facility_id', profile.facility_id)
    .order('created_at', { ascending: false })

  if (startDate) {
    query = query.gte('created_at', startDate)
  }
  if (endDate) {
    query = query.lte('created_at', endDate)
  }

  const { data: readings, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ readings })
}

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('facility_id').eq('id', user.id).single()
  if (!profile?.facility_id) return NextResponse.json({ error: 'No facility found' }, { status: 400 })

  const body = await request.json()
  const parsed = createReadingSchema.safeParse({ ...body, facility_id: profile.facility_id })
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
  }

  const { values, ...readingData } = parsed.data

  const { data: reading, error: readingError } = await supabase
    .from('air_quality_readings')
    .insert({
      facility_id: readingData.facility_id,
      user_id: user.id,
      location: readingData.notes ?? '',
      notes: readingData.notes ?? null,
    })
    .select()
    .single()

  if (readingError) return NextResponse.json({ error: readingError.message }, { status: 500 })

  const readingValues = values.map((v) => ({
    reading_id: reading.id,
    metric_id: v.metric_id,
    value: v.value,
  }))

  const { error: valuesError } = await supabase
    .from('air_quality_reading_values')
    .insert(readingValues)

  if (valuesError) return NextResponse.json({ error: valuesError.message }, { status: 500 })

  return NextResponse.json({ reading }, { status: 201 })
}
