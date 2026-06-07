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
        <img
          src="/flowsign-logo.png"
          alt="FlowSign logo"
          className="h-8 w-8 rounded-lg object-cover"
        />
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

    </aside>
  )
}
