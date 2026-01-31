export function PriceList() {
  const reformerPlans = [
    { name: "Clase Individual", price: "70.000" },
    { name: "Cuatro Clases", price: "250.000" },
    { name: "Diez Clases", price: "500.000" },
    { name: "Treinta Clases", price: "700.000", popular: true },
  ]

  const hotPilatesPlans = [
    { name: "Clase Individual", price: "50.000" },
    { name: "Cuatro Clases", price: "180.000" },
  ]

  return (
    <section className="px-8 mb-32 max-w-md mx-auto">
      <div className="text-center mb-16">
        <span className="text-black/40 text-[10px] tracking-[0.4em] uppercase font-bold mb-4 block">Inversión</span>
        <h3 className="serif-title text-3xl text-black italic mb-2">Price List</h3>
        <div className="w-12 h-px bg-black/10 mx-auto mt-6"></div>
      </div>

      {/* Reformer Section */}
      <div className="mb-16">
        <div className="flex items-center gap-4 mb-8">
          <h4 className="serif-title text-xl text-black italic">Reformer</h4>
          <div className="flex-grow h-px bg-gradient-to-r from-black/10 to-transparent"></div>
        </div>
        
        <div className="space-y-6 px-2">
          {reformerPlans.map((plan, index) => (
            <div key={index} className="group">
              <div className="flex justify-between items-end mb-2">
                <span className="text-[10px] font-medium text-black/70 uppercase tracking-[0.2em] group-hover:text-black transition-colors">
                  {plan.name}
                  {plan.popular && (
                    <span className="ml-2 text-[8px] bg-ocean-blue/10 text-ocean-blue px-2 py-0.5 rounded-full font-bold tracking-tighter">POPULAR</span>
                  )}
                </span>
                <span className="text-lg font-light text-black serif-title">
                  ${plan.price}
                </span>
              </div>
              <div className="w-full h-px border-b border-dashed border-black/10"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Hot Pilates Section */}
      <div className="mb-16">
        <div className="flex items-center gap-4 mb-8">
          <h4 className="serif-title text-xl text-black italic">Hot pilates - yoga</h4>
          <div className="flex-grow h-px bg-gradient-to-r from-black/10 to-transparent"></div>
        </div>
        
        <div className="space-y-6 px-2">
          {hotPilatesPlans.map((plan, index) => (
            <div key={index} className="group">
              <div className="flex justify-between items-end mb-2">
                <span className="text-[10px] font-medium text-black/70 uppercase tracking-[0.2em] group-hover:text-black transition-colors">
                  {plan.name}
                </span>
                <span className="text-lg font-light text-black serif-title">
                  ${plan.price}
                </span>
              </div>
              <div className="w-full h-px border-b border-dashed border-black/10"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Importante Section */}
      <div className="bg-ocean-blue/5 rounded-[40px] p-8 border border-ocean-blue/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <span className="material-icons-outlined text-4xl text-ocean-blue">info</span>
        </div>
        <h5 className="text-[10px] font-bold text-ocean-blue uppercase tracking-[0.3em] mb-4 italic">Importante:</h5>
        <div className="space-y-2">
          <p className="text-xs text-black/60 italic leading-relaxed">
            Un mes para usar nuestros paquetes.
          </p>
          <p className="text-xs text-black/60 italic leading-relaxed">
            Dos meses para usar paquete de treinta clases.
          </p>
        </div>
        <div className="mt-8 text-center">
          <p className="text-[10px] text-ocean-blue/40 tracking-[0.4em] uppercase font-medium">Wave.pilatesclub</p>
        </div>
      </div>
    </section>
  )
}
