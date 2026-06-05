import { queryClient } from '~/shared/lib/query-client'
import { userInfoQueryOptions, userQueryKeys } from '~/shared/queries'
import { useRuoYiProfileStore } from '~/entities/ruoyi-user'
import { auth } from '~/shared/auth/instance'
import type { UserInfo } from '@repo/ruoyi-api'

function syncAuthSessionFromUserInfo(info: UserInfo) {
  const session = auth.getSession()
  const token = auth.getAccessToken()
  if (!session || !token) return

  auth.setSession(
    {
      ...session,
      user: {
        ...session.user,
        id: String(info.user.userId),
        name: info.user.nickName ?? info.user.userName,
        email: info.user.email?.includes('@') ? info.user.email : session.user.email,
      },
    },
    { accessToken: token },
  )
}

/** 资料变更后刷新 getInfo 缓存与 profile store */
export async function refreshAuthenticatedUser() {
  await queryClient.invalidateQueries({ queryKey: userQueryKeys.info() })
  const userInfo = await queryClient.fetchQuery(userInfoQueryOptions())
  useRuoYiProfileStore.getState().setProfile(userInfo)
  syncAuthSessionFromUserInfo(userInfo)
  return userInfo
}
