import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

const DEFAULT_LOCATIONS = [
  { value: 'rink-surface', label: 'Rink Surface' },
  { value: 'stands', label: 'Stands/Seating' },
  { value: 'lobby', label: 'Lobby' },
  { value: 'locker-room', label: 'Locker Room' },
  { value: 'parking', label: 'Parking Lot' },
  { value: 'concessions', label: 'Concessions Area' },
  { value: 'pro-shop', label: 'Pro Shop' },
  { value: 'zamboni-room', label: 'Zamboni Room' },
  { value: 'mechanical-room', label: 'Mechanical Room' },
  { value: 'other', label: 'Other' },
]

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Return default locations — in a future iteration these could be
    // configurable per facility via an admin settings table.
    return NextResponse.json(DEFAULT_LOCATIONS)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
