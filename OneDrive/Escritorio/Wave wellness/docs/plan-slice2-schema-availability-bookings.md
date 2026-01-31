# Plan: Slice 2 - Schema Disponibilidad y Reservas (PASO 1)

## Definition of Done (DoD)

- [ ] Enum `booking_status` creado: 'booked', 'cancelled', 'attended', 'no_show'
- [ ] Tabla `coach_slots` creada con:
  - id, coach_id, starts_at, ends_at, capacity, active, created_at
  - Constraint: capacity = 2 (o default 2)
  - Constraint: ends_at = starts_at + interval '1 hour'
  - Unique: (coach_id, starts_at)
- [ ] Tabla `class_bookings` creada con:
  - id, slot_id, student_id, status, created_at, cancelled_at
  - Unique: (slot_id, student_id)
  - Foreign keys correctos
- [ ] Vista o función helper para `booked_count` por slot
- [ ] Indexes apropiados para queries comunes
- [ ] No triggers implementados (solo schema)
- [ ] No descuento de créditos (solo schema)
- [ ] Documentación de cómo aplicar en Supabase

## Lista de Archivos a Crear/Modificar

### Archivos a Modificar:
1. `supabase/schema.sql` - Agregar enum, tablas, constraints, vista

### Archivos a Crear:
1. `docs/plan-slice2-schema-availability-bookings.md` - Este archivo
2. `docs/IMPLEMENTACION-SLICE2-SCHEMA.md` - Documentación de implementación

## Estructura de Implementación

### 1. Enum booking_status

```sql
CREATE TYPE booking_status AS ENUM ('booked', 'cancelled', 'attended', 'no_show');
```

### 2. Tabla coach_slots

**Columnas:**
- id uuid PRIMARY KEY DEFAULT gen_random_uuid()
- coach_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE
- starts_at timestamptz NOT NULL
- ends_at timestamptz NOT NULL
- capacity int NOT NULL DEFAULT 2
- active boolean DEFAULT true
- created_at timestamptz DEFAULT now()

**Constraints:**
- CHECK: ends_at = starts_at + interval '1 hour'
- CHECK: capacity = 2 (o al menos DEFAULT 2)
- UNIQUE: (coach_id, starts_at)

**Indexes:**
- idx_coach_slots_coach_starts_at ON coach_slots(coach_id, starts_at)
- idx_coach_slots_active ON coach_slots(active) WHERE active = true

### 3. Tabla class_bookings

**Columnas:**
- id uuid PRIMARY KEY DEFAULT gen_random_uuid()
- slot_id uuid NOT NULL REFERENCES coach_slots(id) ON DELETE CASCADE
- student_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE
- status booking_status NOT NULL DEFAULT 'booked'
- created_at timestamptz DEFAULT now()
- cancelled_at timestamptz NULL

**Constraints:**
- UNIQUE: (slot_id, student_id)

**Indexes:**
- idx_class_bookings_slot ON class_bookings(slot_id)
- idx_class_bookings_student ON class_bookings(student_id)
- idx_class_bookings_status ON class_bookings(status) WHERE status = 'booked'

### 4. Vista booked_count

```sql
CREATE VIEW slot_bookings_count AS
SELECT 
  slot_id,
  COUNT(*) FILTER (WHERE status = 'booked') as booked_count,
  capacity
FROM class_bookings
JOIN coach_slots ON class_bookings.slot_id = coach_slots.id
GROUP BY slot_id, capacity;
```

O mejor, una función helper:

```sql
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

## Pasos para Aplicar en Supabase

1. Abrir Supabase Dashboard
2. Ir a SQL Editor
3. Copiar solo las nuevas secciones del schema
4. Ejecutar query
5. Verificar que se crearon las tablas

## Notas Importantes

- No implementar triggers todavía
- No implementar descuento de créditos todavía
- Validación de créditos > 0 se hará en app o RPC (no en schema)
- Capacity fijo en 2 (o default 2)
