import {
  createIceCutSchema,
  createEdgingLogSchema,
  createBladeChangeSchema,
  createCircleCheckSchema,
  createCircleCheckResponseSchema,
} from '@/lib/validations/ice-operations'

const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000'

describe('createIceCutSchema', () => {
  it('accepts valid ice cut', () => {
    const result = createIceCutSchema.safeParse({
      facility_id: VALID_UUID,
      equipment_id: VALID_UUID,
      rink_name: 'Main Rink',
    })
    expect(result.success).toBe(true)
  })

  it('rejects empty rink name', () => {
    const result = createIceCutSchema.safeParse({
      facility_id: VALID_UUID,
      equipment_id: VALID_UUID,
      rink_name: '',
    })
    expect(result.success).toBe(false)
  })

  it('accepts optional fields', () => {
    const result = createIceCutSchema.safeParse({
      facility_id: VALID_UUID,
      equipment_id: VALID_UUID,
      rink_name: 'Main Rink',
      cut_number: 3,
      water_temperature: 145.5,
      notes: 'Good cut',
    })
    expect(result.success).toBe(true)
  })
})

describe('createEdgingLogSchema', () => {
  it('accepts valid edging log', () => {
    const result = createEdgingLogSchema.safeParse({
      facility_id: VALID_UUID,
      rink_name: 'Practice Rink',
    })
    expect(result.success).toBe(true)
  })

  it('equipment_id is optional', () => {
    const result = createEdgingLogSchema.safeParse({
      facility_id: VALID_UUID,
      rink_name: 'Main Rink',
      equipment_id: VALID_UUID,
    })
    expect(result.success).toBe(true)
  })
})

describe('createBladeChangeSchema', () => {
  it('accepts valid blade change', () => {
    const result = createBladeChangeSchema.safeParse({
      facility_id: VALID_UUID,
      equipment_id: VALID_UUID,
      blade_type: 'Standard',
    })
    expect(result.success).toBe(true)
  })

  it('rejects missing blade type', () => {
    const result = createBladeChangeSchema.safeParse({
      facility_id: VALID_UUID,
      equipment_id: VALID_UUID,
      blade_type: '',
    })
    expect(result.success).toBe(false)
  })
})

describe('createCircleCheckSchema', () => {
  it('accepts valid circle check', () => {
    const result = createCircleCheckSchema.safeParse({
      facility_id: VALID_UUID,
      equipment_id: VALID_UUID,
    })
    expect(result.success).toBe(true)
  })
})

describe('createCircleCheckResponseSchema', () => {
  it('accepts passed response', () => {
    const result = createCircleCheckResponseSchema.safeParse({
      circle_check_id: VALID_UUID,
      item_id: VALID_UUID,
      passed: true,
    })
    expect(result.success).toBe(true)
  })

  it('accepts failed response with notes', () => {
    const result = createCircleCheckResponseSchema.safeParse({
      circle_check_id: VALID_UUID,
      item_id: VALID_UUID,
      passed: false,
      notes: 'Tire pressure low',
    })
    expect(result.success).toBe(true)
  })
})
