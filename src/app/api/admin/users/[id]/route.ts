import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Database } from '@/types/database'

const updateUserSchema = z.object({
  role: z.enum(['facility_admin', 'manager', 'supervisor', 'staff', 'read_only'] as const).optional(),
  is_active: z.boolean().optional(),
  position: z.string().max(100).optional(),
  certifications: z.array(z.string()).optional(),
  first_name: z.string().min(1).max(100).optional(),
  last_name: z.string().min(1).max(100).optional(),
  reset_password: z.boolean().optional(),
  new_password: z.string().min(8).max(128).optional(),
})

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: targetUserId } = await params
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

    // Verify target user belongs to the same facility
    const { data: targetProfile } = await supabase
      .from('profiles')
      .select('id, facility_id, role')
      .eq('id', targetUserId)
      .eq('facility_id', profile.facility_id)
      .single()

    if (!targetProfile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Prevent modifying super_admin accounts unless you are a super_admin
    if (targetProfile.role === 'super_admin' && profile.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Cannot modify super admin accounts' },
        { status: 403 }
      )
    }

    // Prevent self-deactivation
    if (targetUserId === user.id) {
      return NextResponse.json(
        { error: 'Cannot modify your own account via this endpoint' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const parsed = updateUserSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { reset_password, new_password, first_name, last_name, ...profileUpdates } = parsed.data

    // Handle password reset via admin client
    if (reset_password || new_password) {
      const adminClient = createAdminClient()

      if (new_password) {
        const { error: passwordError } = await adminClient.auth.admin.updateUserById(
          targetUserId,
          { password: new_password }
        )

        if (passwordError) {
          return NextResponse.json(
            { error: `Failed to reset password: ${passwordError.message}` },
            { status: 500 }
          )
        }
      }
    }

    // Build profile update payload
    const updatePayload: Database['public']['Tables']['profiles']['Update'] = {
      updated_at: new Date().toISOString(),
    }

    if (profileUpdates.role) {
      updatePayload.role = profileUpdates.role
    }
    if (profileUpdates.position !== undefined) {
      updatePayload.position = profileUpdates.position
    }
    if (profileUpdates.certifications !== undefined) {
      updatePayload.certifications = profileUpdates.certifications
    }
    if (profileUpdates.is_active !== undefined) {
      updatePayload.is_active = profileUpdates.is_active
    }
    if (first_name !== undefined || last_name !== undefined) {
      // Map first_name/last_name to full_name
      const parts = [first_name, last_name].filter(Boolean)
      if (parts.length > 0) {
        updatePayload.full_name = parts.join(' ')
      }
    }

    // Update profile if there are profile fields to update
    const hasProfileUpdates = Object.keys(profileUpdates).length > 0 || first_name !== undefined || last_name !== undefined
    if (hasProfileUpdates) {
      const { data: updatedProfile, error: updateError } = await supabase
        .from('profiles')
        .update(updatePayload)
        .eq('id', targetUserId)
        .eq('facility_id', profile.facility_id)
        .select()
        .single()

      if (updateError) {
        return NextResponse.json(
          { error: 'Failed to update user profile' },
          { status: 500 }
        )
      }

      return NextResponse.json(updatedProfile)
    }

    // If only password was reset, return success
    return NextResponse.json({ message: 'User updated successfully' })
  } catch (error) {
    console.error('PUT /api/admin/users/[id] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
