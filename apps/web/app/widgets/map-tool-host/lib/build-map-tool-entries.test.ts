import { describe, expect, it } from 'vitest'

import {
  buildMapToolEntries,
  groupMapToolEntriesByPlacement,
  partitionMapToolEntries,
} from './build-map-tool-entries'

describe('buildMapToolEntries', () => {
  it('renders active map tool on correct placement', () => {
    const entries = buildMapToolEntries({
      activeMapTool: {
        navItemId: 'tool-draw-line',
        toolId: 'measure-distance',
        pluginToolId: 'measure-distance-plugin',
        variant: { drawLine: true },
        variantKey: 'drawLine',
      },
      activePanelTools: [],
    })
    const { left } = groupMapToolEntriesByPlacement(entries)
    expect(left).toHaveLength(1)
    expect(left[0]?.title).toBe('绘线')
    expect(left[0]?.variantKey).toBe('drawLine')
    expect(left[0]?.presentation).toBe('movable-panel')
  })

  it('partitions movable vs anchor presentations', () => {
    const entries = buildMapToolEntries({
      activeMapTool: {
        navItemId: 'tool-measure-distance',
        toolId: 'measure-distance',
        pluginToolId: 'measure-distance-plugin',
      },
      activePanelTools: [],
    })
    const { movable, anchorByPlacement } = partitionMapToolEntries(entries)
    expect(movable).toHaveLength(1)
    expect(anchorByPlacement.left).toHaveLength(0)
  })

  it('places locate tool on the right', () => {
    const entries = buildMapToolEntries({
      activeMapTool: {
        navItemId: 'tool-locate-point',
        toolId: 'locate-point',
        pluginToolId: 'locate-map-point-plugin',
      },
      activePanelTools: [],
    })
    const grouped = groupMapToolEntriesByPlacement(entries)
    expect(grouped.right.map((e) => e.toolId)).toEqual(['locate-point'])
    expect(grouped.left).toHaveLength(0)
  })

  it('places pick-point tool on the right (legacy panel alignment)', () => {
    const entries = buildMapToolEntries({
      activeMapTool: {
        navItemId: 'tool-pick-point',
        toolId: 'pick-point',
        pluginToolId: 'pick-map-point-plugin',
      },
      activePanelTools: [],
    })
    const grouped = groupMapToolEntriesByPlacement(entries)
    expect(grouped.right.map((e) => e.toolId)).toEqual(['pick-point'])
    expect(grouped.left).toHaveLength(0)
  })

  it('includes parallel panel tools alongside active map tool', () => {
    const entries = buildMapToolEntries({
      activeMapTool: {
        navItemId: 'tool-measure-distance',
        toolId: 'measure-distance',
        pluginToolId: 'measure-distance-plugin',
      },
      activePanelTools: [{ navItemId: 'tool-hd-image-compare', toolId: 'hd-image-compare' }],
    })
    expect(entries.map((e) => e.toolId).sort()).toEqual(['hd-image-compare', 'measure-distance'])
  })
})
