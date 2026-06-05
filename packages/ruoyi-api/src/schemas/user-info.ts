import { z } from 'zod'

/** RuoYi 用户对象内嵌的角色详情（与顶层 roles 字符串数组不同） */
export const ruoYiRoleSchema = z
  .object({
    roleId: z.union([z.string(), z.number()]).optional(),
    roleName: z.string().optional(),
    roleKey: z.string().optional(),
    admin: z.boolean().optional(),
  })
  .passthrough()

export const ruoYiUserSchema = z
  .object({
    userId: z.union([z.string(), z.number()]),
    userName: z.string(),
    nickName: z.string().optional().nullable(),
    email: z.string().optional().nullable(),
    phonenumber: z.string().optional().nullable(),
    sex: z.string().optional().nullable(),
    avatar: z.string().nullable().optional(),
    /** RuoYi 头像字段，常为 base64 或 URL */
    icon: z.string().nullable().optional(),
    status: z.string().optional().nullable(),
    deptId: z.union([z.string(), z.number()]).optional().nullable(),
    dept: z.unknown().optional(),
    roles: z.array(ruoYiRoleSchema).optional(),
  })
  .passthrough()

export const userInfoSchema = z
  .object({
    code: z.number().optional(),
    msg: z.string().optional(),
    data: z.null().optional(),
    user: ruoYiUserSchema,
    roles: z.array(z.string()),
    permissions: z.array(z.string()),
  })
  .passthrough()

export type RuoYiRole = z.infer<typeof ruoYiRoleSchema>
export type RuoYiUser = z.infer<typeof ruoYiUserSchema>
export type UserInfo = z.infer<typeof userInfoSchema>
