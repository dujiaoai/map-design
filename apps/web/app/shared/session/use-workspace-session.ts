import { useSession } from '@repo/auth'

import { useSessionQuery } from '~/shared/queries/session-queries'
import { usesSaasSessionBootstrap } from '~/shared/session/fetch-saas-session'

/** 工作台壳层统一会话：SaaS 路径合并 Query 与 Context，Mock 路径仅读 Context */
export function useWorkspaceSession() {
  const saasSession = usesSaasSessionBootstrap()
  const sessionQuery = useSessionQuery(saasSession)
  const contextSession = useSession()
  const session = saasSession ? (sessionQuery.data ?? contextSession) : contextSession

  return {
    session,
    isLoading: saasSession && sessionQuery.isPending && !session,
    error: sessionQuery.error,
  }
}
