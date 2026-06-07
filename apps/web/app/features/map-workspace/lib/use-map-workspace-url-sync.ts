import { useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router'

import {
  parseWorkspaceUrl,
  selectWorkspaceLocation,
  selectWorkspaceUrlState,
  workspaceLocationsEqual,
  workspaceUrlStatesEqual,
} from './workspace-url'
import { useMapWorkspaceStore } from '../model/workspace-store'

/**
 * 地图工作台 ↔ URL（子路由 + query）双向同步
 *
 * Path 约定（侧栏模块全局互斥，pathname 仅反映当前模块）：
 * - /data/:moduleId — 图层 / 分析模块
 * - /uav/:moduleId — 机库模块
 * - /ops/:moduleId — 运营模块
 *
 * Query 约定：
 * - tool / variant / panels — 地图工具
 * - dataDock=collapsed — 数据段模块收起（pathname 为 /data/...）
 * - dock=collapsed — 非数据段模块收起
 */
export function useMapWorkspaceUrlSync() {
  const location = useLocation()
  const navigate = useNavigate()
  const applyingFromUrl = useRef(false)

  useEffect(() => {
    applyingFromUrl.current = true
    const parsed = parseWorkspaceUrl(
      new URLSearchParams(location.search),
      location.pathname,
    )
    useMapWorkspaceStore.getState().applyFromUrl(parsed)
    applyingFromUrl.current = false
  }, [location.pathname, location.search])

  useEffect(() => {
    let prevUrlState = selectWorkspaceUrlState(useMapWorkspaceStore.getState())

    return useMapWorkspaceStore.subscribe((state) => {
      if (applyingFromUrl.current) return

      const urlState = selectWorkspaceUrlState(state)
      if (workspaceUrlStatesEqual(urlState, prevUrlState)) return
      prevUrlState = urlState

      const next = selectWorkspaceLocation(state)
      const current = {
        pathname: window.location.pathname,
        searchParams: new URLSearchParams(window.location.search),
      }
      if (workspaceLocationsEqual(next, current)) return

      const search = next.searchParams.toString()
      void navigate(
        { pathname: next.pathname, search: search ? `?${search}` : '' },
        { replace: true },
      )
    })
  }, [navigate])
}
