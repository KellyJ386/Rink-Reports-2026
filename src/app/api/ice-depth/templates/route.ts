import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createTemplateSchema } from '@/lib/validations/ice-depth'

export async function GET() {
  const supabase = createServerSupabaseClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('facility_id').eq('id', user.id).single()
  if (!profile?.facility_id) return NextResponse.json({ error: 'No facility found' }, { status: 400 })

  const { data: templates, error } = await supabase
    .from('ice_depth_templates')
    .select('*')
    .eq('facility_id', profile.facility_id)
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ templates })
}

export async function POST(request: Request) {
  const supabase = createServerSupabaseClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('facility_id').eq('id', user.id).single()
  if (!profile?.facility_id) return NextResponse.json({ error: 'No facility found' }, { status: 400 })

  const body = await request.json()
  const parsed = createTemplateSchema.safeParse({ ...body, facility_id: profile.facility_id })
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
  }

  // Enforce max 8 templates per facility
  const { count, error: countError } = await supabase
    .from('ice_depth_templates')
    .select('*', { count: 'exact', head: true })
    .eq('facility_id', profile.facility_id)

  if (countError) return NextResponse.json({ error: countError.message }, { status: 500 })
  if (count !== null && count >= 8) {
    return NextResponse.json({ error: 'Maximum of 8 templates per facility reached' }, { status: 409 })
  }

  const { data: template, error } = await supabase
    .from('ice_depth_templates')
    .insert({
      ...parsed.data,
      created_by: user.id,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ template }, { status: 201 })
}
