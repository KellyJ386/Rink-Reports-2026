import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import {
  createCircleCheckSchema,
  createCircleCheckResponseSchema,
} from '@/lib/validations/ice-operations'
import { z } from 'zod'

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()

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

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('facility_id')
      .eq('id', user.id)
      .single()

    if (profileError || !profile || !profile.facility_id) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    const { data, error } = await supabase
      .from('circle_checks')
      .select('*, circle_check_responses(*)')
      .eq('facility_id', profile.facility_id)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ data })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

const createCircleCheckWithResponsesSchema = createCircleCheckSchema.extend({
  responses: z.array(createCircleCheckResponseSchema.omit({ circle_check_id: true })),
})

export async function POST(request: Request) {
  try {
    const supabase = createServerSupabaseClient()

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

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('facility_id')
      .eq('id', user.id)
      .single()

    if (profileError || !profile || !profile.facility_id) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const parsed = createCircleCheckWithResponsesSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    if (parsed.data.facility_id !== profile.facility_id) {
      return NextResponse.json(
        { error: 'Facility mismatch' },
        { status: 403 }
      )
    }

    const { responses, notes: _notes, ...circleCheckData } = parsed.data

    // Insert the circle check record
    const { data: circleCheck, error: checkError } = await supabase
      .from('circle_checks')
      .insert({
        facility_id: circleCheckData.facility_id,
        equipment_id: circleCheckData.equipment_id,
        user_id: user.id,
      })
      .select()
      .single()

    if (checkError) {
      return NextResponse.json(
        { error: checkError.message },
        { status: 500 }
      )
    }

    // Insert all responses linked to the circle check
    if (responses.length > 0) {
      const responseRows = responses.map((response) => ({
        ...response,
        circle_check_id: circleCheck.id,
      }))

      const { error: responsesError } = await supabase
        .from('circle_check_responses')
        .insert(responseRows)

      if (responsesError) {
        return NextResponse.json(
          { error: responsesError.message },
          { status: 500 }
        )
      }
    }

    // Fetch the complete circle check with responses
    const { data: fullCheck, error: fetchError } = await supabase
      .from('circle_checks')
      .select('*, circle_check_responses(*)')
      .eq('id', circleCheck.id)
      .single()

    if (fetchError) {
      return NextResponse.json(
        { error: fetchError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: fullCheck }, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
