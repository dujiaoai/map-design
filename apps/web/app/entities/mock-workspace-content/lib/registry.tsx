import type { MapToolVariantKey } from '~/entities/navigation'

import type {
  MockDrawerToolContentComponent,
  MockDrawerToolContentProps,
  MockModuleContentComponent,
  MockModuleContentProps,
  MockToolContentComponent,
  MockToolContentProps,
} from '../model/types'
import { FallbackDrawerToolContent } from '../ui/drawers/fallback-drawer-tool-content'
import { GlobalSearchDrawerContent } from '../ui/drawers/global-search-drawer-content'
import { FallbackModuleContent } from '../ui/modules/fallback-module-content'
import { FlightLedgerModuleContent } from '../ui/modules/flight-ledger-module-content'
import { MyFavoritesModuleContent } from '../ui/modules/my-favorites-module-content'
import { ThematicModuleContent } from '../ui/modules/thematic-module-content'
import { FallbackToolContent } from '../ui/tools/fallback-tool-content'
import { MeasureDistanceToolContent } from '../ui/tools/measure-distance-tool-content'
import { PlotPointToolContent } from '../ui/tools/plot-point-tool-content'
import { SwipeCompareToolContent } from '../ui/tools/swipe-compare-tool-content'

import {
  isRegisteredMockDrawerToolId,
  isRegisteredMockModuleId,
  isRegisteredMockToolId,
} from './registry-catalog'

const MOCK_TOOL_REGISTRY: Record<string, MockToolContentComponent> = {
  'measure-distance': MeasureDistanceToolContent,
  'plot-point': PlotPointToolContent,
  'swipe-compare': SwipeCompareToolContent,
}

const MOCK_MODULE_REGISTRY: Record<string, MockModuleContentComponent> = {
  thematic: ThematicModuleContent,
  'my-favorites': MyFavoritesModuleContent,
  'flight-ledger': FlightLedgerModuleContent,
}

const MOCK_DRAWER_TOOL_REGISTRY: Record<string, MockDrawerToolContentComponent> = {
  'global-search': GlobalSearchDrawerContent,
}

export function resolveMockToolContent(
  toolId: string,
  _variantKey?: MapToolVariantKey | null,
): MockToolContentComponent {
  return MOCK_TOOL_REGISTRY[toolId] ?? FallbackToolContent
}

export function resolveMockModuleContent(moduleId: string): MockModuleContentComponent {
  return MOCK_MODULE_REGISTRY[moduleId] ?? FallbackModuleContent
}

export function resolveMockDrawerToolContent(toolId: string): MockDrawerToolContentComponent {
  return MOCK_DRAWER_TOOL_REGISTRY[toolId] ?? FallbackDrawerToolContent
}

export function MockToolContent(props: MockToolContentProps) {
  const Content = resolveMockToolContent(props.toolId, props.variantKey)
  return <Content {...props} />
}

export function MockModuleContent(props: MockModuleContentProps) {
  const Content = resolveMockModuleContent(props.moduleId)
  return <Content {...props} />
}

export function MockDrawerToolContent(props: MockDrawerToolContentProps) {
  const Content = resolveMockDrawerToolContent(props.toolId)
  return <Content {...props} />
}

export {
  isRegisteredMockDrawerToolId,
  isRegisteredMockModuleId,
  isRegisteredMockToolId,
}
