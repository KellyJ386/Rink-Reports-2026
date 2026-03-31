import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { syncSignupToHubSpot } from '@/lib/hubspot'

const onboardingFacilitySchema = z.object({
  facility_name: z.string().min(1, 'Facility name is required').max(255),
  address: z.string().max(500).optional().default(''),
  city: z.string().max(100).optional().default(''),
  state: z.string().max(50).optional().default(''),
  zip: z.string().max(20).optional().default(''),
  phone: z.string().max(30).optional().default(''),
  admin_full_name: z.string().min(1, 'Admin name is required').max(200),
})

export async function POST(request: Request) {
  try {
    const supabase = createServerSupabaseClient()

    // Verify authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const parsed = onboardingFacilitySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { facility_name, address, city, state, zip, phone, admin_full_name } = parsed.data

    // Create facility record
    const { data: facility, error: facilityError } = await supabase
      .from('facilities')
      .insert({
        name: facility_name,
        address,
        city,
        state,
        zip,
        phone,
        subscription_status: 'pending',
      })
      .select('id')
      .single()

    if (facilityError) {
      return NextResponse.json(
        { error: facilityError.message },
        { status: 500 }
      )
    }

    // Create profile record with facility_admin role
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        facility_id: facility.id,
        full_name: admin_full_name,
        email: user.email ?? '',
        role: 'facility_admin',
        is_active: true,
      })

    if (profileError) {
      return NextResponse.json(
        { error: profileError.message },
        { status: 500 }
      )
    }

    // Sync to HubSpot (downstream only — fire and forget)
    syncSignupToHubSpot({
      facilityName: facility_name,
      address,
      city,
      state,
      zip,
      phone,
      adminEmail: user.email ?? '',
      adminName: admin_full_name,
    }).catch((err: unknown) => {
      console.error('[HubSpot] Signup sync failed:', err instanceof Error ? err.message : err)
    })

    return NextResponse.json({ facility_id: facility.id })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
