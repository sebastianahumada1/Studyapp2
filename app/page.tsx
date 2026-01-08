import { Sidebar } from '@/components/Sidebar';
import { requireAuth } from '@/lib/auth';
import Link from 'next/link';

export default async function Home() {
  const user = await requireAuth();

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar />

      <main className="flex-1 h-full overflow-y-auto relative bg-background-dark bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/20 via-background-dark to-background-dark">
        <div className="max-w-[1400px] mx-auto p-4 md:p-8 flex flex-col gap-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="h-px w-8 bg-accent"></span>
                <span className="text-accent text-xs font-bold uppercase tracking-widest">
                  Panel de Control
                </span>
              </div>
              <h2 className="text-white text-3xl md:text-4xl font-bold tracking-tight">
                Hola,{' '}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-300">
                  {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuario'}
                </span>{' '}
                👋
              </h2>
              <p className="text-text-secondary mt-1">
                Aquí tienes el resumen de tu rendimiento hoy.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <button className="relative p-2 rounded-full hover:bg-white/5 text-text-secondary hover:text-white transition-colors">
                <span className="material-symbols-outlined">notifications</span>
                <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-background-dark"></span>
              </button>
              <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-gradient-to-r from-[#1a162e] to-[#201c38] border border-white/10 shadow-lg">
                <div className="relative size-10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-orange-500 text-[28px] drop-shadow-[0_0_8px_rgba(249,115,22,0.6)]">
                    local_fire_department
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-orange-400 font-bold text-lg leading-none">
                    5 Días
                  </span>
                  <span className="text-text-secondary text-xs font-medium">
                    Racha actual
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 auto-rows-min">
            {/* Ruta Principal Card */}
            <div className="group relative md:col-span-2 lg:col-span-8 bg-card-dark rounded-2xl border border-white/5 hover:border-primary/40 transition-all duration-300 overflow-hidden flex flex-col shadow-lg">
              <div className="absolute top-3 right-3 text-white/20 widget-handle">
                <span className="material-symbols-outlined text-lg">
                  drag_indicator
                </span>
              </div>
              <div className="flex flex-col md:flex-row h-full">
                <div
                  className="w-full md:w-2/5 h-48 md:h-auto bg-cover bg-center relative"
                  style={{
                    backgroundImage:
                      'url("https://lh3.googleusercontent.com/aida-public/AB6AXuA7ZlH1kT0yHwFcr4VMP6re1gZL041Lyv4hcdD4xt_QnejrIWAdKc4HIu2npmqqCgv9nph4z6iFgG0LuyiY2_2tcdjMwpp3nKQcI3xSU4w2iYGhaWwB6UdsBnibGoT2LLxyJeuO1mb-r5P89riuFsnt6nfVNf4ASNRGS-1zDm7ikyQfVZlwtMpM9Sg7vVb6AvZRlEySgRnOe2VGDzGAsp8AiZcgWzeeaRjyPn2s55R8vnyEv86m6wkiWVhcBkcPgVMvaCR5gswbXa3q")',
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-card-dark via-card-dark/80 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 z-10">
                    <span className="bg-primary/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
                      En Curso
                    </span>
                  </div>
                </div>
                <div className="p-6 md:p-8 flex flex-col justify-center flex-1 relative">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-text-secondary text-sm font-medium uppercase tracking-wider">
                      Ruta Principal
                    </h3>
                    <span className="text-white text-xs font-mono bg-white/5 px-2 py-1 rounded">
                      MAT-204
                    </span>
                  </div>
                  <h4 className="text-2xl font-bold text-white mb-2">
                    Matemáticas Avanzadas:{' '}
                    <span className="text-indigo-400">Cálculo Integral</span>
                  </h4>
                  <p className="text-gray-400 text-sm mb-6 line-clamp-2">
                    Continuar con las técnicas de integración por partes y
                    sustitución trigonométrica.
                  </p>
                  <div className="flex items-center gap-4 mt-auto">
                    <div className="flex-1 flex flex-col gap-1">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-indigo-300">
                          Progreso del módulo
                        </span>
                        <span className="text-white">45%</span>
                      </div>
                      <div className="w-full bg-[#0f0c1d] rounded-full h-2 overflow-hidden border border-white/5">
                        <div
                          className="bg-gradient-to-r from-cyan-500 to-indigo-600 h-full rounded-full relative"
                          style={{ width: '45%' }}
                        >
                          <div className="absolute top-0 right-0 h-full w-full bg-gradient-to-b from-white/20 to-transparent"></div>
                        </div>
                      </div>
                    </div>
                    <button className="shrink-0 flex items-center gap-2 bg-white text-black hover:bg-cyan-50 px-5 py-2.5 rounded-lg font-bold text-sm transition-colors shadow-[0_0_20px_rgba(255,255,255,0.15)]">
                      Continuar
                      <span className="material-symbols-outlined text-lg">
                        play_arrow
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Rendimiento Card */}
            <div className="group relative md:col-span-2 lg:col-span-4 bg-card-dark rounded-2xl border border-white/5 hover:border-primary/40 transition-all duration-300 p-6 flex flex-col justify-between shadow-lg bg-gradient-violet">
              <div className="absolute top-3 right-3 text-white/20 widget-handle">
                <span className="material-symbols-outlined text-lg">
                  drag_indicator
                </span>
              </div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold text-lg">Rendimiento</h3>
                <select className="bg-black/20 border-none text-xs text-indigo-300 rounded focus:ring-0 cursor-pointer">
                  <option>Semanal</option>
                  <option>Mensual</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-[#0f0c1d]/50 p-3 rounded-xl border border-white/5">
                  <p className="text-text-secondary text-[10px] uppercase mb-1">
                    Precisión
                  </p>
                  <div className="flex items-end gap-1">
                    <span className="text-2xl font-bold text-white">78%</span>
                    <span className="text-green-400 text-xs mb-1">↑ 2%</span>
                  </div>
                </div>
                <div className="bg-[#0f0c1d]/50 p-3 rounded-xl border border-white/5">
                  <p className="text-text-secondary text-[10px] uppercase mb-1">
                    Tiempo
                  </p>
                  <div className="flex items-end gap-1">
                    <span className="text-2xl font-bold text-white">4.2h</span>
                    <span className="text-text-secondary text-xs mb-1">
                      hoy
                    </span>
                  </div>
                </div>
              </div>
              <div className="h-24 w-full flex items-end gap-2 justify-between px-1">
                {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, index) => {
                  const heights = [40, 60, 30, 75, 90, 20, 10];
                  const isToday = index === 4;
                  return (
                    <div
                      key={`day-${index}`}
                      className={`w-full rounded-t-sm hover:bg-indigo-500/30 transition-all relative group/bar ${
                        isToday
                          ? 'bg-accent/20 hover:bg-accent/40'
                          : 'bg-indigo-500/10'
                      }`}
                      style={{ height: `${heights[index]}%` }}
                    >
                      <div className="opacity-0 group-hover/bar:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded">
                        {day}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Módulos Activos */}
            <div className="col-span-1 md:col-span-2 lg:col-span-12">
              <div className="flex items-center justify-between mb-4 px-1">
                <h3 className="text-white font-bold text-lg flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-accent box-shadow-[0_0_10px_#06b6d4]"></span>
                  Módulos Activos
                </h3>
                <button className="text-xs text-indigo-400 hover:text-white transition-colors">
                  Personalizar
                </button>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <Link
                  href="/hub"
                  className="group relative bg-[#1a162e] p-4 rounded-xl border border-white/5 hover:border-accent/50 transition-all cursor-pointer hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(6,182,212,0.1)] block"
                >
                  <div className="absolute top-2 right-2 text-white/10 widget-handle">
                    <span className="material-symbols-outlined text-sm">
                      drag_indicator
                    </span>
                  </div>
                  <div className="size-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 mb-3 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined">hub</span>
                  </div>
                  <h4 className="text-white font-semibold">Hub de Conocimiento</h4>
                  <p className="text-xs text-text-secondary mt-1">
                    Base de conocimientos
                  </p>
                </Link>
                <div className="group relative bg-[#1a162e] p-4 rounded-xl border border-white/5 hover:border-accent/50 transition-all cursor-pointer hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(6,182,212,0.1)]">
                  <div className="absolute top-2 right-2 text-white/10 widget-handle">
                    <span className="material-symbols-outlined text-sm">
                      drag_indicator
                    </span>
                  </div>
                  <div className="size-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-3 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined">quiz</span>
                  </div>
                  <h4 className="text-white font-semibold">Evaluación</h4>
                  <p className="text-xs text-text-secondary mt-1">
                    Banco de preguntas
                  </p>
                </div>
                <div className="group relative bg-gradient-to-br from-[#1a162e] to-indigo-900/20 p-4 rounded-xl border border-indigo-500/30 hover:border-accent transition-all cursor-pointer hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                  <div className="absolute top-2 right-2 text-white/10 widget-handle">
                    <span className="material-symbols-outlined text-sm">
                      drag_indicator
                    </span>
                  </div>
                  <div className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-accent"></span>
                  </div>
                  <div className="size-10 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-300 mb-3 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined">smart_toy</span>
                  </div>
                  <h4 className="text-white font-semibold">Tutor IA</h4>
                  <p className="text-xs text-indigo-200/70 mt-1">
                    Asistencia 24/7
                  </p>
                </div>
              </div>
            </div>

            {/* Focos de Atención */}
            <div className="group relative md:col-span-1 lg:col-span-4 bg-card-dark rounded-2xl border border-white/5 hover:border-red-500/30 transition-all p-6 shadow-lg flex flex-col justify-between">
              <div className="absolute top-3 right-3 text-white/20 widget-handle">
                <span className="material-symbols-outlined text-lg">
                  drag_indicator
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <div className="p-1.5 bg-red-500/10 rounded-md animate-pulse">
                    <span className="material-symbols-outlined text-red-400 text-sm">
                      warning
                    </span>
                  </div>
                  <h3 className="text-white font-bold text-lg">
                    Focos de Atención
                  </h3>
                </div>
                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between group/item cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-1 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
                      <div>
                        <p className="text-white font-medium text-sm group-hover/item:text-red-400 transition-colors">
                          Factorización
                        </p>
                        <p className="text-xs text-text-secondary">Álgebra</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-red-400 font-bold text-sm">32%</span>
                      <p className="text-[10px] text-text-secondary">Precisión</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between group/item cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-1 bg-orange-500 rounded-full"></div>
                      <div>
                        <p className="text-white font-medium text-sm group-hover/item:text-orange-400 transition-colors">
                          Dinámica
                        </p>
                        <p className="text-xs text-text-secondary">Física</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-orange-400 font-bold text-sm">
                        55%
                      </span>
                      <p className="text-[10px] text-text-secondary">Precisión</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between group/item cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-1 bg-yellow-500 rounded-full"></div>
                      <div>
                        <p className="text-white font-medium text-sm group-hover/item:text-yellow-400 transition-colors">
                          Estequiometría
                        </p>
                        <p className="text-xs text-text-secondary">Química</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-yellow-400 font-bold text-sm">
                        68%
                      </span>
                      <p className="text-[10px] text-text-secondary">Precisión</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Próximos Hitos */}
            <div className="group relative md:col-span-1 lg:col-span-4 md:col-start-2 lg:col-start-5 lg:col-span-8 bg-card-dark rounded-2xl border border-white/5 hover:border-primary/40 transition-all p-6 shadow-lg flex flex-col">
              <div className="absolute top-3 right-3 text-white/20 widget-handle">
                <span className="material-symbols-outlined text-lg">
                  drag_indicator
                </span>
              </div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold text-lg">Próximos Hitos</h3>
                <button className="text-xs text-indigo-400 hover:text-white transition-colors">
                  Ver Calendario
                </button>
              </div>
              <div className="flex-1 flex flex-col gap-3">
                <div className="flex items-center gap-4 p-3 rounded-xl bg-[#0f0c1d] border border-white/5 hover:border-indigo-500/30 transition-colors">
                  <div className="flex flex-col items-center justify-center w-12 h-12 bg-indigo-500/10 rounded-lg text-indigo-400 border border-indigo-500/20">
                    <span className="text-xs font-bold uppercase">OCT</span>
                    <span className="text-lg font-bold leading-none">28</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-medium">
                      Examen Parcial de Cálculo
                    </h4>
                    <p className="text-xs text-text-secondary flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">
                        schedule
                      </span>
                      10:00 AM - Aula Virtual 3
                    </p>
                  </div>
                  <span className="px-2 py-1 bg-red-500/10 text-red-400 text-[10px] font-bold uppercase rounded border border-red-500/20">
                    Alta Prioridad
                  </span>
                </div>
                <div className="flex items-center gap-4 p-3 rounded-xl bg-[#0f0c1d] border border-white/5 hover:border-indigo-500/30 transition-colors">
                  <div className="flex flex-col items-center justify-center w-12 h-12 bg-gray-700/10 rounded-lg text-gray-400 border border-gray-600/20">
                    <span className="text-xs font-bold uppercase">NOV</span>
                    <span className="text-lg font-bold leading-none">02</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-medium">
                      Entrega de Proyecto Física
                    </h4>
                    <p className="text-xs text-text-secondary flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">
                        schedule
                      </span>
                      23:59 PM - Plataforma
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
