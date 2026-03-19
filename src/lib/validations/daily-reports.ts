import { z } from 'zod'

export const createTabSchema = z.object({
  facility_id: z.string().uuid(),
  name: z.string().min(1).max(100),
  sort_order: z.number().int().min(0),
})

export const createChecklistItemSchema = z.object({
  tab_id: z.string().uuid(),
  facility_id: z.string().uuid(),
  text: z.string().min(1).max(500),
  checklist_type: z.enum(['opening', 'closing', 'daily']),
  sort_order: z.number().int().min(0),
  recurrence: z.enum(['daily', 'weekly', 'monthly', 'seasonal']).default('daily'),
})

export const createChecklistEntrySchema = z.object({
  item_id: z.string().uuid(),
  facility_id: z.string().uuid(),
  checked: z.boolean(),
  notes: z.string().max(1000).optional(),
})

export type CreateTabInput = z.infer<typeof createTabSchema>
export type CreateChecklistItemInput = z.infer<typeof createChecklistItemSchema>
export type CreateChecklistEntryInput = z.infer<typeof createChecklistEntrySchema>
