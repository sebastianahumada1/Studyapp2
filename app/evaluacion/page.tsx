import { Sidebar } from '@/components/Sidebar';
import { requireAuth } from '@/lib/auth';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/layout/Container';
import { Grid } from '@/components/layout/Grid';

export default async function EvaluacionPage() {
  await requireAuth();

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar />

      <main className="flex-1 h-full overflow-y-auto relative bg-background-dark bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/20 via-background-dark to-background-dark">
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute inset-0 bg-[size:40px_40px] bg-grid-pattern opacity-[0.05]"></div>
          <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px]"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[120px]"></div>
        </div>

        <Container maxWidth="2xl" className="relative z-10 py-8 md:py-12">
          <div className="mb-8">
            <div className="flex items-center gap-2 text-text-muted text-xs font-medium uppercase tracking-widest mb-2">
              <span>Evaluación</span>
              <span className="material-symbols-outlined text-[10px]">chevron_right</span>
              <span className="text-primary">Centro de Diagnóstico</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight font-display">
              Centro de Diagnóstico
            </h1>
            <p className="text-text-secondary mt-2">
              Gestiona tu banco de preguntas y configura simulacros personalizados
            </p>
          </div>

          <Grid cols={2} gap="lg" className="mt-8">
            {/* Banco de Preguntas Card */}
            <Card className="group relative flex flex-col bg-surface-dark border border-border-dark rounded-2xl p-1 tech-card-clip transition-all duration-500 hover:border-primary hover:shadow-neon hover:-translate-y-1 h-full">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="material-symbols-outlined text-[120px] text-primary rotate-12">
                  folder_data
                </span>
              </div>
              <div className="flex-1 bg-background-dark/50 rounded-xl p-8 flex flex-col gap-6 backdrop-blur-sm h-full tech-card-clip">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-surface-dark to-background-dark border border-border-dark flex items-center justify-center shadow-lg group-hover:shadow-neon-sm transition-all group-hover:border-primary/50">
                  <span className="material-symbols-outlined text-3xl text-primary">
                    inventory_2
                  </span>
                </div>
                <div className="flex-col gap-2">
                  <h3 className="text-2xl font-bold text-white group-hover:text-primary transition-colors">
                    Banco de Preguntas
                  </h3>
                  <div className="h-1 w-12 bg-border-dark rounded-full mt-2 group-hover:bg-primary group-hover:w-24 transition-all duration-500"></div>
                </div>
                <p className="text-text-muted font-body leading-relaxed text-sm">
                  Gestiona, busca y organiza el contenido de preguntas por temas y subtemas.
                  Consulta rápidamente la base de conocimiento para configurar pruebas.
                </p>
                <ul className="flex flex-col gap-2 text-xs text-text-muted/80 mt-auto mb-6">
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-sm">
                      check_circle
                    </span>
                    <span>Búsqueda rápida</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-sm">
                      check_circle
                    </span>
                    <span>Vista general de tópicos</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-sm">
                      check_circle
                    </span>
                    <span>Acceso a edición limitada</span>
                  </li>
                </ul>
                <Link href="/evaluacion/banco-preguntas" className="w-full">
                  <Button className="w-full py-3 px-6 rounded-lg bg-surface-dark border border-primary/30 text-primary font-bold uppercase tracking-wider text-xs flex items-center justify-between group-hover:bg-primary group-hover:text-background-dark transition-all duration-300">
                    <span>Explorar Banco</span>
                    <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
                      arrow_forward
                    </span>
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Ponte a Prueba Card */}
            <Card className="group relative flex flex-col bg-surface-dark border border-border-dark rounded-2xl p-1 tech-card-clip transition-all duration-500 hover:border-primary hover:shadow-neon hover:-translate-y-1 h-full">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="material-symbols-outlined text-[150px] text-primary -rotate-12">
                  quiz
                </span>
              </div>
              <div className="flex-1 bg-background-dark/50 rounded-xl p-8 flex flex-col gap-6 backdrop-blur-sm h-full tech-card-clip">
                <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-surface-dark to-background-dark border border-border-dark flex items-center justify-center shadow-lg group-hover:shadow-neon-sm transition-all group-hover:border-primary/50">
                  <span className="material-symbols-outlined text-4xl text-primary">
                    smart_toy
                  </span>
                </div>
                <div className="flex-col gap-2">
                  <h3 className="text-3xl font-bold text-white group-hover:text-primary transition-colors">
                    Ponte a Prueba
                  </h3>
                  <div className="h-1 w-16 bg-border-dark rounded-full mt-2 group-hover:bg-primary group-hover:w-32 transition-all duration-500"></div>
                </div>
                <p className="text-text-muted font-body leading-relaxed text-lg max-w-2xl">
                  Inicia tu simulación de diagnóstico. Configura la prueba a tu medida, selecciona
                  temas, niveles de dificultad y recibe retroalimentación en tiempo real.
                </p>
                <ul className="flex flex-col gap-2 text-xs text-text-muted/80 mt-auto mb-6">
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-sm">
                      check_circle
                    </span>
                    <span>Configuración personalizada</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-sm">
                      check_circle
                    </span>
                    <span>Retroalimentación de IA</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-sm">
                      check_circle
                    </span>
                    <span>Análisis de progreso</span>
                  </li>
                </ul>
                <Link href="/evaluacion/ponte-a-prueba" className="w-full">
                  <Button className="w-full py-4 px-6 rounded-lg bg-gradient-to-r from-primary/80 to-primary text-background-dark font-bold uppercase tracking-wider text-sm flex items-center justify-center hover:shadow-neon hover:brightness-110 transition-all duration-300">
                    <span className="material-symbols-outlined mr-2">play_arrow</span>
                    <span>Iniciar Diagnóstico</span>
                  </Button>
                </Link>
              </div>
            </Card>
          </Grid>
        </Container>
      </main>
    </div>
  );
}

