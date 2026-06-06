import { Sidebar } from '@/components/dashboard/sidebar'
import { TopBar } from '@/components/dashboard/top-bar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex bg-background min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-64">
        <TopBar />
        <div className="pt-20 px-8 pb-8">
          {children}
        </div>
      </main>
    </div>
  )
}
