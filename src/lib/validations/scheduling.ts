import { z } from 'zod'

export const createShiftSchema = z.object({
  facility_id: z.string().uuid(),
  user_id: z.string().uuid(),
  position_id: z.string().uuid().optional(),
  start_time: z.string().datetime(),
  end_time: z.string().datetime(),
  notes: z.string().max(1000).optional(),
})

export const updateShiftSchema = createShiftSchema.partial().omit({ facility_id: true })

export const createAvailabilitySchema = z.object({
  facility_id: z.string().uuid(),
  day_of_week: z.number().int().min(0).max(6),
  start_time: z.string(),
  end_time: z.string(),
  is_available: z.boolean().default(true),
})

export const createSwapRequestSchema = z.object({
  facility_id: z.string().uuid(),
  shift_id: z.string().uuid(),
  requested_by: z.string().uuid(),
  requested_to: z.string().uuid().optional(),
  reason: z.string().max(500).optional(),
})

export const updateSwapStatusSchema = z.object({
  status: z.enum(['approved', 'denied']),
  reviewed_by: z.string().uuid(),
})
