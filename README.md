# jsnl-consumos-app

Plataforma web centralizada y API REST integrada con aplicación móvil para la toma, validación y gestión de lecturas de agua y energía de la **Cooperativa de Provisión de Agua Potable y Otros Servicios Públicos de Tacural Ltda.**

Desarrollado por **JSNL Soluciones Informáticas (Grupo 5)**.

---

## 📐 Estructura del Proyecto

Monorepo en `./`:

* **Backend API REST** (`./src`): NestJS (TypeScript) + TypeORM
* **Consola Web** (`./apps/web`): React + Vite + Tailwind CSS
* **App Móvil** (`./apps/mobile`): React Native (Expo + TypeScript), offline-first con SQLite
* **Base de Datos:** PostgreSQL alojada en Render.com / Docker Local

---

## 📁 Documentación y Sprints

Toda la documentación técnica y hojas de ruta del proyecto se organizan en las carpetas `./docs/` y `./sprints/`:

### Documentación General (`./docs/`)
* [`./docs/00-ARQUITECTURA.md`](./docs/00-ARQUITECTURA.md): Visión general del sistema y stack tecnológico.
* [`./docs/01-DATABASE.md`](./docs/01-DATABASE.md): Esquema relacional de PostgreSQL.
* [`./docs/02-API-SPEC.md`](./docs/02-API-SPEC.md): Especificación de endpoints de NestJS.
* [`./apps/mobile/README.md`](./apps/mobile/README.md): App móvil: conexión a la API, túneles, Expo Go/web y solución de problemas.
* [`./docs/Contexto-Tecnico-ConsumosApp.md`](./docs/Contexto-Tecnico-ConsumosApp.md): Contexto técnico general del proyecto.

### Planificación por Sprints (`./sprints/`)
* [`./sprints/03-ROADMAP-SPRINTS.md`](./sprints/03-ROADMAP-SPRINTS.md): Hoja de ruta general y lista de verificación por Sprint.
* [`./sprints/SPRINT-1.md`](./sprints/SPRINT-1.md): Prompt del orquestador y tareas del Sprint 1 (Backend NestJS + DB + Docker + Render).
* [`./sprints/SPRINT-2.md`](./sprints/SPRINT-2.md): Autenticación JWT, sincronización de lotes y detección de desvío.
* [`./sprints/SPRINT-3.md`](./sprints/SPRINT-3.md): Swagger/OpenAPI y Consola Web React.
* [`./sprints/SPRINT-4.md`](./sprints/SPRINT-4.md): App móvil React Native (Expo) offline-first.

---

## ▶️ Puesta en marcha local

Requisitos: Node.js 22+, Docker.

```bash
cp .env.example .env            # completar JWT_SECRET, POSTGRES_PASSWORD, SEED_PASSWORD
docker compose up -d            # PostgreSQL local
npm install
npm run migration:run           # crea/actualiza el esquema
npm run seed                    # usuarios, socios, medidores y lecturas de ejemplo
npm run start:dev               # API en http://localhost:3000/api
```

Consola web (`./apps/web`):

```bash
cd apps/web
cp .env.example .env            # VITE_API_URL=http://localhost:3000
npm install
npm run dev                     # http://localhost:5173
```

Tests del backend: `npm test`.

### Documentación interactiva (Swagger)

Con la API corriendo: **http://localhost:3000/api/docs** (JSON OpenAPI en `/api/docs-json`).
Para probar endpoints protegidos: `POST /api/auth/login`, copiar `access_token` y pulsar **Authorize**.

### Usuarios de ejemplo (seed)

| Rol | Email | Uso |
|---|---|---|
| `ADMIN` | `admin@tacural.com` | Consola web y API |
| `OPERARIO` | `operario1@tacural.com`, `operario2@tacural.com` | App móvil (sincronización de lotes) |

La contraseña de los tres es el valor de `SEED_PASSWORD` en tu `.env` (si no está definida, el seed genera una aleatoria y la imprime una sola vez). El seed no modifica usuarios ya existentes. **No uses la contraseña de desarrollo en producción.**

### Reglas de negocio

* Una lectura con desvío > 40% respecto al promedio histórico del medidor se marca como **atípica** y queda `PENDIENTE` de revisión.
* El administrador la **aprueba** o **rechaza** desde el dashboard.
* La exportación CSV para facturación (`/exportar`) excluye lecturas rechazadas y atípicas sin aprobar.

---

## 🚀 Funcionalidades Clave

* **Sincronización Diferida:** Recepción de lotes de mediciones tomadas por operarios en zonas rurales sin conectividad.
* **Alertas de Consumos Atípicos:** Validación automática en backend que detecta desvíos mayores al 40% respecto al promedio histórico del socio.
* **Gestión de Reclamos:** Panel administrativo con historial de mediciones y evidencia gráfica (foto del medidor).
* **Exportación de Datos:** Consolidación de lecturas para facturación.

---

## 🛠️ Despliegue (CI/CD)

* **Local:** Ejecutar `docker compose up -d` en `./` para levantar PostgreSQL local.
* **Producción:** Configuración para despliegue automático en **Render.com** mediante `./render.yaml`. Cada commit a la rama `main` despliega la API en NestJS, la web en React y PostgreSQL.

## App móvil (`apps/mobile`)

React Native (Expo + TypeScript), offline-first con SQLite. Guía completa de conexión (web, emulador, celular, túnel) en [`apps/mobile/README.md`](./apps/mobile/README.md).

```bash
cd apps/mobile
cp .env.example .env   # EXPO_PUBLIC_API_URL: web -> http://localhost:3000/api
npm install
npm start              # w = web, a = Android, o escanear el QR con Expo Go
npm run typecheck && npm test
```

Flujo: login (requiere red) → descarga de la ruta (`GET /api/lecturas/ruta`) → carga de lecturas 100% offline → sincronización automática al recuperar la red o con "Sincronizar ahora".
