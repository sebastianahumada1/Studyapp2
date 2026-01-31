# Implementación: Slice 2 - Schema Disponibilidad y Reservas

## Archivos Modificados

1. **`supabase/schema.sql`** - Agregado enum, tablas, constraints, función helper

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

## Cómo Aplicar en Supabase

### Opción 1: Aplicar Solo los Cambios Nuevos

1. Abre tu proyecto en Supabase Dashboard
2. Ve a **SQL Editor**
3. Crea un nuevo query
4. Copia y pega **solo las secciones nuevas**:

```sql
-- Enum booking_status
CREATE TYPE booking_status AS ENUM ('booked', 'cancelled', 'attended', 'no_show');

-- Tabla coach_slots
CREATE TABLE coach_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  capacity int NOT NULL DEFAULT 2,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT check_slot_duration CHECK (ends_at = starts_at + interval '1 hour'),
  CONSTRAINT check_capacity CHECK (capacity = 2),
  CONSTRAINT unique_coach_slot_time UNIQUE (coach_id, starts_at)
);

-- Tabla class_bookings
CREATE TABLE class_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_id uuid NOT NULL REFERENCES coach_slots(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status booking_status NOT NULL DEFAULT 'booked',
  created_at timestamptz DEFAULT now(),
  cancelled_at timestamptz NULL,
  CONSTRAINT unique_student_slot UNIQUE (slot_id, student_id)
);

-- Indexes
CREATE INDEX idx_coach_slots_coach_starts_at ON coach_slots(coach_id, starts_at);
CREATE INDEX idx_coach_slots_active ON coach_slots(active) WHERE active = true;
CREATE INDEX idx_class_bookings_slot ON class_bookings(slot_id);
CREATE INDEX idx_class_bookings_student ON class_bookings(student_id);
CREATE INDEX idx_class_bookings_status ON class_bookings(status) WHERE status = 'booked';

-- Función helper
CREATE OR REPLACE FUNCTION get_slot_booked_count(slot_uuid uuid)
RETURNS int AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM class_bookings
    WHERE slot_id = slot_uuid
      AND status = 'booked'
  );
END;
$$ LANGUAGE plpgsql;
```

5. Ejecuta el query (botón "Run" o Ctrl+Enter)
6. Verifica que no hay errores

### Opción 2: Aplicar Schema Completo

Si prefieres aplicar todo el schema de nuevo (incluyendo lo anterior):

1. Copia todo el contenido de `supabase/schema.sql`
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

### Test 1: Crear Slot

```sql
-- Insertar un slot de prueba
INSERT INTO coach_slots (coach_id, starts_at, ends_at)
VALUES (
  'coach-uuid-here',
  '2024-01-15 09:00:00+00',
  '2024-01-15 10:00:00+00'
);
```

**Verificar:**
- ✅ Slot se crea correctamente
- ✅ `capacity` = 2 (default)
- ✅ `active` = true (default)

### Test 2: Constraint de Duración

```sql
-- Intentar crear slot con duración incorrecta (debe fallar)
INSERT INTO coach_slots (coach_id, starts_at, ends_at)
VALUES (
  'coach-uuid-here',
  '2024-01-15 09:00:00+00',
  '2024-01-15 11:00:00+00'  -- 2 horas, debería fallar
);
```

**Verificar:**
- ❌ Error: constraint `check_slot_duration` violado

### Test 3: Constraint de Capacity

```sql
-- Intentar crear slot con capacity != 2 (debe fallar)
INSERT INTO coach_slots (coach_id, starts_at, ends_at, capacity)
VALUES (
  'coach-uuid-here',
  '2024-01-15 09:00:00+00',
  '2024-01-15 10:00:00+00',
  3  -- debería fallar
);
```

**Verificar:**
- ❌ Error: constraint `check_capacity` violado

### Test 4: Unique Coach+Starts_At

```sql
-- Crear dos slots iguales para el mismo coach (debe fallar el segundo)
INSERT INTO coach_slots (coach_id, starts_at, ends_at)
VALUES (
  'coach-uuid-here',
  '2024-01-15 09:00:00+00',
  '2024-01-15 10:00:00+00'
);

INSERT INTO coach_slots (coach_id, starts_at, ends_at)
VALUES (
  'coach-uuid-here',
  '2024-01-15 09:00:00+00',  -- mismo coach, misma hora
  '2024-01-15 10:00:00+00'
);
```

**Verificar:**
- ❌ Error en segundo INSERT: constraint `unique_coach_slot_time` violado

### Test 5: Crear Booking

```sql
-- Crear booking
INSERT INTO class_bookings (slot_id, student_id, status)
VALUES (
  'slot-uuid-here',
  'student-uuid-here',
  'booked'
);
```

**Verificar:**
- ✅ Booking se crea correctamente
- ✅ `status` = 'booked' (default)

### Test 6: Unique Student+Slot

```sql
-- Intentar crear dos bookings del mismo student al mismo slot (debe fallar)
INSERT INTO class_bookings (slot_id, student_id)
VALUES ('slot-uuid-here', 'student-uuid-here');

INSERT INTO class_bookings (slot_id, student_id)
VALUES ('slot-uuid-here', 'student-uuid-here');  -- mismo student, mismo slot
```

**Verificar:**
- ❌ Error en segundo INSERT: constraint `unique_student_slot` violado

### Test 7: Función get_slot_booked_count

```sql
-- Crear slot y bookings
INSERT INTO coach_slots (coach_id, starts_at, ends_at) VALUES (...);
INSERT INTO class_bookings (slot_id, student_id) VALUES ('slot-id', 'student-1');
INSERT INTO class_bookings (slot_id, student_id) VALUES ('slot-id', 'student-2');

-- Verificar función
SELECT get_slot_booked_count('slot-id');
```

**Verificar:**
- ✅ Retorna 2 (ambos bookings con status = 'booked')

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

### Próximos Pasos

1. **Paso 2:** Agregar RLS policies para `coach_slots` y `class_bookings`
2. **Paso 3:** Implementar UI para coaches (crear slots)
3. **Paso 4:** Implementar UI para students (reservar slots) + validación de créditos
4. **Paso 5:** Implementar triggers para descuento de créditos al marcar asistencia

## Diff del Schema

**Agregado al final de `supabase/schema.sql`:**

```sql
-- Enum booking_status
CREATE TYPE booking_status AS ENUM ('booked', 'cancelled', 'attended', 'no_show');

-- Tabla coach_slots
CREATE TABLE coach_slots (...);

-- Tabla class_bookings
CREATE TABLE class_bookings (...);

-- Indexes
CREATE INDEX idx_coach_slots_coach_starts_at ON coach_slots(coach_id, starts_at);
CREATE INDEX idx_coach_slots_active ON coach_slots(active) WHERE active = true;
CREATE INDEX idx_class_bookings_slot ON class_bookings(slot_id);
CREATE INDEX idx_class_bookings_student ON class_bookings(student_id);
CREATE INDEX idx_class_bookings_status ON class_bookings(status) WHERE status = 'booked';

-- Función helper
CREATE OR REPLACE FUNCTION get_slot_booked_count(slot_uuid uuid) RETURNS int AS $$ ... $$;
```
