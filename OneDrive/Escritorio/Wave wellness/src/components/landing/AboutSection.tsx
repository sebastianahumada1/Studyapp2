import Image from 'next/image'

export function AboutSection() {
  return (
    <section id="nosotros" className="px-6 mb-32 max-w-screen-sm mx-auto text-center scroll-mt-32">
      <div className="flex justify-center mb-10">
        <Image 
          src="/images/wave-logo-isotipo.png" 
          alt="Wave Isotipo" 
          width={78} 
          height={78} 
          className="h-16 w-auto object-contain"
        />
      </div>
      <span className="text-black/60 text-[10px] tracking-[0.4em] uppercase font-semibold mb-6 block">Nuestra Esencia</span>
      <h3 className="serif-title text-3xl text-black mb-8 italic">Sobre Wave</h3>
      <p className="text-black/80 leading-relaxed font-light mb-6">
      En Wave, transformamos el entrenamiento tradicional en un espacio de movimiento  <span className="italic">consciente</span>. Inspirados en la fluidez del agua, nuestro propósito es el equilibrio integral:
      </p>
      <p className="text-black/80 leading-relaxed font-light">
      Fortalecer el cuerpo mientras nutrimos el alma y liberamos la mente. No solo vienes a ejercitarte, vienes a fluir, renovarte y transformarte.      </p>
    </section>
  )
}
