import { z } from 'zod'

export const updateUserProfilePayloadSchema = z.object({
  userId: z.union([z.string(), z.number()]).optional(),
  nickName: z.string().min(1).max(30),
  phonenumber: z.string().min(1).max(11),
  email: z.string().min(1).max(50),
  sex: z.string(),
})

export type UpdateUserProfilePayload = z.infer<typeof updateUserProfilePayloadSchema>

export const updateUserPasswordPayloadSchema = z.object({
  oldPassword: z.string().min(1),
  newPassword: z.string().min(1),
})

export type UpdateUserPasswordPayload = z.infer<typeof updateUserPasswordPayloadSchema>

export const ruoYiActionResponseSchema = z
  .object({
    code: z.number().optional(),
    msg: z.string().optional(),
  })
  .passthrough()

export type RuoYiActionResponse = z.infer<typeof ruoYiActionResponseSchema>
