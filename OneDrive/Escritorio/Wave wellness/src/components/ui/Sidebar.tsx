'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import type { Role } from '@/lib/auth/roles'
import { cn } from '@/lib/utils'

interface SidebarProps {
  role: Role
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname()

  const links = {
    student: [
      { href: '/student', label: 'Dashboard' },
      { href: '/student/payments', label: 'Pagos' },
    ],
    coach: [
      { href: '/coach', label: 'Dashboard' },
    ],
    admin: [
      { href: '/admin', label: 'Paquetes' },
      { href: '/admin/payments', label: 'Pagos' },
    ],
  }

  const roleLinks = links[role] || []

  return (
    <aside className="hidden md:block w-64 bg-white border-r border-border h-screen fixed left-0 top-0 p-6">
      <h2 className="text-xl font-bold text-ocean mb-6">Wave Wellness</h2>
      <nav className="space-y-2">
        {roleLinks.map((link) => {
          const isActive = pathname === link.href || pathname.startsWith(link.href + '/')
          
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "block px-4 py-3 text-base rounded-md transition-colors min-h-[48px] flex items-center",
                isActive
                  ? "bg-primary text-primary-foreground font-medium"
                  : "text-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              {link.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
