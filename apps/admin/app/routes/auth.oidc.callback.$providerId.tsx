import { isLoginMfaRequiredError } from '@repo/auth'
import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router'

import { auth } from '~/shared/auth/client'
import { getAdminHomePath } from '~/shared/auth/admin-access'

export function meta() {
  return [{ title: 'OIDC 登录 · 云眼运营后台' }]
}

export default function OidcCallbackRoute() {
  const navigate = useNavigate()
  const { providerId } = useParams()
  const [searchParams] = useSearchParams()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function completeLogin() {
      const code = searchParams.get('code')
      const state = searchParams.get('state')
      if (!providerId || !code || !state) {
        setError('缺少 OIDC 回调参数')
        return
      }
      try {
        await auth.completeOidcLogin({ providerId, code, state })
        void navigate(getAdminHomePath(auth.getSession()), { replace: true })
      } catch (err) {
        if (isLoginMfaRequiredError(err)) {
          void navigate('/login', {
            replace: true,
            state: { mfaChallengeToken: err.challengeToken, email: err.userEmail },
          })
          return
        }
        setError('OIDC 登录失败，请返回重试')
      }
    }
    void completeLogin()
  }, [navigate, providerId, searchParams])

  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 px-6 text-center">
      <p className="text-sm text-white/70">{error ?? '正在完成 OIDC 登录…'}</p>
      {error ? (
        <button
          type="button"
          className="text-sm text-primary hover:underline"
          onClick={() => {
            void navigate('/login', { replace: true })
          }}
        >
          返回登录
        </button>
      ) : null}
    </div>
  )
}
