import { create } from 'zustand'

import {
  MOCK_MAP_CONTROL_LEGEND_ITEMS,
  type MapControlLegendItem,
} from './map-control-legend'

interface MapControlLegendState {
  items: MapControlLegendItem[]
  setItems: (items: MapControlLegendItem[]) => void
  upsertItem: (item: MapControlLegendItem) => void
  removeItem: (id: string) => void
  reorderItems: (activeId: string, overId: string) => void
  resetItems: () => void
}

export const useMapControlLegendStore = create<MapControlLegendState>((set, get) => ({
  items: MOCK_MAP_CONTROL_LEGEND_ITEMS,
  setItems: (items) => set({ items }),
  upsertItem: (item) => {
    const items = get().items
    const index = items.findIndex((entry) => entry.id === item.id)
    if (index === -1) {
      set({ items: [...items, item] })
      return
    }
    const next = items.slice()
    next[index] = item
    set({ items: next })
  },
  removeItem: (id) => set({ items: get().items.filter((entry) => entry.id !== id) }),
  reorderItems: (activeId, overId) => {
    const items = get().items
    const oldIndex = items.findIndex((entry) => entry.id === activeId)
    const newIndex = items.findIndex((entry) => entry.id === overId)
    if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) {
      return
    }

    const next = items.slice()
    const [item] = next.splice(oldIndex, 1)
    next.splice(newIndex, 0, item)
    set({ items: next })
  },
  resetItems: () => set({ items: MOCK_MAP_CONTROL_LEGEND_ITEMS }),
}))
