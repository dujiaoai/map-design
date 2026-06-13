import { AdminEmptyState, AdminPageHeader, AdminPanel } from '~/shared/ui/admin-page-shell'

export function AdminComingSoonPage({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="space-y-6">
      <AdminPageHeader title={title} description={description} />
      <AdminPanel>
        <AdminEmptyState message="功能规划中，将于后续版本交付。" />
      </AdminPanel>
    </div>
  )
}
