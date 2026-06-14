import { Button, cn } from '@repo/ui'
import { MapIcon } from 'lucide-react'
import { Link, NavLink, Outlet } from 'react-router'

import { webLoginUrl, webRegisterPersonalUrl } from '~/shared/config/web-app-url'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'text-sm transition-colors',
    isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
  )

export default function MarketingLayout() {
  return (
    <div className="bg-background text-foreground relative flex min-h-svh flex-col">
      <header className="border-border/60 bg-background/80 sticky top-0 z-20 border-b backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link to="/" className="marketing-display flex items-center gap-2 font-semibold tracking-tight">
            <MapIcon className="text-primary size-5" />
            云眼地图
          </Link>
          <nav className="hidden items-center gap-6 sm:flex">
            <NavLink to="/" end className={navLinkClass}>
              首页
            </NavLink>
            <NavLink to="/pricing" className={navLinkClass}>
              定价
            </NavLink>
          </nav>
          <div className="flex items-center gap-2">
            <Button nativeButton={false} variant="ghost" size="sm" render={<a href={webLoginUrl()} />}>
              登录
            </Button>
            <Button nativeButton={false} size="sm" render={<a href={webRegisterPersonalUrl()} />}>
              免费注册
            </Button>
          </div>
        </div>
      </header>

      <Outlet />

      <footer className="border-border/60 text-muted-foreground mt-auto border-t px-4 py-8 text-sm sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} 云眼地图 · 积分按用户个人账户计费</p>
          <p>
            企业批量采购请{' '}
            <a className="text-primary hover:underline" href="mailto:sales@yunyan.local">
              联系销售
            </a>{' '}
            或咨询对公转账方案
          </p>
        </div>
      </footer>
    </div>
  )
}
