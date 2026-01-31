# Implementación Completa - Schema SQL + Env Vars (PASO 2)

## ✅ Estado: COMPLETADO

Todos los archivos han sido creados según la SPEC y el plan.

## Archivos Creados

### Variables de Entorno ✅
- `.env.example` - Template con variables públicas de Supabase

### Schema SQL ✅
- `/supabase/schema.sql` - Schema completo con enums, tablas, foreign keys e índices

## Contenido de `.env.example`

```env
# Supabase Configuration
# Copy this file to .env.local and fill with your Supabase project credentials
# Get these values from: Supabase Dashboard → Project Settings → API

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Note: Do NOT include SUPABASE_SERVICE_ROLE_KEY here
# Service role key should NEVER be used in frontend code
```

## Contenido de `supabase/schema.sql`

### Enums Creados
- `role`: student, coach, admin
- `payment_status`: pending, approved, rejected
- `ledger_reason`: payment_approved, manual_adjustment

### Tablas Creadas

**profiles**
- id (uuid PK, FK auth.users)
- full_name (text)
- phone (text)
- role (role enum, default 'student')
- created_at (timestamptz)

**packages**
- id (uuid PK)
- name (text)
- credits (int, nullable - null = ilimitado)
- price (numeric)
- active (boolean, default true)
- created_at (timestamptz)

**payments** (con snapshot)
- id (uuid PK)
- student_id (uuid FK profiles)
- package_id (uuid FK packages)
- status (payment_status enum)
- proof_path (text, nullable)
- **SNAPSHOT**: package_name, package_credits, amount
- created_at (timestamptz)
- approved_at (timestamptz, nullable)
- approved_by (uuid FK profiles, nullable)

**credit_ledger**
- id (uuid PK)
- student_id (uuid FK profiles)
- delta (int)
- reason (ledger_reason enum)
- ref_payment_id (uuid FK payments, nullable)
- created_at (timestamptz)
- created_by (uuid FK profiles, nullable)

### Índices Creados
- `idx_packages_active` - packages(active)
- `idx_payments_status_created_at` - payments(status, created_at)
- `idx_payments_student_created_at` - payments(student_id, created_at)
- `idx_credit_ledger_student_created_at` - credit_ledger(student_id, created_at)

### Foreign Keys
- profiles.id → auth.users.id (ON DELETE CASCADE)
- payments.student_id → profiles.id (ON DELETE CASCADE)
- payments.package_id → packages.id (ON DELETE RESTRICT)
- payments.approved_by → profiles.id (ON DELETE SET NULL)
- credit_ledger.student_id → profiles.id (ON DELETE CASCADE)
- credit_ledger.ref_payment_id → payments.id (ON DELETE SET NULL)
- credit_ledger.created_by → profiles.id (ON DELETE SET NULL)

## Verificación del Schema

### Checklist
- [x] Enums creados correctamente
- [x] Todas las tablas con columnas exactas especificadas
- [x] Foreign keys definidas correctamente
- [x] Índices creados según especificación
- [x] Payments tiene snapshot en columnas individuales (package_name, package_credits, amount)
- [x] NO hay RLS policies (se agregarán después)
- [x] NO hay seeds de packages
- [x] NO hay columnas inventadas
- [x] Usa gen_random_uuid() para UUIDs
- [x] Documentación incluida sobre cómo aplicar

## Pasos Exactos para Probar

### 1. Configurar Variables de Entorno

```bash
# Copiar template
cp .env.example .env.local

# Editar .env.local y agregar tus credenciales de Supabase:
# - NEXT_PUBLIC_SUPABASE_URL: Tu URL del proyecto
# - NEXT_PUBLIC_SUPABASE_ANON_KEY: Tu anon key
```

Obtener credenciales:
1. Ve a [Supabase Dashboard](https://app.supabase.com)
2. Selecciona tu proyecto
3. Ve a Settings → API
4. Copia "Project URL" y "anon public" key

### 2. Aplicar Schema en Supabase

1. Abre tu proyecto en Supabase Dashboard
2. Ve a **SQL Editor** en el menú lateral
3. Haz clic en **New Query**
4. Abre el archivo `/supabase/schema.sql` en tu editor
5. Copia **TODO** el contenido del archivo
6. Pega en el SQL Editor de Supabase
7. Haz clic en **Run** (o presiona Ctrl+Enter / Cmd+Enter)
8. Verifica que no hay errores en la consola

### 3. Verificar que las Tablas se Crearon

En Supabase SQL Editor, ejecuta:

```sql
-- Verificar tablas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

Deberías ver: `credit_ledger`, `packages`, `payments`, `profiles`

### 4. Verificar Enums

```sql
-- Verificar enums
SELECT typname, enumlabel 
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid 
WHERE typname IN ('role', 'payment_status', 'ledger_reason')
ORDER BY typname, enumlabel;
```

Deberías ver todos los valores de los enums.

### 5. Verificar Foreign Keys

En Supabase Dashboard:
1. Ve a **Table Editor**
2. Selecciona cada tabla
3. Verifica que las foreign keys aparecen en la sección "Foreign Keys"

### 6. Verificar Índices

```sql
-- Verificar índices
SELECT indexname, tablename 
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;
```

Deberías ver los 4 índices creados.

## Notas Importantes

1. **RLS no está habilitado**: Este paso solo crea el schema. Las policies RLS se agregarán en el siguiente paso según la skill `supabase-schema-and-rls`.

2. **Snapshot en payments**: El snapshot usa columnas individuales (`package_name`, `package_credits`, `amount`), no JSON. Esto sigue el patrón de `payments-ledger-accounting`.

3. **No hay seeds**: Los packages deben ser creados por el admin desde el panel. No se incluyen datos iniciales.

4. **Service Role Key**: NO está incluido en `.env.example` porque nunca debe usarse en frontend según las reglas globales.

## Próximos Pasos

1. Aplicar el schema en Supabase SQL Editor
2. Configurar `.env.local` con credenciales reales
3. Habilitar RLS y crear policies (siguiente paso)
4. Actualizar helpers de Supabase para usar conexión real
5. Implementar autenticación real
