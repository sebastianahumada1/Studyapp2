'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';

export function Header() {
  const pathname = usePathname();
  const [searchMode, setSearchMode] = useState<string | null>(null);
  const { user, loading } = useAuth();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setSearchMode(params.get('mode'));
    }
  }, [pathname]);


  return (
    <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-solid border-[#223f49] bg-[#101e23]/90 backdrop-blur-md px-6 py-4 lg:px-12">
      <Link href="/" className="flex items-center gap-4 text-white cursor-pointer">
        <div className="size-8 text-primary flex items-center justify-center">
          <span className="material-symbols-outlined text-3xl">neurology</span>
        </div>
        <h2 className="text-white text-xl font-bold leading-tight tracking-[-0.015em]">
          StudyApp
        </h2>
      </Link>
      <nav className="hidden md:flex flex-1 justify-end gap-8 items-center">
        <div className="flex items-center gap-8">
          <Link
            className={`transition-colors text-sm font-medium leading-normal relative ${
              pathname === '/metodo'
                ? 'text-white after:content-[""] after:absolute after:-bottom-1 after:left-0 after:w-full after:h-0.5 after:bg-primary after:rounded-full'
                : 'text-slate-300 hover:text-white'
            }`}
            href="/metodo"
          >
            Método
          </Link>
          <Link
            className={`transition-colors text-sm font-medium leading-normal relative ${
              pathname === '/planes'
                ? 'text-white after:content-[""] after:absolute after:-bottom-1 after:left-0 after:w-full after:h-0.5 after:bg-primary after:rounded-full'
                : 'text-slate-300 hover:text-white'
            }`}
            href="/planes"
          >
            Planes
          </Link>
        </div>
        {!loading && !user && (
          <div className="flex items-center gap-3">
            <Link
              href="/login?mode=signin"
              className={`flex min-w-[100px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-5 border text-sm font-bold leading-normal tracking-[0.015em] transition-all ${
                pathname === '/login' && searchMode === 'signin'
                  ? 'bg-primary hover:bg-primary/90 border-primary text-white'
                  : 'bg-white/5 hover:bg-primary/20 border-white/10 hover:border-primary/50 text-white hover:text-primary'
              }`}
            >
              <span className="truncate">Iniciar Sesión</span>
            </Link>
            <Link
              href="/login"
              className={`flex min-w-[120px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-5 border text-sm font-bold leading-normal tracking-[0.015em] transition-all ${
                pathname === '/login' && (!searchMode || searchMode !== 'signin')
                  ? 'bg-primary hover:bg-primary/90 border-primary text-white'
                  : 'bg-white/5 hover:bg-primary/20 border-white/10 hover:border-primary/50 text-white hover:text-primary'
              }`}
            >
              <span className="truncate">Crear Cuenta</span>
            </Link>
          </div>
        )}
        {!loading && user && (
          <Link
            href="/"
            className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-5 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-bold leading-normal tracking-[0.015em] transition-all"
          >
            <span className="truncate">Mi Perfil</span>
          </Link>
        )}
      </nav>
      <button className="md:hidden text-white">
        <span className="material-symbols-outlined">menu</span>
      </button>
    </header>
  );
}

