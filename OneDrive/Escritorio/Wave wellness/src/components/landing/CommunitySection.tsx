'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'

export function CommunitySection() {
  const [activeIndex, setActiveIndex] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  const images = [
    "/images/girls/1.jpeg",
    "/images/girls/2.jpeg",
    "/images/girls/3.jpeg",
    "/images/girls/4.jpeg",
    "/images/girls/5.jpeg",
    "/images/girls/6.jpeg",
    "/images/girls/7.jpeg",
    "/images/girls/8.jpeg",
    "/images/girls/9.jpeg",
    "/images/girls/10.jpeg",
    "/images/girls/11.jpeg",
    "/images/girls/12.jpeg",
    "/images/girls/13.jpeg",
  ]

  useEffect(() => {
    const handleScroll = () => {
      if (scrollRef.current) {
        const { scrollLeft, offsetWidth } = scrollRef.current
        const index = Math.round(scrollLeft / (offsetWidth * 0.75))
        setActiveIndex(index)
      }
    }

    const scrollContainer = scrollRef.current
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll)
    }

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', handleScroll)
      }
    }
  }, [])

  const scrollToImage = (index: number) => {
    if (scrollRef.current) {
      const { offsetWidth } = scrollRef.current
      scrollRef.current.scrollTo({
        left: index * (offsetWidth * 0.75),
        behavior: 'smooth'
      })
    }
  }

  return (
    <section className="mb-32 px-6">
      <div className="bg-gradient-to-br from-white via-[#FDFCFB] to-[#F5F3F0] border border-white/80 rounded-[50px] pt-20 pb-12 text-center relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
        {/* Decorative elements */}
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-skyblue/30 rounded-full blur-[100px] opacity-60"></div>
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-ocean-blue/5 rounded-full blur-[100px] opacity-40"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.8)_0%,transparent_100%)] pointer-events-none"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="max-w-md mx-auto px-6 mb-12">
            <span className="text-black/40 text-[11px] tracking-[0.5em] uppercase font-bold mb-8 block">Comunidad</span>
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="flex-none">
                <Image 
                  src="/images/wave-logo.png" 
                  alt="Wave Logo" 
                  width={80} 
                  height={30} 
                  className="h-8 md:h-10 w-auto object-contain"
                />
              </div>
              <h3 className="serif-title text-4xl md:text-5xl text-black italic leading-tight">Girls</h3>
            </div>
            <div className="w-12 h-px bg-black/10 mx-auto mb-10"></div>
            
            <p className="serif-title text-2xl md:text-3xl text-black/80 font-light italic leading-relaxed mb-8">
              "Wave is a safe space"
            </p>
            
            <p className="text-base text-black/60 font-light mb-10 leading-relaxed">
              Un espacio diseñado para que te sientas libre, fuerte y conectada con tu propia esencia. Únete a nuestro flujo.
            </p>
          </div>

          <div className="relative mt-4">
            <div 
              ref={scrollRef}
              className="flex overflow-x-auto gap-4 px-10 no-scrollbar snap-x snap-mandatory scroll-smooth"
            >
              {images.map((src, index) => (
                <div key={index} className="flex-none w-[70%] md:w-[40%] lg:w-[25%] snap-center">
                  <div 
                    className="aspect-[4/5] rounded-[30px] bg-cover bg-center shadow-md overflow-hidden bg-slate-200" 
                    style={{ backgroundImage: `url("${src}")` }}
                  ></div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-center gap-1.5 mt-8 px-10 overflow-x-auto no-scrollbar py-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => scrollToImage(index)}
                  className={`flex-none w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                    index === activeIndex ? 'bg-black w-4' : 'bg-black/20'
                  }`}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          </div>

          <div className="mt-12">
            <a 
              href="https://www.instagram.com/wave.pilatesclub/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-black text-white px-8 py-4 rounded-full text-sm font-medium hover:bg-black/80 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95"
            >
              <svg 
                className="w-5 h-5" 
                fill="currentColor" 
                viewBox="0 0 24 24"
              >
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              Seguir en Instagram
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
