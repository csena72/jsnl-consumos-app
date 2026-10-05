# Prompt Orquestador — Sprint 6: Ajustes de Aplicación Móvil (Offline-First) y Pruebas E2E

Copia y pega este prompt directamente en la consola de tu agente de IA (Claude Code, Cursor, Windsurf) para ejecutar el **Sprint 6**:

```text
Actúa como un Senior Mobile Engineer especializado en React Native, Expo, TypeScript, SQLite (`expo-sqlite`) y arquitecturas Offline-First.

CONTEXTO DEL ENTORNO DE TRABAJO (RUTAS RELATIVAS):
- Repositorio principal (Backend NestJS + Web React): `./`
- Repositorio móvil React Native: `./apps/mobile`
- Documentación técnica: `./docs/`
- Archivo de Sprints: `./sprints/`
- Definición de Agentes: `./AGENTS.md`

Documentos de referencia a leer antes de empezar:
- `./docs/00-ARQUITECTURA.md`
- `./docs/01-DATABASE.md`
- `./docs/02-API-SPEC.md`
- `./sprints/SPRINT-5.md`

OBJETIVO DEL SPRINT 6:
Adaptar la Aplicación Móvil en React Native Expo (`./apps/mobile`) a los nuevos esquemas del Backend desarrollados en el Sprint 5 (Servicios Luz/Agua con cajas independientes, Localidades/Pueblos, Orden de Secuencia física) e implementar la captura offline de medidores nuevos, asegurando la integración End-to-End (E2E) completa con la API REST desplegada en producción.

TAREAS ESPECÍFICAS A EJECUTAR:

1. ACTUALIZACIÓN DE LA BASE DE DATOS LOCAL SQLITE (`./apps/mobile`):
   - Actualizar las migraciones y tabla local `consumos_local.db`:
     - Agregar campos `localidadId` y `tipoServicio` ('ENERGIA' | 'AGUA') en las tablas cache de rutas y medidores.
     - Agregar campo `ordenSecuencia` en la lista de medidores por ruta.
     - Crear tabla local `medidores_nuevos_pendientes` (id_local, numeroSerie, socioId, tipoServicio, localidadId, lecturaInicial, fotoPathLocal, sincronizado).

2. MEJORAS EN LA INTERFAZ Y RECORRIDO EN CAMPO (`./apps/mobile`):
   - Módulo de Selección de Ruta: Permitir filtrar y descargar recorridos por **Pueblo / Localidad** y por **Tipo de Servicio** (Luz o Agua).
   - Pantalla de Toma de Lecturas: Visualizar los medidores respetando el orden exacto de caminata (`ordenSecuencia`), mostrando claramente el número de caja y tipo de servicio.
   - Formulario de "Alta de Medidor Nuevo / No Empadronado":
     - Permite al lecturista ingresar los datos de un medidor instalado que no figuraba en la ruta.
     - Captura obligatoria de foto del medidor con `expo-camera`.
     - Guardado en SQLite local para sincronizar cuando recupere señal.

3. ADAPTACIÓN DEL MOTOR DE SINCRONIZACIÓN DIFERIDA (`Sync Engine`):
   - Actualizar el servicio de sincronización para enviar los lotes a la API REST actualizando `POST /api/lecturas/sincronizar-lote`.
   - Implementar el envío del lote de medidores nuevos detectados en campo a `POST /api/medidores-pendientes` con sus fotos asociadas (`multipart/form-data`).
   - Marcar registros como sincronizados en SQLite tras recibir confirmación exitosa (HTTP 201/200) de la API.

4. PRUEBAS Y VALIDACIÓN END-TO-END (E2E):
   - Simular el flujo completo en un dispositivo móvil/emulador:
     1. Descargar ruta específica de Agua o Luz para una localidad.
     2. Cortar la conexión a Internet (Modo Avión).
     3. Registrar lecturas normales, atípicas (>40% con foto) y dar de alta un medidor nuevo.
     4. Reconectar a Internet y presionar "Sincronizar Lote".
     5. Verificar en la Consola Web React que las lecturas y la solicitud del medidor nuevo aparezcan para aprobación.

Por favor, genera el código modular en React Native con TypeScript estricto, manejo robusto de errores de red y componentes listos para ejecutar.
```
