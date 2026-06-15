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
import { ImportFileDrawerContent } from '../ui/drawers/import-file-drawer-content'
import { CustomHighwayAlertModuleContent } from '../ui/modules/custom-highway-alert-module-content'
import { CustomLiveShareModuleContent } from '../ui/modules/custom-live-share-module-content'
import { FallbackModuleContent } from '../ui/modules/fallback-module-content'
import { FlightAiAlertsModuleContent } from '../ui/modules/flight-ai-alerts-module-content'
import { FlightLedgerModuleContent } from '../ui/modules/flight-ledger-module-content'
import { LegendModuleContent } from '../ui/modules/legend-module-content'
import { MyFavoritesModuleContent } from '../ui/modules/my-favorites-module-content'
import { PropertyViewModuleContent } from '../ui/modules/property-view-module-content'
import { ScenicSpotsModuleContent } from '../ui/modules/scenic-spots-module-content'
import { SpatialAnalysisModuleContent } from '../ui/modules/spatial-analysis-module-content'
import { ThematicModuleContent } from '../ui/modules/thematic-module-content'
import { ViewProjectModuleContent } from '../ui/modules/view-project-module-content'
import { VideoMonitorModuleContent } from '../ui/modules/video-monitor-module-content'
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
  'scenic-spots': ScenicSpotsModuleContent,
  legend: LegendModuleContent,
  'spatial-analysis': SpatialAnalysisModuleContent,
  'property-view': PropertyViewModuleContent,
  'my-favorites': MyFavoritesModuleContent,
  'flight-ledger': FlightLedgerModuleContent,
  'flight-ai-alerts': FlightAiAlertsModuleContent,
  'custom-highway-alert': CustomHighwayAlertModuleContent,
  'custom-live-share': CustomLiveShareModuleContent,
  'video-monitor': VideoMonitorModuleContent,
  'view-project': ViewProjectModuleContent,
}

const MOCK_DRAWER_TOOL_REGISTRY: Record<string, MockDrawerToolContentComponent> = {
  'global-search': GlobalSearchDrawerContent,
  'import-file': ImportFileDrawerContent,
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
