import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

/**
 * Middleware: Verifica autenticación y rol del usuario.
 * Redirige si el rol no coincide con la ruta.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Rutas protegidas que requieren autenticación
  // Excluir rutas de auth y assets estáticos
  if (
    pathname.startsWith('/student') ||
    pathname.startsWith('/coach') ||
    pathname.startsWith('/admin')
  ) {
    // Crear cliente de Supabase para middleware
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => {
              request.cookies.set(name, value)
            })
          },
        },
      }
    )

    // Verificar sesión
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.user) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    // Verificar rol y redirigir si es necesario
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (!profile) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    // Determinar home path según rol
    const roleHomePaths: Record<string, string> = {
      student: '/student',
      coach: '/coach',
      admin: '/admin',
    }

    const userHomePath = roleHomePaths[profile.role] || '/student'

    // Si el pathname indica un rol específico y no coincide con el role del usuario
    // Redirigir al home correcto (solo si no está ya en el home correcto)
    if (pathname !== userHomePath) {
      if (pathname.startsWith('/student') && profile.role !== 'student') {
        return NextResponse.redirect(new URL(userHomePath, request.url))
      } else if (pathname.startsWith('/coach') && profile.role !== 'coach') {
        return NextResponse.redirect(new URL(userHomePath, request.url))
      } else if (pathname.startsWith('/admin') && profile.role !== 'admin') {
        return NextResponse.redirect(new URL(userHomePath, request.url))
      }
    }

    return NextResponse.next()
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
