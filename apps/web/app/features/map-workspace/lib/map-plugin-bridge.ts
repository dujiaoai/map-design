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
let customBridgeAttached = false

/** 接入 MapProvider 后由宿主注入真实 bridge */
export function setMapPluginBridge(next: MapPluginBridge): void {
  bridge = next
  customBridgeAttached = true
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('map-engine-ready'))
  }
}

export function getMapPluginBridge(): MapPluginBridge {
  return bridge
}

export function resetMapPluginBridge(): void {
  bridge = createNoopBridge()
  customBridgeAttached = false
}

/** 是否已由 MapProvider / 宿主注入自定义 bridge（非默认 noop） */
export function isMapPluginBridgeAttached(): boolean {
  return customBridgeAttached
}

/** 地图引擎已挂载（注入 bridge 或显式 env 开启） */
export function isMapEngineReady(): boolean {
  return customBridgeAttached || import.meta.env.VITE_MAP_ENGINE_READY === 'true'
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
