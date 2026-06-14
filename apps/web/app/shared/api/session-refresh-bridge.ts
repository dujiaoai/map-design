import { fetchAndPersistSaasSession } from '~/shared/session/fetch-saas-session'

export function handleAfterAuthRefresh(): void {
  void fetchAndPersistSaasSession().catch(() => {
    // refresh 已成功但 bootstrap 失败时不阻断主请求
  })
}
