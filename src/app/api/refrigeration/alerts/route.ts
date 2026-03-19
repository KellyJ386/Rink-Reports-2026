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

    // Fetch recent readings with their reading type thresholds and log/equipment info
    const { data: readings, error } = await supabase
      .from('refrigeration_readings')
      .select(`
        *,
        reading_type:refrigeration_reading_types(
          name,
          unit,
          min_value,
          max_value,
          equipment_id
        ),
        log:refrigeration_logs(
          recorded_at,
          recorded_by,
          facility_id,
          equipment:refrigeration_equipment(name, equipment_type)
        )
      `)
      .order('id', { ascending: false })
      .limit(500)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Filter to only readings belonging to this facility that are out of threshold
    const alerts = (readings || [])
      .filter((reading) => {
        const log = reading.log as unknown as { recorded_at: string; recorded_by: string; facility_id: string; equipment: { name: string; equipment_type: string } | null } | null
        if (!log || log.facility_id !== profile.facility_id) return false

        const rt = reading.reading_type as unknown as { name: string; unit: string; min_value: number | null; max_value: number | null; equipment_id: string } | null
        if (!rt) return false

        const belowMin = rt.min_value !== null && reading.value < rt.min_value
        const aboveMax = rt.max_value !== null && reading.value > rt.max_value
        return belowMin || aboveMax
      })
      .map((reading) => {
        const rt = reading.reading_type as unknown as { name: string; unit: string; min_value: number | null; max_value: number | null; equipment_id: string }
        const log = reading.log as unknown as { recorded_at: string; recorded_by: string; facility_id: string; equipment: { name: string; equipment_type: string } | null }
        const belowMin = rt.min_value !== null && reading.value < rt.min_value

        return {
          reading_id: reading.id,
          log_id: reading.log_id,
          reading_type_id: reading.reading_type_id,
          reading_type_name: rt.name,
          unit: rt.unit,
          value: reading.value,
          min_value: rt.min_value,
          max_value: rt.max_value,
          status: belowMin ? 'low' : 'high',
          recorded_at: log.recorded_at,
          recorded_by: log.recorded_by,
          equipment_name: log.equipment?.name ?? null,
          equipment_type: log.equipment?.equipment_type ?? null,
        }
      })

    return NextResponse.json({ data: alerts })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
