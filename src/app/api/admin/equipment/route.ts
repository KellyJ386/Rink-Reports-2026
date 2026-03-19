import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database'

const readingTypeSchema = z.object({
  name: z.string().min(1).max(100),
  unit: z.string().min(1).max(50),
  low_threshold: z.number().optional(),
  high_threshold: z.number().optional(),
})

const createEquipmentSchema = z.object({
  name: z.string().min(1).max(255),
  equipment_type: z.string().min(1).max(100),
  group_name: z.string().max(100).optional(),
  model: z.string().max(255).optional(),
  serial_number: z.string().max(255).optional(),
  location: z.string().max(255).optional(),
  reading_types: z.array(readingTypeSchema).optional(),
  is_active: z.boolean().optional(),
})

const updateEquipmentSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255).optional(),
  equipment_type: z.string().min(1).max(100).optional(),
  group_name: z.string().max(100).optional(),
  model: z.string().max(255).optional(),
  serial_number: z.string().max(255).optional(),
  location: z.string().max(255).optional(),
  reading_types: z.array(readingTypeSchema).optional(),
  is_active: z.boolean().optional(),
})

export async function GET() {
  try {
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

    if (!profile || !['facility_admin', 'super_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (!profile.facility_id) {
      return NextResponse.json({ error: 'No facility found' }, { status: 400 })
    }

    const { data: equipment, error } = await supabase
      .from('equipment')
      .select('*')
      .eq('facility_id', profile.facility_id)
      .order('name', { ascending: true })

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch equipment' }, { status: 500 })
    }

    return NextResponse.json(equipment)
  } catch (error) {
    console.error('GET /api/admin/equipment error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
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

    if (!profile || !['facility_admin', 'super_admin'].includes(profile.role) || !profile.facility_id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const parsed = createEquipmentSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { data: equipment, error } = await supabase
      .from('equipment')
      .insert({
        facility_id: profile.facility_id,
        name: parsed.data.name,
        type: parsed.data.equipment_type as 'zamboni' | 'edger' | 'other',
        fuel_type: 'gas' as const,
        is_active: parsed.data.is_active ?? true,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: 'Failed to create equipment' }, { status: 500 })
    }

    return NextResponse.json(equipment, { status: 201 })
  } catch (error) {
    console.error('POST /api/admin/equipment error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
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

    if (!profile || !['facility_admin', 'super_admin'].includes(profile.role) || !profile.facility_id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const parsed = updateEquipmentSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { id, ...fields } = parsed.data

    const updatePayload: Partial<Database['public']['Tables']['equipment']['Update']> = {}
    if (fields.name !== undefined) updatePayload.name = fields.name
    if (fields.equipment_type !== undefined) updatePayload.type = fields.equipment_type as 'zamboni' | 'edger' | 'other'
    if (fields.is_active !== undefined) updatePayload.is_active = fields.is_active

    const { data: equipment, error } = await supabase
      .from('equipment')
      .update(updatePayload)
      .eq('id', id)
      .eq('facility_id', profile.facility_id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: 'Failed to update equipment' }, { status: 500 })
    }

    return NextResponse.json(equipment)
  } catch (error) {
    console.error('PUT /api/admin/equipment error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
