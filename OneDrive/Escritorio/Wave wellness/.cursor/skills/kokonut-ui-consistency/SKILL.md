# kokonut-ui-consistency

## Cuando usar

Al crear/modificar componentes UI o formularios. Antes de importar cualquier componente UI.

## Objetivo

Garantizar que TODO el UI usa exclusivamente Kokonut UI. Sin librerías UI adicionales.

## Inputs obligatorios

- Componentes Kokonut disponibles - Verificar en documentación o código existente
- Formularios existentes - Revisar patrones de estructura

## Procedimiento

1. Verificar que el componente Kokonut existe antes de usarlo:

```typescript
// ✅ CORRECTO - Usar componente Kokonut existente
import { Button } from '@kokonut/ui';
import { Input } from '@kokonut/ui';

// ❌ PROHIBIDO - No importar otras librerías UI
import { Button } from 'shadcn/ui'; // NO
import { TextField } from '@mui/material'; // NO
```

2. Estructura de formulario con Kokonut (plantilla):

```typescript
// types.ts
export interface <FormName>FormData {
  field1: string;
  field2: number;
  // ... campos según necesidad
}

// Componente
import { Button, Input, Form } from '@kokonut/ui';

export function <FormName>Form() {
  const [formData, setFormData] = useState<<FormName>FormData>({
    field1: '',
    field2: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validación y submit
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Input
        value={formData.field1}
        onChange={(e) => setFormData({ ...formData, field1: e.target.value })}
        label="Field 1"
      />
      <Button type="submit">Submit</Button>
    </Form>
  );
}
```

3. Checklist de consistencia antes de commit:
   - [ ] Solo imports de `@kokonut/ui` o ruta equivalente
   - [ ] No hay imports de otras librerías UI (shadcn, mui, antd, etc.)
   - [ ] Tipos TypeScript definidos para props/form data
   - [ ] Componentes siguen estructura similar a otros forms del proyecto

## Checks

- [ ] No hay imports de librerías UI fuera de Kokonut
- [ ] Componentes usan tipos TypeScript (props tipadas)
- [ ] Formularios siguen estructura consistente (types + component)
- [ ] No se inventan componentes UI nuevos (usar solo los de Kokonut)
- [ ] Revisar código existente para mantener consistencia de patrones

## Output obligatorio

**Archivos tocados:**
- Componentes UI creados/modificados
- Archivos de tipos TypeScript (si aplica)

**Pasos para probar:**
1. Buscar en archivos modificados: `import.*from.*ui` → verificar que solo Kokonut
2. Verificar que componentes compilan sin errores
3. Revisar que estructura de forms es consistente con otros forms del proyecto
4. Ejecutar linter: no debe haber warnings sobre imports UI desconocidos
