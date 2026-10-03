# 01. Modelo de Base de Datos (PostgreSQL)

## 1. Tablas y Entidades Principales

### `usuarios`
* `id`: UUID (PK)
* `email`: VARCHAR (Unique)
* `password_hash`: VARCHAR
* `nombre`: VARCHAR
* `rol`: ENUM (`ADMIN`, `OPERARIO`)

### `socios`
* `id`: UUID (PK)
* `numero_socio`: INT (Unique)
* `nombre_completo`: VARCHAR
* `direccion_tacural`: VARCHAR
* `categoria`: ENUM (`RESIDENCIAL`, `RURAL`, `COMERCIAL`)

### `medidores`
* `id`: UUID (PK)
* `numero_serie`: VARCHAR (Unique)
* `socio_id`: UUID (FK -> `socios.id`)
* `tipo_servicio`: ENUM (`AGUA`, `ENERGIA`)
* `estado`: ENUM (`ACTIVO`, `INACTIVO`)

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
* `motivo`: VARCHAR
* `estado`: ENUM (`PENDIENTE`, `EN_REVISION`, `RESUELTO`)
* `foto_evidencia_url`: VARCHAR (Nullable)
* `fecha_ingreso`: TIMESTAMP
