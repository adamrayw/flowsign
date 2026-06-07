import { Sidebar } from '@/components/dashboard/sidebar'
import { TopBar } from '@/components/dashboard/top-bar'
import {
  buildRayTechLogoutUrl,
  getRequestOrigin,
  requireRayTechUser,
} from '@/lib/raytech-auth'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireRayTechUser('/dashboard')
  const origin = await getRequestOrigin()
  const logoutUrl = buildRayTechLogoutUrl(origin)

  return (
    <div className="flex bg-background min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-64">
        <TopBar user={user} logoutUrl={logoutUrl} />
        <div className="pt-20 px-8 pb-8">
          {children}
        </div>
      </main>
    </div>
  )
}
