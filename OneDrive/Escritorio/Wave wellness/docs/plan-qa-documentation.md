# Plan: QA + Documentación (PASO 13)

## Definition of Done (DoD)

- [ ] README.md actualizado con:
  - Requisitos (node version)
  - Instalación + correr local
  - Variables de entorno (.env.local basado en .env.example)
  - Rutas principales
  - Nota sobre Vercel Hobby (uploads directos)
- [ ] .env.example creado/actualizado
- [ ] docs/QA_SLICE1.md creado con:
  - Checklist E2E Student (register, login, crear payment, subir comprobante)
  - Checklist E2E Admin (crear packages, ver payments, aprobar)
  - Checklist E2E Student post-approval (ver créditos, ledger)
  - Checklist E2E Coach (navegar rutas)
- [ ] docs/SECURITY_CHECKLIST.md creado con:
  - RLS habilitado en tablas
  - Policies verificadas
  - Storage bucket privado
  - Storage policies verificadas
  - No service role key en repo
  - Hobby-safe uploads
- [ ] Limitaciones Slice 1 documentadas

## Lista de Archivos a Crear/Modificar

### Archivos a Modificar:
1. `README.md` - Actualizar con setup completo

### Archivos a Crear:
1. `.env.example` - Template de variables de entorno
2. `docs/QA_SLICE1.md` - Checklist E2E por rol
3. `docs/SECURITY_CHECKLIST.md` - Verificación de seguridad
4. `docs/plan-qa-documentation.md` - Este archivo

## Estructura de Contenido

### README.md
- Requisitos (Node.js 18+)
- Instalación paso a paso
- Variables de entorno
- Cómo aplicar schema/rls en Supabase
- Rutas principales
- Nota Vercel Hobby

### docs/QA_SLICE1.md
- Setup inicial
- Checklist Student completo
- Checklist Admin completo
- Checklist Coach
- Limitaciones conocidas

### docs/SECURITY_CHECKLIST.md
- RLS en tablas
- Policies por tabla
- Storage bucket y policies
- Verificación de no service role
- Hobby-safe uploads
