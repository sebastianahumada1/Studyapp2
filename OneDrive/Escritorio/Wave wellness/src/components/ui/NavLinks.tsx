'use client'

import Link from 'next/link'
import type { Role } from '@/lib/auth/roles'

interface NavLinksProps {
  role: Role
}

export function NavLinks({ role }: NavLinksProps) {
  const links = {
    student: [
      { href: '/student', label: 'Dashboard' },
      { href: '/student/payments', label: 'Pagos' },
      { href: '/student/book', label: 'Agendar' },
      { href: '/student/bookings', label: 'Mis Reservas' },
    ],
    coach: [
      { href: '/coach', label: 'Dashboard' },
      { href: '/coach/availability', label: 'Disponibilidad' },
      { href: '/coach/schedule', label: 'Agenda' },
    ],
    admin: [
      { href: '/admin', label: 'Dashboard' },
      { href: '/admin/packages', label: 'Paquetes' },
      { href: '/admin/payments', label: 'Pagos' },
      { href: '/admin/classes', label: 'Clases' },
    ],
  }

  const roleLinks = links[role] || []

  return (
    <nav className="space-y-2">
      {roleLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="block px-4 py-2 text-earth-dark hover:bg-background-dark rounded transition-colors"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  )
}
