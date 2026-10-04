# 03. Roadmap de Sprints Iterativos

Esta hoja de ruta se organiza en la carpeta `./sprints/`:

- [ ] **Sprint 1: Setup Backend NestJS + PostgreSQL + Docker + Render** (`./sprints/SPRINT-1.md`)
  - [ ] Levantar PostgreSQL local en `./` con `docker compose up -d`.
  - [ ] Inicializar proyecto NestJS.
  - [ ] Configurar TypeORM con PostgreSQL y variables de entorno (`.env`).
  - [ ] Crear entidades y migraciones base segun `./docs/01-DATABASE.md`.
  - [ ] Validar archivo `./render.yaml` para deploy en Render.com.

- [ ] **Sprint 2: Autenticación & API de Sincronización Móvil** (`./sprints/SPRINT-2.md`)
  - [ ] Implementar módulo Auth con JWT y roles (`ADMIN`, `OPERARIO`).
  - [ ] Endpoint `POST /api/lecturas/sincronizar-lote`.
  - [ ] Lógica de cálculo de desvío de consumo (> 40%).

- [ ] **Sprint 3: Consola Web Administrativa (React + Tailwind)** (`./sprints/SPRINT-3.md`)
  - [ ] Dashboard interactivo de lecturas recibidas.
  - [ ] Módulo de alertas de lecturas atípicas.
  - [ ] Módulo de reclamos con vista de fotos de evidencia.

- [ ] **Sprint 4: App Móvil React Native/Expo (`./apps/mobile`)** (`./sprints/SPRINT-4.md`)
  - [ ] Cliente HTTP Dio para conectar con la API NestJS.
  - [ ] Manejo de cola SQFlite offline y disparo de sincronización diferida.

- [ ] **Sprint 5: Pruebas de Integración y Material para Tesis** (`./sprints/SPRINT-5.md`)
  - [ ] Captura de pantallas y diagramas para la 4ta Entrega del 20 de Octubre.
