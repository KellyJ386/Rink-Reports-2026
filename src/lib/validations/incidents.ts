import { z } from 'zod'

export const createIncidentSchema = z.object({
  facility_id: z.string().uuid(),
  type: z.enum(['incident', 'accident']),
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(5000),
  date: z.string(),
  time: z.string().optional(),
  location: z.string().max(200).optional(),
  // Incident-specific (injury/near-miss)
  injured_type: z.enum(['patron', 'staff']).optional(),
  injured_name: z.string().max(200).optional(),
  body_regions: z.array(z.string()).optional(),
  severity: z.string().max(50).optional(),
  first_aid_given: z.boolean().optional(),
  // Accident-specific (property/equipment)
  equipment_involved: z.string().max(200).optional(),
  damage_description: z.string().max(2000).optional(),
  estimated_cost: z.number().optional(),
  // Common
  witnesses: z.string().max(1000).optional(),
  actions_taken: z.string().max(2000).optional(),
})

export const updateIncidentSchema = createIncidentSchema.partial().omit({
  facility_id: true,
})

export type CreateIncidentInput = z.infer<typeof createIncidentSchema>
export type UpdateIncidentInput = z.infer<typeof updateIncidentSchema>
