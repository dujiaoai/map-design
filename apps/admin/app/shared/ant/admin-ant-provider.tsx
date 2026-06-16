import { App, ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { useMemo } from 'react'

import { useTheme } from '~/features/theme'

import { getAdminAntTheme } from './admin-ant-theme'
import './admin-ant.css'

export function AdminAntProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme()
  const antTheme = useMemo(() => getAdminAntTheme(theme), [theme])

  return (
    <ConfigProvider locale={zhCN} theme={antTheme}>
      <div className="admin-ant-root contents">
        <App notification={{ placement: 'topRight' }} message={{ maxCount: 3 }}>
          {children}
        </App>
      </div>
    </ConfigProvider>
  )
}
