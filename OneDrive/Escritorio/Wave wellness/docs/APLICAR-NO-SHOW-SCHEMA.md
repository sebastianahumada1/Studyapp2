# Cómo Aplicar el Schema de No-Show

## Error: "type ledger_reason already exists"

Si obtienes este error, significa que el enum `ledger_reason` ya existe en tu base de datos, pero probablemente no tiene el valor `'class_no_show'` todavía.

## Solución

### Opción 1: Usar el Script de Adiciones (Recomendado)

Ejecuta **solo** el archivo `supabase/schema-slice2-no-show-additions.sql`:

1. Abre Supabase Dashboard → SQL Editor
2. Copia y pega el contenido de `supabase/schema-slice2-no-show-additions.sql`
3. Ejecuta (Run o Ctrl+Enter)

Este script:
- Verifica si el valor `'class_no_show'` ya existe
- Solo lo agrega si no existe
- No intenta crear el enum de nuevo

### Opción 2: Verificar y Agregar Manualmente

1. Verifica qué valores tiene el enum actualmente:
```sql
SELECT unnest(enum_range(NULL::ledger_reason));
```

2. Si `'class_no_show'` NO aparece en la lista, agrega el valor:
```sql
ALTER TYPE ledger_reason ADD VALUE 'class_no_show';
```

3. Si `'class_no_show'` YA aparece en la lista, no necesitas hacer nada.

## Verificación

Después de aplicar el script, verifica que el valor fue agregado:

```sql
SELECT unnest(enum_range(NULL::ledger_reason));
```

Deberías ver:
- payment_approved
- manual_adjustment
- class_attended
- class_no_show ← Nuevo

## Nota Importante

**NO ejecutes el `schema.sql` completo** si ya tienes la base de datos creada. Solo ejecuta el script de adiciones (`schema-slice2-no-show-additions.sql`) que agrega el nuevo valor al enum existente.
