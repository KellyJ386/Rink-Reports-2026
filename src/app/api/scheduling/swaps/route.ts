import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createSwapRequestSchema } from '@/lib/validations/scheduling'

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('facility_id, role')
      .eq('id', user.id)
      .single()
    if (!profile?.facility_id) {
      return NextResponse.json({ error: 'No facility found' }, { status: 400 })
    }

    let query = supabase
      .from('swap_requests')
      .select('*')
      .eq('facility_id', profile.facility_id)
      .order('created_at', { ascending: false })

    // Non-managers only see swaps they are involved in
    const managerRoles = ['super_admin', 'facility_admin', 'manager']
    if (!managerRoles.includes(profile.role)) {
      query = query.or(`requested_by.eq.${user.id},requested_to.eq.${user.id}`)
    }

    const { data: swaps, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: swaps })
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
    const parsed = createSwapRequestSchema.safeParse(body)
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

    // Verify the shift exists and belongs to the requesting user's facility
    const { data: shift, error: shiftError } = await supabase
      .from('shifts')
      .select('id, facility_id')
      .eq('id', parsed.data.shift_id)
      .eq('facility_id', profile.facility_id)
      .single()

    if (shiftError || !shift) {
      return NextResponse.json(
        { error: 'Shift not found or does not belong to this facility' },
        { status: 404 }
      )
    }

    const { data: swap, error } = await supabase
      .from('swap_requests')
      .insert({
        facility_id: parsed.data.facility_id,
        shift_id: parsed.data.shift_id,
        requested_by: parsed.data.requested_by,
        requested_to: parsed.data.requested_to,
        reason: parsed.data.reason,
        status: 'pending',
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: swap }, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
