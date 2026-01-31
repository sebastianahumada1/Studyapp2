-- ============================================================================
-- Wave Wellness Database Schema
-- ============================================================================
-- 
-- CÓMO APLICAR ESTE SCHEMA EN SUPABASE:
-- 
-- 1. Abre tu proyecto en Supabase Dashboard
-- 2. Ve a "SQL Editor" en el menú lateral
-- 3. Crea un nuevo query
-- 4. Copia y pega TODO el contenido de este archivo
-- 5. Ejecuta el query (botón "Run" o Ctrl+Enter)
-- 6. Verifica que todas las tablas se crearon correctamente
-- 
-- NOTA: Este schema NO incluye RLS (Row Level Security) policies.
-- Las policies se agregarán en un paso posterior.
-- ============================================================================

-- Enums
-- ============================================================================

CREATE TYPE role AS ENUM ('student', 'coach', 'admin');

CREATE TYPE payment_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TYPE ledger_reason AS ENUM ('payment_approved', 'manual_adjustment', 'class_attended', 'class_no_show', 'class_booked', 'class_cancelled');

CREATE TYPE booking_status AS ENUM ('booked', 'cancelled', 'attended', 'no_show');

-- Tables
-- ============================================================================

-- Profiles: Perfiles de usuario vinculados a auth.users
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  phone text NOT NULL,
  role role NOT NULL DEFAULT 'student',
  created_at timestamptz DEFAULT now()
);

-- Packages: Paquetes de créditos definidos por admin
-- credits NULL = ilimitado (pero Slice 1 no soporta aprobarlo)
CREATE TABLE packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  credits int NULL,
  price numeric NOT NULL,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Payments: Pagos con snapshot del package al momento de creación
-- El snapshot (package_name, package_credits, amount) se guarda al crear el payment
-- y se usa al aprobar, NO se lee del package actual
CREATE TABLE payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  package_id uuid NOT NULL REFERENCES packages(id) ON DELETE RESTRICT,
  status payment_status DEFAULT 'pending',
  proof_path text NULL,
  -- SNAPSHOT: Valores del package al momento de crear el payment
  package_name text NOT NULL,
  package_credits int NULL,
  amount numeric NOT NULL,
  created_at timestamptz DEFAULT now(),
  approved_at timestamptz NULL,
  approved_by uuid NULL REFERENCES profiles(id) ON DELETE SET NULL
);

-- Credit Ledger: Registro de cambios en créditos de estudiantes
CREATE TABLE credit_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  delta int NOT NULL,
  reason ledger_reason NOT NULL,
  ref_payment_id uuid NULL REFERENCES payments(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  created_by uuid NULL REFERENCES profiles(id) ON DELETE SET NULL
);

-- Indexes
-- ============================================================================

-- Index para filtrar packages activos
CREATE INDEX idx_packages_active ON packages(active);

-- Indexes para queries de payments por status y fecha
CREATE INDEX idx_payments_status_created_at ON payments(status, created_at);
CREATE INDEX idx_payments_student_created_at ON payments(student_id, created_at);

-- Index para queries de ledger por estudiante y fecha
CREATE INDEX idx_credit_ledger_student_created_at ON credit_ledger(student_id, created_at);

-- Coach Slots: Bloques de disponibilidad de coaches (1 hora, capacidad 2)
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

-- Class Bookings: Reservas de estudiantes en slots
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

-- RPC Function: Reserva atómica de slot (Slice 2 - PASO 6)
-- ============================================================================
-- Esta función garantiza reservas atómicas evitando overbooking cuando
-- múltiples usuarios intentan reservar el mismo slot simultáneamente.
-- 
-- Ver archivo completo: /supabase/rpc-book-slot.sql
-- 
-- Uso:
--   SELECT book_slot('slot-uuid-here');
-- 
-- Retorno:
--   { "success": true, "booking_id": "uuid" }
--   o
--   { "success": false, "error": "mensaje" }
-- ============================================================================

-- ============================================================================
-- SLICE 2: Disponibilidad y Reservas
-- ============================================================================
-- 
-- Tablas agregadas:
-- - coach_slots: Bloques de disponibilidad de coaches (1 hora, capacidad 2)
-- - class_bookings: Reservas de estudiantes en slots
-- 
-- Reglas:
-- - Solo se puede reservar si student tiene créditos > 0 (validación en app/RPC)
-- - Capacity fijo en 2 estudiantes por slot
-- - Duración fija: 1 hora (starts_at + 1 hour = ends_at)
-- 
-- NOTA: No se implementan triggers todavía (solo schema).
-- El descuento de créditos se implementará en un paso posterior.
-- ============================================================================

-- ============================================================================
-- NOTAS IMPORTANTES:
-- 
-- 1. NO se incluyen seeds de packages - el admin los crea desde el panel
-- 2. NO se incluyen RLS policies - se agregarán en un paso posterior
-- 3. El snapshot en payments usa columnas individuales (no JSON)
-- 4. Todos los UUIDs usan gen_random_uuid() para compatibilidad con Supabase
-- 5. Slice 2: coach_slots y class_bookings agregadas (RLS en paso posterior)
-- ============================================================================
