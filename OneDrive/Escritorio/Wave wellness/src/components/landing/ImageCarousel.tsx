'use client'

import { useState, useRef, useEffect } from 'react'

export function ImageCarousel() {
  const [activeIndex, setActiveIndex] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  const images = [
    "/images/Galeria/1.jpeg",
    "/images/Galeria/2.jpeg",
    "/images/Galeria/3.jpeg",
    "/images/Galeria/4.jpeg",
    "/images/Galeria/5.jpeg",
    "/images/Galeria/6.jpeg",
    "/images/Galeria/7.jpeg",
    "/images/Galeria/8.jpeg",
  ]

  useEffect(() => {
    const handleScroll = () => {
      if (scrollRef.current) {
        const { scrollLeft, offsetWidth } = scrollRef.current
        const index = Math.round(scrollLeft / (offsetWidth * 0.75)) // 0.75 matches the w-[75%]
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
    <section className="mb-16">
      <div 
        ref={scrollRef}
        className="flex overflow-x-auto gap-4 px-6 no-scrollbar snap-x snap-mandatory scroll-smooth"
      >
        {images.map((src, index) => (
          <div key={index} className="flex-none w-[75%] md:w-[45%] lg:w-[30%] snap-center">
            <div 
              className="aspect-[4/5] rounded-[30px] bg-cover bg-center shadow-sm overflow-hidden bg-slate-200" 
              style={{ backgroundImage: `url("${src}")` }}
            ></div>
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-1.5 mt-6">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollToImage(index)}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
              index === activeIndex ? 'bg-black w-4' : 'bg-black/20'
            }`}
            aria-label={`Go to image ${index + 1}`}
          />
        ))}
      </div>
    </section>
  )
}
