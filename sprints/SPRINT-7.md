# Prompt Orquestador — Sprint 7: Correcciones Críticas (Exportación, Asignación de Rutas y Persistencia de Imágenes)

Copia y pega este prompt directamente en la consola de tu agente de IA (Claude 3.5 Sonnet, Cursor o Windsurf) para ejecutar el **Sprint 7**:

```text
Actúa como un Senior Fullstack Engineer especializado en NestJS, React, React Native Expo, PostgreSQL y Render.com.

CONTEXTO DEL ENTORNO DE TRABAJO (RUTAS RELATIVAS):
- Repositorio Backend + Web: `./`
- Repositorio App Móvil: `./apps/mobile`
- Documentación técnica: `./docs/`
- Definición de Agentes: `./AGENTS.md`

OBJETIVOS DEL SPRINT 7 (CORRECCIONES Y AJUSTES CRÍTICOS):

1. MEJORA DEL MÓDULO DE EXPORTACIÓN (BACKEND + WEB):
   - Backend (`./apps/api`): Modificar el endpoint `GET /api/lecturas/exportar` para que acepte el parámetro de consulta `?filtro=TODAS|ATIPICAS|PROCESADAS`.
     * `TODAS`: Exporta la totalidad de lecturas tomadas en el período.
     * `ATIPICAS`: Exporta solo aquellas lecturas marcadas con desvío > 40%.
     * `PROCESADAS`: Exporta solo las lecturas validadas/correctas.
   - Frontend Web (`./apps/web`): En la pantalla de Exportación (`/exportar`), agregar un selector desplegable (Dropdown / Select) que permita elegir el tipo de reporte a descargar (Todas, Atípicas, Procesadas correctamente) y enviar dicho parámetro a la API.

2. ASIGNACIÓN EXCLUSIVA DE RUTAS Y ORDEN DE CAMINATA (BACKEND + WEB + MOBILE):
   - Backend (`./apps/api`):
     * Vincular la entidad `Ruta` con el `Usuario` (operador/lecturista asignado).
     * Crear el endpoint `PATCH /api/rutas/:id/asignar` para asignar/desasignar operadores.
     * Modificar `GET /api/rutas/asignada` para que retorne ÚNICAMENTE las rutas asignadas al `userId` del JWT del operario autenticado.
     * Asegurar que el listado de medidores dentro de la ruta venga ordenado por `ordenSecuencia ASC`.
   - Consola Web (`./apps/web`):
     * En la gestión de rutas (`/rutas`), agregar la opción para que el Admin seleccione el operario responsable de cada ruta.
   - App Móvil (`./apps/mobile`):
     * Al sincronizar/descargar la ruta, asegurar que solo se descarguen los medidores de las rutas asignadas al usuario logueado y se muestren respetando estrictamente `ordenSecuencia`.

3. SOLUCIÓN AL ERROR 404 DE IMÁGENES EN RENDER.COM:
   - Diagnóstico: Render.com posee un sistema de archivos efímero. Al reiniciar el servidor o re-desplegar, los archivos en `./uploads` se borran. Además, NestJS requiere servir estáticamente dicha carpeta.
   - Solución en Backend (`./apps/api`):
     * Configurar `ServeStaticModule` de `@nestjs/serve-static` en `app.module.ts` mapeando `/uploads` a la carpeta física de almacenamiento.
     * Implementar persistencia de imágenes en la nube (usando Cloudinary / Supabase Storage / Render Persistent Disk o sirviendo las imágenes desde un controlador de almacenamiento seguro con fallback).
     * Modificar la generación de URLs de evidencia para garantizar HTTPS y rutas absolutas persistentes.

Por favor, ejecuta las correcciones paso a paso asegurando TypeScript estricto, probando la persistencia de imágenes y verificando que la exportación y la asignación de rutas funcionen de punta a punta.
```
