# Pruebas: Student Pagos - Crear Payment + Subir Comprobante (PASO 9)

## Rutas a Visitar

### Student:
- `/student/payments` - Página de pagos

---

## Prueba 1: Listar Packages Activos

### Objetivo
Verificar que solo se muestran packages activos.

### Pasos

1. **Login como student:**
   - Ir a `/auth/login`
   - Login con usuario student
   - Debería redirigir a `/student`

2. **Navegar a Pagos:**
   - Click en "Pagos" (sidebar o bottom nav)
   - Debería navegar a `/student/payments`

3. **Verificar Empty State (si no hay packages activos):**
   - [ ] Muestra icono de package
   - [ ] Título: "Aún no hay planes disponibles"
   - [ ] Descripción clara

4. **Crear package activo como admin:**
   - Login como admin
   - Ir a `/admin/packages`
   - Crear un package con `active = true`
   - Volver a `/student/payments` como student

5. **Verificar listado:**
   - [ ] Muestra cards con packages activos
   - [ ] Cada card muestra: name, credits (o "Ilimitado"), price
   - [ ] Botón "Pagar este plan" grande (h-14)
   - [ ] Cards son mobile-friendly

### Resultado Esperado
- ✅ Solo muestra packages con `active = true`
- ✅ Empty state claro si no hay packages
- ✅ UI mobile-friendly

---

## Prueba 2: Crear Payment Pending

### Objetivo
Verificar que se crea payment con snapshot correcto.

### Pasos

1. **Seleccionar package:**
   - En `/student/payments`, ver lista de packages
   - Click en "Pagar este plan" de cualquier package

2. **Verificar creación:**
   - [ ] Toast: "Pago creado"
   - [ ] Dialog para subir comprobante se abre automáticamente
   - [ ] Payment aparece en "Mis Pagos"

3. **Verificar en DB:**
   - Ir a Supabase Dashboard → Table Editor → payments
   - Buscar el payment recién creado
   - [ ] `student_id` = ID del usuario student
   - [ ] `package_id` = ID del package seleccionado
   - [ ] `package_name` = nombre del package (SNAPSHOT)
   - [ ] `package_credits` = créditos del package (SNAPSHOT, puede ser null)
   - [ ] `amount` = precio del package (SNAPSHOT)
   - [ ] `status` = 'pending'
   - [ ] `proof_path` = null (aún no subido)

4. **Verificar snapshot:**
   - Modificar el package original en DB (cambiar nombre, precio, créditos)
   - Verificar que el payment mantiene los valores originales (snapshot)

### Resultado Esperado
- ✅ Payment creado con snapshot correcto
- ✅ Dialog para subir comprobante se abre
- ✅ Payment aparece en lista
- ✅ Snapshot no cambia aunque el package original cambie

---

## Prueba 3: Subir Comprobante - Archivo Válido

### Objetivo
Verificar que el upload funciona correctamente.

### Pasos

1. **Abrir dialog de upload:**
   - Después de crear payment, dialog debería abrirse automáticamente
   - O click en "Subir comprobante" en un payment pending sin comprobante

2. **Seleccionar archivo válido:**
   - Click en "Archivo"
   - Seleccionar un archivo JPG/PNG/WEBP/PDF
   - Tamaño < 5MB
   - [ ] Archivo seleccionado se muestra
   - [ ] Tamaño del archivo se muestra

3. **Subir:**
   - Click en "Subir Comprobante"
   - [ ] Botón muestra "Subiendo..." (loading state)
   - [ ] Toast de éxito: "Comprobante subido"
   - [ ] Dialog se cierra
   - [ ] Lista de pagos se actualiza

4. **Verificar en Storage:**
   - Ir a Supabase Dashboard → Storage → payment-proofs
   - [ ] Archivo existe en path: `payments/{user_id}/{payment_id}.{ext}`
   - [ ] Path es correcto según formato requerido

5. **Verificar en DB:**
   - Ir a Supabase Dashboard → Table Editor → payments
   - Buscar el payment
   - [ ] `proof_path` = `payments/{user_id}/{payment_id}.{ext}`
   - [ ] Path coincide con el archivo en Storage

### Resultado Esperado
- ✅ Archivo subido a Storage en path correcto
- ✅ `proof_path` actualizado en DB
- ✅ Toast de éxito mostrado
- ✅ Lista actualizada

---

## Prueba 4: Validación de Archivo - Tamaño

### Objetivo
Verificar que se rechazan archivos muy grandes.

### Pasos

1. **Intentar subir archivo > 5MB:**
   - Abrir dialog de upload
   - Seleccionar archivo > 5MB
   - [ ] Toast de error: "El archivo es demasiado grande"
   - [ ] Archivo no se selecciona
   - [ ] Botón "Subir Comprobante" deshabilitado

### Resultado Esperado
- ✅ Archivos > 5MB son rechazados
- ✅ Mensaje de error claro

---

## Prueba 5: Validación de Archivo - Tipo

### Objetivo
Verificar que se rechazan tipos de archivo no permitidos.

### Pasos

1. **Intentar subir archivo no permitido:**
   - Abrir dialog de upload
   - Intentar seleccionar archivo .txt, .doc, .zip, etc.
   - [ ] Toast de error: "Tipo de archivo no permitido"
   - [ ] Archivo no se selecciona

2. **Verificar tipos permitidos:**
   - JPG: ✅ debería funcionar
   - PNG: ✅ debería funcionar
   - WEBP: ✅ debería funcionar
   - PDF: ✅ debería funcionar

### Resultado Esperado
- ✅ Solo tipos permitidos (JPG, PNG, WEBP, PDF) son aceptados
- ✅ Otros tipos son rechazados con error claro

---

## Prueba 6: Lista de Pagos

### Objetivo
Verificar que la lista muestra todos los payments del student.

### Pasos

1. **Verificar lista:**
   - En `/student/payments`, sección "Mis Pagos"
   - [ ] Muestra todos los payments del student
   - [ ] Ordenados por fecha (más reciente primero)

2. **Verificar columnas (Desktop):**
   - [ ] Plan (package_name)
   - [ ] Monto (amount formateado)
   - [ ] Estado (badge con color)
   - [ ] Comprobante (indicator: "✓ Subido" o "Pendiente")
   - [ ] Fecha (created_at formateada)
   - [ ] Acciones (botón "Subir comprobante" si aplica)

3. **Verificar cards (Mobile):**
   - [ ] Cards muestran información completa
   - [ ] Badge de estado visible
   - [ ] Indicator de comprobante visible
   - [ ] Botón "Subir comprobante" si aplica

4. **Verificar badges de estado:**
   - [ ] Pending: badge amarillo con icono Clock
   - [ ] Approved: badge verde con icono CheckCircle
   - [ ] Rejected: badge rojo con icono XCircle

5. **Verificar CTA "Subir comprobante":**
   - [ ] Solo aparece si `status = 'pending'` y `proof_path = null`
   - [ ] Botón grande y claro
   - [ ] Al click, abre dialog de upload

### Resultado Esperado
- ✅ Lista muestra todos los payments del student
- ✅ Información completa y clara
- ✅ Badges de estado correctos
- ✅ CTA aparece solo cuando aplica

---

## Prueba 7: Flujo Completo

### Objetivo
Verificar el flujo completo desde seleccionar plan hasta subir comprobante.

### Pasos

1. **Seleccionar plan:**
   - Ver lista de packages activos
   - Click en "Pagar este plan"

2. **Crear payment:**
   - [ ] Payment creado
   - [ ] Dialog de upload se abre

3. **Subir comprobante:**
   - Seleccionar archivo válido
   - Click en "Subir Comprobante"
   - [ ] Upload exitoso
   - [ ] Toast de éxito

4. **Verificar resultado:**
   - [ ] Payment aparece en "Mis Pagos"
   - [ ] Estado: "Pendiente"
   - [ ] Comprobante: "✓ Subido"
   - [ ] No hay botón "Subir comprobante" (ya está subido)

5. **Verificar en Storage:**
   - [ ] Archivo en path correcto
   - [ ] Path coincide con `proof_path` en DB

### Resultado Esperado
- ✅ Flujo completo funciona sin errores
- ✅ Datos correctos en DB y Storage
- ✅ UI actualizada correctamente

---

## Prueba 8: RLS - Student Solo Ve Sus Payments

### Objetivo
Verificar que RLS funciona correctamente.

### Pasos

1. **Crear payments para diferentes students:**
   - Student A crea un payment
   - Student B crea un payment

2. **Verificar que Student A solo ve sus payments:**
   - Login como Student A
   - Ir a `/student/payments`
   - [ ] Solo ve payments de Student A
   - [ ] No ve payments de Student B

3. **Verificar que Student B solo ve sus payments:**
   - Login como Student B
   - Ir a `/student/payments`
   - [ ] Solo ve payments de Student B
   - [ ] No ve payments de Student A

### Resultado Esperado
- ✅ RLS funciona correctamente
- ✅ Cada student solo ve sus propios payments

---

## Prueba 9: Upload - Path Correcto

### Objetivo
Verificar que el path del archivo es correcto según RLS.

### Pasos

1. **Subir comprobante:**
   - Crear payment como student
   - Subir comprobante

2. **Verificar path:**
   - Obtener `user_id` del student
   - Obtener `payment_id` del payment
   - Verificar en Storage:
     - [ ] Path: `payments/{user_id}/{payment_id}.{ext}`
     - [ ] Formato correcto según RLS

3. **Verificar que student no puede subir a otro path:**
   - Intentar subir con path incorrecto (sin user_id o con otro user_id)
   - [ ] RLS debería bloquear (si se intenta manualmente)

### Resultado Esperado
- ✅ Path correcto: `payments/{auth.uid()}/{payment_id}.{ext}`
- ✅ RLS valida el path

---

## Prueba 10: UI/UX - Mobile-First +60

### Objetivo
Verificar que la UI es accesible para usuarios +60.

### Pasos

1. **Verificar tamaños:**
   - [ ] Botones >= 48px (h-12) o 56px (h-14) para CTAs
   - [ ] Inputs >= 48px (h-12)
   - [ ] Texto >= 16px (text-base)
   - [ ] Labels claros y visibles

2. **Verificar en mobile:**
   - Abrir en DevTools mobile view
   - [ ] Cards en lugar de tabla
   - [ ] Botones fáciles de tocar
   - [ ] Spacing generoso

3. **Verificar focus visible:**
   - Presionar Tab
   - [ ] Ring de focus visible en todos los elementos
   - [ ] Ring es claro (2px mínimo)

4. **Verificar mensajes:**
   - [ ] Mensajes claros y simples
   - [ ] Errores explicativos
   - [ ] Toasts informativos

### Resultado Esperado
- ✅ UI accesible para usuarios +60
- ✅ Mobile-friendly
- ✅ Focus visible claro

---

## Checklist Final

### Funcionalidad
- [ ] Lista packages activos correctamente
- [ ] Crea payment pending con snapshot
- [ ] Sube comprobante directo a Storage
- [ ] Path correcto: `payments/{user_id}/{payment_id}.{ext}`
- [ ] Actualiza `proof_path` en DB
- [ ] Lista payments del student
- [ ] Badges de estado correctos
- [ ] CTA "Subir comprobante" aparece cuando aplica

### Validación
- [ ] Rechaza archivos > 5MB
- [ ] Rechaza tipos no permitidos
- [ ] Acepta JPG, PNG, WEBP, PDF

### UI/UX
- [ ] Componentes usan shadcn/ui base (no Kokonut)
- [ ] Botones >= 48px (CTAs >= 56px)
- [ ] Inputs >= 48px
- [ ] Texto >= 16px
- [ ] Labels reales
- [ ] Focus visible ring claro
- [ ] Mobile-friendly (cards en mobile)
- [ ] Estados: loading/error/empty/success

### Datos
- [ ] Snapshot correcto en payment
- [ ] Archivo en Storage en path correcto
- [ ] `proof_path` actualizado en DB
- [ ] RLS funciona correctamente

---

## Notas Adicionales

### Para Verificar en Storage

1. Ir a Supabase Dashboard → Storage → payment-proofs
2. Buscar archivo en path: `payments/{user_id}/{payment_id}.{ext}`
3. Verificar que el archivo existe y es accesible

### Para Verificar Snapshot

1. Crear payment con un package
2. Modificar el package original (cambiar nombre, precio, créditos)
3. Verificar que el payment mantiene los valores originales

### Para Probar RLS

1. Intentar crear payment como student (debería funcionar)
2. Intentar ver payments de otro student (debería fallar o no mostrar)
3. Verificar que el upload solo funciona con path correcto
