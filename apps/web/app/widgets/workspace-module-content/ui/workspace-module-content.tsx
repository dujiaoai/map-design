import {
  MockModuleContent,
  type MockModuleContentProps,
} from '~/entities/mock-workspace-content'
import { ThematicLayerModuleContent } from '~/features/layer-catalog'
import { UavListModuleContent } from '~/features/uav-dock-catalog'
import { usesSaasSessionBootstrap } from '~/shared/session/fetch-saas-session'

export function WorkspaceModuleContent(props: MockModuleContentProps) {
  if (props.moduleId === 'thematic' && usesSaasSessionBootstrap()) {
    return <ThematicLayerModuleContent />
  }
  if (props.moduleId === 'uav-list' && usesSaasSessionBootstrap()) {
    return <UavListModuleContent />
  }
  return <MockModuleContent {...props} />
}
