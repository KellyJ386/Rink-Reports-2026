import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerSupabaseClient } from '@/lib/supabase/server'

const createRinkSchema = z.object({
  name: z.string().min(1).max(100),
  length: z.number().int().min(50).max(300).default(200),
  width: z.number().int().min(30).max(150).default(85),
})

const updateRinksSchema = z.object({
  rinks: z.array(z.object({
    id: z.string().uuid(),
    name: z.string().min(1).max(100),
    length: z.number().int().min(50).max(300),
    width: z.number().int().min(30).max(150),
    thresholds: z.object({
      green_min: z.number().min(0).max(10),
      green_max: z.number().min(0).max(10),
      yellow_min: z.number().min(0).max(10),
      yellow_max: z.number().min(0).max(10),
      red_min: z.number().min(0).max(10),
      red_max: z.number().min(0).max(10),
    }).optional(),
  })),
})

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
    if (!profile || !['facility_admin', 'super_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    if (!profile.facility_id) {
      return NextResponse.json({ error: 'No facility found' }, { status: 400 })
    }

    const { data: templates, error } = await supabase
      .from('ice_depth_templates')
      .select('*')
      .eq('facility_id', profile.facility_id)
      .order('name', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(templates ?? [])
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
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
      .select('facility_id, role')
      .eq('id', user.id)
      .single()
    if (!profile || !['facility_admin', 'super_admin'].includes(profile.role) || !profile.facility_id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const parsed = createRinkSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { data: template, error } = await supabase
      .from('ice_depth_templates')
      .insert({
        facility_id: profile.facility_id,
        name: parsed.data.name,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(template, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
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
    if (!profile || !['facility_admin', 'super_admin'].includes(profile.role) || !profile.facility_id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const parsed = updateRinksSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    for (const rink of parsed.data.rinks) {
      const { error } = await supabase
        .from('ice_depth_templates')
        .update({ name: rink.name })
        .eq('id', rink.id)
        .eq('facility_id', profile.facility_id)

      if (error) {
        return NextResponse.json({ error: `Failed to update rink ${rink.name}: ${error.message}` }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
