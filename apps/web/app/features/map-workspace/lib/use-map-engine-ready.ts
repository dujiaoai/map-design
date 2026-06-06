import { useSyncExternalStore } from 'react'

import { isMapEngineReady } from './map-plugin-bridge'

function subscribe(onStoreChange: () => void) {
  window.addEventListener('map-engine-ready', onStoreChange)
  return () => window.removeEventListener('map-engine-ready', onStoreChange)
}

function getSnapshot() {
  return isMapEngineReady()
}

function getServerSnapshot() {
  return false
}

export function useMapEngineReady(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
