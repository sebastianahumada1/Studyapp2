# vercel-hobby-safe-uploads

## Cuando usar

Al implementar cualquier funcionalidad de upload de archivos. Obligatorio en Vercel Hobby.

## Objetivo

Upload directo desde cliente a Supabase Storage. PROHIBIDO pasar archivos por Server Actions o Route Handlers.

## Inputs obligatorios

- `/src/lib/supabase/client.ts` - Verificar función `createClient`
- Bucket de Supabase Storage - Verificar que existe y tiene políticas públicas/autenticadas

## Procedimiento

1. Crear cliente Supabase desde el helper del proyecto:

```typescript
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();
```

2. Validar archivo antes de upload:

```typescript
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

function validateFile(file: File): { valid: boolean; error?: string } {
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: 'File too large (max 5MB)' };
  }
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return { valid: false, error: 'Invalid file type' };
  }
  return { valid: true };
}
```

3. Upload directo a Supabase Storage:

```typescript
async function uploadFile(file: File, bucket: string, path: string) {
  const validation = validateFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) throw error;
  return data;
}
```

4. Obtener URL pública (si bucket es público):

```typescript
const { data } = supabase.storage.from(bucket).getPublicUrl(path);
const publicUrl = data.publicUrl;
```

5. PROHIBICIONES:
   - ❌ No usar `FormData` en Server Actions
   - ❌ No usar Route Handlers con `multipart/form-data`
   - ❌ No pasar archivos por API routes

## Checks

- [ ] Upload usa `supabase.storage.from().upload()` directamente desde cliente
- [ ] Validación de size (ej: max 5MB) implementada
- [ ] Validación de MIME type implementada
- [ ] No hay Server Actions que reciban archivos
- [ ] No hay Route Handlers con multipart
- [ ] Cliente creado con `createClient` desde `/src/lib/supabase/client`

## Output obligatorio

**Archivos tocados:**
- Componente que hace upload (usa `supabase.storage` directamente)
- Helpers de validación (si se extraen)

**Pasos para probar:**
1. Subir archivo válido → debe funcionar
2. Subir archivo > 5MB → debe rechazar con error
3. Subir archivo con MIME type inválido → debe rechazar
4. Verificar Network tab: upload va directo a Supabase (no a API route)
5. Buscar en codebase: `FormData` en Server Actions → no debe existir
