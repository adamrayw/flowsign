import Link from 'next/link'

const footerLinks = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '/#features' },
      { label: 'Sign Document', href: '/dashboard/sign' },
      { label: 'Documents', href: '/dashboard/documents' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'Contact', href: '/contact' },
      { label: 'Privacy', href: '/privacy' },
      { label: 'Terms', href: '/terms' },
    ],
  },
]

export function Footer() {
  return (
    <footer className="bg-card border-t border-border/50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10 grid gap-8 md:grid-cols-[1fr_auto_auto]">
          <div className="max-w-sm">
            <div className="mb-3 flex items-center gap-2">
              <img
                src="/flowsign-logo.png"
                alt="FlowSign logo"
                className="h-7 w-7 rounded object-cover"
              />
              <span className="font-bold text-foreground">FlowSign</span>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Fast, local-first PDF signing for teams and professionals.
            </p>
            <p className="mt-3 text-xs text-muted-foreground">A Product by RayTech</p>
          </div>

          {footerLinks.map((group) => (
            <div key={group.title}>
              <h3 className="mb-3 font-semibold text-foreground">{group.title}</h3>
              <ul className="space-y-2">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-border/50 pt-6 text-sm text-muted-foreground">
          © 2024 RayTech. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
