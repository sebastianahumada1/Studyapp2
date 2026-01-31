import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from '@/components/ui/base/toaster'

export const metadata: Metadata = {
  title: 'Wave Wellness',
  description: 'Wellness platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
