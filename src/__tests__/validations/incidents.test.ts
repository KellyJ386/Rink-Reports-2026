import { createIncidentSchema, updateIncidentSchema } from '@/lib/validations/incidents'

const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000'

describe('createIncidentSchema', () => {
  const validIncident = {
    facility_id: VALID_UUID,
    type: 'incident' as const,
    title: 'Slip on ice',
    description: 'Patron slipped near the boards',
    date: '2026-03-15',
  }

  it('accepts a valid incident', () => {
    expect(createIncidentSchema.safeParse(validIncident).success).toBe(true)
  })

  it('accepts a valid accident with injury fields', () => {
    const result = createIncidentSchema.safeParse({
      ...validIncident,
      type: 'accident',
      injured_name: 'Jane Doe',
      injured_type: 'patron',
      body_regions: ['left_knee', 'left_ankle'],
      severity: 'moderate',
      first_aid_given: true,
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid incident type', () => {
    const result = createIncidentSchema.safeParse({
      ...validIncident,
      type: 'unknown',
    })
    expect(result.success).toBe(false)
  })

  it('rejects missing description', () => {
    const { description: _, ...noDesc } = validIncident
    expect(createIncidentSchema.safeParse(noDesc).success).toBe(false)
  })

  it('rejects empty description', () => {
    const result = createIncidentSchema.safeParse({
      ...validIncident,
      description: '',
    })
    expect(result.success).toBe(false)
  })

  it('rejects title over 200 characters', () => {
    const result = createIncidentSchema.safeParse({
      ...validIncident,
      title: 'x'.repeat(201),
    })
    expect(result.success).toBe(false)
  })
})

describe('updateIncidentSchema', () => {
  it('accepts partial updates', () => {
    const result = updateIncidentSchema.safeParse({
      title: 'Updated title',
    })
    expect(result.success).toBe(true)
  })

  it('does not allow facility_id changes', () => {
    const result = updateIncidentSchema.safeParse({
      facility_id: VALID_UUID,
      title: 'Updated',
    })
    // facility_id should be stripped (omitted from schema)
    if (result.success) {
      expect('facility_id' in result.data).toBe(false)
    }
  })
})
