import { Header } from '@/components/Header';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'StudyApp - Metacognición Extendida',
  description:
    'Aprende más rápido y recuerda para siempre con nuestro sistema de ingeniería del conocimiento que fusiona la Metacognición Extendida, la codificación del error y la IA adaptativa.',
};

export default function MetodoPage() {
  return (
    <div className="relative min-h-screen flex flex-col bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display overflow-x-hidden antialiased">
      <Header />

      <main className="flex-1 flex flex-col items-center w-full relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px]"></div>
          <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-[10%] left-[20%] w-[30%] h-[30%] bg-blue-600/5 rounded-full blur-[80px]"></div>
        </div>

        <div className="w-full max-w-4xl mx-auto px-6 pt-16 pb-12 lg:pt-24 lg:pb-16 text-center z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 w-fit mb-6 mx-auto animate-fade-in-up">
            <span className="material-symbols-outlined text-primary text-sm">
              science
            </span>
            <span className="text-primary text-xs font-bold uppercase tracking-wider">
              Metodología Científica
            </span>
          </div>

          <h1 className="text-4xl lg:text-6xl font-bold text-white leading-tight mb-6 tracking-tight">
            Aprende más rápido. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-cyan-300 to-purple-400">
              Recuerda para siempre.
            </span>
          </h1>

          <p className="text-slate-400 text-lg leading-relaxed max-w-2xl mx-auto">
            StudyApp no es solo una app de notas. Es un sistema de ingeniería
            del conocimiento que fusiona la{' '}
            <span className="text-white font-medium">
              Metacognición Extendida
            </span>
            , la codificación del error y la IA adaptativa.
          </p>
        </div>

        <div className="w-full max-w-6xl px-6 grid grid-cols-1 md:grid-cols-3 gap-6 z-10 mb-24">
          <div className="bg-card-dark border border-border-dark p-8 rounded-2xl relative overflow-hidden group hover:border-primary/50 transition-colors duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-primary/10 transition-colors"></div>
            <div className="size-14 rounded-xl bg-gradient-to-br from-blue-900/50 to-blue-800/20 border border-blue-500/20 flex items-center justify-center mb-6 text-blue-400 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-blue-500/5">
              <span className="material-symbols-outlined text-3xl">psychology</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-3">
              Metacognición Extendida
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Tu cerebro, amplificado. Externaliza tus procesos de pensamiento
              en nuestra interfaz para liberar carga cognitiva y estructurar
              ideas complejas con claridad.
            </p>
          </div>

          <div className="bg-card-dark border border-border-dark p-8 rounded-2xl relative overflow-hidden group hover:border-emerald-500/50 transition-colors duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-emerald-500/10 transition-colors"></div>
            <div className="size-14 rounded-xl bg-gradient-to-br from-emerald-900/50 to-emerald-800/20 border border-emerald-500/20 flex items-center justify-center mb-6 text-emerald-400 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-emerald-500/5">
              <span className="material-symbols-outlined text-3xl">
                fact_check
              </span>
            </div>
            <h3 className="text-xl font-bold text-white mb-3">
              Codificación del Error
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              El error es un dato. Clasifica tus fallos (atención, concepto,
              proceso) para que el algoritmo personalice tus sesiones de
              repaso.
            </p>
          </div>

          <div className="bg-card-dark border border-border-dark p-8 rounded-2xl relative overflow-hidden group hover:border-purple-500/50 transition-colors duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-purple-500/10 transition-colors"></div>
            <div className="size-14 rounded-xl bg-gradient-to-br from-purple-900/50 to-purple-800/20 border border-purple-500/20 flex items-center justify-center mb-6 text-purple-400 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-purple-500/5">
              <span className="material-symbols-outlined text-3xl">
                smart_toy
              </span>
            </div>
            <h3 className="text-xl font-bold text-white mb-3">
              Tutoría Adaptativa
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Un tutor que nunca duerme. La IA analiza tus patrones de olvido y
              te interroga justo cuando estás a punto de olvidar.
            </p>
          </div>
        </div>

        <div className="w-full border-y border-[#2a424d] bg-[#101e23]/50 backdrop-blur-sm py-20 z-10 relative">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-white">
                El Ciclo de Metacognición Extendida
              </h2>
              <p className="text-slate-400 mt-4">
                Cuatro fases integradas para externalizar, auditar y consolidar
                el conocimiento.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-4 relative">
              <div className="flex flex-col items-center text-center group">
                <div className="size-12 rounded-full bg-gradient-to-b from-primary to-blue-600 text-white font-bold text-xl flex items-center justify-center mb-6 z-10 shadow-[0_0_20px_rgba(13,185,242,0.3)] ring-4 ring-[#101e23]">
                  1
                </div>
                <h4 className="text-white font-bold mb-2 group-hover:text-primary transition-colors">
                  Selección del Foco
                </h4>
                <p className="text-xs text-slate-400 px-2 leading-relaxed">
                  Define el objeto de estudio. Prepara tu "entorno cognitivo"
                  digital enfocando la atención en un concepto clave.
                </p>
              </div>

              <div className="hidden md:block absolute top-6 left-[12%] w-[22%] h-[2px] bg-gradient-to-r from-primary/50 to-transparent"></div>

              <div className="flex flex-col items-center text-center group">
                <div className="size-12 rounded-full bg-card-dark border-2 border-primary text-primary font-bold text-xl flex items-center justify-center mb-6 z-10 ring-4 ring-[#101e23] group-hover:bg-primary/10 transition-colors">
                  2
                </div>
                <h4 className="text-white font-bold mb-2 group-hover:text-primary transition-colors">
                  Exteriorización
                </h4>
                <p className="text-xs text-slate-400 px-2 leading-relaxed">
                  Transfiere lo que sabes. Explica el concepto a la IA como si
                  fuera un estudiante novato, forzando la estructuración mental.
                </p>
              </div>

              <div className="hidden md:block absolute top-6 left-[37%] w-[22%] h-[2px] bg-gradient-to-r from-primary/20 to-transparent"></div>

              <div className="flex flex-col items-center text-center group">
                <div className="size-12 rounded-full bg-card-dark border-2 border-primary/50 text-primary/80 font-bold text-xl flex items-center justify-center mb-6 z-10 ring-4 ring-[#101e23] group-hover:border-primary group-hover:text-primary transition-all">
                  3
                </div>
                <h4 className="text-white font-bold mb-2 group-hover:text-primary transition-colors">
                  Auditoría de Brechas
                </h4>
                <p className="text-xs text-slate-400 px-2 leading-relaxed">
                  Monitoreo activo. El sistema detecta dónde se rompe tu lógica
                  o falta información, señalando qué repasar.
                </p>
              </div>

              <div className="hidden md:block absolute top-6 left-[62%] w-[22%] h-[2px] bg-gradient-to-r from-primary/10 to-transparent"></div>

              <div className="flex flex-col items-center text-center group">
                <div className="size-12 rounded-full bg-card-dark border-2 border-primary/20 text-primary/60 font-bold text-xl flex items-center justify-center mb-6 z-10 ring-4 ring-[#101e23] group-hover:border-primary group-hover:text-primary transition-all">
                  4
                </div>
                <h4 className="text-white font-bold mb-2 group-hover:text-primary transition-colors">
                  Síntesis Iterativa
                </h4>
                <p className="text-xs text-slate-400 px-2 leading-relaxed">
                  Re-codificación. Simplifica la explicación basándote en el
                  feedback. La verdadera comprensión es simple y conectada.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full max-w-6xl px-6 py-24 flex flex-col lg:flex-row gap-16 items-center z-10">
          <div className="flex-1 space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 w-fit">
              <span className="material-symbols-outlined text-emerald-400 text-sm">
                analytics
              </span>
              <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider">
                Analítica de Progreso
              </span>
            </div>

            <h2 className="text-3xl lg:text-4xl font-bold text-white">
              Codificación del Error: <br />
              El Fallo es un Dato Valioso
            </h2>

            <p className="text-slate-400 leading-relaxed text-lg">
              La mayoría ignora sus errores. StudyApp te permite etiquetarlos
              para generar un "Mapa de Calor Cognitivo". Identifica patrones
              ocultos en tu aprendizaje.
            </p>

            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-card-dark border border-border-dark transition-transform hover:translate-x-2">
                <div className="flex-shrink-0 size-10 rounded-lg bg-red-500/20 flex items-center justify-center text-red-500">
                  <span className="material-symbols-outlined">priority_high</span>
                </div>
                <div>
                  <h5 className="text-white font-bold text-sm flex items-center gap-2">
                    Error de Concepto{' '}
                    <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded uppercase">
                      Crítico
                    </span>
                  </h5>
                  <p className="text-slate-500 text-sm mt-1">
                    No entendiste la teoría base. Requiere re-estudio.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-xl bg-card-dark border border-border-dark transition-transform hover:translate-x-2">
                <div className="flex-shrink-0 size-10 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-500">
                  <span className="material-symbols-outlined">calculate</span>
                </div>
                <div>
                  <h5 className="text-white font-bold text-sm flex items-center gap-2">
                    Error de Proceso{' '}
                    <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded uppercase">
                      Práctica
                    </span>
                  </h5>
                  <p className="text-slate-500 text-sm mt-1">
                    Sabías la teoría, pero fallaste en la ejecución o pasos.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-xl bg-card-dark border border-border-dark transition-transform hover:translate-x-2">
                <div className="flex-shrink-0 size-10 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-500">
                  <span className="material-symbols-outlined">visibility</span>
                </div>
                <div>
                  <h5 className="text-white font-bold text-sm flex items-center gap-2">
                    Error de Atención{' '}
                    <span className="text-[10px] bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded uppercase">
                      Enfoque
                    </span>
                  </h5>
                  <p className="text-slate-500 text-sm mt-1">
                    Distracciones o lectura rápida. Requiere mindfulness.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 w-full">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-primary/10 border border-[#2a424d] aspect-square w-full bg-[#16262c] group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt="AI Analyzing Data"
                className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAKXSgA6qoJUp13eHdmNweu9ZpOEhQ-hhi2IEX5xIDMWR015t8Fro9x5w4nNV4uPL0c5wNnYui2LQttMYQ3LUbIg8WqVYHPuAx8tiSJTwpHUA-q9wT7cIlxOUPUSmOR8dpJ3s2_TXgUEqRfAaiTXoGT_gvfX06h3psbdyts-jg8dzV-Riu3poTkSglf_F-l8WWXXhYEN2btN6AiEhD4cbtCGF1ScIQM4FxF3ZDxQgiHuELcre_Q79UD3Rsvtf1F-q8AUXG7zd3cQMsG"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#101e23] via-[#101e23]/50 to-transparent"></div>

              <div className="absolute top-8 right-8 bg-black/60 backdrop-blur-md border border-white/10 p-3 rounded-lg shadow-xl">
                <div className="flex gap-2 items-center text-xs font-mono text-cyan-400">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                  </span>
                  IA Analizando patrones...
                </div>
              </div>

              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-cyan-500/30 rounded-full flex items-center justify-center">
                <div className="w-24 h-24 border border-cyan-500/60 rounded-full animate-[spin_10s_linear_infinite]"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="material-symbols-outlined text-4xl text-white/80">
                    psychology_alt
                  </span>
                </div>
              </div>

              <div className="absolute bottom-8 left-8 right-8">
                <div className="bg-[#16262c]/90 backdrop-blur-md border border-white/10 p-4 rounded-xl shadow-2xl">
                  <div className="flex justify-between items-end mb-2">
                    <div className="flex flex-col">
                      <span className="text-slate-300 text-xs font-medium uppercase tracking-wider">
                        Eficacia de Estudio
                      </span>
                      <span className="text-white text-sm">
                        Sesión optimizada por IA
                      </span>
                    </div>
                    <span className="text-primary text-2xl font-bold">94%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-700/50 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary to-purple-500 w-[94%] shadow-[0_0_10px_rgba(13,185,242,0.5)]"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full max-w-2xl mx-auto px-6 pb-24 text-center z-10">
          <h2 className="text-2xl lg:text-3xl font-bold text-white mb-6">
            ¿Listo para hackear tu aprendizaje?
          </h2>
          <p className="text-slate-400 mb-8">
            Únete a miles de estudiantes que ya han transformado su manera de
            estudiar.
          </p>
          <Link
            href="/login"
            className="cursor-pointer inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-primary to-purple-600 px-8 py-4 text-sm font-bold text-white shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-105 transition-all duration-200 group"
          >
            Comenzar Prueba Gratuita
            <span className="material-symbols-outlined ml-2 group-hover:translate-x-1 transition-transform">
              rocket_launch
            </span>
          </Link>
        </div>
      </main>
    </div>
  );
}
