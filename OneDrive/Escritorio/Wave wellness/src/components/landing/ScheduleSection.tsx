export function ScheduleSection() {
  return (
    <section id="horarios" className="px-6 mb-32 max-w-screen-sm mx-auto scroll-mt-32">
      <div className="text-center mb-12">
        <span className="text-black/40 text-[10px] tracking-[0.4em] uppercase font-bold mb-4 block">Disponibilidad</span>
        <h3 className="serif-title text-3xl md:text-4xl text-black italic mb-2">Pilates Reformer</h3>
        <div className="w-8 h-px bg-black/20 mx-auto mt-6"></div>
      </div>

      <div className="grid gap-6">
        {/* Horario Principal */}
        <div className="bg-gradient-to-br from-skyblue/20 via-white/40 to-white/10 backdrop-blur-md rounded-[40px] p-8 border border-white/80 shadow-[0_10px_30px_rgba(0,0,0,0.02)] relative overflow-hidden group hover:shadow-md transition-all duration-500">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <span className="material-icons-outlined text-6xl text-ocean-blue">wb_twilight</span>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-ocean-blue/10 flex items-center justify-center">
                <span className="material-icons-outlined text-ocean-blue text-lg">wb_twilight</span>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-black uppercase tracking-wider">Lunes a Sábado</h4>
                <p className="text-[10px] text-ocean-blue/60 uppercase tracking-widest font-medium">Jornada Mañana</p>
              </div>
            </div>
            
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-light text-black serif-title">07:00</span>
              <span className="text-sm text-black/40 uppercase tracking-widest">am</span>
              <span className="mx-3 text-black/20">—</span>
              <span className="text-4xl font-light text-black serif-title">12:00</span>
              <span className="text-sm text-black/40 uppercase tracking-widest">pm</span>
            </div>
          </div>
        </div>

        {/* Horario Especial Miércoles */}
        <div className="bg-gradient-to-br from-ocean-blue/10 via-white/40 to-white/10 backdrop-blur-md rounded-[40px] p-8 border border-white/80 shadow-[0_10px_30px_rgba(0,0,0,0.02)] relative overflow-hidden group hover:shadow-md transition-all duration-500">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <span className="material-icons-outlined text-6xl text-ocean-blue">wb_sunny</span>
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-ocean-blue/10 flex items-center justify-center">
                <span className="material-icons-outlined text-ocean-blue text-lg">wb_sunny</span>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-black uppercase tracking-wider">Miércoles</h4>
                <p className="text-[10px] text-ocean-blue/60 uppercase tracking-widest font-medium">Jornada Tarde</p>
              </div>
            </div>
            
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-light text-black serif-title">02:00</span>
              <span className="text-sm text-black/40 uppercase tracking-widest">pm</span>
              <span className="mx-3 text-black/20">—</span>
              <span className="text-4xl font-light text-black serif-title">06:00</span>
              <span className="text-sm text-black/40 uppercase tracking-widest">pm</span>
            </div>
          </div>
        </div>
      </div>

      <p className="text-center text-[10px] text-black/30 mt-10 tracking-[0.3em] uppercase italic">
        Cupos limitados | Reserva previa
      </p>
    </section>
  )
}
