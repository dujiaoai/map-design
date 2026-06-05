import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateUserPassword, updateUserProfile, type RuoYiUser } from '@haoxuan/ruoyi-api'

import type { ProfileFormValues } from '~/features/account/model/account-schemas'
import { refreshAuthenticatedUser } from '~/shared/session/refresh-authenticated-user'
import { ruoyi, userQueryKeys } from '~/shared/queries'

export function useUpdateUserProfileMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: { user: RuoYiUser; values: ProfileFormValues }) =>
      updateUserProfile(ruoyi, {
        userId: input.user.userId,
        nickName: input.values.nickName,
        phonenumber: input.values.phonenumber,
        email: input.values.email,
        sex: input.values.sex,
      }),
    onSuccess: async () => {
      await refreshAuthenticatedUser()
      await queryClient.invalidateQueries({ queryKey: userQueryKeys.profile() })
    },
  })
}

export function useUpdateUserPasswordMutation() {
  return useMutation({
    mutationFn: (values: { oldPassword: string; newPassword: string }) =>
      updateUserPassword(ruoyi, values),
  })
}
