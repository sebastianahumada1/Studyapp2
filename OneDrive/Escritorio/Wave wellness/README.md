# Wave Wellness

Plataforma de bienestar con Next.js, shadcn/ui (base), Kokonut UI (decorativo) y Supabase.

## Requisitos

- **Node.js**: 18.x o superior
- **npm**: 9.x o superior
- **Cuenta de Supabase**: Para base de datos y autenticación

## Instalación

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd "Wave wellness"
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Copia `.env.example` a `.env.local`:

```bash
cp .env.example .env.local
```

Edita `.env.local` y agrega tus credenciales de Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
```

**Obtener credenciales:**
1. Ve a [Supabase Dashboard](https://app.supabase.com)
2. Selecciona tu proyecto
3. Ve a **Settings** → **API**
4. Copia `Project URL` y `anon public` key

**⚠️ Importante:**
- **NO** incluyas `SUPABASE_SERVICE_ROLE_KEY` en `.env.local`
- El service role key solo debe usarse en entornos servidor seguros (no Vercel Hobby)
- Nunca commitees `.env.local` al repositorio

### 4. Configurar Supabase

#### Aplicar Schema

1. Abre tu proyecto en Supabase Dashboard
2. Ve a **SQL Editor**
3. Crea un nuevo query
4. Copia y pega el contenido de `supabase/schema.sql`
5. Ejecuta el query (botón "Run" o Ctrl+Enter)
6. Verifica que todas las tablas se crearon correctamente

#### Aplicar RLS y Storage

1. En el mismo SQL Editor
2. Crea un nuevo query
3. Copia y pega el contenido de `supabase/rls.sql`
4. Ejecuta el query
5. Verifica que todas las policies se crearon correctamente

**Verificación rápida:**
```sql
-- Verificar que RLS está habilitado
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'packages', 'payments', 'credit_ledger');

-- Verificar policies
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';
```

### 5. Ejecutar servidor de desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Rutas Disponibles

### Públicas
- `/` - Landing page
- `/auth/login` - Iniciar sesión
- `/auth/register` - Registrarse
- `/ui` - Showcase de componentes UI (solo desarrollo)

### Protegidas (requieren autenticación)

#### Student
- `/student` - Dashboard (balance de créditos, movimientos, pagos)
- `/student/payments` - Ver planes, crear pagos, subir comprobantes

#### Coach
- `/coach` - Dashboard
- `/coach/availability` - Configurar disponibilidad (Slice 2)
- `/coach/schedule` - Ver agenda (Slice 2)
- `/coach/attendance` - Marcar asistencia (Slice 2)

#### Admin
- `/admin` - Dashboard
- `/admin/packages` - CRUD de paquetes/precios
- `/admin/payments` - Revisar y aprobar/rechazar pagos

## Estructura del Proyecto

```
src/
├── app/                    # Next.js App Router
│   ├── (protected)/        # Rutas protegidas
│   │   ├── student/        # Rutas de estudiante
│   │   ├── coach/          # Rutas de coach
│   │   └── admin/          # Rutas de admin
│   ├── auth/               # Rutas de autenticación
│   ├── ui/                 # Showcase de componentes
│   └── layout.tsx          # Layout root
├── components/
│   └── ui/
│       ├── base/           # Componentes base (shadcn/ui)
│       └── ...             # Componentes Kokonut UI (decorativos)
├── lib/
│   ├── auth/               # Helpers de autenticación y roles
│   ├── supabase/           # Clientes Supabase (server/client)
│   └── validations/        # Schemas de validación (Zod)
└── middleware.ts           # Guards de rutas por rol

supabase/
├── schema.sql              # Schema de base de datos
└── rls.sql                 # RLS policies + Storage
```

## Sistemas de Diseño

### Base UI (shadcn/ui) - ⭐ USAR PARA PANTALLAS FUNCIONALES

**Ubicación:** `src/components/ui/base/`

**Uso:** Sistema de diseño base para todas las pantallas funcionales:
- ✅ Autenticación (login, register)
- ✅ Dashboards (student, coach, admin)
- ✅ Tablas de datos
- ✅ Formularios
- ✅ Cualquier UI funcional de la app

**Características:**
- Mobile-first y optimizado para usuarios +60 años
- Tamaños grandes: botones e inputs altura >= 48px (ideal 56px para CTAs)
- Texto base: 16-18px mínimo
- Focus visible (focus-visible ring)
- Labels reales (no solo placeholder)
- Spacing generoso, tap targets 44px+

**Componentes disponibles:**
- `Button`, `Input`, `Label`, `Card`, `Table`, `Dialog`, `Toast`, `Tabs`

**Ejemplo:**
```tsx
import { Button } from '@/components/ui/base/button'
import { Input } from '@/components/ui/base/input'
import { Label } from '@/components/ui/base/label'
```

### Kokonut UI - ⚠️ SOLO DECORATIVO/MARKETING

**Ubicación:** `src/components/ui/` (sin `/base`)

**Uso:** Solo para componentes decorativos y marketing:
- ✅ Landing pages
- ✅ Componentes decorativos
- ✅ Marketing y promociones
- ❌ NO usar para dashboards, forms, tablas, auth

**Regla importante:** 
- **Kokonut UI: solo decorativo/marketing**
- **shadcn/ui: base funcional para toda UI de app**

## Uploads de Archivos (Vercel Hobby)

**⚠️ Importante para Vercel Hobby:**

Los uploads de archivos (comprobantes de pago) se hacen **directamente desde el cliente a Supabase Storage**, NO pasan por el servidor Next.js.

**Razón:** Vercel Hobby tiene límites estrictos en funciones serverless (10 segundos timeout, 50MB max). Subir archivos por Server Actions o Route Handlers puede fallar.

**Implementación:**
- Cliente → Supabase Storage (directo)
- Path: `payments/{auth.uid()}/{payment_id}.{ext}`
- Bucket: `payment-proofs` (privado)
- Admin genera signed URLs server-side para ver comprobantes

**Ver:** `docs/SECURITY_CHECKLIST.md` para más detalles.

## Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Build de producción
npm run build

# Iniciar servidor de producción
npm start

# Linter
npm run lint
```

## Testing y QA

Ver documentación completa en:
- `docs/QA_SLICE1.md` - Checklist E2E por rol
- `docs/SECURITY_CHECKLIST.md` - Verificación de seguridad

## Limitaciones de Slice 1

### Funcionalidades NO Implementadas

1. **Agenda/Reservas:**
   - Los estudiantes aún no pueden agendar clases
   - Los coaches pueden ver placeholders pero no configurar slots reales
   - Flujo: "Primero pagas, luego agendamos cuando tengas créditos aprobados"

2. **Créditos Ilimitados:**
   - Los paquetes con `credits = NULL` (ilimitado) NO se pueden aprobar en Slice 1
   - Al intentar aprobar, se muestra error: "No se pueden aprobar pagos con créditos ilimitados en este momento"
   - Se implementará en Slice 2

3. **Asistencia:**
   - Los coaches pueden ver placeholder de asistencia
   - No hay lógica real de marcar asistió/faltó
   - No se descuentan créditos automáticamente

### Funcionalidades Implementadas

✅ Autenticación completa (register, login, logout)
✅ Roles y guards por ruta
✅ Student: crear payments, subir comprobantes
✅ Admin: CRUD packages, aprobar/rechazar payments, ver comprobantes
✅ Ledger de créditos (balance, movimientos)
✅ Storage privado para comprobantes
✅ RLS completo en todas las tablas

## Tecnologías

- **Next.js 16.1.6** (App Router)
- **TypeScript** (strict mode)
- **Tailwind CSS**
- **shadcn/ui** (sistema base - Radix UI + Tailwind)
- **Kokonut UI** (sistema decorativo - solo marketing)
- **Supabase** (autenticación, base de datos, storage)
- **Zod** (validación de esquemas)
- **React Hook Form** (manejo de formularios)

## Documentación Adicional

- `docs/QA_SLICE1.md` - Checklist de pruebas end-to-end
- `docs/SECURITY_CHECKLIST.md` - Verificación de seguridad (RLS, Storage)
- `docs/CHECKLIST-PRUEBAS-RLS.md` - Pruebas detalladas de RLS
- `supabase/schema.sql` - Schema de base de datos
- `supabase/rls.sql` - Políticas RLS y Storage

## Soporte

Para problemas o preguntas:
1. Revisa la documentación en `docs/`
2. Verifica que las variables de entorno estén configuradas
3. Verifica que el schema y RLS estén aplicados en Supabase
4. Revisa la consola del navegador para errores
