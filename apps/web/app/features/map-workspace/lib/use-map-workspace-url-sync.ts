import { useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router'

import {
  parseWorkspaceUrl,
  selectWorkspaceLocation,
  workspaceLocationsEqual,
} from './workspace-url'
import { useMapWorkspaceStore } from '../model/workspace-store'

/**
 * 地图工作台 ↔ URL（子路由 + query）双向同步
 *
 * Path 约定（模块子路由，非数据段全局互斥）：
 * - /data/:moduleId — 数据段业务模块
 * - /uav/:moduleId — 机库模块
 * - /ops/:moduleId — 运营模块
 * - /panorama/:moduleId — 全景模块
 *
 * Query 约定：
 * - tool / variant / panels — 地图工具（同前）
 * - data — 与非数据子路由并存时的数据段 moduleId
 * - dataDock=collapsed — 数据段 Dock 收起
 * - dock=collapsed — 非数据段 Dock 收起
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
    return useMapWorkspaceStore.subscribe((state) => {
      if (applyingFromUrl.current) return

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
