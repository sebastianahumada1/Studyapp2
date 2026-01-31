-- ============================================================================
-- SLICE 2 - Agregados al Schema: Disponibilidad y Reservas
-- ============================================================================
-- 
-- CÓMO APLICAR ESTE ARCHIVO EN SUPABASE:
-- 
-- 1. Asegúrate de haber aplicado primero `supabase/schema.sql` (Slice 1)
-- 2. Abre tu proyecto en Supabase Dashboard
-- 3. Ve a "SQL Editor" en el menú lateral
-- 4. Crea un nuevo query
-- 5. Copia y pega TODO el contenido de este archivo
-- 6. Ejecuta el query (botón "Run" o Ctrl+Enter)
-- 7. Verifica que no hay errores
-- 
-- NOTA: Este archivo contiene SOLO los agregados de Slice 2.
-- Si prefieres aplicar todo el schema de nuevo, usa `supabase/schema.sql` completo.
-- ============================================================================

-- Enum: booking_status
-- ============================================================================

CREATE TYPE booking_status AS ENUM ('booked', 'cancelled', 'attended', 'no_show');

-- Tabla: coach_slots
-- ============================================================================
-- Bloques de disponibilidad de coaches (1 hora, capacidad 2)

CREATE TABLE coach_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  capacity int NOT NULL DEFAULT 2,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  -- Constraint: ends_at debe ser exactamente 1 hora después de starts_at
  CONSTRAINT check_slot_duration CHECK (ends_at = starts_at + interval '1 hour'),
  -- Constraint: capacity debe ser 2 (fijo para Slice 2)
  CONSTRAINT check_capacity CHECK (capacity = 2),
  -- Constraint: evitar duplicados exactos por coach+starts_at
  CONSTRAINT unique_coach_slot_time UNIQUE (coach_id, starts_at)
);

-- Tabla: class_bookings
-- ============================================================================
-- Reservas de estudiantes en slots

CREATE TABLE class_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_id uuid NOT NULL REFERENCES coach_slots(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status booking_status NOT NULL DEFAULT 'booked',
  created_at timestamptz DEFAULT now(),
  cancelled_at timestamptz NULL,
  -- Constraint: evitar doble reserva del mismo alumno al mismo slot
  CONSTRAINT unique_student_slot UNIQUE (slot_id, student_id)
);

-- Indexes para coach_slots
-- ============================================================================

-- Index para filtrar slots por coach y fecha
CREATE INDEX idx_coach_slots_coach_starts_at ON coach_slots(coach_id, starts_at);

-- Index para filtrar slots activos
CREATE INDEX idx_coach_slots_active ON coach_slots(active) WHERE active = true;

-- Indexes para class_bookings
-- ============================================================================

-- Index para queries de bookings por slot
CREATE INDEX idx_class_bookings_slot ON class_bookings(slot_id);

-- Index para queries de bookings por student
CREATE INDEX idx_class_bookings_student ON class_bookings(student_id);

-- Index para filtrar bookings activos (booked)
CREATE INDEX idx_class_bookings_status ON class_bookings(status) WHERE status = 'booked';

-- Helper Function: Obtener cantidad de reservas activas por slot
-- ============================================================================

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

-- ============================================================================
-- NOTAS IMPORTANTES:
-- 
-- 1. RLS policies se agregarán en un paso posterior
-- 2. No se implementan triggers todavía (solo schema)
-- 3. El descuento de créditos se implementará en un paso posterior
-- 4. La validación de "créditos > 0" se hará en app o RPC (no en schema)
-- 5. Capacity fijo en 2 estudiantes por slot
-- 6. Duración fija: 1 hora (starts_at + 1 hour = ends_at)
-- ============================================================================
