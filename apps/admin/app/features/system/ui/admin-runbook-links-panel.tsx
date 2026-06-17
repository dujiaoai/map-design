import { Button } from '@repo/ui'
import { ArrowUpRightIcon, BookOpenIcon, ExternalLinkIcon } from 'lucide-react'
import { Link } from 'react-router'

import {
  ADMIN_RUNBOOK_LINKS,
  resolveRunbookDocsHref,
} from '~/features/system/lib/admin-runbook-links'
import { AdminPanel, AdminPanelHeader } from '~/shared/ui/admin-page-shell'

export function AdminRunbookLinksPanel() {
  const docsBaseConfigured = Boolean(
    (import.meta.env.VITE_DOCS_REPO_BROWSE_URL as string | undefined)?.trim(),
  )

  return (
    <AdminPanel className="admin-stagger">
      <AdminPanelHeader
        icon={BookOpenIcon}
        title="Runbook 索引"
        description={
          docsBaseConfigured
            ? '仓库运维文档与 Admin 内相关入口'
            : '仓库内路径引用；配置 VITE_DOCS_REPO_BROWSE_URL 后可外链打开 Git 文档'
        }
      />
      <ul className="divide-y divide-border/50">
        {ADMIN_RUNBOOK_LINKS.map((item) => {
          const docsHref = resolveRunbookDocsHref(item.path)
          return (
            <li key={item.id} className="admin-runbook-row px-4 py-3.5 md:px-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="mt-0.5 font-mono text-xs text-primary/80">{item.path}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{item.hint}</p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  {item.inAppTo ? (
                    <Button
                      nativeButton={false}
                      variant="outline"
                      size="sm"
                      render={<Link to={item.inAppTo} />}
                    >
                      Admin 入口
                      <ArrowUpRightIcon className="size-3.5" aria-hidden />
                    </Button>
                  ) : null}
                  {docsHref ? (
                    <Button
                      nativeButton={false}
                      variant="outline"
                      size="sm"
                      render={
                        <a href={docsHref} target="_blank" rel="noopener noreferrer" />
                      }
                    >
                      打开文档
                      <ExternalLinkIcon className="size-3.5" aria-hidden />
                    </Button>
                  ) : null}
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </AdminPanel>
  )
}
