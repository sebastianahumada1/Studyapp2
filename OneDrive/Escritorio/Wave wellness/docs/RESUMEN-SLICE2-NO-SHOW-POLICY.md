# Resumen: Slice 2 - Política No-Show con Descuento (HARDENING)

## ✅ Implementación Completa

### Archivos Creados

1. **`supabase/schema-slice2-no-show-additions.sql`**
   - SQL para agregar `'class_no_show'` al enum `ledger_reason`

2. **`docs/plan-slice2-no-show-policy.md`**
   - Plan y Definition of Done

3. **`docs/PRUEBAS-SLICE2-NO-SHOW-POLICY.md`**
   - 12 pruebas detalladas paso a paso

4. **`docs/IMPLEMENTACION-SLICE2-NO-SHOW-POLICY.md`**
   - Documentación técnica completa

5. **`docs/RESUMEN-SLICE2-NO-SHOW-POLICY.md`**
   - Este archivo

### Archivos Modificados

1. **`supabase/schema.sql`**
   - Agregado `'class_no_show'` al enum `ledger_reason`

2. **`src/app/(protected)/coach/schedule/actions.ts`**
   - Actualizado `markAttendance()` para descontar créditos en no-show
   - Permitir admin marcar no-show
   - Idempotencia garantizada

3. **`src/app/(protected)/coach/schedule/CoachScheduleClient.tsx`**
   - Agregado Dialog de confirmación para no-show
   - Mensaje claro sobre descuento

4. **`src/app/(protected)/student/page.tsx`**
   - Actualizado `humanizeReason()` para incluir `'class_no_show'`

## Funcionalidades Implementadas

### ✅ Política No-Show con Descuento

**Comportamiento:**
- Al marcar booking como `no_show`: se descuenta 1 crédito
- Idempotente: no duplica descuento
- No descontar si booking estaba `cancelled`
- Solo coach/admin puede marcar `no_show`

**Implementación:**
- Actualiza `class_bookings.status = 'no_show'`
- Inserta en `credit_ledger`:
  - `delta = -1`
  - `reason = 'class_no_show'`
  - `created_by = coach.id`

### ✅ Dialog de Confirmación

**Características:**
- Advertencia clara: "Esta acción descontará 1 crédito del estudiante."
- Información del booking (hora, estudiante)
- Botones: "Cancelar" y "Sí, marcar No Show"
- Mobile-friendly y accesible

### ✅ Student Dashboard

**Actualización:**
- Muestra movimiento: "No asistió a clase"
- Delta: -1 (negativo)
- Balance de créditos se reduce correctamente

## Seguridad

### Validaciones
- ✅ Usuario es coach o admin
- ✅ Booking existe
- ✅ Slot pertenece al coach (o admin puede todo)
- ✅ Status actual es 'booked' (no se puede cambiar de attended/no_show)
- ✅ Idempotencia: no duplicar descuento

### Auditoría
- `created_by` registra quién marcó el no-show
- Timestamp automático en `created_at`

## Pasos para Probar

### 1. Aplicar Schema

**En Supabase SQL Editor:**
```sql
-- Ejecutar supabase/schema-slice2-no-show-additions.sql
-- O ejecutar directamente:
ALTER TYPE ledger_reason ADD VALUE IF NOT EXISTS 'class_no_show';
```

### 2. Marcar No-Show

**Pasos:**
1. Autenticarse como Coach
2. Navegar a `/coach/schedule`
3. Encontrar booking con status 'booked'
4. Click en "Marcar No Show"
5. Verificar Dialog de confirmación
6. Click en "Sí, marcar No Show"
7. Verificar toast: "Se registró que el estudiante no asistió y se descontó 1 crédito."
8. Verificar en DB que:
   - `class_bookings.status = 'no_show'`
   - Existe entrada en `credit_ledger` con `delta = -1`, `reason = 'class_no_show'`

### 3. Verificar Idempotencia

**Pasos:**
1. Marcar booking como no-show
2. Verificar que booking.status = 'no_show'
3. Verificar que solo hay 1 entrada en ledger para ese booking
4. Intentar marcar no-show de nuevo (si es posible)
5. Verificar que NO se crea segunda entrada

### 4. Student Dashboard

**Pasos:**
1. Marcar booking como no-show
2. Autenticarse como Student
3. Navegar a `/student`
4. Verificar que en "Últimos Movimientos" aparece:
   - "No asistió a clase" (humanizado)
   - Delta: -1
5. Verificar que balance se redujo en 1

## Archivos de Referencia

- `supabase/schema-slice2-no-show-additions.sql` - SQL para aplicar
- `src/app/(protected)/coach/schedule/actions.ts` - Server Action actualizado
- `src/app/(protected)/coach/schedule/CoachScheduleClient.tsx` - UI con Dialog
- `docs/PRUEBAS-SLICE2-NO-SHOW-POLICY.md` - Checklist de pruebas
- `docs/IMPLEMENTACION-SLICE2-NO-SHOW-POLICY.md` - Documentación técnica

## Comparación con Attended

**Similitudes:**
- Ambos descuentan 1 crédito (`delta = -1`)
- Ambos insertan en `credit_ledger`
- Ambos tienen `created_by` para auditoría

**Diferencias:**
- `reason`: `'class_attended'` vs `'class_no_show'`
- UI: attended no requiere confirmación, no-show sí

## Próximos Pasos

1. **Monitoreo:** Verificar que no hay descuentos duplicados en producción
2. **Reportes:** Agregar métricas de no-shows por estudiante/coach
3. **Notificaciones:** Notificar al estudiante cuando se marca no-show
