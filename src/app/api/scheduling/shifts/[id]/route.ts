import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { updateShiftSchema } from '@/lib/validations/scheduling'

const MANAGER_ROLES = ['super_admin', 'facility_admin', 'manager']

export async function GET(
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
      .select('facility_id')
      .eq('id', user.id)
      .single()
    if (!profile?.facility_id) {
      return NextResponse.json({ error: 'No facility found' }, { status: 400 })
    }

    const { data: shift, error } = await supabase
      .from('shifts')
      .select('*')
      .eq('id', params.id)
      .eq('facility_id', profile.facility_id)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    if (!shift) {
      return NextResponse.json({ error: 'Shift not found' }, { status: 404 })
    }

    return NextResponse.json({ data: shift })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

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
    const parsed = updateShiftSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { data: shift, error } = await supabase
      .from('shifts')
      .update({
        ...parsed.data,
        updated_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .eq('facility_id', profile.facility_id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    if (!shift) {
      return NextResponse.json({ error: 'Shift not found' }, { status: 404 })
    }

    return NextResponse.json({ data: shift })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    const { error } = await supabase
      .from('shifts')
      .delete()
      .eq('id', params.id)
      .eq('facility_id', profile.facility_id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: 'Shift deleted' })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
