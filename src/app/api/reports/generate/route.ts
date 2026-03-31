import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerSupabaseClient } from '@/lib/supabase/server'

const generateReportSchema = z.object({
  module: z.enum([
    'daily-reports',
    'ice-depth',
    'ice-operations',
    'incidents',
    'refrigeration',
    'air-quality',
    'scheduling',
  ]),
  type: z.enum(['pdf', 'excel', 'csv']),
  filters: z.object({
    start_date: z.string().optional(),
    end_date: z.string().optional(),
  }).passthrough().optional(),
})

const MODULE_TABLES: Record<string, string> = {
  'daily-reports': 'daily_reports',
  'ice-depth': 'ice_depth_readings',
  'ice-operations': 'ice_operations',
  'incidents': 'incidents',
  'refrigeration': 'refrigeration_logs',
  'air-quality': 'air_quality_readings',
  'scheduling': 'shifts',
}

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('facility_id, role')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  }

  const body = await request.json()
  const parsed = generateReportSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const { module, type, filters } = parsed.data

  const tableName = MODULE_TABLES[module]
  if (!tableName) {
    return NextResponse.json({ error: `Unknown module: ${module}` }, { status: 400 })
  }

  let query = supabase
    .from(tableName)
    .select('*')
    .eq('facility_id', profile.facility_id!)
    .order('created_at', { ascending: false })

  if (filters?.start_date) {
    query = query.gte('created_at', filters.start_date)
  }
  if (filters?.end_date) {
    query = query.lte('created_at', filters.end_date)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    module,
    type,
    facility_id: profile.facility_id,
    generated_at: new Date().toISOString(),
    record_count: data?.length ?? 0,
    data: data ?? [],
  })
}
