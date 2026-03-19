import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { updateSwapStatusSchema } from '@/lib/validations/scheduling'

const MANAGER_ROLES = ['super_admin', 'facility_admin', 'manager']

export async function PUT(
  request: Request,
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
      .select('facility_id, role')
      .eq('id', user.id)
      .single()
    if (!profile?.facility_id) {
      return NextResponse.json({ error: 'No facility found' }, { status: 400 })
    }

    if (!MANAGER_ROLES.includes(profile.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions. Manager role or above required.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const parsed = updateSwapStatusSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    // Verify the swap request exists and belongs to this facility
    const { data: existingSwap, error: fetchError } = await supabase
      .from('swap_requests')
      .select('id, status, facility_id')
      .eq('id', params.id)
      .eq('facility_id', profile.facility_id)
      .single()

    if (fetchError || !existingSwap) {
      return NextResponse.json(
        { error: 'Swap request not found' },
        { status: 404 }
      )
    }

    if (existingSwap.status !== 'pending') {
      return NextResponse.json(
        { error: `Swap request has already been ${existingSwap.status}` },
        { status: 400 }
      )
    }

    const { data: swap, error } = await supabase
      .from('swap_requests')
      .update({
        status: parsed.data.status,
        reviewed_by: parsed.data.reviewed_by,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .eq('facility_id', profile.facility_id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: swap })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
