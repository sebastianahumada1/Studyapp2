# Supabase Schema + Env Vars (PASO 2)

## Contexto
- Crear schema SQL completo para Supabase con tablas de perfiles, packages, payments y ledger
- Configurar variables de entorno para conexión a Supabase
- Preparar base de datos sin RLS aún (se agregará en siguiente paso)
- ¿Qué usuario lo necesita?: Desarrolladores que implementarán autenticación y funcionalidad de pagos

## Requisitos

### DB
- [ ] Enums: `role` (student, coach, admin), `payment_status` (pending, approved, rejected), `ledger_reason` (payment_approved, manual_adjustment)
- [ ] Tabla `profiles`: id (uuid PK, auth.users.id), full_name, phone, role, created_at
- [ ] Tabla `packages`: id (uuid PK), name, credits (int null), price, active, created_at
- [ ] Tabla `payments`: id (uuid PK), student_id (FK profiles), package_id (FK packages), status, proof_path, package_name (snapshot), package_credits (snapshot), amount (snapshot), created_at, approved_at, approved_by (FK profiles)
- [ ] Tabla `credit_ledger`: id (uuid PK), student_id (FK profiles), delta, reason, ref_payment_id (FK payments), created_at, created_by (FK profiles)
- [ ] Índices: packages(active), payments(status, created_at), payments(student_id, created_at), credit_ledger(student_id, created_at)
- [ ] NO seeds de packages (admin los crea)
- [ ] NO inventar columnas extra
- [ ] Compatible con Supabase Postgres (gen_random_uuid())
- [ ] Documentar cómo aplicar SQL en Supabase SQL Editor

### Env Vars
- [ ] `.env.example` con NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY
- [ ] NO incluir service_role key

### Pagos (según payments-ledger-accounting)
- [ ] Payments tiene snapshot: package_name, package_credits, amount (columnas individuales, no JSON)
- [ ] Snapshot se guarda al crear payment (no al aprobar)

## Implementación

1. Crear `.env.example` con variables de Supabase
2. Crear `/supabase/schema.sql` con:
   - Comentario inicial sobre cómo aplicar en Supabase
   - Enums
   - Tablas con todas las columnas especificadas
   - Foreign keys
   - Índices
   - Sin RLS (se agregará después)
   - Sin seeds

## Testing

- [ ] `.env.example` existe y tiene solo variables públicas
- [ ] `schema.sql` se puede ejecutar en Supabase SQL Editor sin errores
- [ ] Todas las tablas se crean correctamente
- [ ] Foreign keys funcionan
- [ ] Índices se crean correctamente
- [ ] No hay columnas inventadas
- [ ] Snapshot en payments usa columnas individuales (package_name, package_credits, amount)
