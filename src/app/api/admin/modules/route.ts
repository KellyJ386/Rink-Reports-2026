import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database'

const updateModuleSchema = z.object({
  module_id: z.string().uuid(),
  is_enabled: z.boolean().optional(),
  role_access: z.array(
    z.enum(['facility_admin', 'manager', 'supervisor', 'staff', 'read_only'] as const)
  ).optional(),
  settings: z.record(z.unknown()).optional(),
})

const updateModulesSchema = z.union([
  updateModuleSchema,
  z.array(updateModuleSchema),
])

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

    if (!profile || !['facility_admin', 'super_admin'].includes(profile.role) || !profile.facility_id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data: moduleSettings, error } = await supabase
      .from('module_settings')
      .select('*')
      .eq('facility_id', profile.facility_id)
      .order('module', { ascending: true })

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch module settings' }, { status: 500 })
    }

    return NextResponse.json(moduleSettings)
  } catch (error) {
    console.error('GET /api/admin/modules error:', error)
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
    const parsed = updateModulesSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const updates = Array.isArray(parsed.data) ? parsed.data : [parsed.data]
    const results = []

    for (const update of updates) {
      const { module_id, ...fields } = update

      const updatePayload: Database['public']['Tables']['module_settings']['Update'] = {}

      if (fields.is_enabled !== undefined) {
        updatePayload.enabled = fields.is_enabled
      }

      if (fields.role_access !== undefined) {
        updatePayload.role_access = fields.role_access
      }

      const { data, error } = await supabase
        .from('module_settings')
        .update(updatePayload)
        .eq('id', module_id)
        .eq('facility_id', profile.facility_id)
        .select()
        .single()

      if (error) {
        return NextResponse.json(
          { error: `Failed to update module ${module_id}` },
          { status: 500 }
        )
      }

      results.push(data)
    }

    return NextResponse.json(results.length === 1 ? results[0] : results)
  } catch (error) {
    console.error('PUT /api/admin/modules error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
