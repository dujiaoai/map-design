import { MOCK_MODULE_CONTENT_ROOT_CLASS } from '~/entities/mock-workspace-content/ui/primitives/mock-module-content-root'
import { usesSaasSessionBootstrap } from '~/shared/session/fetch-saas-session'

import { UavDockListPanel } from './uav-dock-list-panel'

export function UavListModuleContent({ className }: { className?: string }) {
  if (!usesSaasSessionBootstrap()) {
    return null
  }
  return <UavDockListPanel className={className ?? MOCK_MODULE_CONTENT_ROOT_CLASS} />
}
