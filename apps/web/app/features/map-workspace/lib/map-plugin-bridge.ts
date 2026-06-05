import { isKnownPluginToolId } from './map-plugin-registry'
import type { ActiveDrawerTool, ActiveMapTool } from './workspace-url'

export interface MapPluginBridge {
  startMapTool: (tool: ActiveMapTool) => void
  stopMapTool: () => void
  showDrawerTool: (tool: ActiveDrawerTool) => void
  hideDrawerTool: () => void
}

function createNoopBridge(): MapPluginBridge {
  return {
    startMapTool(tool) {
      if (import.meta.env.DEV) {
        console.debug('[map-plugin-bridge] startMapTool', tool)
      }
    },
    stopMapTool() {
      if (import.meta.env.DEV) {
        console.debug('[map-plugin-bridge] stopMapTool')
      }
    },
    showDrawerTool(tool) {
      if (import.meta.env.DEV) {
        console.debug('[map-plugin-bridge] showDrawerTool', tool)
      }
    },
    hideDrawerTool() {
      if (import.meta.env.DEV) {
        console.debug('[map-plugin-bridge] hideDrawerTool')
      }
    },
  }
}

let bridge: MapPluginBridge = createNoopBridge()

/** 接入 MapProvider 后由宿主注入真实 bridge */
export function setMapPluginBridge(next: MapPluginBridge): void {
  bridge = next
}

export function getMapPluginBridge(): MapPluginBridge {
  return bridge
}

export function resetMapPluginBridge(): void {
  bridge = createNoopBridge()
}

/**
 * 按 pluginToolId 分发（Phase C 占位实现）。
 * 真实接入时在此调用各 map-plugins lazyEntry / useXxx start|stop。
 */
export function createDevMapPluginBridge(): MapPluginBridge {
  return {
    startMapTool(tool) {
      if (import.meta.env.DEV) {
        if (!isKnownPluginToolId(tool.pluginToolId)) {
          console.warn('[map-plugin-bridge] unknown pluginToolId', tool.pluginToolId)
        }
        console.debug('[map-plugin-bridge] start', tool.pluginToolId, tool.variant ?? {})
      }
    },
    stopMapTool() {
      if (import.meta.env.DEV) {
        console.debug('[map-plugin-bridge] stop')
      }
    },
    showDrawerTool(tool) {
      if (import.meta.env.DEV) {
        console.debug('[map-plugin-bridge] drawer', tool.pluginToolId)
      }
    },
    hideDrawerTool() {
      if (import.meta.env.DEV) {
        console.debug('[map-plugin-bridge] hide drawer')
      }
    },
  }
}
