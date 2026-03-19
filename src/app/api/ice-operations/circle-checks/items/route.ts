import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const supabase = createServerSupabaseClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('facility_id')
      .eq('id', user.id)
      .single()

    if (profileError || !profile || !profile.facility_id) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    const { searchParams } = new URL(request.url)
    const equipmentId = searchParams.get('equipment_id')

    if (!equipmentId) {
      return NextResponse.json(
        { error: 'equipment_id query parameter is required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('circle_check_items')
      .select('*')
      .eq('equipment_id', equipmentId)
      .order('sort_order', { ascending: true })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ data })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
