import { z } from 'zod'

export const createReadingSchema = z.object({
  equipment_id: z.string().uuid(),
  facility_id: z.string().uuid(),
  notes: z.string().max(1000).optional(),
  readings: z.array(z.object({
    reading_type_id: z.string().uuid(),
    value: z.number(),
  })).min(1, 'At least one reading is required'),
})

export const getReadingsQuerySchema = z.object({
  equipment_id: z.string().uuid().optional(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
})

export type CreateReadingInput = z.infer<typeof createReadingSchema>
export type GetReadingsQuery = z.infer<typeof getReadingsQuerySchema>
