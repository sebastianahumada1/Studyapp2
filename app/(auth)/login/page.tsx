'use client';

import { Suspense } from 'react';
import { Header } from '@/components/Header';
import { signUp, signIn } from '@/app/actions/auth';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginFormContent() {
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode');
  const [isSignUp, setIsSignUp] = useState(mode !== 'signin');

  useEffect(() => {
    setIsSignUp(mode !== 'signin');
  }, [mode]);
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirm-password') as string;

    if (isSignUp && password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    try {
      const result = isSignUp
        ? await signUp(formData)
        : await signIn(formData);

      if (result?.error) {
        setError(result.error);
        setLoading(false);
      } else if (result?.success) {
        router.push('/');
        router.refresh();
      }
    } catch (err) {
      setError('Ocurrió un error. Por favor, intenta de nuevo.');
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-8 lg:gap-16 items-center justify-center z-10 my-8">
          <div className="hidden lg:flex flex-col flex-1 gap-6 text-left max-w-lg">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 w-fit">
              <span className="material-symbols-outlined text-primary text-sm">
                psychology
              </span>
              <span className="text-primary text-xs font-bold uppercase tracking-wider">
                Tutor IA Personalizado
              </span>
            </div>

            <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
              Potencia tu aprendizaje con{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">
                IA y Metacognicion extendida
              </span>
              .
            </h1>

            <p className="text-slate-400 text-lg leading-relaxed">
              StudyApp combina inteligencia artificial, codificación del error y
              técnicas de estudio avanzadas para transformar radicalmente tu
              rendimiento académico.
            </p>

            <div className="mt-8 relative rounded-2xl overflow-hidden shadow-2xl shadow-primary/10 border border-[#2a424d] aspect-video w-full bg-[#16262c]">
              <img
                alt="AI Concept"
                className="w-full h-full object-cover opacity-80"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAKXSgA6qoJUp13eHdmNweu9ZpOEhQ-hhi2IEX5xIDMWR015t8Fro9x5w4nNV4uPL0c5wNnYui2LQttMYQ3LUbIg8WqVYHPuAx8tiSJTwpHUA-q9wT7cIlxOUPUSmOR8dpJ3s2_TXgUEqRfAaiTXoGT_gvfX06h3psbdyts-jg8dzV-Riu3poTkSglf_F-l8WWXXhYEN2btN6AiEhD4cbtCGF1ScIQM4FxF3ZDxQgiHuELcre_Q79UD3Rsvtf1F-q8AUXG7zd3cQMsG"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#101e23] to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4 p-4 bg-[#101e23]/60 backdrop-blur-sm rounded-xl border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold">
                    A+
                  </div>
                  <div>
                    <p className="text-white text-sm font-bold">
                      Mejora de Rendimiento
                    </p>
                    <p className="text-xs text-slate-400">
                      Mediante codificación del error
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full max-w-md flex flex-col">
            <div className="bg-card-dark border border-border-dark shadow-xl rounded-2xl p-6 md:p-8 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-purple-500 to-primary opacity-50"></div>

              <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold text-white mb-2">
                  {isSignUp ? 'Crear Cuenta' : 'Iniciar Sesión'}
                </h2>
                <p className="text-slate-400 text-sm">
                  {isSignUp
                    ? 'Comienza tu viaje hacia el dominio del estudio.'
                    : 'Bienvenido de vuelta.'}
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                {isSignUp && (
                  <div className="flex flex-col gap-1.5">
                    <label
                      className="text-slate-300 text-sm font-medium"
                      htmlFor="name"
                    >
                      Nombre Completo
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xl">
                        person
                      </span>
                      <input
                        className="w-full bg-input-dark border border-border-dark rounded-xl px-4 pl-12 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm"
                        id="name"
                        name="name"
                        placeholder="Ej. Ana García"
                        type="text"
                        required={isSignUp}
                      />
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <label
                    className="text-slate-300 text-sm font-medium"
                    htmlFor="email"
                  >
                    Correo Electrónico
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xl">
                      mail
                    </span>
                    <input
                      className="w-full bg-input-dark border border-border-dark rounded-xl px-4 pl-12 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm"
                      id="email"
                      name="email"
                      placeholder="ejemplo@correo.com"
                      type="email"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label
                    className="text-slate-300 text-sm font-medium"
                    htmlFor="password"
                  >
                    Contraseña
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xl">
                      lock
                    </span>
                    <input
                      className="w-full bg-input-dark border border-border-dark rounded-xl px-4 pl-12 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm"
                      id="password"
                      name="password"
                      placeholder="••••••••"
                      type="password"
                      required
                    />
                  </div>
                  {isSignUp && (
                    <>
                      <div className="flex gap-1 mt-1">
                        <div className="h-1 flex-1 rounded-full bg-emerald-500/50"></div>
                        <div className="h-1 flex-1 rounded-full bg-emerald-500/50"></div>
                        <div className="h-1 flex-1 rounded-full bg-white/10"></div>
                        <div className="h-1 flex-1 rounded-full bg-white/10"></div>
                      </div>
                      <span className="text-xs text-emerald-400">
                        Seguridad media
                      </span>
                    </>
                  )}
                </div>

                {isSignUp && (
                  <div className="flex flex-col gap-1.5">
                    <label
                      className="text-slate-300 text-sm font-medium"
                      htmlFor="confirm-password"
                    >
                      Confirmar Contraseña
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xl">
                        verified_user
                      </span>
                      <input
                        className="w-full bg-input-dark border border-border-dark rounded-xl px-4 pl-12 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm"
                        id="confirm-password"
                        name="confirm-password"
                        placeholder="••••••••"
                        type="password"
                        required={isSignUp}
                      />
                    </div>
                  </div>
                )}

                {isSignUp && (
                  <div className="flex items-start gap-3 mt-2">
                    <div className="flex h-5 items-center">
                      <input
                        className="h-4 w-4 rounded border-slate-600 bg-input-dark text-primary focus:ring-primary focus:ring-offset-background-dark"
                        id="terms"
                        type="checkbox"
                        required
                      />
                    </div>
                    <label className="text-xs text-slate-400" htmlFor="terms">
                      Acepto los{' '}
                      <a
                        className="text-primary hover:text-primary/80 hover:underline"
                        href="#"
                      >
                        Términos de Servicio
                      </a>{' '}
                      y la{' '}
                      <a
                        className="text-primary hover:text-primary/80 hover:underline"
                        href="#"
                      >
                        Política de Privacidad
                      </a>{' '}
                      de StudyApp.
                    </label>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-4 w-full cursor-pointer flex items-center justify-center rounded-xl bg-gradient-to-r from-primary to-purple-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    'Cargando...'
                  ) : (
                    <>
                      {isSignUp ? 'Registrarme' : 'Iniciar Sesión'}
                      <span className="material-symbols-outlined ml-2 text-sm font-bold">
                        arrow_forward
                      </span>
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-slate-400">
                  {isSignUp ? '¿Ya tienes una cuenta? ' : '¿No tienes una cuenta? '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(!isSignUp);
                      setError(null);
                    }}
                    className="font-bold text-white hover:text-primary transition-colors"
                  >
                    {isSignUp ? 'Inicia sesión' : 'Regístrate'}
                  </button>
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 mt-4 text-slate-500">
              <span className="material-symbols-outlined text-xs">lock</span>
              <span className="text-xs font-medium">
                Tus datos están encriptados y seguros.
              </span>
            </div>
          </div>
        </div>
  );
}

export default function LoginPage() {
  return (
    <div className="relative min-h-screen flex flex-col bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display overflow-x-hidden antialiased">
      <Header />

      <main className="flex-1 flex flex-col items-center justify-center p-4 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px]"></div>
          <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[100px]"></div>
        </div>

        <Suspense fallback={null}>
          <LoginFormContent />
        </Suspense>
      </main>
    </div>
  );
}

