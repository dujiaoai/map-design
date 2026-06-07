import type { ReactNode } from 'react'

import { MODULE_PANEL_BODY_CLASS } from '../lib/dock-panel-layout'

/** 侧栏 / 画布原生模块面板内容区：单区域滚动，避免模块内再套 overflow */
export function DockPanelScrollBody({ children }: { children: ReactNode }) {
  return <div className={MODULE_PANEL_BODY_CLASS}>{children}</div>
}
