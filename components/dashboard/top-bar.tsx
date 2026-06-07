import type { RayTechUser } from '@/lib/raytech-auth'

type TopBarProps = {
  user: RayTechUser
  logoutUrl: string
}

export function TopBar({ user, logoutUrl }: TopBarProps) {
  return (
    <header className="fixed top-0 right-0 left-64 h-16 bg-background border-b border-border flex items-center justify-between px-8 z-40">
      <div>
        <h1 className="text-xl font-bold text-foreground">Welcome to FlowSign</h1>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-semibold text-foreground">{user.name}</p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
        </div>
        <a
          href={logoutUrl}
          className="rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-card/80"
        >
          Sign out
        </a>
      </div>
    </header>
  )
}
