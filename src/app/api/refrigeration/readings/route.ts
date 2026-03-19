import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createReadingSchema, getReadingsQuerySchema } from '@/lib/validations/refrigeration'

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
    const queryParsed = getReadingsQuerySchema.safeParse({
      equipment_id: searchParams.get('equipment_id') || undefined,
      start_date: searchParams.get('start_date') || undefined,
      end_date: searchParams.get('end_date') || undefined,
    })
    if (!queryParsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: queryParsed.error.flatten() },
        { status: 400 }
      )
    }

    const { equipment_id, start_date, end_date } = queryParsed.data

    let query = supabase
      .from('refrigeration_logs')
      .select(`
        *,
        readings:refrigeration_readings(
          *,
          reading_type:refrigeration_reading_types(*)
        ),
        equipment:refrigeration_equipment(name, equipment_type)
      `)
      .eq('facility_id', profile.facility_id)
      .order('recorded_at', { ascending: false })

    if (equipment_id) {
      query = query.eq('equipment_id', equipment_id)
    }
    if (start_date) {
      query = query.gte('recorded_at', start_date)
    }
    if (end_date) {
      query = query.lte('recorded_at', end_date)
    }

    const { data: logs, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: logs })
  } catch {
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
    const parsed = createReadingSchema.safeParse(body)
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

    const now = new Date().toISOString()

    // Create the log entry
    const { data: log, error: logError } = await supabase
      .from('refrigeration_logs')
      .insert({
        equipment_id: parsed.data.equipment_id,
        facility_id: parsed.data.facility_id,
        notes: parsed.data.notes || null,
        recorded_by: user.id,
        recorded_at: now,
      })
      .select()
      .single()

    if (logError) {
      return NextResponse.json({ error: logError.message }, { status: 500 })
    }

    // Create individual reading entries
    const readingRows = parsed.data.readings.map((r) => ({
      log_id: log.id,
      reading_type_id: r.reading_type_id,
      value: r.value,
    }))

    const { data: readings, error: readingsError } = await supabase
      .from('refrigeration_readings')
      .insert(readingRows)
      .select(`
        *,
        reading_type:refrigeration_reading_types(name, unit, min_value, max_value)
      `)

    if (readingsError) {
      return NextResponse.json({ error: readingsError.message }, { status: 500 })
    }

    // Check for out-of-threshold readings
    const alerts: Array<{
      reading_type_id: string
      reading_type_name: string
      value: number
      min_value: number | null
      max_value: number | null
      status: 'low' | 'high'
    }> = []

    for (const reading of readings) {
      const rt = reading.reading_type as unknown as { name: string; unit: string; min_value: number | null; max_value: number | null } | null
      if (!rt) continue

      if (rt.min_value !== null && reading.value < rt.min_value) {
        alerts.push({
          reading_type_id: reading.reading_type_id,
          reading_type_name: rt.name,
          value: reading.value,
          min_value: rt.min_value,
          max_value: rt.max_value,
          status: 'low',
        })
      } else if (rt.max_value !== null && reading.value > rt.max_value) {
        alerts.push({
          reading_type_id: reading.reading_type_id,
          reading_type_name: rt.name,
          value: reading.value,
          min_value: rt.min_value,
          max_value: rt.max_value,
          status: 'high',
        })
      }
    }

    return NextResponse.json(
      {
        data: { ...log, readings },
        alerts: alerts.length > 0 ? alerts : null,
      },
      { status: 201 }
    )
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
