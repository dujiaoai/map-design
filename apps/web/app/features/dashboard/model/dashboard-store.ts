import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface DashboardState {
  sidebarCollapsed: boolean
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
}

/** 工作台 UI 偏好（示例：侧栏折叠状态，持久化到 localStorage） */
export const useDashboardStore = create<DashboardState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
    }),
    { name: 'saas-web:dashboard' },
  ),
)
