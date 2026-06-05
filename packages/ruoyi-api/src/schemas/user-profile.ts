import { z } from 'zod'

import { ruoYiUserSchema } from './user-info'

export const userProfileSchema = z
  .object({
    code: z.number().optional(),
    msg: z.string().optional(),
    data: ruoYiUserSchema,
    roleGroup: z.string().optional(),
    postGroup: z.string().optional(),
  })
  .passthrough()

export type UserProfile = z.infer<typeof userProfileSchema>
