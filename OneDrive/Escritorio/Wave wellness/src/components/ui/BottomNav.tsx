'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, CreditCard, Package, FileText, Calendar, Clock, BookOpen, Users, ListChecks } from 'lucide-react'
import type { Role } from '@/lib/auth/roles'
import { cn } from '@/lib/utils'

interface BottomNavProps {
  role: Role
}

export function BottomNav({ role }: BottomNavProps) {
  const pathname = usePathname()

  const links = {
    student: [
      { href: '/student', label: 'Dashboard', icon: Home },
      { href: '/student/payments', label: 'Pagos', icon: CreditCard },
      { href: '/student/book', label: 'Agendar', icon: BookOpen },
      { href: '/student/bookings', label: 'Reservas', icon: ListChecks },
    ],
    coach: [
      { href: '/coach', label: 'Dashboard', icon: Home },
      { href: '/coach/availability', label: 'Disponibilidad', icon: Clock },
      { href: '/coach/schedule', label: 'Agenda', icon: Calendar },
    ],
    admin: [
      { href: '/admin/packages', label: 'Paquetes', icon: Package },
      { href: '/admin/payments', label: 'Pagos', icon: FileText },
      { href: '/admin/classes', label: 'Clases', icon: Users },
    ],
  }

  const roleLinks = links[role] || []

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-border z-50 md:hidden">
      <div className="flex items-center justify-around h-16">
        {roleLinks.map((link) => {
          const Icon = link.icon
          const isActive = pathname === link.href || pathname.startsWith(link.href + '/')
          
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 min-w-[80px] h-16 px-4 transition-colors",
                isActive
                  ? "text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-6 w-6" />
              <span className="text-xs font-medium">{link.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
