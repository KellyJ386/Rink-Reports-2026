'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'

const US_STATES = [
  { value: 'AL', label: 'Alabama' }, { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' }, { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' }, { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' }, { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' }, { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' }, { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' }, { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' }, { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' }, { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' }, { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' }, { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' }, { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' }, { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' }, { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' }, { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' }, { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' }, { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' }, { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' }, { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' }, { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' }, { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' }, { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' }, { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' }, { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' }, { value: 'WY', label: 'Wyoming' },
]

export default function OnboardingFacilityPage() {
  const [facilityName, setFacilityName] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [zip, setZip] = useState('')
  const [phone, setPhone] = useState('')
  const [adminFullName, setAdminFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/onboarding/facility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facility_name: facilityName,
          address,
          city,
          state,
          zip,
          phone,
          admin_full_name: adminFullName,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to create facility')
        return
      }

      router.push('/onboarding/billing')
    } catch {
      setError('Unable to save facility info. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const currentStep = 2

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-navy-dark px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-navy dark:text-white">
            Max Facility
          </h1>
          <p className="text-wolf-grey mt-1">Rink Reports</p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                s === currentStep
                  ? 'bg-navy text-white dark:bg-action-green'
                  : s < currentStep
                    ? 'bg-action-green text-white'
                    : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
              }`}
            >
              {s}
            </div>
          ))}
        </div>

        {/* Facility Form */}
        <div className="card">
          <h2 className="text-xl font-semibold text-navy dark:text-white mb-4">
            Facility Information
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-alert-red/10 text-alert-red px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <Input
              label="Your Full Name"
              type="text"
              value={adminFullName}
              onChange={(e) => setAdminFullName(e.target.value)}
              placeholder="John Smith"
              required
            />

            <Input
              label="Facility Name"
              type="text"
              value={facilityName}
              onChange={(e) => setFacilityName(e.target.value)}
              placeholder="Tennity Ice Skating Pavilion"
              required
            />

            <Input
              label="Address"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="511 Skytop Rd"
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="City"
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Syracuse"
              />

              <Select
                label="State"
                value={state}
                onChange={(e) => setState(e.target.value)}
                options={US_STATES}
                placeholder="Select state"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="ZIP Code"
                type="text"
                value={zip}
                onChange={(e) => setZip(e.target.value)}
                placeholder="13244"
                inputMode="numeric"
              />

              <Input
                label="Phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(315) 555-0100"
              />
            </div>

            <Button type="submit" className="w-full" loading={loading}>
              Continue to Billing
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
