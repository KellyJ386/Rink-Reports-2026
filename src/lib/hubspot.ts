import { createAdminClient } from '@/lib/supabase/admin'

// ─── Types ──────────────────────────────────────────────────────────────────

interface HubSpotContact {
  email: string
  firstname: string
  lastname?: string
  company?: string
}

interface HubSpotCompany {
  name: string
  domain?: string
  address?: string
  city?: string
  state?: string
  zip?: string
  phone?: string
}

// ─── API Client ─────────────────────────────────────────────────────────────

const HUBSPOT_BASE_URL = 'https://api.hubapi.com'

async function hubspotFetch<T>(
  path: string,
  options: { method?: string; body?: Record<string, unknown> } = {}
): Promise<T | null> {
  const apiKey = process.env.HUBSPOT_API_KEY
  if (!apiKey) {
    console.warn('[HubSpot] HUBSPOT_API_KEY not set — skipping CRM sync')
    return null
  }

  try {
    const res = await fetch(`${HUBSPOT_BASE_URL}${path}`, {
      method: options.method ?? 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    })

    if (!res.ok) {
      const text = await res.text()
      console.error(`[HubSpot] ${options.method ?? 'GET'} ${path} failed (${res.status}):`, text)
      return null
    }

    return (await res.json()) as T
  } catch (err) {
    console.error('[HubSpot] Network error:', err instanceof Error ? err.message : err)
    return null
  }
}

// ─── Company ────────────────────────────────────────────────────────────────

export async function createHubSpotCompany(company: HubSpotCompany): Promise<string | null> {
  const result = await hubspotFetch<{ id: string }>('/crm/v3/objects/companies', {
    method: 'POST',
    body: {
      properties: {
        name: company.name,
        domain: company.domain ?? '',
        address: company.address ?? '',
        city: company.city ?? '',
        state: company.state ?? '',
        zip: company.zip ?? '',
        phone: company.phone ?? '',
        type: 'ICE_FACILITY',
      },
    },
  })

  return result?.id ?? null
}

// ─── Contact ────────────────────────────────────────────────────────────────

export async function createHubSpotContact(
  contact: HubSpotContact,
  companyId?: string
): Promise<string | null> {
  const result = await hubspotFetch<{ id: string }>('/crm/v3/objects/contacts', {
    method: 'POST',
    body: {
      properties: {
        email: contact.email,
        firstname: contact.firstname,
        lastname: contact.lastname ?? '',
        company: contact.company ?? '',
        lifecyclestage: 'customer',
      },
      ...(companyId
        ? {
            associations: [
              {
                to: { id: companyId },
                types: [
                  {
                    associationCategory: 'HUBSPOT_DEFINED',
                    associationTypeId: 1, // contact-to-company
                  },
                ],
              },
            ],
          }
        : {}),
    },
  })

  return result?.id ?? null
}

// ─── Tag Contact ────────────────────────────────────────────────────────────

export async function tagHubSpotContact(
  contactEmail: string,
  tag: string
): Promise<void> {
  // Search for contact by email
  const search = await hubspotFetch<{ results: { id: string }[] }>(
    '/crm/v3/objects/contacts/search',
    {
      method: 'POST',
      body: {
        filterGroups: [
          {
            filters: [
              { propertyName: 'email', operator: 'EQ', value: contactEmail },
            ],
          },
        ],
      },
    }
  )

  const contactId = search?.results?.[0]?.id
  if (!contactId) {
    console.warn(`[HubSpot] Contact not found for email: ${contactEmail}`)
    return
  }

  await hubspotFetch(`/crm/v3/objects/contacts/${contactId}`, {
    method: 'PATCH',
    body: {
      properties: {
        hs_lead_status: tag,
      },
    },
  })
}

// ─── On Signup ──────────────────────────────────────────────────────────────
// Called from the onboarding facility creation webhook or API route.

export async function syncSignupToHubSpot(params: {
  facilityName: string
  address?: string
  city?: string
  state?: string
  zip?: string
  phone?: string
  adminEmail: string
  adminName: string
}): Promise<void> {
  // 1. Create company
  const companyId = await createHubSpotCompany({
    name: params.facilityName,
    address: params.address,
    city: params.city,
    state: params.state,
    zip: params.zip,
    phone: params.phone,
  })

  // 2. Create contact associated with company
  const nameParts = params.adminName.split(' ')
  await createHubSpotContact(
    {
      email: params.adminEmail,
      firstname: nameParts[0] ?? params.adminName,
      lastname: nameParts.slice(1).join(' ') || undefined,
      company: params.facilityName,
    },
    companyId ?? undefined
  )
}

// ─── Inactivity Check ──────────────────────────────────────────────────────
// Designed to be called from a scheduled CRON API route.

export async function tagInactiveContacts(inactiveDays: number = 30): Promise<number> {
  const supabase = createAdminClient()

  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - inactiveDays)

  // Find facility admins who haven't had activity since cutoff
  const { data: inactiveProfiles } = await supabase
    .from('profiles')
    .select('email, full_name')
    .eq('is_active', true)
    .in('role', ['facility_admin'])
    .lt('last_active_at', cutoff.toISOString())

  if (!inactiveProfiles || inactiveProfiles.length === 0) {
    return 0
  }

  let tagged = 0
  for (const profile of inactiveProfiles) {
    if (profile.email) {
      await tagHubSpotContact(profile.email, 'At Risk')
      tagged++
    }
  }

  return tagged
}
