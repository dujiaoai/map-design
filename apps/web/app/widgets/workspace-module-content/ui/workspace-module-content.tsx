import {
  MockModuleContent,
  type MockModuleContentProps,
} from '~/entities/mock-workspace-content'
import { ThematicLayerModuleContent } from '~/features/layer-catalog'
import { usesSaasSessionBootstrap } from '~/shared/session/fetch-saas-session'

export function WorkspaceModuleContent(props: MockModuleContentProps) {
  if (props.moduleId === 'thematic' && usesSaasSessionBootstrap()) {
    return <ThematicLayerModuleContent />
  }
  return <MockModuleContent {...props} />
}
