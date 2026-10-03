# jsnl-consumos-app

Plataforma web centralizada y API REST integrada con aplicación móvil para la toma, validación y gestión de lecturas de agua y energía de la **Cooperativa de Provisión de Agua Potable y Otros Servicios Públicos de Tacural Ltda.**

Desarrollado por **JSNL Soluciones Informáticas (Grupo 5)**.

---

## 📐 Estructura del Proyecto

El desarrollo se organiza en dos proyectos independientes en el espacio de trabajo:

* **`jsnl-consumos-app`** (`./` - Repositorio actual):
  * **Backend API REST:** NestJS (TypeScript) + TypeORM
  * **Consola Web:** React + Vite + Tailwind CSS
  * **Base de Datos:** PostgreSQL alojada en Render.com / Docker Local
* **`consumos_app`** (`../consumos_app` - Proyecto hermano):
  * **Aplicación Móvil:** Flutter (Offline-First con SQFlite)

---

## 📁 Documentación y Sprints

Toda la documentación técnica y hojas de ruta del proyecto se organizan en las carpetas `./docs/` y `./sprints/`:

### Documentación General (`./docs/`)
* [`./docs/00-ARQUITECTURA.md`](./docs/00-ARQUITECTURA.md): Visión general del sistema y stack tecnológico.
* [`./docs/01-DATABASE.md`](./docs/01-DATABASE.md): Esquema relacional de PostgreSQL.
* [`./docs/02-API-SPEC.md`](./docs/02-API-SPEC.md): Especificación de endpoints de NestJS.
* [`./docs/Contexto-Tecnico-ConsumosApp.md`](./docs/Contexto-Tecnico-ConsumosApp.md): Contexto técnico general del proyecto.

### Planificación por Sprints (`./sprints/`)
* [`./sprints/03-ROADMAP-SPRINTS.md`](./sprints/03-ROADMAP-SPRINTS.md): Hoja de ruta general y lista de verificación por Sprint.
* [`./sprints/SPRINT-1.md`](./sprints/SPRINT-1.md): Prompt del orquestador y tareas del Sprint 1 (Backend NestJS + DB + Docker + Render).
* [`./sprints/SPRINT-2.md`](./sprints/SPRINT-2.md): Autenticación JWT, sincronización de lotes y detección de desvío.
* [`./sprints/SPRINT-3.md`](./sprints/SPRINT-3.md): Swagger/OpenAPI y Consola Web React.

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
