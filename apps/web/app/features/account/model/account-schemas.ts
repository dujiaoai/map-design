import { z } from 'zod'

const phonePattern = /^1[3-9]\d{9}$/

export const profileFormSchema = z.object({
  nickName: z.string().trim().min(1, '用户姓名不能为空').max(30, '最多 30 个字符'),
  phonenumber: z
    .string()
    .trim()
    .min(1, '手机号码不能为空')
    .regex(phonePattern, '请输入正确的手机号码'),
  email: z
    .string()
    .trim()
    .min(1, '邮箱地址不能为空')
    .email('请输入正确的邮箱地址')
    .max(50, '最多 50 个字符'),
  sex: z.enum(['0', '1'], { message: '请选择性别' }),
})

export type ProfileFormValues = z.infer<typeof profileFormSchema>

export const resetPasswordSchema = z
  .object({
    oldPassword: z.string().min(1, '旧密码不能为空'),
    newPassword: z
      .string()
      .min(6, '长度在 6 到 20 个字符')
      .max(20, '长度在 6 到 20 个字符')
      .regex(/^[^<>"'|\\]+$/, '不能包含非法字符：< > " \' \\ |'),
    confirmPassword: z.string().min(1, '确认密码不能为空'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: '两次输入的密码不一致',
    path: ['confirmPassword'],
  })

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>
