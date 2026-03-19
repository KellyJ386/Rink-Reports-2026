import { z } from 'zod'

export const createTemplateSchema = z.object({
  facility_id: z.string().uuid(),
  name: z.string().min(1).max(100),
  rink_length: z.number().positive().default(200),
  rink_width: z.number().positive().default(85),
})

export const createPointSchema = z.object({
  template_id: z.string().uuid(),
  point_number: z.number().int().min(1),
  x_percent: z.number().min(0).max(100),
  y_percent: z.number().min(0).max(100),
  label: z.string().max(50).optional(),
})

export const createReadingSchema = z.object({
  point_id: z.string().uuid(),
  template_id: z.string().uuid(),
  facility_id: z.string().uuid(),
  depth_inches: z.number().min(0).max(10),
  source: z.enum(['manual', 'bluetooth']).default('manual'),
})
