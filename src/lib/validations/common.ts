import { z } from 'zod'

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export const uuidSchema = z.string().regex(UUID_REGEX, 'Invalid UUID format')

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1, 'Page must be at least 1').default(1),
  per_page: z.coerce
    .number()
    .int()
    .min(1, 'Per page must be at least 1')
    .max(100, 'Per page cannot exceed 100')
    .default(20),
})

export type PaginationInput = z.infer<typeof paginationSchema>

export const dateRangeSchema = z
  .object({
    start_date: z.coerce.date({ required_error: 'Start date is required' }),
    end_date: z.coerce.date({ required_error: 'End date is required' }),
  })
  .refine((data) => data.end_date >= data.start_date, {
    message: 'End date must be on or after start date',
    path: ['end_date'],
  })

export type DateRangeInput = z.infer<typeof dateRangeSchema>
