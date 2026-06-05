import { useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router'

import {
  mergeWorkspaceSearchParams,
  parseWorkspaceUrl,
  searchParamsEqual,
  selectWorkspaceUrlState,
  workspaceUrlStatesEqual,
} from './workspace-url'
import { useMapWorkspaceStore } from '../model/workspace-store'

/**
 * 地图工作台 ↔ URL query 双向同步
 *
 * Query 约定：
 * - tool: 当前地图工具 toolId（互斥；导入同为 tool=import-file）
 * - variant: drawLine | drawSurface（区分测距/绘线、测面/绘面）
 * - panels: 逗号分隔的 panel 工具 toolId（可多开）
 * - uav: 当前机库子模块 moduleId（组内互斥，与 tool/module 不互斥）
 * - uavDock=collapsed: 机库 Dock 收起（需配合 uav）
 * - module: 当前地图业务 moduleId
 * - dock=collapsed: 业务 Dock 收起（需配合 module）
 */
export function useMapWorkspaceUrlSync() {
  const [searchParams, setSearchParams] = useSearchParams()
  const applyingFromUrl = useRef(false)

  useEffect(() => {
    applyingFromUrl.current = true
    const parsed = parseWorkspaceUrl(searchParams)
    const current = selectWorkspaceUrlState(useMapWorkspaceStore.getState())

    if (!workspaceUrlStatesEqual(parsed, current)) {
      useMapWorkspaceStore.getState().applyFromUrl(parsed)
    }

    applyingFromUrl.current = false
  }, [searchParams])

  useEffect(() => {
    return useMapWorkspaceStore.subscribe((state, prevState) => {
      if (applyingFromUrl.current) return

      const next = selectWorkspaceUrlState(state)
      const prev = selectWorkspaceUrlState(prevState)
      if (workspaceUrlStatesEqual(next, prev)) return

      const currentParams = new URLSearchParams(window.location.search)
      const nextParams = mergeWorkspaceSearchParams(currentParams, next)
      if (searchParamsEqual(nextParams, currentParams)) return

      setSearchParams(nextParams, { replace: true })
    })
  }, [setSearchParams])
}
