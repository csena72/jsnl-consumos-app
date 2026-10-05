# Prompt Orquestador — Sprint 5: Cierre de Backend (API REST) y Consola Web (CRUDs Completos)

Copia y pega este prompt directamente en la consola de tu agente de IA para ejecutar el **Sprint 5**:

```text
Actúa como un Senior Fullstack Engineer especializado en NestJS, PostgreSQL, TypeORM, React, Vite y Tailwind CSS.

CONTEXTO DEL ENTORNO DE TRABAJO (RUTAS RELATIVAS):
- Repositorio principal (Backend + Web): `./`
- Repositorio hermano (App Móvil React Native Expo): `./apps/mobile`
- Documentación técnica: `./docs/`

OBJETIVO DEL SPRINT 5:
Completar al 100% el Backend (NestJS) y la Consola Web (React), dejando implementados todos los CRUDs/ABMs, las nuevas entidades de negocio (Luz/Agua, Multilocalidad, Orden de Secuencia) y el sistema de reclamos, garantizando un contrato de API REST estable antes de actualizar la App Móvil.

TAREAS ESPECÍFICAS A EJECUTAR:

1. ACTUALIZACIÓN DEL MODELO DE DATOS Y BASE DE DATOS (NestJS / PostgreSQL):
   - Crear entidad `Localidad` (id, nombre, provincia, codigoPostal).
   - Actualizar entidad `Medidor`: agregar campos `tipoServicio` ('ENERGIA' | 'AGUA'), `numeroCaja`, `estadoPrecinto`, `localidadId`.
   - Actualizar entidad `Ruta`: agregar relación con `Localidad` y ordenamiento por `ordenSecuencia`.
   - Crear entidad `MedidorPendienteAlta`: para registrar solicitudes de medidores nuevos detectados en campo (pendiente de vinculación a socio).
   - Crear entidad `Reclamo`: (id, socioId, tipoReclamo, descripcion, estado, fotoUrl, fechaCreacion).

2. DESARROLLO DE CRUDS / ABMS COMPLETOS EN BACKEND (`./apps/api`):
   - `SociosController` / `SociosService`: CRUD completo (Crear, Listar con paginado y filtro por localidad, Editar, Dar de Baja).
   - `MedidoresController` / `MedidoresService`: CRUD completo con filtros por tipo de servicio (Luz/Agua), socio y localidad.
   - `RutasController` / `RutasService`: CRUD de rutas con gestión de la secuencia física de lectura (`ordenSecuencia`).
   - `LocalidadesController`: CRUD para la gestión de pueblos y parajes rurales.
   - `ReclamosController`: Endpoints para crear, cambiar estado ('PENDIENTE', 'EN_PROCESO', 'RESUELTO') y listar reclamos.
   - `MedidoresNuevosController`: Endpoints para auditar, aprobar y transformar un medidor pendiente en un medidor oficial del padrón.

3. CONSOLA WEB ADMINISTRATIVA REACT (`./apps/web`):
   - Módulo ABM de Socios: Formulario modal para alta/edición, búsqueda por DNI/Socio y tabla de resultados.
   - Módulo ABM de Medidores: Gestión diferenciada de medidores de Energía y Agua, asignación de caja y número de serie.
   - Módulo ABM de Rutas y Localidades: Armado interactivo de rutas por pueblo y reordenamiento de la secuencia de lectura.
   - Módulo de Auditoría de Medidores Nuevos: Panel para revisar las solicitudes de medidores hallados en campo y asociarlos a un socio.
   - Módulo de Reclamos (RF-08): Pantalla para gestión de tickets de reclamo con actualización de estado e historial.

4. DOCUMENTACIÓN SWAGGER (`/api/docs`):
   - Decorar todos los nuevos controladores y DTOs con `@ApiTags()`, `@ApiOperation()` y `@ApiResponse()` para actualizar Swagger.
```
