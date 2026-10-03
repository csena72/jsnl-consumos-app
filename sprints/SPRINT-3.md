# Prompt Orquestador — Sprint 3: Consola Web React + Documentación OpenAPI (Swagger)

Copia y pega este prompt directamente en la consola de tu agente de IA (Claude Code, Cursor, Windsurf) para ejecutar el **Sprint 3**:

```text
Actúa como un Senior Fullstack Engineer especializado en NestJS, React, OpenAPI/Swagger y Tailwind CSS.

CONTEXTO DEL ENTORNO DE TRABAJO (RUTAS RELATIVAS):
- Repositorio actual (Web + API REST): `./`
- Repositorio hermano (App Móvil Flutter): `../consumos_app`
- Documentación técnica: `./docs/`
- Sprints y Prompts: `./sprints/`
- Definición de Agentes: `./AGENTS.md`

Documentos de referencia a leer antes de empezar:
- `./docs/00-ARQUITECTURA.md`
- `./docs/01-DATABASE.md`
- `./docs/02-API-SPEC.md`
- `./sprints/03-ROADMAP-SPRINTS.md`

OBJETIVOS DEL SPRINT 3:

1. CONFIGURACIÓN DE SWAGGER / OPENAPI EN NESTJS (`./apps/api`):
   - Instalar `@nestjs/swagger` y `swagger-ui-express`.
   - Configurar Swagger Module en `main.ts` disponible en la ruta `/api/docs`.
   - Configurar `@ApiBearerAuth()` para autenticación JWT en Swagger.
   - Decorar todos los Controladores (`Auth`, `Socios`, `Medidores`, `Lecturas`, `Reclamos`) con `@ApiTags()`, `@ApiOperation()`, `@ApiResponse()`.
   - Decorar los DTOs con `@ApiProperty()` y validadores de `class-validator`.

2. ENDPOINTS ADICIONALES DEL BACKEND (`./apps/api`):
   - `PATCH /api/lecturas/:id/aprobar`: Permitir al Administrador validar una lectura marcada como atípica (>40% desvío).
   - `GET /api/lecturas/exportar`: Endpoint para descargar reporte consolidado en CSV/Excel para facturación.
   - `GET /api/reclamos` y `PATCH /api/reclamos/:id/estado`: Gestión completa del ciclo de vida de reclamos de socios.

3. CONSOLA WEB ADMINISTRATIVA REACT (`./apps/web`):
   - Inicializar proyecto React + Vite + TypeScript con Tailwind CSS en `./apps/web`.
   - Implementar Router (React Router DOM) con protección de rutas JWT.
   - Vista de Autenticación (`/login`): Formulario conectado a `/api/auth/login`.
   - Dashboard Principal (`/`):
     - Métrica de Lotes procesados y Alertas de Consumos Atípicos (>40%).
     - Tabla interactiva de Lecturas Atípicas con visualización de fotografía del medidor subida por el operario.
     - Botón de aprobación/rechazo manual de lecturas atípicas.
   - Módulo de Reclamos (`/reclamos`): Listado de reclamos, cambio de estado y foto de evidencia.
   - Módulo de Exportación (`/exportar`): Descarga de planillas de consumo para facturación.

Por favor, genera la implementación paso a paso asegurando TypeScript estricto, componentes limpios en React y documentación interactiva de Swagger funcionando.
```
