import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerSupabaseClient } from '@/lib/supabase/server'

const generateReportSchema = z.object({
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  format: z.enum(['pdf', 'csv', 'xlsx']),
  location: z.string().nullable().optional(),
  jurisdiction_id: z.string().uuid().nullable().optional(),
})

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
    const parsed = generateReportSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { start_date, end_date, format, location } = parsed.data

    // Fetch readings in date range
    let query = supabase
      .from('air_quality_readings')
      .select(`
        id,
        location,
        notes,
        created_at,
        air_quality_reading_values (
          value,
          out_of_range,
          metric_id,
          air_quality_metrics (
            name,
            unit,
            max_threshold
          )
        )
      `)
      .eq('facility_id', profile.facility_id)
      .gte('created_at', start_date)
      .lte('created_at', end_date + 'T23:59:59')
      .order('created_at', { ascending: false })

    if (location) {
      query = query.eq('location', location)
    }

    const { data: readings, error } = await query
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // For CSV format, return as downloadable text
    if (format === 'csv') {
      const rows: string[] = ['Date,Location,Metric,Value,Unit,Out of Range']
      for (const reading of readings ?? []) {
        const values = (reading as Record<string, unknown>).air_quality_reading_values as Array<{
          value: number
          out_of_range: boolean
          air_quality_metrics: { name: string; unit: string } | null
        }>
        for (const val of values ?? []) {
          rows.push([
            reading.created_at,
            reading.location,
            val.air_quality_metrics?.name ?? '',
            val.value,
            val.air_quality_metrics?.unit ?? '',
            val.out_of_range ? 'YES' : 'NO',
          ].join(','))
        }
      }

      return new NextResponse(rows.join('\n'), {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="air-quality-report.csv"`,
        },
      })
    }

    // For PDF and XLSX, return structured JSON data for client-side generation
    return NextResponse.json({
      format,
      facility_id: profile.facility_id,
      start_date,
      end_date,
      location: location ?? 'All Locations',
      generated_at: new Date().toISOString(),
      record_count: readings?.length ?? 0,
      data: readings ?? [],
    })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
