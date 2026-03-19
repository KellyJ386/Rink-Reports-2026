import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createTemplateSchema } from '@/lib/validations/ice-depth'

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createServerSupabaseClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('facility_id').eq('id', user.id).single()
  if (!profile?.facility_id) return NextResponse.json({ error: 'No facility found' }, { status: 400 })

  const { data: template, error } = await supabase
    .from('ice_depth_templates')
    .select(`
      *,
      ice_depth_points (*)
    `)
    .eq('id', params.id)
    .eq('facility_id', profile.facility_id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 404 })

  return NextResponse.json({ template })
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createServerSupabaseClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('facility_id').eq('id', user.id).single()
  if (!profile?.facility_id) return NextResponse.json({ error: 'No facility found' }, { status: 400 })

  const body = await request.json()
  const updateSchema = createTemplateSchema.partial().omit({ facility_id: true })
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
  }

  const { data: template, error } = await supabase
    .from('ice_depth_templates')
    .update({
      ...parsed.data,
      updated_at: new Date().toISOString(),
    })
    .eq('id', params.id)
    .eq('facility_id', profile.facility_id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ template })
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createServerSupabaseClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('facility_id').eq('id', user.id).single()
  if (!profile?.facility_id) return NextResponse.json({ error: 'No facility found' }, { status: 400 })

  // Delete associated points first
  await supabase
    .from('ice_depth_points')
    .delete()
    .eq('template_id', params.id)

  const { error } = await supabase
    .from('ice_depth_templates')
    .delete()
    .eq('id', params.id)
    .eq('facility_id', profile.facility_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
