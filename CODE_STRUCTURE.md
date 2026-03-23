# Estructura del Código - Study APP

## 📋 Información General

- **Framework**: Next.js 16+ (App Router)
- **Lenguaje**: TypeScript (strict mode)
- **Styling**: TailwindCSS
- **Base de Datos**: Supabase (PostgreSQL)
- **Estado**: TanStack Query v5
- **Validación**: Zod + React Hook Form
- **UI Components**: shadcn/ui (configurado)

---

## 🚀 Entry Point y Flujo de Inicialización

### **Diferencia con React Tradicional**

En una aplicación React tradicional:
- Entry point: `src/index.js` o `src/App.js`
- Renderiza: `<App />` en el DOM

En Next.js con App Router (este proyecto):
- Entry point: `app/layout.tsx` (Root Layout)
- Página principal: `app/page.tsx`
- Middleware: `middleware.ts` (se ejecuta antes de cada request)

### **Orden de Ejecución**

```
1. next.config.js          → Configuración de Next.js
   ↓
2. middleware.ts            → Se ejecuta ANTES de cada request
   - Refresh de sesión Supabase
   - Protección de rutas
   - Redirecciones
   ↓
3. app/layout.tsx          → ROOT LAYOUT (equivalente a <App />)
   - Wrapper HTML (<html>, <body>)
   - Providers globales (ReactQueryProvider)
   - Estilos globales (globals.css)
   - Metadata
   ↓
4. app/page.tsx            → Página principal "/" (equivalente a index)
   - Renderiza el dashboard
   ↓
5. app/providers.tsx       → QueryClientProvider wrapper
```

### **Archivos Clave**

#### **`app/layout.tsx`** - Root Layout (Entry Point Principal)
```typescript
// Este es el equivalente a <App /> en React tradicional
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ReactQueryProvider>
          {children}  {/* Aquí se renderizan las páginas */}
        </ReactQueryProvider>
      </body>
    </html>
  );
}
```

**Características:**
- Se ejecuta en **cada página** (wrapper global)
- Define la estructura HTML base
- Incluye providers globales
- Carga fuentes y estilos globales

#### **`app/page.tsx`** - Página Principal "/"
```typescript
// Equivalente a la página index/home
export default async function Home() {
  // Server Component - puede hacer async/await
  const user = await requireAuth();
  return <div>Dashboard...</div>;
}
```

**Características:**
- Server Component por defecto
- Puede hacer `async/await` directamente
- Se renderiza en el servidor

#### **`middleware.ts`** - Middleware (Pre-Request)
```typescript
// Se ejecuta ANTES de renderizar cualquier página
export async function middleware(request: NextRequest) {
  // Refresh de sesión
  // Protección de rutas
  // Redirecciones
}
```

**Características:**
- Se ejecuta en el **edge runtime**
- Acceso a cookies y headers
- Puede redirigir antes de renderizar
- Perfecto para autenticación

#### **`app/providers.tsx`** - Providers Globales
```typescript
// Wrapper para TanStack Query
export function ReactQueryProvider({ children }) {
  return <QueryClientProvider>{children}</QueryClientProvider>;
}
```

### **Comparación con React Tradicional**

| React Tradicional | Next.js App Router |
|-------------------|-------------------|
| `src/index.js` → `ReactDOM.render(<App />)` | `app/layout.tsx` → Root Layout |
| `src/App.js` → Componente principal | `app/page.tsx` → Página principal |
| `src/index.css` → Estilos globales | `app/globals.css` → Estilos globales |
| No hay middleware | `middleware.ts` → Pre-request logic |

### **Flujo de una Request**

```
Usuario hace request a "/"
  ↓
middleware.ts ejecuta
  - Verifica autenticación
  - Refresh sesión
  - Decide si redirigir
  ↓
app/layout.tsx se renderiza
  - Estructura HTML base
  - Providers globales
  ↓
app/page.tsx se renderiza
  - Server Component
  - Puede hacer fetch/async
  - Retorna JSX
  ↓
React hidrata en el cliente
  - Client Components se activan
  - Interactividad disponible
```

---

## 📁 Estructura de Directorios

```
Study APP/
├── app/                          # Next.js App Router
│   ├── (auth)/                  # Grupo de rutas de autenticación
│   │   └── login/
│   │       └── page.tsx         # Página de login/registro
│   ├── (dashboard)/             # Grupo de rutas del dashboard
│   ├── actions/                 # Server Actions
│   │   ├── auth.ts              # Autenticación (signIn, signUp, signOut)
│   │   └── knowledge-hub.ts     # CRUD Knowledge Hub (1500+ líneas)
│   ├── auth/
│   │   └── callback/
│   │       └── route.ts         # Callback OAuth Supabase
│   ├── hub/                     # Knowledge Hub
│   │   ├── page.tsx             # Lista de rutas de estudio
│   │   └── [routeId]/
│   │       └── page.tsx         # Detalle de ruta de estudio
│   ├── metodo/
│   │   └── page.tsx             # Página del método
│   ├── planes/
│   │   ├── layout.tsx
│   │   └── page.tsx             # Página de planes
│   ├── globals.css              # Estilos globales + Tailwind
│   ├── layout.tsx               # Layout raíz
│   ├── page.tsx                 # Dashboard principal
│   └── providers.tsx            # QueryClientProvider wrapper
│
├── components/                   # Componentes React
│   ├── knowledge-hub/           # Componentes del Knowledge Hub
│   │   ├── ActivityCard.tsx
│   │   ├── CreateRouteModal.tsx
│   │   ├── CreateTopicModal.tsx
│   │   ├── CreateSubtopicModal.tsx
│   │   ├── CreateSubsubtopicModal.tsx
│   │   ├── CSVImportModal.tsx
│   │   ├── EditContentPanel.tsx
│   │   ├── EditRouteModal.tsx
│   │   ├── HubMainContent.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── RichTextEditor.tsx   # Editor de texto enriquecido custom
│   │   ├── RouteCard.tsx
│   │   ├── RouteDetailContent.tsx
│   │   ├── RouteTreeNavigator.tsx
│   │   ├── SubtopicNode.tsx
│   │   ├── SubsubtopicNode.tsx
│   │   └── TopicNode.tsx
│   ├── Header.tsx                # Header público
│   └── Sidebar.tsx               # Sidebar del dashboard
│
├── hooks/                        # Custom React Hooks
│   ├── useAuth.ts               # Hook de autenticación
│   └── useKnowledgeHub.ts       # Hooks para Knowledge Hub (mutations/queries)
│
├── lib/                          # Utilidades y configuraciones
│   ├── knowledge-hub.ts         # Utilidades Knowledge Hub
│   ├── supabase/
│   │   ├── client.ts            # Cliente Supabase (browser) - Singleton
│   │   └── server.ts            # Cliente Supabase (server)
│   └── utils.ts                 # Utilidades generales (cn helper)
│
├── middleware.ts                 # Middleware Next.js (auth, session refresh)
│
├── supabase/
│   └── migrations/              # Migraciones de base de datos
│       ├── 001_knowledge_hub.sql
│       └── 002_add_content_field.sql
│
├── types/                        # TypeScript type definitions
│   └── knowledge-hub.ts         # Tipos del Knowledge Hub
│
├── .env.local.example            # Template de variables de entorno
├── components.json               # Configuración shadcn/ui
├── next.config.js                # Configuración Next.js
├── package.json                  # Dependencias
├── postcss.config.js             # Configuración PostCSS
├── tailwind.config.ts            # Configuración TailwindCSS
└── tsconfig.json                 # Configuración TypeScript
```

---

## 🏗️ Arquitectura

### **Patrón de Datos**

1. **Server Actions** (`app/actions/`)
   - Toda la lógica de negocio y acceso a BD
   - Funciones async que retornan `{ success: true, data }` o `{ success: false, error }`
   - Validación de usuario en cada acción
   - Revalidación de rutas con `revalidatePath`

2. **Custom Hooks** (`hooks/`)
   - Wrappers de TanStack Query
   - `useRoutes()`, `useRoute()`, `useRouteProgress()`
   - Mutations: `useCreateRoute()`, `useUpdateRoute()`, `useDeleteRoute()`, etc.
   - Invalidación automática de queries

3. **Componentes**
   - Separación clara entre Server Components y Client Components
   - Client Components marcados con `'use client'`
   - Modales usando React Portals para overlay

### **Flujo de Datos**

```
Usuario → Componente (Client) 
  → Hook (TanStack Query) 
    → Server Action 
      → Supabase 
        → PostgreSQL
```

---

## 🔑 Puntos Clave para Revisión

### **1. Server Actions** (`app/actions/knowledge-hub.ts`)
- **Tamaño**: ~1500 líneas - Considerar dividir en módulos
- **Funciones principales**:
  - CRUD de rutas, temas, subtemas, sub-subtemas
  - `generateRouteWithAI()` - Integración OpenAI
  - `importRoutesFromCSV()` - Importación CSV con parser custom
  - `calculateRouteProgress()` - Cálculo de progreso
  - `toggleTopicCompletion()` - Lógica de completado en cascada

### **2. Parser CSV** (`app/actions/knowledge-hub.ts`)
- Parser custom (no usa librería externa)
- Soporta delimitadores: `,` y `;`
- Maneja campos entre comillas
- Normaliza headers a minúsculas
- Limpia BOM (Byte Order Mark)

### **3. Rich Text Editor** (`components/knowledge-hub/RichTextEditor.tsx`)
- Editor custom (no usa `react-quill` por incompatibilidad con React 19)
- Usa `document.execCommand` (API legacy)
- Considerar migrar a una solución más moderna

### **4. Autenticación**
- Supabase Auth con email/password
- Middleware para refresh de sesión
- RLS (Row Level Security) en Supabase

### **5. Base de Datos**
- **Tablas principales**:
  - `study_routes` - Rutas de estudio
  - `study_topics` - Temas (Nivel 1)
  - `study_subtopics` - Subtemas (Nivel 2)
  - `study_subsubtopics` - Sub-subtemas (Nivel 3)
- Relaciones: CASCADE DELETE
- Campos: `content TEXT` para contenido HTML

---

## ⚠️ Áreas de Mejora Potencial

1. **`app/actions/knowledge-hub.ts`** - Archivo muy grande, considerar:
   - Dividir en módulos: `routes.ts`, `topics.ts`, `csv-import.ts`, `ai-generation.ts`

2. **Rich Text Editor** - Considerar alternativas:
   - `@tiptap/react` (moderno, compatible con React 19)
   - `slate-react` (más control, más complejo)

3. **Parser CSV** - Considerar librería:
   - `papaparse` (robusto, bien mantenido)
   - O mantener custom pero con mejor testing

4. **Error Handling**:
   - Implementar error boundaries
   - Mejorar mensajes de error al usuario
   - Logging estructurado

5. **Testing**:
   - No hay tests actualmente
   - Considerar: Jest + React Testing Library

6. **Performance**:
   - Optimizar queries de Supabase (índices)
   - Considerar paginación para listas grandes
   - Lazy loading de componentes pesados

---

## 🔒 Seguridad

- ✅ Validación de usuario en cada Server Action
- ✅ RLS en Supabase
- ✅ Variables de entorno para secrets
- ✅ Sanitización de inputs (Zod)
- ⚠️ Revisar: Sanitización de HTML en `content` field (XSS)

---

## 📦 Dependencias Principales

```json
{
  "next": "^16.1.1",
  "react": "^19.0.0",
  "typescript": "^5.6.3",
  "@supabase/ssr": "^0.5.2",
  "@supabase/supabase-js": "^2.49.2",
  "@tanstack/react-query": "^5.62.11",
  "zod": "^3.24.1",
  "react-hook-form": "^7.54.2",
  "tailwindcss": "^3.4.17"
}
```

---

## 🎨 Estilos

- **TailwindCSS** con configuración custom
- **Dark mode** por defecto
- **Colores personalizados**: `primary`, `secondary`, `accent`
- **Animaciones**: `fadeIn`, `zoomIn95`
- **Material Symbols** para iconos

---

## 📝 Convenciones de Código

- **Nombres de archivos**: PascalCase para componentes, camelCase para utilidades
- **Server Actions**: Prefijo descriptivo (`createRoute`, `updateRoute`, etc.)
- **Hooks**: Prefijo `use` (`useRoutes`, `useCreateRoute`)
- **Types**: Definidos en `types/` con interfaces exportadas
- **Client Components**: Marcados explícitamente con `'use client'`

---

## 🚀 Scripts Disponibles

```bash
npm run dev          # Desarrollo
npm run build        # Build de producción
npm run start        # Iniciar servidor de producción
npm run lint         # Linter
npm run type-check   # Verificación de tipos TypeScript
```

---

## 📌 Notas para el Revisor

1. **Archivo grande**: `app/actions/knowledge-hub.ts` tiene ~1500 líneas - considerar refactorización
2. **Parser CSV custom**: Funcional pero podría beneficiarse de una librería probada
3. **Rich Text Editor**: Usa API legacy, considerar modernización
4. **Sin tests**: Proyecto funcional pero sin cobertura de tests
5. **Código funcional**: La aplicación está operativa y cumple los requisitos

---

**Última actualización**: Diciembre 2024

