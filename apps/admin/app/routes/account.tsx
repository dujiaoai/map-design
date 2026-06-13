import { useEffect } from 'react'
import { redirect, useNavigate } from 'react-router'

import { hasAdminAccess } from '~/shared/auth/admin-access'
import { auth } from '~/shared/auth/client'
import { useAdminChrome } from '~/widgets/admin-shell/model/admin-chrome-context'

import type { Route } from './+types/account'

export function meta(_args: Route.MetaArgs) {
  return [{ title: '账号信息 · 云眼运营后台' }]
}

export async function clientLoader(_args: Route.ClientLoaderArgs) {
  auth.hydrateSession()
  if (!hasAdminAccess(auth.getSession())) {
    throw redirect('/403')
  }
  return null
}

export default function AccountRoute() {
  const { openAccount } = useAdminChrome()
  const navigate = useNavigate()

  useEffect(() => {
    openAccount()
    void navigate('/', { replace: true })
  }, [navigate, openAccount])

  return null
}
