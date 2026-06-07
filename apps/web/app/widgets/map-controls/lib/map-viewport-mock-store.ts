import { create } from 'zustand'

import { MAP_CONTROL_ZOOM } from './map-controls-mock'

interface MockMapViewportState {
  zoom: number
  bearing: number
  setZoom: (zoom: number) => void
  nudgeZoom: (delta: number) => void
  setBearing: (bearing: number) => void
  resetView: () => void
}

function clampZoom(zoom: number) {
  return Math.min(MAP_CONTROL_ZOOM.max, Math.max(MAP_CONTROL_ZOOM.min, zoom))
}

export const useMockMapViewportStore = create<MockMapViewportState>((set, get) => ({
  zoom: MAP_CONTROL_ZOOM.default,
  bearing: 24,
  setZoom: (zoom) => set({ zoom: clampZoom(zoom) }),
  nudgeZoom: (delta) => set({ zoom: clampZoom(get().zoom + delta) }),
  setBearing: (bearing) => set({ bearing: ((bearing % 360) + 360) % 360 }),
  resetView: () => set({ zoom: MAP_CONTROL_ZOOM.default, bearing: 0 }),
}))
