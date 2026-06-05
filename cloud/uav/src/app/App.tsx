import { AppProvider } from '@/app/providers/AppProvider'
import { DockDashboardPage } from '@/pages/dock-dashboard/ui/DockDashboardPage'

export default function App() {
  return (
    <AppProvider>
      <DockDashboardPage />
    </AppProvider>
  )
}
