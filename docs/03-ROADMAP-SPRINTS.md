# 03. Roadmap de Sprints Iterativos

## Roadmap de Trabajo

- [ ] **Sprint 1: Setup Backend NestJS + PostgreSQL + Render**
  - [ ] Inicializar proyecto NestJS en la raíz del repositorio `./`.
  - [ ] Configurar TypeORM con PostgreSQL y variables de entorno.
  - [ ] Crear entidades y migraciones base.
  - [ ] Generar archivo `./render.yaml` y probar deploy inicial en Render.com.

- [ ] **Sprint 2: Autenticación & API de Sincronización Móvil**
  - [ ] Implementar módulo Auth con JWT y roles (`ADMIN`, `OPERARIO`).
  - [ ] Endpoint `POST /api/lecturas/sincronizar-lote`.
  - [ ] Lógica de cálculo de desvío de consumo (> 40%).

- [ ] **Sprint 3: Consola Web Administrativa (React + Tailwind)**
  - [ ] Dashboard interactivo de lecturas recibidas.
  - [ ] Módulo de alertas de lecturas atípicas.
  - [ ] Módulo de reclamos con vista de fotos de evidencia.

- [ ] **Sprint 4: Integración Móvil en Flutter (`../consumos_app`)**
  - [ ] Cliente HTTP Dio en `../consumos_app` para conectar con la API NestJS.
  - [ ] Manejo de cola SQFlite offline y disparo de sincronización diferida.

- [ ] **Sprint 5: Pruebas de Integración y Material para Tesis**
  - [ ] Captura de pantallas y diagramas para la 4ta Entrega del 20 de Octubre.

---

## Prompt para ejecutar el SPRINT 1 en la Consola (Cursor / Claude Code)

```text
Actúa como un Senior Backend Engineer especializado en NestJS, TypeORM y PostgreSQL.

Estamos iniciando el SPRINT 1 para el proyecto ubicado en la raíz del repositorio `./`.

CONTEXTO DE RUTAS RELATIVAS:
- Repositorio principal (Web + API REST): `./`
- Repositorio hermano (App Móvil Flutter): `../consumos_app`
- Carpeta de documentación: `./docs/`

OBJETIVO DEL SPRINT 1:
1. Crear la estructura inicial del proyecto NestJS en la raíz `./`.
2. Configurar TypeORM/Prisma con conexión a PostgreSQL usando variables de entorno (.env).
3. Definir las Entidades base de la base de datos basándote en `./docs/01-DATABASE.md`:
   - Socio, Medidor, Lectura, Lote, Reclamo y Usuario.
4. Crear el archivo `./render.yaml` en la raíz para desplegar la API y la DB PostgreSQL en Render.com.

Por favor, lee `./docs/00-ARQUITECTURA.md`, `./docs/01-DATABASE.md` y `./docs/02-API-SPEC.md`, y genera los archivos paso a paso con TypeScript estricto.
```
