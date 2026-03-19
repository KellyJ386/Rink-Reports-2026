import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { UserRole } from '@/types/database'

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  first_name: z.string().min(1).max(100),
  last_name: z.string().min(1).max(100),
  role: z.enum(['facility_admin', 'manager', 'supervisor', 'staff', 'read_only'] as const),
  position: z.string().max(100).optional(),
  certifications: z.array(z.string()).optional(),
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

    if (!profile || !['facility_admin', 'super_admin'].includes(profile.role) || !profile.facility_id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data: users, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('facility_id', profile.facility_id)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
    }

    return NextResponse.json(users)
  } catch (error) {
    console.error('GET /api/admin/users error:', error)
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
    const parsed = createUserSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { email, password, first_name, last_name, role, position, certifications } = parsed.data

    // Prevent non-super_admin from creating facility_admin users
    if (role === 'facility_admin' && profile.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Only super admins can create facility admin accounts' },
        { status: 403 }
      )
    }

    const adminClient = createAdminClient()

    // Create the auth user via admin API (bypasses RLS)
    const { data: newAuthUser, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (createError) {
      return NextResponse.json(
        { error: `Failed to create auth user: ${createError.message}` },
        { status: 400 }
      )
    }

    // Create the profile record
    const { data: newProfile, error: profileError } = await adminClient
      .from('profiles')
      .insert({
        id: newAuthUser.user.id,
        facility_id: profile.facility_id,
        email,
        full_name: `${first_name} ${last_name}`.trim(),
        role: role as UserRole,
        position: position ?? null,
        certifications: certifications ?? [],
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (profileError) {
      // Attempt to clean up the auth user if profile creation fails
      await adminClient.auth.admin.deleteUser(newAuthUser.user.id)
      return NextResponse.json(
        { error: 'Failed to create user profile' },
        { status: 500 }
      )
    }

    return NextResponse.json(newProfile, { status: 201 })
  } catch (error) {
    console.error('POST /api/admin/users error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
