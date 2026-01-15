'use client';

import { signOut } from '@/app/actions/auth';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useMemo } from 'react';
import Link from 'next/link';

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
    router.refresh();
  };

  const userName = useMemo(
    () => user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuario',
    [user]
  );
  const userEmail = useMemo(() => user?.email || '', [user]);
  const userAvatar = useMemo(
    () => user?.user_metadata?.avatar_url || user?.user_metadata?.picture,
    [user]
  );

  return (
    <aside className="hidden md:flex flex-col w-20 lg:w-72 h-full border-r border-white/5 bg-[#0f0c1d] p-4 lg:p-5 justify-between flex-shrink-0 transition-all duration-300 z-50">
      <div className="flex flex-col gap-8">
        <div className="flex items-center gap-3 px-1 lg:px-2 justify-center lg:justify-start">
          <div className="relative">
            {loading ? (
              <div className="size-10 lg:size-12 rounded-full bg-white/10 animate-pulse"></div>
            ) : (
              <>
                {userAvatar ? (
                  <div
                    className="bg-center bg-no-repeat bg-cover rounded-full size-10 lg:size-12 ring-2 ring-accent/30 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                    style={{ backgroundImage: `url("${userAvatar}")` }}
                  ></div>
                ) : (
                  <div className="size-10 lg:size-12 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold text-lg ring-2 ring-accent/30 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full border-2 border-[#0f0c1d]"></div>
              </>
            )}
          </div>
          <div className="hidden lg:flex flex-col">
            <h1 className="text-white text-base font-semibold leading-normal tracking-wide">
              {loading ? 'Cargando...' : userName}
            </h1>
            <p className="text-accent text-xs font-medium leading-normal">
              {loading ? '...' : userEmail || 'Usuario'}
            </p>
          </div>
        </div>

        <nav className="flex flex-col gap-2">
          <Link
            href="/"
            className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all group ${
              pathname === '/'
                ? 'bg-gradient-to-r from-primary/20 to-transparent border-l-4 border-primary text-white'
                : 'hover:bg-white/5 text-text-secondary hover:text-white'
            }`}
          >
            <span
              className={`material-symbols-outlined text-[24px] transition-colors ${
                pathname === '/'
                  ? 'text-primary group-hover:text-white'
                  : 'group-hover:text-accent'
              }`}
            >
              dashboard
            </span>
            <p className="hidden lg:block text-sm font-medium leading-normal">
              Dashboard
            </p>
          </Link>
          <Link
            href="/hub"
            className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all group ${
              pathname?.startsWith('/hub')
                ? 'bg-gradient-to-r from-primary/20 to-transparent border-l-4 border-primary text-white'
                : 'hover:bg-white/5 text-text-secondary hover:text-white'
            }`}
          >
            <span
              className={`material-symbols-outlined text-[24px] transition-colors ${
                pathname?.startsWith('/hub')
                  ? 'text-primary group-hover:text-white'
                  : 'group-hover:text-accent'
              }`}
            >
              hub
            </span>
            <p className="hidden lg:block text-sm font-medium leading-normal">
              Hub de Conocimiento
            </p>
          </Link>
          <Link
            href="/assessment"
            className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all group ${
              pathname?.startsWith('/assessment') || pathname?.startsWith('/evaluacion')
                ? 'bg-gradient-to-r from-primary/20 to-transparent border-l-4 border-primary text-white'
                : 'hover:bg-white/5 text-text-secondary hover:text-white'
            }`}
          >
            <span
              className={`material-symbols-outlined text-[24px] transition-colors ${
                pathname?.startsWith('/assessment') || pathname?.startsWith('/evaluacion')
                  ? 'text-primary group-hover:text-white'
                  : 'group-hover:text-accent'
              }`}
            >
              quiz
            </span>
            <p className="hidden lg:block text-sm font-medium leading-normal">
              Evaluación
            </p>
          </Link>
          <Link
            href="/mentor"
            className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all group ${
              pathname?.startsWith('/mentor')
                ? 'bg-gradient-to-r from-primary/20 to-transparent border-l-4 border-primary text-white'
                : 'hover:bg-white/5 text-text-secondary hover:text-white'
            }`}
          >
            <span
              className={`material-symbols-outlined text-[24px] transition-colors ${
                pathname?.startsWith('/mentor')
                  ? 'text-primary group-hover:text-white'
                  : 'group-hover:text-accent'
              }`}
            >
              chat_bubble
            </span>
            <p className="hidden lg:block text-sm font-medium leading-normal">
              Mentor IA
            </p>
          </Link>
          <Link
            href="/errors"
            className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all group ${
              pathname?.startsWith('/errors')
                ? 'bg-gradient-to-r from-primary/20 to-transparent border-l-4 border-primary text-white'
                : 'hover:bg-white/5 text-text-secondary hover:text-white'
            }`}
          >
            <span
              className={`material-symbols-outlined text-[24px] transition-colors ${
                pathname?.startsWith('/errors')
                  ? 'text-primary group-hover:text-white'
                  : 'group-hover:text-accent'
              }`}
            >
              assignment_late
            </span>
            <p className="hidden lg:block text-sm font-medium leading-normal">
              Dashboard de Errores
            </p>
          </Link>
        </nav>
      </div>

      <button
        onClick={handleSignOut}
        className="flex w-full cursor-pointer items-center justify-center lg:justify-start gap-3 rounded-xl h-12 lg:px-4 bg-[#1a162e] hover:bg-[#231e3d] text-text-secondary hover:text-white text-sm font-bold transition-colors border border-white/5"
      >
        <span className="material-symbols-outlined text-[20px]">logout</span>
        <span className="hidden lg:block truncate">Cerrar Sesión</span>
      </button>
    </aside>
  );
}

