'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export function FloatingCTA() {
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  useEffect(() => {
    const controlNavbar = () => {
      if (typeof window !== 'undefined') {
        if (window.scrollY > lastScrollY && window.scrollY > 100) {
          // Scrolling down
          setIsVisible(false)
        } else {
          // Scrolling up
          setIsVisible(true)
        }
        setLastScrollY(window.scrollY)
      }
    }

    window.addEventListener('scroll', controlNavbar)
    return () => {
      window.removeEventListener('scroll', controlNavbar)
    }
  }, [lastScrollY])

  return (
    <div 
      className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-50 w-full px-6 flex justify-center transition-all duration-500 ease-in-out ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'
      }`}
    >
      <Link href="/auth/register" className="w-full max-w-xs">
        <button className="w-full bg-[#BFA58E] text-white text-[11px] font-bold tracking-[0.3em] uppercase py-5 px-12 rounded-full shadow-[0_15px_40px_rgba(191,165,142,0.3)] border border-white/20 active:scale-95 transition-all hover:bg-[#A68B6F] hover:shadow-[0_20px_50px_rgba(191,165,142,0.4)] hover:-translate-y-1">
          Inscribirse
        </button>
      </Link>
    </div>
  )
}
