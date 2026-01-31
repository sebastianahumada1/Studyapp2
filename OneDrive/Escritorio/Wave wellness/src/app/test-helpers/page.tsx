import { getCurrentProfile } from '@/lib/auth/getCurrentProfile'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

// Forzar renderizado dinámico para que las cookies se lean correctamente
export const dynamic = 'force-dynamic'

export default async function TestHelpersPage() {
  // Verificar cookies primero (para debug)
  const cookieStore = await cookies()
  const allCookies = cookieStore.getAll()
  const supabaseCookies = allCookies.filter(c => c.name.startsWith('sb-'))
  
  // Crear cliente de Supabase
  const supabase = await createClient()
  
  // 1. Verificar sesión - Usar getSession() primero (más confiable)
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
  const sessionDebug = sessionData
  const user = sessionData?.session?.user || null
  const authError = sessionError
  
  // 3. Obtener profile
  const profile = await getCurrentProfile()

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">Test: Supabase Helpers</h1>
      
      {/* Sección: Sesión */}
      <section className="border p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">1. Sesión de Usuario</h2>
        {authError ? (
          <div className="text-red-500">
            <p><strong>Error:</strong> {authError.message}</p>
            <p className="text-sm mt-2">❌ No hay sesión activa</p>
          </div>
        ) : user ? (
          <div className="text-green-600">
            <p className="text-sm">✅ Usuario autenticado</p>
            <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
              {JSON.stringify({ id: user.id, email: user.email }, null, 2)}
            </pre>
          </div>
        ) : (
          <div className="text-yellow-600">
            <p>⚠️ No hay usuario (pero tampoco error)</p>
          </div>
        )}
      </section>

      {/* Sección: Profile */}
      <section className="border p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">2. Perfil del Usuario</h2>
        {profile ? (
          <div className="text-green-600">
            <p className="text-sm mb-2">✅ Profile encontrado</p>
            <div className="space-y-1 text-sm">
              <p><strong>ID:</strong> {profile.id}</p>
              <p><strong>Nombre:</strong> {profile.full_name}</p>
              <p><strong>Teléfono:</strong> {profile.phone}</p>
              <p><strong>Role:</strong> <span className="font-mono bg-blue-100 px-2 py-1 rounded">{profile.role}</span></p>
              {profile.created_at && (
                <p><strong>Created At:</strong> {new Date(profile.created_at).toLocaleString()}</p>
              )}
            </div>
          </div>
        ) : (
          <div className="text-red-500">
            <p className="text-sm">❌ No hay profile</p>
            <p className="text-xs mt-2">
              Posibles causas:
            </p>
            <ul className="text-xs mt-1 list-disc list-inside space-y-1">
              <li>Usuario no autenticado</li>
              <li>Usuario no tiene registro en la tabla <code className="bg-gray-100 px-1 rounded">profiles</code></li>
              <li>Error de RLS (Row Level Security) - verifica policies</li>
            </ul>
          </div>
        )}
      </section>

      {/* Sección: Cookies (Debug) */}
      <section className="border p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">3. Cookies (Debug)</h2>
        {supabaseCookies.length > 0 ? (
          <div className="text-green-600">
            <p className="text-sm mb-2">✅ Cookies de Supabase encontradas: {supabaseCookies.length}</p>
            <div className="text-xs space-y-1 mt-2">
              {supabaseCookies.map((cookie, idx) => (
                <div key={idx} className="font-mono bg-gray-100 p-2 rounded">
                  <p><strong>Nombre:</strong> {cookie.name}</p>
                  <p><strong>Valor (primeros 50 chars):</strong> {cookie.value.substring(0, 50)}...</p>
                  <p><strong>Es JSON?:</strong> {cookie.value.startsWith('{') ? 'Sí' : 'No'}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-red-500">
            <p className="text-sm">❌ No se encontraron cookies de Supabase</p>
            <p className="text-xs mt-2">
              Esto significa que las cookies no se están sincronizando entre cliente y servidor.
              Intenta recargar la página manualmente después de hacer login.
            </p>
          </div>
        )}
      </section>

      {/* Sección: Session Debug */}
      {sessionDebug && (
        <section className="border p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">3.5. Session Debug</h2>
          <div className="text-xs">
            <pre className="bg-gray-100 p-2 rounded overflow-auto">
              {JSON.stringify(sessionDebug, null, 2)}
            </pre>
          </div>
        </section>
      )}

      {/* Sección: Variables de Entorno */}
      <section className="border p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">4. Variables de Entorno</h2>
        <div className="text-sm space-y-1">
          <p>
            <strong>NEXT_PUBLIC_SUPABASE_URL:</strong>{' '}
            {process.env.NEXT_PUBLIC_SUPABASE_URL ? (
              <span className="text-green-600">✅ Configurada</span>
            ) : (
              <span className="text-red-500">❌ No configurada</span>
            )}
          </p>
          <p>
            <strong>NEXT_PUBLIC_SUPABASE_ANON_KEY:</strong>{' '}
            {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? (
              <span className="text-green-600">✅ Configurada</span>
            ) : (
              <span className="text-red-500">❌ No configurada</span>
            )}
          </p>
        </div>
      </section>

      {/* Instrucciones */}
      <section className="border p-4 rounded-lg bg-blue-50">
        <h2 className="text-xl font-semibold mb-2">📋 Próximos Pasos</h2>
        <ol className="text-sm space-y-2 list-decimal list-inside">
          <li>Si no hay sesión: Ve a <code className="bg-gray-100 px-1 rounded">/auth/login</code> e inicia sesión</li>
          <li>Si hay sesión pero no profile: Crea un registro en la tabla <code className="bg-gray-100 px-1 rounded">profiles</code></li>
          <li>Verifica que las variables de entorno estén en <code className="bg-gray-100 px-1 rounded">.env.local</code></li>
        </ol>
      </section>
    </div>
  )
}
