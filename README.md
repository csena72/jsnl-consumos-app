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
