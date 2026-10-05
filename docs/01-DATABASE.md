# 01. Modelo de Base de Datos (PostgreSQL)

## 1. Tablas y Entidades Principales

### `usuarios`
* `id`: UUID (PK)
* `email`: VARCHAR (Unique)
* `password_hash`: VARCHAR
* `nombre`: VARCHAR
* `rol`: ENUM (`ADMIN`, `OPERARIO`)
* `activo`: BOOLEAN (baja lógica; un usuario inactivo no puede iniciar sesión)

### `socios`
* `id`: UUID (PK)
* `numero_socio`: INT (Unique)
* `nombre_completo`: VARCHAR
* `direccion_tacural`: VARCHAR
* `categoria`: ENUM (`RESIDENCIAL`, `RURAL`, `COMERCIAL`)
* `dni`: VARCHAR (Unique, Nullable)
* `telefono`: VARCHAR (Nullable)
* `localidad_id`: UUID (FK -> `localidades.id`, Nullable)
* `activo`: BOOLEAN (baja lógica)

### `medidores`
* `id`: UUID (PK)
* `numero_serie`: VARCHAR (Unique)
* `socio_id`: UUID (FK -> `socios.id`)
* `tipo_servicio`: ENUM (`AGUA`, `ENERGIA`)
* `estado`: ENUM (`ACTIVO`, `INACTIVO`)
* `numero_caja`: VARCHAR (Nullable). Único por servicio: `(tipo_servicio, numero_caja)`; ENERGIA y AGUA llevan cajas independientes
* `estado_precinto`: ENUM (`INTACTO`, `VIOLADO`, `SIN_PRECINTO`)
* `localidad_id`: UUID (FK -> `localidades.id`, Nullable)
* `ruta_id`: UUID (FK -> `rutas.id`, Nullable, `ON DELETE SET NULL`)
* `orden_secuencia`: INT (Nullable). Posición en el recorrido de la ruta (1 = primero)

### `localidades`
* `id`: UUID (PK)
* `nombre`: VARCHAR (Unique)
* `provincia`: VARCHAR
* `codigo_postal`: VARCHAR (Nullable)

### `rutas`
* `id`: UUID (PK)
* `nombre`: VARCHAR (Unique junto con `localidad_id`)
* `localidad_id`: UUID (FK -> `localidades.id`)
* `activa`: BOOLEAN

### `medidores_pendientes_alta`
Medidores hallados en campo, pendientes de auditoría y vinculación a un socio.
* `id`: UUID (PK)
* `numero_serie`, `tipo_servicio`, `numero_caja`, `estado_precinto`, `localidad_id`, `direccion_referencia`, `observaciones`, `foto_url`
* `estado`: ENUM (`PENDIENTE`, `APROBADO`, `RECHAZADO`)
* `reportado_por_id`: UUID (FK -> `usuarios.id`); `fecha_creacion`: TIMESTAMP
* `revisado_por_id`: UUID (FK, Nullable); `fecha_revision`: TIMESTAMP (Nullable); `motivo_rechazo`: VARCHAR (Nullable)
* `medidor_id`: UUID (FK -> `medidores.id`, Nullable). Medidor oficial creado al aprobar

### `lotes_sincronizacion`
* `id`: UUID (PK)
* `operario_id`: UUID (FK -> `usuarios.id`)
* `fecha_creacion`: TIMESTAMP
* `estado`: ENUM (`PENDIENTE`, `PROCESADO`, `CON_INCONSISTENCIAS`)

### `lecturas`
* `id`: UUID (PK)
* `lote_id`: UUID (FK -> `lotes_sincronizacion.id`, Nullable)
* `medidor_id`: UUID (FK -> `medidores.id`)
* `operario_id`: UUID (FK -> `usuarios.id`)
* `valor_lectura`: DECIMAL(10,2)
* `periodo`: VARCHAR(6) (Ejemplo: `202610`)
* `fecha_captura`: TIMESTAMP
* `promedio_historico`: DECIMAL(10,2)
* `desvio_porcentaje`: DECIMAL(5,2)
* `es_atipico`: BOOLEAN (Calculado en backend: `true` si desvío > 40%)
* `fotografia_url`: VARCHAR (Nullable)
* `observaciones`: TEXT

### `reclamos`
* `id`: UUID (PK)
* `socio_id`: UUID (FK -> `socios.id`)
* `lectura_id`: UUID (FK -> `lecturas.id`, Nullable)
* `tipo_reclamo`: ENUM (`LECTURA_ERRONEA`, `FACTURACION`, `MEDIDOR_DANADO`, `FALTA_SERVICIO`, `OTRO`)
* `descripcion`: TEXT
* `estado`: ENUM (`PENDIENTE`, `EN_PROCESO`, `RESUELTO`)
* `foto_url`: VARCHAR (Nullable)
* `fecha_creacion`: TIMESTAMP

### `reclamos_historial`
* `id`: UUID (PK), `reclamo_id`: UUID (FK -> `reclamos.id`, `ON DELETE CASCADE`)
* `estado_anterior`: ENUM (Nullable), `estado_nuevo`: ENUM
* `comentario`: TEXT (Nullable), `usuario_id`: UUID (FK, Nullable), `fecha`: TIMESTAMP
