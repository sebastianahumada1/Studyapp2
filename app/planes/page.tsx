'use client';

import { Header } from '@/components/Header';
import { useState } from 'react';
import Link from 'next/link';

export default function PlanesPage() {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <div className="relative min-h-screen flex flex-col bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display overflow-x-hidden antialiased">
      <Header />

      <main className="flex-1 flex flex-col items-center p-4 relative w-full">
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-[10%] left-[20%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]"></div>
          <div className="absolute top-[30%] -right-[5%] w-[30%] h-[30%] bg-purple-600/10 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-[0%] left-[10%] w-[30%] h-[30%] bg-cyan-900/10 rounded-full blur-[100px]"></div>
        </div>

        <div className="text-center max-w-3xl mx-auto mt-8 lg:mt-12 mb-12 lg:mb-16 z-10 relative px-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full bg-primary/10 border border-primary/20 w-fit">
            <span className="material-symbols-outlined text-primary text-sm">
              verified
            </span>
            <span className="text-primary text-xs font-bold uppercase tracking-wider">
              Garantía de aprendizaje
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
            Elige el plan para tu <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">
              Excelencia Académica
            </span>
          </h1>

          <p className="text-slate-400 text-lg leading-relaxed max-w-2xl mx-auto">
            Desbloquea el poder del Método Feynman y la codificación del error
            con nuestros tutores de IA. Empieza gratis o lleva tu rendimiento al
            nivel médico-quirúrgico.
          </p>
        </div>

        <div className="flex items-center justify-center gap-4 mb-12 z-10 relative">
          <span className="text-slate-300 text-sm font-medium">Mensual</span>
          <button
            onClick={() => setIsAnnual(!isAnnual)}
            className="relative inline-flex h-8 w-14 items-center rounded-full bg-card-dark border border-border-dark cursor-pointer"
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-primary transition ${
                isAnnual ? 'translate-x-7' : 'translate-x-1'
              }`}
            ></span>
          </button>
          <span className="text-white text-sm font-medium">
            Anual{' '}
            <span className="ml-1 text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded uppercase font-bold">
              -20%
            </span>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-7xl w-full z-10 mb-20 px-2 lg:px-8">
          {/* Plan Básico */}
          <div className="relative flex flex-col p-6 lg:p-8 bg-card-dark border border-border-dark rounded-2xl hover:border-slate-600 transition-colors">
            <div className="mb-4">
              <h3 className="text-xl font-bold text-white mb-2">Básico</h3>
              <p className="text-slate-400 text-sm h-10">
                Para estudiantes que inician con técnicas de estudio inteligentes.
              </p>
            </div>

            <div className="mb-6 flex items-end gap-1">
              <span className="text-4xl font-bold text-white">$0</span>
              <span className="text-slate-500 text-sm mb-1">/mes</span>
            </div>

            <Link
              href="/login"
              className="w-full py-3 rounded-xl bg-input-dark border border-border-dark text-white font-medium hover:bg-white/5 transition-colors mb-8 text-center block"
            >
              Comenzar Gratis
            </Link>

            <div className="space-y-4 flex-1">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Incluye:
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-sm text-slate-300">
                  <span className="material-symbols-outlined text-primary text-lg">
                    check
                  </span>
                  <span>Tutor IA limitado (10 consultas/día)</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-slate-300">
                  <span className="material-symbols-outlined text-primary text-lg">
                    check
                  </span>
                  <span>Resúmenes automáticos básicos</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-slate-300">
                  <span className="material-symbols-outlined text-primary text-lg">
                    check
                  </span>
                  <span>Organizador de tareas simple</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-slate-500 line-through">
                  <span className="material-symbols-outlined text-slate-700 text-lg">
                    close
                  </span>
                  <span>Método Feynman Interactivo</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Plan Estudiante Pro - Recomendado */}
          <div className="relative flex flex-col p-6 lg:p-8 bg-[#132228] border border-primary/50 rounded-2xl shadow-2xl shadow-primary/10 scale-100 md:scale-105 z-10">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
              RECOMENDADO
            </div>

            <div className="mb-4">
              <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                Estudiante Pro
                <span className="material-symbols-outlined text-primary text-lg">
                  auto_awesome
                </span>
              </h3>
              <p className="text-slate-300 text-sm h-10">
                Potencia total con IA para dominar materias complejas.
              </p>
            </div>

            <div className="mb-6 flex items-end gap-1">
              <span className="text-5xl font-bold text-white">
                ${isAnnual ? '7.99' : '9.99'}
              </span>
              <span className="text-slate-400 text-sm mb-1">/mes</span>
            </div>

            <Link
              href="/login"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-purple-600 text-white font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] transition-all mb-8 text-center block"
            >
              Elegir Plan Pro
            </Link>

            <div className="space-y-4 flex-1">
              <p className="text-xs font-bold text-primary uppercase tracking-wider">
                Todo lo del plan Básico, más:
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-sm text-white font-medium">
                  <span className="material-symbols-outlined text-primary text-lg">
                    check_circle
                  </span>
                  <span>Tutor IA Ilimitado & Personalizado</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-white font-medium">
                  <span className="material-symbols-outlined text-primary text-lg">
                    check_circle
                  </span>
                  <span>Módulo Método Feynman Guiado</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-white font-medium">
                  <span className="material-symbols-outlined text-primary text-lg">
                    check_circle
                  </span>
                  <span>Sistema de Codificación del Error</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-white font-medium">
                  <span className="material-symbols-outlined text-primary text-lg">
                    check_circle
                  </span>
                  <span>Análisis de rendimiento académico</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-white font-medium">
                  <span className="material-symbols-outlined text-primary text-lg">
                    check_circle
                  </span>
                  <span>Generación de Quizzes infinitos</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Plan Investigador */}
          <div className="relative flex flex-col p-6 lg:p-8 bg-card-dark border border-border-dark rounded-2xl hover:border-slate-600 transition-colors">
            <div className="mb-4">
              <h3 className="text-xl font-bold text-white mb-2">Investigador</h3>
              <p className="text-slate-400 text-sm h-10">
                Para tesistas y grupos de estudio avanzados.
              </p>
            </div>

            <div className="mb-6 flex items-end gap-1">
              <span className="text-4xl font-bold text-white">
                ${isAnnual ? '19.99' : '24.99'}
              </span>
              <span className="text-slate-500 text-sm mb-1">/mes</span>
            </div>

            <Link
              href="/login"
              className="w-full py-3 rounded-xl bg-input-dark border border-border-dark text-white font-medium hover:bg-white/5 transition-colors mb-8 text-center block"
            >
              Contactar Ventas
            </Link>

            <div className="space-y-4 flex-1">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Todo lo del plan Pro, más:
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-sm text-slate-300">
                  <span className="material-symbols-outlined text-primary text-lg">
                    check
                  </span>
                  <span>Colaboración en tiempo real</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-slate-300">
                  <span className="material-symbols-outlined text-primary text-lg">
                    check
                  </span>
                  <span>Análisis cognitivo profundo (Beta)</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-slate-300">
                  <span className="material-symbols-outlined text-primary text-lg">
                    check
                  </span>
                  <span>Exportación de datos académicos</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-slate-300">
                  <span className="material-symbols-outlined text-primary text-lg">
                    check
                  </span>
                  <span>Soporte prioritario 24/7</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="w-full max-w-5xl z-10 px-4 mb-12">
          <div className="flex flex-col md:flex-row gap-8 md:gap-16">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-6">
                ¿Por qué elegir StudyApp?
              </h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary text-2xl">
                      psychology_alt
                    </span>
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-lg mb-1">
                      Técnica Feynman Digital
                    </h4>
                    <p className="text-slate-400 text-sm">
                      Nuestra IA te evalúa mientras explicas conceptos,
                      identificando lagunas en tu conocimiento al instante.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="size-12 rounded-xl bg-purple-600/10 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-purple-400 text-2xl">
                      bug_report
                    </span>
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-lg mb-1">
                      Codificación del Error
                    </h4>
                    <p className="text-slate-400 text-sm">
                      Transforma tus errores en datos. El sistema categoriza tus
                      fallos para evitar que los repitas.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="size-12 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-emerald-400 text-2xl">
                      monitoring
                    </span>
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-lg mb-1">
                      Progreso Clínico
                    </h4>
                    <p className="text-slate-400 text-sm">
                      Visualiza tu avance con gráficos de precisión médica.
                      Detecta síntomas de fatiga académica a tiempo.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-6">
                Preguntas Frecuentes
              </h2>
              <div className="space-y-4">
                <details className="group bg-card-dark border border-border-dark rounded-xl overflow-hidden">
                  <summary className="flex cursor-pointer items-center justify-between p-4 font-medium text-white hover:bg-white/5 transition-colors">
                    ¿Puedo cancelar mi suscripción cuando quiera?
                    <span className="material-symbols-outlined transition-transform group-open:rotate-180">
                      expand_more
                    </span>
                  </summary>
                  <div className="px-4 pb-4 text-sm text-slate-400">
                    Sí, puedes cancelar tu suscripción en cualquier momento desde
                    tu panel de usuario. Seguirás teniendo acceso hasta el final
                    del periodo facturado.
                  </div>
                </details>

                <details className="group bg-card-dark border border-border-dark rounded-xl overflow-hidden">
                  <summary className="flex cursor-pointer items-center justify-between p-4 font-medium text-white hover:bg-white/5 transition-colors">
                    ¿La IA funciona para carreras de medicina?
                    <span className="material-symbols-outlined transition-transform group-open:rotate-180">
                      expand_more
                    </span>
                  </summary>
                  <div className="px-4 pb-4 text-sm text-slate-400">
                    Absolutamente. StudyApp está optimizada con bases de datos
                    científicas y médicas, ideal para estudiantes que requieren
                    alta precisión terminológica.
                  </div>
                </details>

                <details className="group bg-card-dark border border-border-dark rounded-xl overflow-hidden">
                  <summary className="flex cursor-pointer items-center justify-between p-4 font-medium text-white hover:bg-white/5 transition-colors">
                    ¿Hay descuento para grupos?
                    <span className="material-symbols-outlined transition-transform group-open:rotate-180">
                      expand_more
                    </span>
                  </summary>
                  <div className="px-4 pb-4 text-sm text-slate-400">
                    Sí, ofrecemos planes especiales para grupos de estudio o
                    instituciones educativas. Contáctanos para el plan
                    "Investigador".
                  </div>
                </details>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

