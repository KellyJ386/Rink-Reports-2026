import { uuidSchema, paginationSchema, dateRangeSchema } from '@/lib/validations/common'

describe('uuidSchema', () => {
  it('accepts valid UUID v4', () => {
    expect(uuidSchema.safeParse('550e8400-e29b-41d4-a716-446655440000').success).toBe(true)
  })

  it('rejects invalid UUID', () => {
    expect(uuidSchema.safeParse('not-a-uuid').success).toBe(false)
    expect(uuidSchema.safeParse('').success).toBe(false)
    expect(uuidSchema.safeParse('550e8400-e29b-41d4-a716').success).toBe(false)
  })
})

describe('paginationSchema', () => {
  it('uses defaults when no values provided', () => {
    const result = paginationSchema.safeParse({})
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.page).toBe(1)
      expect(result.data.per_page).toBe(20)
    }
  })

  it('accepts valid page and per_page', () => {
    const result = paginationSchema.safeParse({ page: 3, per_page: 50 })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.page).toBe(3)
      expect(result.data.per_page).toBe(50)
    }
  })

  it('rejects page less than 1', () => {
    expect(paginationSchema.safeParse({ page: 0 }).success).toBe(false)
  })

  it('rejects per_page over 100', () => {
    expect(paginationSchema.safeParse({ per_page: 101 }).success).toBe(false)
  })
})

describe('dateRangeSchema', () => {
  it('accepts valid date range', () => {
    const result = dateRangeSchema.safeParse({
      start_date: '2026-01-01',
      end_date: '2026-03-31',
    })
    expect(result.success).toBe(true)
  })

  it('rejects end date before start date', () => {
    const result = dateRangeSchema.safeParse({
      start_date: '2026-03-31',
      end_date: '2026-01-01',
    })
    expect(result.success).toBe(false)
  })

  it('accepts same start and end date', () => {
    const result = dateRangeSchema.safeParse({
      start_date: '2026-03-15',
      end_date: '2026-03-15',
    })
    expect(result.success).toBe(true)
  })
})
