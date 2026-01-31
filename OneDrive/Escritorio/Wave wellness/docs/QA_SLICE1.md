# QA Slice 1 - Checklist End-to-End

## Pre-requisitos

1. ✅ Variables de entorno configuradas en `.env.local`
2. ✅ Schema aplicado en Supabase (`supabase/schema.sql`)
3. ✅ RLS y Storage aplicados en Supabase (`supabase/rls.sql`)
4. ✅ Servidor de desarrollo corriendo (`npm run dev`)

## Checklist: Student - Flujo Completo

### 1. Registro de Student

- [ ] Navegar a `/auth/register`
- [ ] Llenar formulario:
  - [ ] Nombre completo (mínimo 2 caracteres)
  - [ ] Teléfono (mínimo 10 caracteres)
  - [ ] Email (formato válido)
  - [ ] Contraseña (mínimo 6 caracteres)
- [ ] Click en "Registrarse"
- [ ] Verificar toast de éxito: "¡Registro exitoso!"
- [ ] Verificar redirección a `/auth/login`
- [ ] Verificar en Supabase:
  - [ ] Usuario creado en `auth.users`
  - [ ] Profile creado en `profiles` con `role = 'student'`

### 2. Login de Student

- [ ] Navegar a `/auth/login`
- [ ] Ingresar email y contraseña del estudiante registrado
- [ ] Click en "Iniciar Sesión"
- [ ] Verificar toast de éxito
- [ ] Verificar redirección a `/student` (dashboard)
- [ ] Verificar que se muestra:
  - [ ] Balance de créditos: 0
  - [ ] Mensaje "No tienes créditos disponibles"
  - [ ] CTA "Comprar Plan"

### 3. Ver Planes Activos

- [ ] Desde `/student`, click en "Comprar Plan" o navegar a `/student/payments`
- [ ] Verificar que se muestran los paquetes activos:
  - [ ] Nombre del paquete
  - [ ] Créditos (o "Ilimitado" si es NULL)
  - [ ] Precio formateado
  - [ ] Botón "Pagar este plan"
- [ ] Si no hay paquetes activos:
  - [ ] Verificar empty state: "No hay planes disponibles"

### 4. Crear Payment Pending

- [ ] Click en "Pagar este plan" de un paquete activo
- [ ] Verificar que se crea el payment:
  - [ ] Status = 'pending'
  - [ ] `package_name`, `package_credits`, `amount` guardados (snapshot)
  - [ ] `student_id` = auth.uid()
- [ ] Verificar que aparece UI para subir comprobante
- [ ] Verificar en Supabase que el payment existe en tabla `payments`

### 5. Subir Comprobante

- [ ] Seleccionar archivo (jpg, png, webp, pdf, max 5MB)
- [ ] Click en "Subir Comprobante"
- [ ] Verificar toast de éxito
- [ ] Verificar que el archivo se subió a Supabase Storage:
  - [ ] Bucket: `payment-proofs`
  - [ ] Path: `payments/{auth.uid()}/{payment_id}.{ext}`
- [ ] Verificar que `payments.proof_path` se actualizó en DB
- [ ] Verificar que el payment aparece en lista con indicador "Con comprobante"

### 6. Ver Payment en Lista

- [ ] En `/student/payments`, verificar que el payment aparece:
  - [ ] `package_name` (snapshot)
  - [ ] `amount` (snapshot)
  - [ ] Status badge: "Pendiente" (amarillo)
  - [ ] Fecha de creación
  - [ ] Indicador de comprobante
- [ ] Si status = 'pending' y no hay comprobante:
  - [ ] Verificar botón "Subir Comprobante" visible

## Checklist: Admin - Flujo Completo

### 1. Login Admin

**Nota:** El admin debe tener `role = 'admin'` en la tabla `profiles`.

- [ ] Navegar a `/auth/login`
- [ ] Ingresar email y contraseña del admin
- [ ] Click en "Iniciar Sesión"
- [ ] Verificar redirección a `/admin` (dashboard)
- [ ] Verificar que se muestra:
  - [ ] Nombre del admin en topbar
  - [ ] Role "Administrador"
  - [ ] Links: "Paquetes", "Pagos"

### 2. Crear Package

- [ ] Navegar a `/admin/packages`
- [ ] Click en "Crear Paquete"
- [ ] Llenar formulario:
  - [ ] Nombre (mínimo 2 caracteres)
  - [ ] Créditos (número entero positivo, o dejar vacío para ilimitado)
  - [ ] Precio (número > 0)
  - [ ] Activo (checkbox)
- [ ] Click en "Crear"
- [ ] Verificar toast de éxito
- [ ] Verificar que el package aparece en la lista:
  - [ ] Nombre correcto
  - [ ] Créditos correctos (o "Ilimitado")
  - [ ] Precio formateado
  - [ ] Badge "Activo" o "Inactivo"

### 3. Ver Pending Payments

- [ ] Navegar a `/admin/payments`
- [ ] Verificar que el filtro por defecto es "Todos"
- [ ] Verificar que se muestran todos los payments:
  - [ ] Student: nombre completo y teléfono
  - [ ] Plan: `package_name` (snapshot)
  - [ ] Monto: `amount` (snapshot)
  - [ ] Estado: badge (pending/approved/rejected)
  - [ ] Comprobante: indicador "Con comprobante" o "Sin comprobante"
  - [ ] Fecha de creación
- [ ] Click en tab "Pendientes"
- [ ] Verificar que solo se muestran payments con `status = 'pending'`

### 4. Abrir Comprobante (Signed URL)

- [ ] Buscar un payment con comprobante (indicador "Con comprobante")
- [ ] Click en botón "Ver" o "Ver Comprobante"
- [ ] Verificar que se abre dialog
- [ ] Verificar que se genera signed URL (server-side)
- [ ] Si es imagen: verificar que se muestra preview
- [ ] Si es PDF: verificar botón "Abrir PDF en nueva pestaña"
- [ ] Verificar que la URL funciona (archivo visible)

### 5. Aprobar Payment

**Pre-requisito:** Payment con `status = 'pending'`, `proof_path NOT NULL`, `package_credits NOT NULL`

- [ ] Buscar payment pendiente con comprobante
- [ ] Click en "Aprobar"
- [ ] Verificar dialog de confirmación con detalles del pago
- [ ] Click en "Aprobar Pago"
- [ ] Verificar toast de éxito: "Pago aprobado"
- [ ] Verificar en Supabase:
  - [ ] `payments.status` = 'approved'
  - [ ] `payments.approved_at` tiene fecha
  - [ ] `payments.approved_by` = admin.id
  - [ ] Existe registro en `credit_ledger`:
    - [ ] `student_id` = payment.student_id
    - [ ] `delta` = payment.package_credits
    - [ ] `reason` = 'payment_approved'
    - [ ] `ref_payment_id` = payment.id
    - [ ] `created_by` = admin.id

### 6. Verificar Idempotencia de Aprobación

- [ ] Intentar aprobar el mismo payment dos veces (cambiar status a 'pending' en DB si es necesario)
- [ ] Verificar que NO se crea ledger duplicado
- [ ] Verificar que solo existe UN registro en `credit_ledger` para ese payment

### 7. Rechazar Payment

- [ ] Buscar payment pendiente
- [ ] Click en "Rechazar"
- [ ] Verificar dialog de confirmación
- [ ] Click en "Rechazar Pago"
- [ ] Verificar toast de éxito: "Pago rechazado"
- [ ] Verificar en Supabase:
  - [ ] `payments.status` = 'rejected'
  - [ ] NO existe registro en `credit_ledger` para ese payment

## Checklist: Student Post-Approval

### 1. Ver Créditos Disponibles

- [ ] Autenticarse como student con payment aprobado
- [ ] Navegar a `/student`
- [ ] Verificar que balance > 0:
  - [ ] Muestra número de créditos disponible
  - [ ] NO muestra mensaje "Sin créditos"
  - [ ] NO muestra CTA "Comprar Plan" (o está menos prominente)

### 2. Ver Movimientos en Ledger

- [ ] En `/student`, sección "Últimos Movimientos"
- [ ] Verificar que aparece movimiento:
  - [ ] Fecha correcta
  - [ ] Reason: "Pago aprobado" (humanizado)
  - [ ] Delta: +N (verde, donde N = package_credits)
- [ ] Verificar que el balance es la suma correcta de todos los movimientos

### 3. Ver Payment Aprobado

- [ ] En `/student`, sección "Últimos Pagos"
- [ ] Verificar que el payment aparece:
  - [ ] Status badge: "Aprobado" (verde)
  - [ ] NO muestra botón "Subir Comprobante"
  - [ ] Fecha de creación correcta

## Checklist: Coach - Navegación

### 1. Login Coach

**Nota:** El coach debe tener `role = 'coach'` en la tabla `profiles`.

- [ ] Navegar a `/auth/login`
- [ ] Ingresar email y contraseña del coach
- [ ] Verificar redirección a `/coach` (dashboard)
- [ ] Verificar que se muestra:
  - [ ] Nombre del coach en topbar
  - [ ] Role "Coach"
  - [ ] Links: "Dashboard", "Disponibilidad", "Agenda"

### 2. Navegar Rutas Coach

- [ ] Click en "Dashboard" → `/coach`
  - [ ] Verificar cards: "Clases hoy", "Próxima clase", "Disponibilidad"
  - [ ] Verificar CTAs funcionan
- [ ] Click en "Disponibilidad" → `/coach/availability`
  - [ ] Verificar selector de día (tabs)
  - [ ] Verificar empty state
  - [ ] Verificar nota sobre Slice 2
- [ ] Click en "Agenda" → `/coach/schedule`
  - [ ] Verificar secciones "Hoy" y "Mañana"
  - [ ] Verificar empty states
- [ ] Navegar directamente a `/coach/attendance`
  - [ ] Verificar placeholder de asistencia
  - [ ] Verificar nota sobre Slice 2

### 3. Verificar Guards por Rol (Coach)

- [ ] Intentar navegar a `/student` o `/admin`
- [ ] Verificar redirección a `/coach` (home del coach)

## Checklist: Guards por Rol

### Student NO Puede Acceder a Otras Rutas

- [ ] Autenticarse como student
- [ ] Intentar navegar a `/admin` → redirige a `/student`
- [ ] Intentar navegar a `/coach` → redirige a `/student`
- [ ] Intentar navegar a `/admin/packages` → redirige a `/student`

### Admin NO Puede Acceder a Rutas de Otros Roles

- [ ] Autenticarse como admin
- [ ] Intentar navegar a `/student` → redirige a `/admin`
- [ ] Intentar navegar a `/coach` → redirige a `/admin`

### Coach NO Puede Acceder a Rutas de Otros Roles

- [ ] Autenticarse como coach
- [ ] Intentar navegar a `/student` → redirige a `/coach`
- [ ] Intentar navegar a `/admin` → redirige a `/coach`

## Casos Edge

### Payment Sin Comprobante

- [ ] Student crea payment pero NO sube comprobante
- [ ] Admin ve payment con indicador "Sin comprobante"
- [ ] Admin intenta aprobar → verificar error: "El pago no tiene comprobante subido"

### Payment Con Créditos Ilimitados

- [ ] Admin crea package con `credits = NULL` (ilimitado)
- [ ] Student crea payment con ese package
- [ ] Admin intenta aprobar → verificar error: "No se pueden aprobar pagos con créditos ilimitados en este momento"

### Payment Ya Aprobado

- [ ] Admin intenta aprobar payment ya aprobado
- [ ] Verificar que NO se crea ledger duplicado (idempotente)

## Limitaciones Conocidas (Slice 1)

### ✅ Funcionalidades Implementadas

- Autenticación completa (register, login, logout)
- Roles y guards por ruta
- Student: crear payments, subir comprobantes
- Admin: CRUD packages, aprobar/rechazar payments, ver comprobantes
- Ledger de créditos (balance, movimientos)
- Storage privado para comprobantes
- RLS completo en todas las tablas

### ❌ Funcionalidades NO Implementadas

1. **Agenda/Reservas:**
   - Los estudiantes NO pueden agendar clases aún
   - Los coaches pueden ver placeholders pero no configurar slots reales
   - Flujo: "Primero pagas, luego agendamos cuando tengas créditos aprobados"

2. **Créditos Ilimitados:**
   - Los paquetes con `credits = NULL` (ilimitado) NO se pueden aprobar
   - Error al intentar aprobar: "No se pueden aprobar pagos con créditos ilimitados en este momento"
   - Se implementará en Slice 2

3. **Asistencia:**
   - Los coaches pueden ver placeholder de asistencia
   - NO hay lógica real de marcar asistió/faltó
   - NO se descuentan créditos automáticamente

4. **Notificaciones:**
   - NO hay notificaciones cuando se aprueba un pago
   - NO hay notificaciones de nuevos payments para admin

## Notas de Testing

- **RLS:** Ver `docs/SECURITY_CHECKLIST.md` para verificación completa
- **Storage:** Verificar que bucket `payment-proofs` es privado
- **Uploads:** Verificar que se hacen directo desde cliente (Hobby-safe)
- **Idempotencia:** Verificar que aprobar dos veces no duplica ledger
