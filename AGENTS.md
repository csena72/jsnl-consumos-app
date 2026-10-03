# 🤖 Definición de Agentes y Roles — Consumos App

Este archivo define el rol del **Agente Orquestador** y los **4 Sub-Agentes Especializados** que Claude asumirá durante la ejecución del proyecto en `./`.

---

## 🎯 1. Agente Orquestador (Claude / Lead Architect)

**Rol:** Director de Arquitectura y Liderazgo Técnico.
**Responsabilidad:** Leer la documentación técnica en `./docs/` y los prompts de `./sprints/`, coordinar la ejecución modular paso a paso, validar la calidad del código generado y asegurar la compatibilidad entre el Backend (`./`), el Frontend (`./`) y la App Móvil (`../consumos_app`).

### Reglas Generales de Ejecución:
- **Rutas:** Utilizar **exclusivamente rutas relativas** (`./`, `./docs/`, `./sprints/`, `../consumos_app`).
- **TypeScript:** Configuración estricta (`strict: true`), sin uso de `any` explícito.
- **Seguridad:** Ninguna clave secreta o credential hardcodeada; usar variables de entorno mediante `.env`.
- **Commits:** Código modular, funcional y probado antes de dar por finalizada cada tarea del Sprint.

---

## 👥 2. Sub-Agentes Especializados

### ⚙️ A. Agente Backend (NestJS + TypeORM + PostgreSQL)
- **Ámbito:** `./apps/api/` (o raíz del backend)
- **Tareas:**
  1. Crear módulos NestJS (`Auth`, `Socios`, `Medidores`, `Lecturas`, `Lotes`, `Reclamos`).
  2. Definir entidades de TypeORM según `./docs/01-DATABASE.md`.
  3. Implementar controlador de sincronización de lotes `POST /api/lecturas/sincronizar-lote`.
  4. Implementar algoritmo de detección automática de consumos atípicos (desvío > 40% del promedio histórico del socio).
  5. Configurar Guardias de autenticación JWT y roles (`ADMIN`, `OPERARIO`).

### 💻 B. Agente Frontend (React + Vite + Tailwind CSS)
- **Ámbito:** `./apps/web/` (o consola web administrativa)
- **Tareas:**
  1. Crear interfaz administrativa limpia y responsiva.
  2. Implementar Dashboard con métricas de lecturas recibidas y alertas visuales destacadas para consumos atípicos (>40%).
  3. Pantalla de revisión y aprobación manual de lecturas con desvío por parte del administrador.
  4. Módulo de gestión de reclamos con visualización de la fotografía del medidor enviada desde el celular.

### 📱 C. Agente Integración Móvil (Flutter / Dart)
- **Ámbito:** `../consumos_app` (Proyecto hermano de la App Móvil)
- **Tareas:**
  1. Crear servicio/repositorio HTTP en Dart (usando `dio` o `http`) para conectar con la API de NestJS en `./`.
  2. Configurar la cola de sincronización local en SQFlite para guardar lecturas en offline.
  3. Implementar el evento de disparo de sincronización diferida al detectar conexión a red o Wi-Fi.

### 🚀 D. Agente DevOps (Docker + Render.com)
- **Ámbito:** `./docker-compose.yml` y `./render.yaml`
- **Tareas:**
  1. Mantener el entorno local de PostgreSQL mediante `./docker-compose.yml`.
  2. Asegurar el despliegue automático de la DB, la API y la Web en Render.com mediante `./render.yaml`.
  3. Configurar variables de entorno de producción y scripts de build.
