import { z } from 'zod'

export const createIceCutSchema = z.object({
  facility_id: z.string().uuid(),
  equipment_id: z.string().uuid(),
  rink_name: z.string().min(1).max(100),
  cut_number: z.number().int().min(1).optional(),
  water_temperature: z.number().optional(),
  notes: z.string().max(1000).optional(),
})

export const createEdgingLogSchema = z.object({
  facility_id: z.string().uuid(),
  equipment_id: z.string().uuid().optional(),
  rink_name: z.string().min(1).max(100),
  notes: z.string().max(1000).optional(),
})

export const createBladeChangeSchema = z.object({
  facility_id: z.string().uuid(),
  equipment_id: z.string().uuid(),
  blade_type: z.string().min(1).max(100),
  reason: z.string().max(500).optional(),
  notes: z.string().max(1000).optional(),
})

export const createCircleCheckSchema = z.object({
  facility_id: z.string().uuid(),
  equipment_id: z.string().uuid(),
  notes: z.string().max(1000).optional(),
})

export const createCircleCheckResponseSchema = z.object({
  circle_check_id: z.string().uuid(),
  item_id: z.string().uuid(),
  passed: z.boolean(),
  notes: z.string().max(1000).optional(),
})

export type CreateIceCutInput = z.infer<typeof createIceCutSchema>
export type CreateEdgingLogInput = z.infer<typeof createEdgingLogSchema>
export type CreateBladeChangeInput = z.infer<typeof createBladeChangeSchema>
export type CreateCircleCheckInput = z.infer<typeof createCircleCheckSchema>
export type CreateCircleCheckResponseInput = z.infer<typeof createCircleCheckResponseSchema>
