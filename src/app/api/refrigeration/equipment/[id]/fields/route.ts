import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
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

    // Verify this equipment belongs to the user's facility
    const { data: equipment, error: equipError } = await supabase
      .from('refrigeration_equipment')
      .select('id')
      .eq('id', params.id)
      .eq('facility_id', profile.facility_id)
      .single()

    if (equipError || !equipment) {
      return NextResponse.json({ error: 'Equipment not found' }, { status: 404 })
    }

    const { data: readingTypes, error } = await supabase
      .from('refrigeration_reading_types')
      .select('id, name, unit, min_threshold, max_threshold, min_value, max_value')
      .eq('equipment_id', params.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const fields = (readingTypes ?? []).map((rt) => ({
      id: rt.id,
      label: rt.name,
      unit: rt.unit,
      min: rt.min_threshold,
      max: rt.max_threshold,
    }))

    return NextResponse.json(fields)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
