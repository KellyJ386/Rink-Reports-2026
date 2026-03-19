import { z } from 'zod'

export const createReadingSchema = z.object({
  facility_id: z.string().uuid(),
  jurisdiction_id: z.string().uuid().optional(),
  notes: z.string().max(1000).optional(),
  values: z.array(z.object({
    metric_id: z.string().uuid(),
    value: z.number(),
  })),
})
