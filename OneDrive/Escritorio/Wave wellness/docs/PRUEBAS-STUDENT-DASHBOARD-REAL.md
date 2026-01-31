# Pruebas: Student Dashboard REAL (PASO 11)

## Prueba 1: Student Sin Ledger (Balance 0)

### Objetivo
Verificar que el dashboard muestra correctamente cuando el student no tiene créditos.

### Pasos
1. Autenticarse como student (sin pagos aprobados)
2. Navegar a `/student`
3. Verificar que se muestra:
   - Balance = 0
   - Mensaje "No tienes créditos disponibles"
   - CTA grande "Comprar Plan" -> /student/payments
4. Verificar que "Últimos Movimientos" muestra empty state
5. Verificar que "Últimos Pagos" muestra empty state o lista vacía

### Resultado Esperado
✅ Balance = 0 se muestra correctamente
✅ Mensaje claro "Sin créditos"
✅ CTA "Comprar Plan" visible y funcional
✅ Empty states se muestran correctamente

---

## Prueba 2: Student Con Pago Aprobado (Balance > 0)

### Objetivo
Verificar que el dashboard muestra correctamente cuando el student tiene créditos.

### Pasos
1. **Preparación:**
   - Autenticarse como student
   - Crear un payment
   - Subir comprobante
   - Autenticarse como admin
   - Aprobar el payment (esto crea ledger)

2. **Verificar Dashboard:**
   - Autenticarse como student
   - Navegar a `/student`
   - Verificar que balance > 0 (debe ser igual a package_credits del payment aprobado)
   - Verificar que "Últimos Movimientos" muestra:
     - Fecha del movimiento
     - Reason: "Pago aprobado"
     - Delta: +N (donde N = package_credits)
   - Verificar que "Últimos Pagos" muestra:
     - package_name
     - amount
     - status: "Aprobado" (badge verde)
     - created_at

### Resultado Esperado
✅ Balance > 0 se muestra correctamente
✅ Movimientos muestran "Pago aprobado" con delta correcto
✅ Pagos muestran status "Aprobado"
✅ Fechas formateadas correctamente

---

## Prueba 3: Student Con Múltiples Movimientos

### Objetivo
Verificar que se muestran los últimos 10 movimientos correctamente.

### Pasos
1. **Preparación:**
   - Crear múltiples payments y aprobarlos (o crear ajustes manuales como admin)
   - Asegurar que hay más de 10 movimientos en credit_ledger

2. **Verificar Dashboard:**
   - Autenticarse como student
   - Navegar a `/student`
   - Verificar que solo se muestran los últimos 10 movimientos
   - Verificar que están ordenados por fecha (más reciente primero)
   - Verificar que el balance es la suma correcta de TODOS los movimientos (no solo los 10 mostrados)

### Resultado Esperado
✅ Solo se muestran últimos 10 movimientos
✅ Ordenados correctamente (más reciente primero)
✅ Balance es la suma de TODOS los movimientos

---

## Prueba 4: Student Con Pago Pending Sin Comprobante

### Objetivo
Verificar que se muestra CTA "Subir Comprobante" cuando hay pagos pending sin comprobante.

### Pasos
1. **Preparación:**
   - Autenticarse como student
   - Crear un payment (sin subir comprobante)
   - Verificar que payment tiene status = 'pending' y proof_path = NULL

2. **Verificar Dashboard:**
   - Navegar a `/student`
   - Verificar que "Últimos Pagos" muestra el payment
   - Verificar que muestra status "Pendiente" (badge amarillo)
   - Verificar que muestra botón "Subir Comprobante"
   - Click en "Subir Comprobante"
   - Verificar que redirige a /student/payments

3. **Verificar CTA Principal:**
   - Verificar que aparece card "Acción Requerida" al final
   - Verificar que tiene CTA "Subir Comprobante"

### Resultado Esperado
✅ Payment pending se muestra en "Últimos Pagos"
✅ Botón "Subir Comprobante" visible
✅ Redirige a /student/payments
✅ Card "Acción Requerida" aparece si hay pending sin comprobante

---

## Prueba 5: Student Con Pago Pending Con Comprobante

### Objetivo
Verificar que NO se muestra CTA "Subir Comprobante" cuando el pago ya tiene comprobante.

### Pasos
1. **Preparación:**
   - Autenticarse como student
   - Crear un payment
   - Subir comprobante
   - Verificar que payment tiene status = 'pending' y proof_path NOT NULL

2. **Verificar Dashboard:**
   - Navegar a `/student`
   - Verificar que "Últimos Pagos" muestra el payment
   - Verificar que muestra status "Pendiente"
   - Verificar que NO muestra botón "Subir Comprobante"
   - Verificar que NO aparece card "Acción Requerida"

### Resultado Esperado
✅ Payment pending con comprobante se muestra
✅ NO muestra botón "Subir Comprobante"
✅ NO aparece card "Acción Requerida"

---

## Prueba 6: Student Con Pago Rechazado

### Objetivo
Verificar que los pagos rechazados se muestran correctamente.

### Pasos
1. **Preparación:**
   - Autenticarse como student
   - Crear un payment y subir comprobante
   - Autenticarse como admin
   - Rechazar el payment

2. **Verificar Dashboard:**
   - Autenticarse como student
   - Navegar a `/student`
   - Verificar que "Últimos Pagos" muestra el payment
   - Verificar que muestra status "Rechazado" (badge rojo)
   - Verificar que NO muestra botón "Subir Comprobante"
   - Verificar que el balance NO cambió (rechazado no crea ledger)

### Resultado Esperado
✅ Payment rechazado se muestra con badge rojo
✅ NO muestra botón "Subir Comprobante"
✅ Balance no cambió (correcto, rechazado no crea ledger)

---

## Prueba 7: Humanización de Reasons

### Objetivo
Verificar que los reasons se humanizan correctamente.

### Pasos
1. **Preparación:**
   - Crear payment y aprobar (reason: 'payment_approved')
   - Como admin, crear ajuste manual (reason: 'manual_adjustment')

2. **Verificar Dashboard:**
   - Autenticarse como student
   - Navegar a `/student`
   - Verificar que movimientos muestran:
     - "Pago aprobado" (no 'payment_approved')
     - "Ajuste manual" (no 'manual_adjustment')

### Resultado Esperado
✅ Reasons se humanizan correctamente
✅ "Pago aprobado" para payment_approved
✅ "Ajuste manual" para manual_adjustment

---

## Prueba 8: Formato de Fechas y Precios

### Objetivo
Verificar que fechas y precios se formatean correctamente.

### Pasos
1. Autenticarse como student
2. Navegar a `/student`
3. Verificar que fechas se muestran en formato legible (ej: "15 ene 2024, 14:30")
4. Verificar que precios se muestran en formato de moneda (ej: "$500.00 MXN")

### Resultado Esperado
✅ Fechas formateadas correctamente (es-MX)
✅ Precios formateados correctamente (MXN)

---

## Prueba 9: Banner de Flujo

### Objetivo
Verificar que el banner de flujo se muestra correctamente.

### Pasos
1. Autenticarse como student
2. Navegar a `/student`
3. Verificar que aparece banner "¿Cómo funciona?"
4. Verificar que muestra:
   - "Paso 1: Pagas y subes comprobante"
   - "Paso 2: Admin aprueba tu pago"
   - "Paso 3: Con créditos aprobados podrás agendar"
5. Verificar que el banner es visible pero no intrusivo

### Resultado Esperado
✅ Banner se muestra correctamente
✅ Contenido correcto (3 pasos)
✅ Estilo informativo (no intrusivo)

---

## Prueba 10: Responsive (Mobile)

### Objetivo
Verificar que el dashboard funciona correctamente en mobile.

### Pasos
1. Abrir DevTools y activar modo mobile
2. Autenticarse como student
3. Navegar a `/student`
4. Verificar que:
   - Cards se apilan verticalmente
   - Texto es legible (>= 16px)
   - Botones son grandes (>= 48px)
   - Spacing es generoso
   - Todo el contenido es accesible

### Resultado Esperado
✅ Layout responsive funciona
✅ Texto legible en mobile
✅ Botones accesibles
✅ Spacing adecuado

---

## Prueba 11: RLS (Row Level Security)

### Objetivo
Verificar que el student solo ve sus propios datos.

### Pasos
1. **Preparación:**
   - Crear 2 students: Student A y Student B
   - Crear payments y movimientos para ambos

2. **Verificar Student A:**
   - Autenticarse como Student A
   - Navegar a `/student`
   - Verificar que solo ve:
     - Sus propios movimientos (credit_ledger donde student_id = Student A)
     - Sus propios pagos (payments donde student_id = Student A)
   - Verificar que balance es solo de sus movimientos

3. **Verificar Student B:**
   - Autenticarse como Student B
   - Navegar a `/student`
   - Verificar que NO ve datos de Student A
   - Verificar que solo ve sus propios datos

### Resultado Esperado
✅ Student solo ve sus propios datos
✅ RLS funciona correctamente
✅ Balance es correcto para cada student

---

## Prueba 12: Edge Cases

### Objetivo
Verificar casos límite.

### Casos a Probar:
1. **Balance negativo:**
   - Crear ajuste manual negativo como admin
   - Verificar que balance se muestra correctamente (puede ser negativo)

2. **Muchos pagos:**
   - Crear más de 5 payments
   - Verificar que solo se muestran últimos 5
   - Verificar que hay botón "Ver Todos los Pagos"

3. **Sin pagos pero con movimientos:**
   - Crear ajuste manual sin payment (ref_payment_id = NULL)
   - Verificar que movimiento se muestra correctamente

### Resultado Esperado
✅ Edge cases se manejan correctamente
✅ No hay errores
✅ UI se adapta correctamente

---

## Checklist Final

- [ ] Student sin ledger muestra balance 0 y CTA
- [ ] Student con pago aprobado muestra balance > 0
- [ ] Movimientos se muestran correctamente (últimos 10)
- [ ] Pagos se muestran correctamente (últimos 5)
- [ ] CTA "Subir Comprobante" aparece cuando corresponde
- [ ] Banner de flujo se muestra
- [ ] Reasons se humanizan
- [ ] Fechas y precios se formatean correctamente
- [ ] Responsive funciona
- [ ] RLS funciona (student solo ve lo suyo)
- [ ] Edge cases se manejan
