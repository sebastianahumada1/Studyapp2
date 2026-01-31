import Image from 'next/image'

export function RulesSection() {
  const rules = [
    {
      title: "1. Puntualidad",
      items: [
        "Te invitamos a llegar mínimo 5 minutos antes de tu clase.",
        "En caso de retraso, la clase comenzará desde el minuto en el que llegues, sin posibilidad de extender el tiempo perdido.",
        "El tiempo de retraso no será recuperable ni reprogramable."
      ]
    },
    {
      title: "2. Inicio de la Clase",
      items: [
        "Para no afectar el ritmo de la sesión ni a otros clientes, una vez iniciada la clase esta continuará según el horario establecido.",
        "Si el retraso compromete la seguridad del entrenamiento, el instructor podrá negar el ingreso sin derecho a reposición."
      ]
    },
    {
      title: "3. Higiene y Cuidado del Espacio",
      items: [
        "Al finalizar la clase, cada cliente debe limpiar su cama de pilates utilizando los pañitos húmedos desinfectantes dispuestos en el estudio.",
        "Este cuidado es parte del bienestar y respeto por los demás usuarios."
      ]
    },
    {
      title: "4. Vestimenta Obligatoria",
      items: [
        "Las clases se realizan únicamente con medias antideslizantes, por motivos de seguridad e higiene.",
        "En caso de no contar con ellas, puedes adquirirlas directamente en Wave Pilates."
      ]
    }
  ]

  return (
    <section className="px-8 mb-32 max-w-md mx-auto text-center">
      <div className="mb-12">
        <h3 className="serif-title text-4xl text-black/80 uppercase tracking-[0.1em] mb-6">Reglamento</h3>
        <div className="flex flex-col items-center gap-2 mb-8">
          <Image 
            src="/images/wave-logo-isotipo.png" 
            alt="Wave Isotipo" 
            width={60} 
            height={40} 
            className="h-10 w-auto object-contain opacity-40"
          />
          <span className="text-black/30 text-[10px] tracking-[0.5em] uppercase font-light">WAVE</span>
        </div>
        
        <p className="text-[11px] text-black/60 leading-relaxed italic mb-12 px-4">
          En Wave Pilates queremos brindarte una experiencia fluida, segura y de alta calidad. Para lograrlo, te pedimos tener en cuenta las siguientes reglas y recomendaciones:
        </p>
      </div>

      <div className="space-y-10 text-left px-2">
        {rules.map((section, index) => (
          <div key={index} className="space-y-4">
            <h4 className="text-xs font-semibold text-black/70 uppercase tracking-widest border-b border-black/5 pb-2">
              {section.title}
            </h4>
            <ul className="space-y-3">
              {section.items.map((item, i) => (
                <li key={i} className="flex gap-3">
                  <span className="text-black/20 text-[10px] mt-1.5">•</span>
                  <p className="text-[11px] text-black/60 leading-relaxed font-light">
                    {item}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-16 pt-8 border-t border-black/5 space-y-4">
        <p className="text-[10px] text-black/40 italic leading-relaxed px-6">
          Nota: El cumplimiento de estas normas garantiza una mejor experiencia para todos. Al asistir a clase, el cliente acepta y respeta las reglas del estudio.
        </p>
        <div className="flex justify-center opacity-20 grayscale">
          <Image 
            src="/images/wave-logo-isotipo.png" 
            alt="Wave Isotipo Small" 
            width={30} 
            height={30} 
            className="h-6 w-auto object-contain"
          />
        </div>
      </div>
    </section>
  )
}
