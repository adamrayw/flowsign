'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function Sidebar() {
  const pathname = usePathname()

  const isActive = (href: string) => pathname === href

  const navItems = [
    { href: '/dashboard', label: 'Home', icon: '🏠' },
    { href: '/dashboard/sign', label: 'Sign Document', icon: '✍️' },
    { href: '/dashboard/documents', label: 'Documents', icon: '📋' },
  ]

  return (
    <aside className="w-64 bg-card border-r border-border h-screen overflow-y-auto fixed left-0 top-0 pt-4">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 px-6 mb-12">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
          <span className="text-white font-bold text-sm">FS</span>
        </div>
        <span className="font-bold text-lg text-foreground">FlowSign</span>
      </Link>

      {/* Navigation */}
      <nav className="space-y-2 px-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              isActive(item.href)
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-card/80 hover:text-foreground'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Footer section */}
      <div className="absolute bottom-6 left-0 right-0 px-4 py-4 border-t border-border/50">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-card/80 transition-all text-left">
          <span className="text-lg">⚙️</span>
          <span className="font-medium">Settings</span>
        </button>
      </div>
    </aside>
  )
}
