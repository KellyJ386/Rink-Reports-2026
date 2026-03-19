import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database'

const notificationRuleSchema = z.object({
  id: z.string().uuid().optional(),
  event_type: z.string().min(1).max(100),
  channel: z.string().min(1).max(50),
  recipients: z.array(z.string().uuid()).optional(),
  recipient_roles: z.array(z.string()).optional(),
  is_enabled: z.boolean().optional(),
  settings: z.record(z.unknown()).optional(),
})

const updateNotificationsSchema = z.union([
  notificationRuleSchema,
  z.array(notificationRuleSchema),
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

    const { data: notifications, error } = await supabase
      .from('notification_settings')
      .select('*')
      .eq('facility_id', profile.facility_id)
      .order('event_type', { ascending: true })

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch notification settings' }, { status: 500 })
    }

    return NextResponse.json(notifications)
  } catch (error) {
    console.error('GET /api/admin/notifications error:', error)
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
    const parsed = updateNotificationsSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const updates = Array.isArray(parsed.data) ? parsed.data : [parsed.data]
    const results: Database['public']['Tables']['notification_settings']['Row'][] = []

    for (const update of updates) {
      const { id, ...fields } = update

      if (id) {
        // Update existing notification rule
        const updatePayload: Database['public']['Tables']['notification_settings']['Update'] = {
          event_type: fields.event_type,
          channel: fields.channel,
          facility_id: profile.facility_id,
          updated_at: new Date().toISOString(),
        }
        if (fields.recipients !== undefined) updatePayload.recipients = fields.recipients
        if (fields.recipient_roles !== undefined) updatePayload.recipient_roles = fields.recipient_roles
        if (fields.is_enabled !== undefined) updatePayload.is_enabled = fields.is_enabled

        const { data, error } = await supabase
          .from('notification_settings')
          .update(updatePayload)
          .eq('id', id)
          .eq('facility_id', profile.facility_id)
          .select()
          .single()

        if (error) {
          return NextResponse.json(
            { error: `Failed to update notification rule ${id}` },
            { status: 500 }
          )
        }

        results.push(data)
      } else {
        // Create new notification rule
        const insertPayload: Database['public']['Tables']['notification_settings']['Insert'] = {
          facility_id: profile.facility_id,
          event_type: fields.event_type,
          channel: fields.channel,
          is_enabled: fields.is_enabled ?? true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        if (fields.recipients !== undefined) insertPayload.recipients = fields.recipients
        if (fields.recipient_roles !== undefined) insertPayload.recipient_roles = fields.recipient_roles

        const { data, error } = await supabase
          .from('notification_settings')
          .insert(insertPayload)
          .select()
          .single()

        if (error) {
          return NextResponse.json(
            { error: 'Failed to create notification rule' },
            { status: 500 }
          )
        }

        results.push(data)
      }
    }

    return NextResponse.json(results.length === 1 ? results[0] : results)
  } catch (error) {
    console.error('PUT /api/admin/notifications error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
