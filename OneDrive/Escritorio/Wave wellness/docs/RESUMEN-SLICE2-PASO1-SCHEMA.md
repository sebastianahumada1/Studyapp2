# Resumen: Slice 2 - PASO 1 - Schema Disponibilidad y Reservas

## ✅ Implementación Completa

### Archivos Creados

1. **`docs/plan-slice2-schema-availability-bookings.md`**
   - Plan y Definition of Done

2. **`docs/IMPLEMENTACION-SLICE2-SCHEMA.md`**
   - Documentación técnica detallada
   - Pruebas básicas
   - Verificación de constraints

3. **`supabase/schema-slice2-additions.sql`**
   - Archivo SQL con SOLO los agregados de Slice 2
   - Listo para aplicar en Supabase

4. **`docs/RESUMEN-SLICE2-PASO1-SCHEMA.md`**
   - Este archivo

### Archivos Modificados

1. **`supabase/schema.sql`**
   - Agregado enum `booking_status`
   - Agregada tabla `coach_slots`
   - Agregada tabla `class_bookings`
   - Agregados indexes
   - Agregada función helper `get_slot_booked_count()`

## Cambios Realizados

### 1. Enum booking_status

```sql
CREATE TYPE booking_status AS ENUM ('booked', 'cancelled', 'attended', 'no_show');
```

**Estados:**
- `booked`: Reserva activa
- `cancelled`: Reserva cancelada
- `attended`: Estudiante asistió
- `no_show`: Estudiante no asistió

### 2. Tabla coach_slots

**Propósito:** Bloques de disponibilidad de coaches (1 hora, capacidad 2)

**Columnas:**
- `id`: UUID primary key
- `coach_id`: Referencia a profiles (coach)
- `starts_at`: Inicio del bloque (timestamptz)
- `ends_at`: Fin del bloque (timestamptz, debe ser starts_at + 1 hora)
- `capacity`: Capacidad fija = 2
- `active`: Si el slot está activo
- `created_at`: Fecha de creación

**Constraints:**
- `check_slot_duration`: `ends_at = starts_at + interval '1 hour'`
- `check_capacity`: `capacity = 2` (fijo)
- `unique_coach_slot_time`: `UNIQUE (coach_id, starts_at)` - evita duplicados

**Indexes:**
- `idx_coach_slots_coach_starts_at`: Para filtrar por coach y fecha
- `idx_coach_slots_active`: Para filtrar slots activos

### 3. Tabla class_bookings

**Propósito:** Reservas de estudiantes en slots

**Columnas:**
- `id`: UUID primary key
- `slot_id`: Referencia a coach_slots
- `student_id`: Referencia a profiles (student)
- `status`: Estado de la reserva (booking_status)
- `created_at`: Fecha de creación
- `cancelled_at`: Fecha de cancelación (NULL si no cancelada)

**Constraints:**
- `unique_student_slot`: `UNIQUE (slot_id, student_id)` - evita doble reserva

**Indexes:**
- `idx_class_bookings_slot`: Para queries por slot
- `idx_class_bookings_student`: Para queries por student
- `idx_class_bookings_status`: Para filtrar bookings activos (booked)

### 4. Función Helper get_slot_booked_count()

**Propósito:** Obtener cantidad de reservas activas (status = 'booked') para un slot

**Uso:**
```sql
SELECT get_slot_booked_count('slot-uuid-here');
-- Retorna: int (0, 1, o 2)
```

**Lógica:**
- Cuenta bookings con `status = 'booked'` para el slot dado
- Retorna 0, 1, o 2 (máximo por capacity)

## Pasos para Aplicar en Supabase

### Opción 1: Aplicar Solo los Agregados (Recomendado)

1. Abre tu proyecto en Supabase Dashboard
2. Ve a **SQL Editor**
3. Crea un nuevo query
4. Copia y pega el contenido de `supabase/schema-slice2-additions.sql`
5. Ejecuta el query (botón "Run" o Ctrl+Enter)
6. Verifica que no hay errores

### Opción 2: Aplicar Schema Completo

1. Copia todo el contenido de `supabase/schema.sql` (ya incluye Slice 2)
2. Ejecuta en SQL Editor
3. Verifica que no hay errores (puede mostrar warnings si las tablas ya existen)

## Verificación

### Verificar que se crearon las tablas

```sql
-- Verificar tablas
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('coach_slots', 'class_bookings');

-- Verificar enum
SELECT typname, typtype 
FROM pg_type 
WHERE typname = 'booking_status';

-- Verificar función
SELECT proname, prorettype::regtype 
FROM pg_proc 
WHERE proname = 'get_slot_booked_count';
```

**Resultado esperado:**
- ✅ `coach_slots` existe
- ✅ `class_bookings` existe
- ✅ `booking_status` enum existe
- ✅ `get_slot_booked_count` función existe

### Verificar Constraints

```sql
-- Verificar constraints de coach_slots
SELECT conname, contype, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'coach_slots'::regclass;

-- Verificar constraints de class_bookings
SELECT conname, contype, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'class_bookings'::regclass;
```

**Resultado esperado:**
- ✅ `check_slot_duration` existe
- ✅ `check_capacity` existe
- ✅ `unique_coach_slot_time` existe
- ✅ `unique_student_slot` existe

## Pruebas Básicas

Ver `docs/IMPLEMENTACION-SLICE2-SCHEMA.md` para pruebas detalladas.

### Test Rápido

```sql
-- 1. Crear slot
INSERT INTO coach_slots (coach_id, starts_at, ends_at)
VALUES (
  'coach-uuid-here',
  '2024-01-15 09:00:00+00',
  '2024-01-15 10:00:00+00'
);

-- 2. Verificar función
SELECT get_slot_booked_count('slot-uuid-here');
-- Debe retornar: 0

-- 3. Crear booking
INSERT INTO class_bookings (slot_id, student_id)
VALUES ('slot-uuid-here', 'student-uuid-here');

-- 4. Verificar función de nuevo
SELECT get_slot_booked_count('slot-uuid-here');
-- Debe retornar: 1
```

## Diff del Schema

**Agregado después de la línea 25 (después de `ledger_reason` enum):**

```sql
CREATE TYPE booking_status AS ENUM ('booked', 'cancelled', 'attended', 'no_show');
```

**Agregado después de la línea 90 (después de indexes de Slice 1):**

```sql
-- Coach Slots: Bloques de disponibilidad de coaches (1 hora, capacidad 2)
CREATE TABLE coach_slots (...);

-- Class Bookings: Reservas de estudiantes en slots
CREATE TABLE class_bookings (...);

-- Indexes
CREATE INDEX idx_coach_slots_coach_starts_at ON coach_slots(coach_id, starts_at);
CREATE INDEX idx_coach_slots_active ON coach_slots(active) WHERE active = true;
CREATE INDEX idx_class_bookings_slot ON class_bookings(slot_id);
CREATE INDEX idx_class_bookings_student ON class_bookings(student_id);
CREATE INDEX idx_class_bookings_status ON class_bookings(status) WHERE status = 'booked';

-- Helper Function
CREATE OR REPLACE FUNCTION get_slot_booked_count(slot_uuid uuid) RETURNS int AS $$ ... $$;
```

## Notas Importantes

### No Implementado Todavía

1. **RLS Policies:**
   - Las policies para `coach_slots` y `class_bookings` se agregarán en un paso posterior
   - Por ahora las tablas están sin RLS (o con RLS deshabilitado)

2. **Triggers:**
   - No se implementan triggers todavía
   - El descuento de créditos se hará en un paso posterior

3. **Validación de Créditos:**
   - La validación de "créditos > 0" se hará en la app o mediante RPC
   - No está en el schema (solo estructura)

### Reglas del Schema

1. **Capacity fijo:** `capacity = 2` (constraint CHECK)
2. **Duración fija:** `ends_at = starts_at + interval '1 hour'` (constraint CHECK)
3. **Sin duplicados:** `UNIQUE (coach_id, starts_at)` para slots
4. **Sin doble reserva:** `UNIQUE (slot_id, student_id)` para bookings

## Próximos Pasos (Slice 2)

1. **Paso 2:** Agregar RLS policies para `coach_slots` y `class_bookings`
2. **Paso 3:** Implementar UI para coaches (crear slots)
3. **Paso 4:** Implementar UI para students (reservar slots) + validación de créditos
4. **Paso 5:** Implementar triggers para descuento de créditos al marcar asistencia

## Archivos de Referencia

- `supabase/schema.sql` - Schema completo (incluye Slice 2)
- `supabase/schema-slice2-additions.sql` - Solo agregados de Slice 2
- `docs/IMPLEMENTACION-SLICE2-SCHEMA.md` - Documentación técnica
- `docs/plan-slice2-schema-availability-bookings.md` - Plan y DoD
