import { createAdminClient } from '@/lib/supabase/admin'

export async function createNotification(params: {
  userId: string
  facilityId: string
  type: string
  title: string
  message: string
  data?: Record<string, unknown>
}) {
  const supabase = createAdminClient()

  const { error } = await supabase.from('notifications').insert({
    user_id: params.userId,
    facility_id: params.facilityId,
    type: params.type,
    title: params.title,
    message: params.message,
    data: (params.data as Record<string, string>) ?? undefined,
    read: false,
  })

  if (error) {
    console.error('Failed to create notification:', error.message)
  }
}

export async function notifyFacilityAdmins(facilityId: string, type: string, title: string, message: string) {
  const supabase = createAdminClient()

  const { data: admins } = await supabase
    .from('profiles')
    .select('id')
    .eq('facility_id', facilityId)
    .in('role', ['facility_admin', 'super_admin'])
    .eq('is_active', true)

  if (!admins) return

  for (const admin of admins) {
    await createNotification({
      userId: admin.id,
      facilityId,
      type,
      title,
      message,
    })
  }
}
