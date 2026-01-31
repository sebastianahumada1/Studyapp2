'use client'

import Link from 'next/link'
import Image from 'next/image'

export function LandingNavbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background-light/80 backdrop-blur-md px-6 py-7 grid grid-cols-3 items-center border-b border-primary/5">
      <div className="flex items-center gap-4">
        <button className="flex items-center justify-center">
          <span className="material-icons-outlined text-black font-light" style={{ fontSize: '32px' }}>menu</span>
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
  )
}
