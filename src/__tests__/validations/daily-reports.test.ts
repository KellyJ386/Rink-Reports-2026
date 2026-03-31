import {
  createTabSchema,
  createChecklistItemSchema,
  createChecklistEntrySchema,
} from '@/lib/validations/daily-reports'

const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000'

describe('createTabSchema', () => {
  it('accepts valid tab data', () => {
    const result = createTabSchema.safeParse({
      facility_id: VALID_UUID,
      name: 'Main Rink',
      sort_order: 0,
    })
    expect(result.success).toBe(true)
  })

  it('rejects empty name', () => {
    const result = createTabSchema.safeParse({
      facility_id: VALID_UUID,
      name: '',
      sort_order: 0,
    })
    expect(result.success).toBe(false)
  })

  it('rejects name over 100 characters', () => {
    const result = createTabSchema.safeParse({
      facility_id: VALID_UUID,
      name: 'x'.repeat(101),
      sort_order: 0,
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid UUID', () => {
    const result = createTabSchema.safeParse({
      facility_id: 'not-a-uuid',
      name: 'Tab',
      sort_order: 0,
    })
    expect(result.success).toBe(false)
  })

  it('rejects negative sort order', () => {
    const result = createTabSchema.safeParse({
      facility_id: VALID_UUID,
      name: 'Tab',
      sort_order: -1,
    })
    expect(result.success).toBe(false)
  })
})

describe('createChecklistItemSchema', () => {
  it('accepts valid checklist item', () => {
    const result = createChecklistItemSchema.safeParse({
      tab_id: VALID_UUID,
      facility_id: VALID_UUID,
      text: 'Check ice surface',
      checklist_type: 'opening',
      sort_order: 0,
    })
    expect(result.success).toBe(true)
  })

  it('defaults recurrence to daily', () => {
    const result = createChecklistItemSchema.safeParse({
      tab_id: VALID_UUID,
      facility_id: VALID_UUID,
      text: 'Check lights',
      checklist_type: 'closing',
      sort_order: 1,
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.recurrence).toBe('daily')
    }
  })

  it('accepts all checklist types', () => {
    for (const type of ['opening', 'closing', 'daily'] as const) {
      const result = createChecklistItemSchema.safeParse({
        tab_id: VALID_UUID,
        facility_id: VALID_UUID,
        text: 'Item',
        checklist_type: type,
        sort_order: 0,
      })
      expect(result.success).toBe(true)
    }
  })

  it('rejects invalid checklist type', () => {
    const result = createChecklistItemSchema.safeParse({
      tab_id: VALID_UUID,
      facility_id: VALID_UUID,
      text: 'Item',
      checklist_type: 'invalid',
      sort_order: 0,
    })
    expect(result.success).toBe(false)
  })
})

describe('createChecklistEntrySchema', () => {
  it('accepts valid entry', () => {
    const result = createChecklistEntrySchema.safeParse({
      item_id: VALID_UUID,
      facility_id: VALID_UUID,
      checked: true,
    })
    expect(result.success).toBe(true)
  })

  it('accepts entry with notes', () => {
    const result = createChecklistEntrySchema.safeParse({
      item_id: VALID_UUID,
      facility_id: VALID_UUID,
      checked: false,
      notes: 'Ice was rough',
    })
    expect(result.success).toBe(true)
  })

  it('rejects notes over 1000 characters', () => {
    const result = createChecklistEntrySchema.safeParse({
      item_id: VALID_UUID,
      facility_id: VALID_UUID,
      checked: true,
      notes: 'x'.repeat(1001),
    })
    expect(result.success).toBe(false)
  })
})
