import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

const DEFAULT_LOCATIONS = [
  { value: 'ice-level', label: 'Ice Level' },
  { value: 'stands', label: 'Stands' },
  { value: 'lobby', label: 'Lobby' },
  { value: 'zamboni-room', label: 'Zamboni Room' },
  { value: 'mechanical-room', label: 'Mechanical Room' },
  { value: 'locker-room', label: 'Locker Room' },
]

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Return default monitoring locations — in a future iteration these
    // could be configurable per facility via admin settings.
    return NextResponse.json(DEFAULT_LOCATIONS)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
