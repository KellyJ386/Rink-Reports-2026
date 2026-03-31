import {
  createShiftSchema,
  createSwapRequestSchema,
  updateSwapStatusSchema,
} from '@/lib/validations/scheduling'

const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000'
const VALID_UUID2 = '660e8400-e29b-41d4-a716-446655440001'

describe('createShiftSchema', () => {
  it('accepts valid shift', () => {
    const result = createShiftSchema.safeParse({
      facility_id: VALID_UUID,
      user_id: VALID_UUID2,
      start_time: '2026-03-15T08:00:00Z',
      end_time: '2026-03-15T16:00:00Z',
    })
    expect(result.success).toBe(true)
  })

  it('accepts shift with optional fields', () => {
    const result = createShiftSchema.safeParse({
      facility_id: VALID_UUID,
      user_id: VALID_UUID2,
      position_id: VALID_UUID,
      start_time: '2026-03-15T08:00:00Z',
      end_time: '2026-03-15T16:00:00Z',
      notes: 'Opening shift',
    })
    expect(result.success).toBe(true)
  })

  it('rejects notes over 1000 characters', () => {
    const result = createShiftSchema.safeParse({
      facility_id: VALID_UUID,
      user_id: VALID_UUID2,
      start_time: '2026-03-15T08:00:00Z',
      end_time: '2026-03-15T16:00:00Z',
      notes: 'x'.repeat(1001),
    })
    expect(result.success).toBe(false)
  })
})

describe('createSwapRequestSchema', () => {
  it('accepts valid swap request', () => {
    const result = createSwapRequestSchema.safeParse({
      facility_id: VALID_UUID,
      shift_id: VALID_UUID2,
      requested_by: VALID_UUID,
    })
    expect(result.success).toBe(true)
  })

  it('accepts swap with optional target and reason', () => {
    const result = createSwapRequestSchema.safeParse({
      facility_id: VALID_UUID,
      shift_id: VALID_UUID2,
      requested_by: VALID_UUID,
      requested_to: VALID_UUID2,
      reason: 'Doctor appointment',
    })
    expect(result.success).toBe(true)
  })
})

describe('updateSwapStatusSchema', () => {
  it('accepts approved status', () => {
    const result = updateSwapStatusSchema.safeParse({
      status: 'approved',
      reviewed_by: VALID_UUID,
    })
    expect(result.success).toBe(true)
  })

  it('accepts denied status', () => {
    const result = updateSwapStatusSchema.safeParse({
      status: 'denied',
      reviewed_by: VALID_UUID,
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid status', () => {
    const result = updateSwapStatusSchema.safeParse({
      status: 'pending',
      reviewed_by: VALID_UUID,
    })
    expect(result.success).toBe(false)
  })
})
