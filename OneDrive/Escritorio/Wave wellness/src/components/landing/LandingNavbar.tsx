'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { X, Menu } from 'lucide-react'
import { cn } from '@/lib/utils'

export function LandingNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const menuItems = [
    { name: 'Inicio', href: '#' },
    { name: 'Nosotros', href: '#nosotros' },
    { name: 'Comunidad', href: '#comunidad' },
    { name: 'Horarios', href: '#horarios' },
    { name: 'Precios', href: '#precios' },
    { name: 'Reglas', href: '#reglas' },
  ]

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background-light/80 backdrop-blur-md px-6 py-7 grid grid-cols-3 items-center border-b border-primary/5">
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleMenu}
            className="flex items-center justify-center text-black hover:opacity-70 transition-opacity"
          >
            {isMenuOpen ? (
              <X className="h-8 w-8 font-light" />
            ) : (
              <Menu className="h-8 w-8 font-light" />
            )}
          </button>
        </div>
        
        <div className="flex justify-center">
          <Link href="/" className="flex items-center">
            <Image 
              src="/images/wave-logo-completo.png" 
              alt="Wave Wellness Logo" 
              width={264} 
              height={88} 
              className="h-16 md:h-20 w-auto object-contain"
              priority
            />
          </Link>
        </div>

        <div className="flex justify-end">
          <Link href="/auth/login" className="flex items-center justify-center text-black hover:opacity-70 transition-opacity">
            <span className="material-icons-outlined font-light" style={{ fontSize: '32px' }}>person_outline</span>
          </Link>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div 
        className={cn(
          "fixed inset-0 z-40 bg-background-light/95 backdrop-blur-lg transition-all duration-500 ease-in-out flex flex-col items-center justify-center",
          isMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      >
        <div className="flex flex-col items-center gap-8">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setIsMenuOpen(false)}
              className="serif-title text-4xl text-[#0A517F] hover:italic transition-all duration-300"
            >
              {item.name}
            </Link>
          ))}
          
          <Link 
            href="/auth/login"
            onClick={() => setIsMenuOpen(false)}
            className="mt-8 px-10 py-4 bg-[#BFA58E] text-white font-bold tracking-[0.3em] text-[11px] uppercase rounded-full shadow-lg hover:bg-[#A68B6F] transition-all"
          >
            INICIAR SESIÓN
          </Link>
        </div>

        {/* Decorative elements */}
        <div className="absolute bottom-12 opacity-20">
          <Image 
            src="/images/wave-logo-isotipo.png" 
            alt="Wave Isotipo" 
            width={60} 
            height={60} 
            className="animate-pulse"
          />
        </div>
      </div>
    </>
  )
}
