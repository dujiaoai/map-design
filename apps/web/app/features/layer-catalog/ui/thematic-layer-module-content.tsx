import { MOCK_MODULE_CONTENT_ROOT_CLASS } from '~/entities/mock-workspace-content/ui/primitives/mock-module-content-root'
import { usesSaasSessionBootstrap } from '~/shared/session/fetch-saas-session'

import { LayerCatalogPanel } from './layer-catalog-panel'

/** SaaS 会话下专题模块走 /v1/layers API；否则由 MockModuleContent 回退 mock 树。 */
export function ThematicLayerModuleContent({ className }: { className?: string }) {
  if (!usesSaasSessionBootstrap()) {
    return null
  }
  return <LayerCatalogPanel className={className ?? MOCK_MODULE_CONTENT_ROOT_CLASS} />
}
