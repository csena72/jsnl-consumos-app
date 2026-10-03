# 00. Arquitectura General del Sistema — Consumos App

## 1. Visión General
**Consumos App** es una plataforma integral desarrollada para la **Cooperativa de Provisión de Agua Potable y Otros Servicios Públicos de Tacural Ltda.** por la consultora **JSNL Soluciones Informáticas (Grupo 5)**.

El sistema resuelve la toma, validación y gestión de lecturas de consumos de servicios de agua y energía, reemplazando el circuito manual en papel por una arquitectura distribuida web-móvil.

---

## 2. Entornos y Rutas Relativas
* **Repositorio Web + Backend API:** `./` (NestJS + React + PostgreSQL).
* **Repositorio App Móvil:** `../consumos_app` (Flutter Offline-First).
* **Carpeta de Documentación:** `./docs/`
* **Carpeta de Sprints:** `./sprints/`

---

## 3. Stack Tecnológico
1. **Backend:** NestJS (TypeScript) con TypeORM.
2. **Frontend Web:** React (TypeScript) + Vite + Tailwind CSS.
3. **Base de Datos:** PostgreSQL (Docker Local en `./docker-compose.yml` / Cloud en Render.com).
4. **App Móvil:** Flutter con SQFlite para persistencia offline local en `../consumos_app`.
5. **CI/CD & Hosting:** Render.com gestionado mediante `./render.yaml`.
