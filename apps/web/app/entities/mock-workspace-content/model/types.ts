import type { ComponentType } from 'react'

import type { MapToolVariantKey } from '~/entities/navigation'

/** 地图工具浮层（movable-panel / anchor / panel）内容 props */
export interface MockToolContentProps {
  toolId: string
  navItemId: string
  title: string
  pluginToolId: string
  variantKey?: MapToolVariantKey | null
}

/** 业务 / 机库 Dock 模块内容 props */
export interface MockModuleContentProps {
  moduleId: string
  title: string
}

/** L4 右侧条带工具内容 props */
export interface MockDrawerToolContentProps {
  toolId: string
  navItemId: string
  title: string
  pluginToolId: string
}

export type MockToolContentComponent = ComponentType<MockToolContentProps>
export type MockModuleContentComponent = ComponentType<MockModuleContentProps>
export type MockDrawerToolContentComponent = ComponentType<MockDrawerToolContentProps>
