# Contexto Técnico y Arquitectura de Proyecto: Consumos App

## 1. Resumen Ejecutivo del Proyecto
- **Proyecto**: Consumos App - Plataforma Web Centralizada e Integración con Aplicación Móvil de Toma de Lecturas de Consumo (Agua y Energía).
- **Cliente**: Cooperativa de Electricidad y Otros Servicios Públicos de Tacural Ltda. (Tacural, Santa Fe, Argentina).
- **Desarrollador / Consultora**: JSNL Soluciones Informáticas (Grupo 5 - ESBA).
- **Problema Principal**: La toma de lecturas manual en planillas impresas de papel genera cuellos de botella (hasta 72 hs en procesar), errores de tipeo manual y pérdida de información por inclemencias climáticas.
- **Solución Propuesta**: Sistema integral compuesto por una **Plataforma Web Centralizada (NestJS + React + PostgreSQL)** y una **Aplicación Móvil en Flutter** que funciona en modo *offline-first* para zonas rurales sin conectividad.

---

## 2. Entornos de Trabajo y Repositorios Relativos
- **Repositorio Principal (Web + API REST)**: `./` (NestJS + React + PostgreSQL).
- **Proyecto Herramo (App Móvil Flutter)**: `../consumos_app` (Flutter Offline-First).

---

## 3. Stack Tecnológico Definido
1. **Backend / API REST**: **NestJS (TypeScript)**
   - Framework modular, robusto y fuertemente tipado.
   - ORM: **TypeORM** o **Prisma** para PostgreSQL.
   - Autenticación: **JWT** (JSON Web Tokens) con Guards y Passport.
2. **Frontend Web**: **React (TypeScript + Vite)**
   - Dashboard administrativo interactivo.
   - UI / Estilos: Tailwind CSS + Shadcn/UI o MUI.
   - Estado y Fetching: TanStack Query + Axios.
3. **Base de Datos**: **PostgreSQL**
   - Alojada en **Render.com** (PostgreSQL Managed Database).
   - Esquema relacional optimizado para consumo histórico, socios, medidores y lotes.
4. **App Móvil**: **Flutter (Dart)**
   - Ubicada en el proyecto hermano `../consumos_app`.
   - Almacenamiento Local Offline: SQFlite / Hive.
   - Cliente HTTP: Dio con interceptores para sincronización diferida.
5. **Infraestructura & CI/CD**:
   - Repositorio vinculado a **GitHub**.
   - Deployment Automatizado en **Render.com** mediante `./render.yaml`.

---

## 4. Estructura Relativa del Repositorio
```text
.
├── ../consumos_app/                 # App Móvil en Flutter (proyecto hermano)
└── ./                               # Repositorio Principal en GitHub
    ├── apps/
    │   ├── api/                     # Backend NestJS
    │   └── web/                     # Frontend React (Vite)
    ├── docs/                        # Documentación técnica en Markdown
    │   ├── 00-ARQUITECTURA.md
    │   ├── 01-DATABASE.md
    │   ├── 02-API-SPEC.md
    │   └── 03-ROADMAP-SPRINTS.md
    ├── render.yaml                  # Infraestructura como Código (Render)
    └── README.md
```
