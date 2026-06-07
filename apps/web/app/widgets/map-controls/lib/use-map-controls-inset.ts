import { useEffect, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'

import { resolveNativeSidebarModule } from '~/features/map-workspace/lib/resolve-active-sidebar-module'
import { useMapWorkspaceStore } from '~/features/map-workspace'

const BASE_INSET_PX = 8
const GAP_PX = 8
const CANVAS_SELECTOR = '.workspace-canvas'
const NATIVE_HOST_SELECTOR = '.workspace-native-module-host'

function selectSidebarModuleState(state: ReturnType<typeof useMapWorkspaceStore.getState>) {
  return {
    activeDockModuleId: state.activeDockModuleId,
    dockPanelCollapsed: state.dockPanelCollapsed,
    activeModuleId: state.activeModuleId,
    modulePanelCollapsed: state.modulePanelCollapsed,
  }
}

function measureInset(): { right: number; bottom: number } {
  const canvas = document.querySelector(CANVAS_SELECTOR)
  const module = document.querySelector(NATIVE_HOST_SELECTOR)

  if (!canvas || !module) {
    return { right: BASE_INSET_PX, bottom: BASE_INSET_PX }
  }

  const canvasRect = canvas.getBoundingClientRect()
  const moduleRect = module.getBoundingClientRect()

  const anchorRight = canvasRect.right - BASE_INSET_PX
  const anchorBottom = canvasRect.bottom - BASE_INSET_PX

  const moduleInCorner =
    moduleRect.left < anchorRight &&
    moduleRect.right > canvasRect.left + canvasRect.width * 0.35 &&
    moduleRect.top < anchorBottom &&
    moduleRect.bottom > canvasRect.top

  if (!moduleInCorner) {
    return { right: BASE_INSET_PX, bottom: BASE_INSET_PX }
  }

  let right = BASE_INSET_PX
  let bottom = BASE_INSET_PX

  if (moduleRect.bottom >= canvasRect.bottom - BASE_INSET_PX - 20) {
    bottom = Math.max(BASE_INSET_PX, canvasRect.bottom - moduleRect.top + GAP_PX)
  }

  if (moduleRect.right >= canvasRect.right - BASE_INSET_PX - 20) {
    right = Math.max(BASE_INSET_PX, canvasRect.right - moduleRect.left + GAP_PX)
  }

  return { right, bottom }
}

/** 避让右下角 MapNativeModuleHost，动态计算 inset */
export function useMapControlsInset() {
  const sidebarState = useMapWorkspaceStore(useShallow(selectSidebarModuleState))
  const nativeModule = resolveNativeSidebarModule(sidebarState)
  const [inset, setInset] = useState({ right: BASE_INSET_PX, bottom: BASE_INSET_PX })

  useEffect(() => {
    if (!nativeModule) {
      setInset({ right: BASE_INSET_PX, bottom: BASE_INSET_PX })
      return
    }

    const update = () => {
      requestAnimationFrame(() => setInset(measureInset()))
    }

    update()

    const canvas = document.querySelector(CANVAS_SELECTOR)
    const module = document.querySelector(NATIVE_HOST_SELECTOR)
    const observer = new ResizeObserver(update)

    if (canvas) observer.observe(canvas)
    if (module) observer.observe(module)

    window.addEventListener('resize', update)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', update)
    }
  }, [nativeModule?.moduleId, nativeModule?.kind])

  return inset
}
