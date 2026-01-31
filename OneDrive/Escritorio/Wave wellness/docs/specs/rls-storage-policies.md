# RLS Policies + Storage Privado (PASO 3)

## Contexto
- Habilitar Row Level Security (RLS) en todas las tablas del schema
- Crear policies que controlen acceso por rol (student, coach, admin)
- Configurar storage privado para comprobantes de pago
- ¿Qué usuario lo necesita?: Desarrolladores que implementarán autenticación y funcionalidad de pagos

## Requisitos

### DB
- [ ] RLS habilitado en: profiles, packages, payments, credit_ledger
- [ ] Policies de profiles: usuario ve/edita su perfil, admin ve todos
- [ ] Policies de packages: todos autenticados pueden leer, solo admin puede escribir
- [ ] Policies de payments: student ve solo los suyos, puede insertar los suyos, no puede aprobar; admin ve todos y puede aprobar
- [ ] Policies de credit_ledger: student ve solo el suyo, solo admin puede insertar
- [ ] Verificar que todas las columnas usadas en policies existen en schema.sql

### Storage
- [ ] Bucket `payment-proofs` PRIVADO (no público)
- [ ] Student puede subir a `payments/{payment_id}.{ext}` (upload directo)
- [ ] Admin puede ver comprobantes mediante signed URL (server-side)
- [ ] Políticas de storage en SQL o documentadas para Supabase Dashboard

### RLS
- [ ] Usar `auth.uid()` para verificar usuario autenticado
- [ ] Verificar roles desde tabla `profiles.role`
- [ ] Bloquear que student apruebe payments (solo admin puede cambiar status)
- [ ] Comentarios explicando cada policy

## Implementación

1. Crear `/supabase/rls.sql` con:
   - ALTER TABLE ... ENABLE ROW LEVEL SECURITY para cada tabla
   - CREATE POLICY para cada operación necesaria
   - Políticas de storage (o documentación)
   - Comentarios explicativos

## Testing

- [ ] Student no ve payments ajenos
- [ ] Student no puede editar packages
- [ ] Student no puede insertar credit_ledger
- [ ] Admin sí puede ver todo y aprobar payments
- [ ] Bucket privado configurado
- [ ] Student puede subir comprobante (upload directo)
- [ ] Admin puede generar signed URL para ver comprobantes
