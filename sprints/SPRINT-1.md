# Sprint 1 — Setup Backend NestJS + PostgreSQL + Docker + Render

Este archivo pertenece a la carpeta `./sprints/SPRINT-1.md`.

## Prompt Orquestador para Agente de IA (Cursor / Claude Code / Windsurf)

Copia y pega este prompt en la consola de tu editor situado en `./`:

```text
Actúa como un Senior Backend Engineer especializado en NestJS, TypeORM y PostgreSQL.

CONTEXTO DEL ENTORNO DE TRABAJO (RUTAS RELATIVAS):
- Repositorio actual (Web + API REST): `./`
- Repositorio hermano (App Móvil Flutter): `../consumos_app`
- Documentación técnica: `./docs/`
- Gestión de Sprints: `./sprints/`

Documentos de referencia a leer antes de empezar:
- `./docs/00-ARQUITECTURA.md`
- `./docs/01-DATABASE.md`
- `./docs/02-API-SPEC.md`
- `./sprints/03-ROADMAP-SPRINTS.md`

OBJETIVO DEL SPRINT 1:
1. Levantar la base de datos PostgreSQL local en `./` usando `./docker-compose.yml` (`docker compose up -d`).
2. Crear la estructura inicial del proyecto NestJS en `./`.
3. Configurar TypeORM/Prisma con conexión a PostgreSQL mediante variables de entorno (`.env`).
4. Definir las Entidades base de la base de datos en TypeScript según `./docs/01-DATABASE.md`:
   - `Usuario` (id, email, passwordHash, nombre, rol)
   - `Socio` (id, numeroSocio, nombreCompleto, direccionTacural, categoria)
   - `Medidor` (id, numeroSerie, socioId, tipoServicio, estado)
   - `LoteSincronizacion` (id, operarioId, fechaCreacion, estado)
   - `Lectura` (id, loteId, medidorId, operarioId, valorLectura, periodo, fechaCaptura, promedioHistorico, desvioPorcentaje, esAtipico, fotografiaUrl, observaciones)
   - `Reclamo` (id, socioId, lecturaId, motivo, estado, fotoEvidenciaUrl, fechaIngreso)
5. Validar que `./render.yaml` en la raíz `./` esté configurado correctamente para desplegar la API NestJS y la DB PostgreSQL en Render.com.

Por favor, genera los archivos paso a paso, asegurando TypeScript estricto, código modular y listo para ejecutar.
```
