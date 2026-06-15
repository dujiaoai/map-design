import { useEffect } from 'react'

import { markMapSdkMounted, useMapEngineReady } from '~/features/map-workspace'

import { MAP_CANVAS_MOUNT_ID } from '../lib/map-canvas-mount'
import { MapPlaceholder } from './map-placeholder'

/**
 * Phase C 地图 canvas 宿主壳：暴露挂载点，SDK 就绪后隐藏占位 HUD。
 * packages-map 联调时在 mount 节点初始化后调用 `markMapSdkMounted()`。
 */
export function MapProvider() {
  const mapEngineReady = useMapEngineReady()

  useEffect(() => {
    if (import.meta.env.VITE_MAP_ENGINE_READY === 'true') {
      markMapSdkMounted()
    }
  }, [])

  return (
    <>
      <div
        id={MAP_CANVAS_MOUNT_ID}
        className="workspace-map-canvas-host absolute inset-0 z-0"
        data-map-canvas-host=""
        aria-hidden={mapEngineReady}
      />
      <MapPlaceholder />
    </>
  )
}
