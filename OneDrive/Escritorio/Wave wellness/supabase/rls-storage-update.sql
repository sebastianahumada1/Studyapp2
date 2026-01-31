-- ============================================================================
-- ACTUALIZACIÓN: Storage Policies - payment-proofs
-- ============================================================================
-- 
-- CÓMO APLICAR ESTE ARCHIVO EN SUPABASE:
-- 
-- 1. Abre tu proyecto en Supabase Dashboard
-- 2. Ve a "SQL Editor" en el menú lateral
-- 3. Crea un nuevo query
-- 4. Copia y pega TODO el contenido de este archivo
-- 5. Ejecuta el query (botón "Run" o Ctrl+Enter)
-- 6. Verifica que las policies se actualizaron correctamente
-- 
-- IMPORTANTE: Este script ELIMINA las policies antiguas y crea las nuevas.
-- Asegúrate de tener backup antes de ejecutar.
-- ============================================================================

-- Eliminar policies antiguas
-- ============================================================================

DROP POLICY IF EXISTS "payment_proofs_select_admin" ON storage.objects;
DROP POLICY IF EXISTS "payment_proofs_insert_own" ON storage.objects;
DROP POLICY IF EXISTS "payment_proofs_update_own" ON storage.objects;
DROP POLICY IF EXISTS "payment_proofs_delete_own" ON storage.objects;

-- Storage Policies: payment-proofs (CORREGIDAS)
-- ============================================================================

-- SELECT: Solo admin puede leer (para generar signed URLs server-side)
-- Los students NO pueden leer directamente (solo admin vía signed URL)
CREATE POLICY "payment_proofs_select_admin"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'payment-proofs'
  AND EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'admin'
  )
);

-- INSERT: Student puede subir comprobante solo a su payment
-- Path: payments/{auth.uid()}/{payment_id}.{ext}
-- Verifica: 1) path correcto con user_id, 2) payment existe, 3) student es owner
CREATE POLICY "payment_proofs_insert_own"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'payment-proofs'
  AND name LIKE 'payments/' || auth.uid()::text || '/%'
  AND EXISTS (
    SELECT 1
    FROM public.payments
    WHERE id::text = split_part(split_part(name, '/', 3), '.', 1)
      AND student_id = auth.uid()
  )
);

-- DELETE: Solo admin puede borrar (para mantener auditoría completa)
-- Student NO puede borrar (si subió mal, contacta admin)
CREATE POLICY "payment_proofs_delete_admin"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'payment-proofs'
  AND EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'admin'
  )
);

-- ============================================================================
-- NOTAS IMPORTANTES:
-- 
-- 1. Path pattern: payments/{auth.uid()}/{payment_id}.{ext}
-- 2. Student solo puede INSERT (no UPDATE ni DELETE)
-- 3. Admin puede SELECT (para signed URLs) y DELETE (para limpieza)
-- 4. El campo proof_path en payments debe almacenar el path completo
-- 5. Frontend debe construir path: `payments/${userId}/${paymentId}.${ext}`
-- ============================================================================
