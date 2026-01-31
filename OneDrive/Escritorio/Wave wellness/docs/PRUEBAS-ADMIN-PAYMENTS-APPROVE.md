# Pruebas: Admin Pagos - Ver Comprobante + Aprobar/Rechazar + Ledger

## Prueba 1: Lista de Pagos

### Objetivo
Verificar que la lista de pagos se carga correctamente con todos los datos necesarios.

### Pasos
1. Autenticarse como admin
2. Navegar a `/admin/payments`
3. Verificar que se muestra la lista de pagos
4. Verificar que cada item muestra:
   - Nombre completo del estudiante
   - Teléfono del estudiante
   - Nombre del plan (package_name)
   - Monto (amount)
   - Estado (status)
   - Indicador de comprobante (con/sin)
   - Fecha de creación

### Resultado Esperado
✅ Lista de pagos se carga correctamente
✅ Todos los campos se muestran correctamente
✅ Join con profiles funciona (full_name, phone)

---

## Prueba 2: Filtros de Pagos

### Objetivo
Verificar que los filtros funcionan correctamente.

### Pasos
1. Autenticarse como admin
2. Navegar a `/admin/payments`
3. Click en tab "Pendientes"
4. Verificar que solo se muestran pagos con status = 'pending'
5. Click en tab "Aprobados"
6. Verificar que solo se muestran pagos con status = 'approved'
7. Click en tab "Rechazados"
8. Verificar que solo se muestran pagos con status = 'rejected'
9. Click en tab "Todos"
10. Verificar que se muestran todos los pagos

### Resultado Esperado
✅ Filtros funcionan correctamente
✅ Pagos pendientes aparecen primero (ordenamiento)

---

## Prueba 3: Ver Comprobante (Imagen)

### Objetivo
Verificar que se puede ver el comprobante cuando es una imagen.

### Pasos
1. Autenticarse como admin
2. Navegar a `/admin/payments`
3. Buscar un pago con comprobante (proof_path NOT NULL) que sea imagen (jpg/png/webp)
4. Click en botón "Ver" o "Ver Comprobante"
5. Verificar que se abre un dialog
6. Verificar que se muestra la imagen del comprobante
7. Verificar que la signed URL funciona

### Resultado Esperado
✅ Dialog se abre correctamente
✅ Imagen se muestra correctamente
✅ Signed URL funciona (imagen visible)

---

## Prueba 4: Ver Comprobante (PDF)

### Objetivo
Verificar que se puede ver el comprobante cuando es un PDF.

### Pasos
1. Autenticarse como admin
2. Navegar a `/admin/payments`
3. Buscar un pago con comprobante (proof_path NOT NULL) que sea PDF
4. Click en botón "Ver" o "Ver Comprobante"
5. Verificar que se abre un dialog
6. Verificar que se muestra un botón "Abrir PDF en nueva pestaña"
7. Click en el botón
8. Verificar que se abre el PDF en una nueva pestaña

### Resultado Esperado
✅ Dialog se abre correctamente
✅ Botón "Abrir PDF" se muestra
✅ PDF se abre en nueva pestaña correctamente

---

## Prueba 5: Ver Comprobante Sin Archivo

### Objetivo
Verificar que se muestra un mensaje cuando no hay comprobante.

### Pasos
1. Autenticarse como admin
2. Navegar a `/admin/payments`
3. Buscar un pago sin comprobante (proof_path NULL)
4. Click en botón "Ver" o "Ver Comprobante" (si existe)
5. Verificar que se muestra un toast con mensaje "El estudiante aún no ha subido un comprobante"

### Resultado Esperado
✅ Toast se muestra con mensaje correcto
✅ No se abre dialog si no hay comprobante

---

## Prueba 6: Aprobar Pago (Flujo Completo)

### Objetivo
Verificar que se puede aprobar un pago y se crea el ledger correctamente.

### Pasos
1. **Preparación:**
   - Autenticarse como student
   - Crear un payment (status = 'pending')
   - Subir comprobante (proof_path NOT NULL)
   - Verificar que package_credits NOT NULL

2. **Aprobar:**
   - Autenticarse como admin
   - Navegar a `/admin/payments`
   - Buscar el pago creado
   - Click en botón "Aprobar"
   - Verificar que se abre dialog de confirmación
   - Click en "Aprobar Pago" en el dialog
   - Verificar que se muestra toast de éxito

3. **Verificar:**
   - Recargar la página
   - Verificar que el pago ahora tiene status = 'approved'
   - Verificar que approved_at tiene fecha
   - Verificar que approved_by tiene el ID del admin
   - Verificar en DB que existe un registro en credit_ledger:
     - student_id = payment.student_id
     - delta = payment.package_credits
     - reason = 'payment_approved'
     - ref_payment_id = payment.id
     - created_by = admin.id

### Resultado Esperado
✅ Dialog de confirmación se muestra
✅ Pago se aprueba correctamente
✅ Payment actualizado: status, approved_at, approved_by
✅ Ledger creado con datos correctos
✅ Toast de éxito se muestra

---

## Prueba 7: Aprobar Pago Sin Comprobante

### Objetivo
Verificar que no se puede aprobar un pago sin comprobante.

### Pasos
1. Autenticarse como admin
2. Navegar a `/admin/payments`
3. Buscar un pago sin comprobante (proof_path NULL)
4. Intentar click en botón "Aprobar" (si existe)
5. Verificar que se muestra un error

### Resultado Esperado
✅ Error: "El pago no tiene comprobante subido"
✅ Pago NO se aprueba
✅ Ledger NO se crea

---

## Prueba 8: Aprobar Pago Con Créditos Ilimitados

### Objetivo
Verificar que no se puede aprobar un pago con créditos ilimitados (Slice 1).

### Pasos
1. **Preparación:**
   - Autenticarse como admin
   - Crear un package con credits = NULL (ilimitado)
   - Autenticarse como student
   - Crear un payment con ese package (package_credits = NULL)
   - Subir comprobante

2. **Intentar Aprobar:**
   - Autenticarse como admin
   - Navegar a `/admin/payments`
   - Buscar el pago con package_credits = NULL
   - Click en botón "Aprobar"
   - Verificar que se muestra error

### Resultado Esperado
✅ Error: "No se pueden aprobar pagos con créditos ilimitados en este momento"
✅ Pago NO se aprueba
✅ Ledger NO se crea

---

## Prueba 9: Aprobar Pago Ya Aprobado (Idempotencia)

### Objetivo
Verificar que aprobar un pago ya aprobado no duplica el ledger.

### Pasos
1. **Preparación:**
   - Aprobar un pago (usar Prueba 6)
   - Verificar que existe un ledger para ese payment

2. **Re-aprobar:**
   - Autenticarse como admin
   - Navegar a `/admin/payments`
   - Buscar el pago ya aprobado
   - Intentar aprobar de nuevo (si el botón existe, o cambiar status manualmente en DB)
   - Verificar en DB que NO se creó un segundo ledger

### Resultado Esperado
✅ No se crea ledger duplicado
✅ Solo existe UN ledger para ese payment
✅ Payment sigue approved

---

## Prueba 10: Rechazar Pago

### Objetivo
Verificar que se puede rechazar un pago.

### Pasos
1. **Preparación:**
   - Autenticarse como student
   - Crear un payment (status = 'pending')
   - Subir comprobante

2. **Rechazar:**
   - Autenticarse como admin
   - Navegar a `/admin/payments`
   - Buscar el pago creado
   - Click en botón "Rechazar"
   - Verificar que se abre dialog de confirmación
   - Click en "Rechazar Pago" en el dialog
   - Verificar que se muestra toast de éxito

3. **Verificar:**
   - Recargar la página
   - Verificar que el pago ahora tiene status = 'rejected'
   - Verificar en DB que NO existe ledger para ese payment

### Resultado Esperado
✅ Dialog de confirmación se muestra
✅ Pago se rechaza correctamente
✅ Payment actualizado: status = 'rejected'
✅ Ledger NO se crea
✅ Toast de éxito se muestra

---

## Prueba 11: Rechazar Pago Ya Rechazado (Idempotencia)

### Objetivo
Verificar que rechazar un pago ya rechazado no causa problemas.

### Pasos
1. **Preparación:**
   - Rechazar un pago (usar Prueba 10)

2. **Re-rechazar:**
   - Autenticarse como admin
   - Navegar a `/admin/payments`
   - Buscar el pago ya rechazado
   - Intentar rechazar de nuevo (si el botón existe, o cambiar status manualmente en DB)
   - Verificar que no hay errores

### Resultado Esperado
✅ No hay errores
✅ Payment sigue rejected
✅ Ledger NO se crea

---

## Prueba 12: Responsive (Mobile)

### Objetivo
Verificar que la UI funciona correctamente en mobile.

### Pasos
1. Abrir DevTools y activar modo mobile
2. Autenticarse como admin
3. Navegar a `/admin/payments`
4. Verificar que se muestran cards en lugar de tabla
5. Verificar que los botones son grandes (>= 48px)
6. Verificar que los textos son legibles (>= 16px)
7. Probar ver comprobante
8. Probar aprobar/rechazar

### Resultado Esperado
✅ Cards se muestran en mobile
✅ Botones son grandes y accesibles
✅ Textos son legibles
✅ Funcionalidad completa funciona en mobile

---

## Prueba 13: End-to-End Completo

### Objetivo
Verificar el flujo completo desde creación hasta aprobación.

### Pasos
1. **Student crea payment:**
   - Autenticarse como student
   - Navegar a `/student/payments`
   - Seleccionar un plan activo
   - Click en "Pagar este plan"
   - Subir comprobante
   - Verificar que payment se creó con status = 'pending'

2. **Admin ve pending:**
   - Autenticarse como admin
   - Navegar a `/admin/payments`
   - Verificar que el pago aparece en "Pendientes"
   - Verificar que muestra "Con comprobante"

3. **Admin abre comprobante:**
   - Click en "Ver" o "Ver Comprobante"
   - Verificar que se abre dialog
   - Verificar que se muestra el comprobante (imagen o PDF)

4. **Admin aprueba:**
   - Click en "Aprobar"
   - Confirmar en dialog
   - Verificar toast de éxito

5. **Verificar ledger:**
   - Recargar página
   - Verificar que pago está "Aprobado"
   - Verificar en DB que ledger existe con datos correctos

6. **Verificar idempotencia:**
   - Intentar aprobar de nuevo (cambiar status a pending en DB si es necesario)
   - Verificar que NO se duplica ledger

### Resultado Esperado
✅ Flujo completo funciona sin errores
✅ Payment creado correctamente
✅ Comprobante visible para admin
✅ Pago aprobado correctamente
✅ Ledger creado con datos correctos
✅ Idempotencia funciona (no duplica ledger)

---

## Checklist Final

- [ ] Lista de pagos carga correctamente
- [ ] Filtros funcionan
- [ ] Ver comprobante (imagen) funciona
- [ ] Ver comprobante (PDF) funciona
- [ ] Ver comprobante sin archivo muestra mensaje
- [ ] Aprobar pago funciona
- [ ] Aprobar sin comprobante muestra error
- [ ] Aprobar con créditos ilimitados muestra error
- [ ] Aprobar idempotente (no duplica ledger)
- [ ] Rechazar pago funciona
- [ ] Rechazar idempotente
- [ ] Responsive funciona
- [ ] End-to-end completo funciona
