import { Button } from '@repo/ui'
import { Link } from 'react-router'

export default function NotFoundRoute() {
  return (
    <main className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-2xl font-semibold">404</h1>
      <p className="text-muted-foreground text-sm">找不到请求的页面。</p>
      <Button nativeButton={false} render={<Link to="/" />} variant="secondary">
        返回首页
      </Button>
    </main>
  )
}
