# 02. Especificación de la API REST (NestJS)

## 1. Autenticación (`/api/auth`)
* `POST /api/auth/login`
  * **Body:** `{ "email": "operario@tacural.com", "password": "..." }`
  * **Response:** `{ "access_token": "JWT_TOKEN...", "user": { ... } }`

---

## 2. Sincronización Móvil (`/api/lecturas`)
* `GET /api/lecturas/ruta` (ADMIN u OPERARIO): medidores de las rutas asignadas al usuario del token (lista plana de `GET /api/rutas/asignada`).
  * **Response:** `[{ "medidorId", "numeroSerie", "tipoServicio", "socioId", "numeroSocio", "nombreCompleto", "direccion", "lecturaAnterior", "promedioHistorico" }]`. `promedioHistorico` es el consumo promedio entre lecturas consecutivas (`null` sin historial suficiente).
* `POST /api/lecturas/sincronizar-lote`
  * **Headers:** `Authorization: Bearer <JWT>`
  * **Body Payload:**
    ```json
    {
      "operarioId": "UUID...",
      "lecturas": [
        {
          "medidorId": "UUID...",
          "valorLectura": 1250.50,
          "periodo": "202610",
          "fechaCaptura": "2026-10-03T10:15:00Z",
          "observaciones": "Medidor limpio"
        }
      ]
    }
    ```
  * **Lógica del Backend:**
    1. Registra el lote.
    2. Calcula el consumo y compara con el promedio histórico del socio.
    3. Si `desvio > 40%`, marca `es_atipico = true`.
    4. Retorna el resultado del lote procesado.

---

## 3. Consola Web Administrativa
Todos requieren `Authorization: Bearer <JWT>` y rol `ADMIN`. Documentación interactiva en `/api/docs`.

### Lecturas (`/api/lecturas`)
* `GET /api/lecturas/resumen?periodo=AAAAMM`: lotes procesados y totales de lecturas atípicas (pendientes/aprobadas/rechazadas). `periodo` es opcional.
* `GET /api/lecturas/atipicas?estado=PENDIENTE|APROBADA|RECHAZADA`: lecturas con desvío > 40%, con socio, medidor, operario y `fotografiaUrl`.
* `PATCH /api/lecturas/:id/aprobar`: body opcional `{ "comentario": "..." }`. 400 si no es atípica, 409 si ya fue revisada.
* `PATCH /api/lecturas/:id/rechazar`: ídem; la lectura queda fuera de la facturación.
* `GET /api/lecturas/exportar?periodo=AAAAMM&filtro=TODAS|ATIPICAS|PROCESADAS`: CSV (UTF-8 con BOM). `TODAS`: padrón completo del periodo; `ATIPICAS`: solo desvío > 40%; `PROCESADAS` (default): validadas/correctas, excluye rechazadas y atípicas sin aprobar.
* `POST /api/lecturas/:id/evidencia` (ADMIN u OPERARIO): `multipart/form-data`, campo `foto` (JPG/PNG, máx. 5 MB). Las fotos se guardan en `./uploads` y se sirven en `/uploads/<archivo>` con `ServeStaticModule`. En Render (disco efímero) se pierden al re-desplegar.

### Reclamos (`/api/reclamos`)
* `GET /api/reclamos?estado=PENDIENTE|EN_PROCESO|RESUELTO&tipoReclamo=...&socioId=...`: más recientes primero, con socio, lectura y `fotoUrl`.
* `GET /api/reclamos/:id`: detalle con `historial` de cambios de estado.
* `POST /api/reclamos` (ADMIN u OPERARIO): `{ socioId, tipoReclamo, descripcion, lecturaId? }`. Queda `PENDIENTE`.
* `PATCH /api/reclamos/:id/estado`: `{ "estado": "EN_PROCESO", "comentario"?: "..." }`. Registra el cambio en el historial; 400 si ya está en ese estado.
* `POST /api/reclamos/:id/foto` (ADMIN u OPERARIO): `multipart/form-data`, campo `foto`.

### Socios (`/api/socios`)
* `GET /api/socios?q=&localidadId=&activo=&page=&limit=`: paginado `{ data, total, page, limit }`; `q` busca por DNI, N° de socio o nombre. Por defecto solo activos.
* `GET /api/socios/:id`, `POST /api/socios`, `PATCH /api/socios/:id` (409 si N° de socio o DNI duplicado).
* `DELETE /api/socios/:id`: baja lógica (también desactiva sus medidores). `PATCH /api/socios/:id/reactivar`.

### Medidores (`/api/medidores`)
* `GET /api/medidores?tipoServicio=ENERGIA|AGUA&socioId=&localidadId=&rutaId=&estado=&q=&page=&limit=`: paginado. Por defecto solo activos.
* `GET/POST/PATCH /api/medidores/:id`: campos `numeroSerie`, `socioId`, `tipoServicio`, `numeroCaja`, `estadoPrecinto`, `localidadId`, `rutaId`, `ordenSecuencia`. 409 si el N° de serie está repetido o la caja ya está ocupada **para ese servicio**.
* `DELETE /api/medidores/:id`: baja lógica (`INACTIVO`).

### Localidades (`/api/localidades`)
* `GET` (ADMIN u OPERARIO), `GET/:id`, `POST`, `PATCH /:id`, `DELETE /:id` (409 si tiene socios, medidores o rutas).

### Rutas (`/api/rutas`)
* `GET /api/rutas?localidadId=&activa=`, `GET /api/rutas/:id` (medidores en orden de lectura), `POST`, `PATCH /:id`, `DELETE /:id` (los medidores quedan sin ruta).
* `GET /api/rutas/asignada` (ADMIN u OPERARIO): únicamente las rutas activas cuyo operario es el `userId` del JWT, con sus medidores (lectura anterior y promedio histórico) ordenados por `ordenSecuencia ASC`.
* `PATCH /api/rutas/:id/asignar` (ADMIN): `{ "operarioId": "<uuid>" | null }` asigna o desasigna el operario responsable (debe ser un usuario OPERARIO activo).
* `PUT /api/rutas/:id/orden`: `{ "medidorIds": [...] }` define el conjunto y la secuencia física de lectura (`ordenSecuencia` = posición + 1).
* `GET /api/lecturas/ruta` (usado por la app móvil) ahora incluye `numeroCaja`, `localidad`, `ruta` y `ordenSecuencia`, y llega ordenada por localidad, ruta y secuencia.

### Medidores nuevos (`/api/medidores-nuevos`)
* `POST` (ADMIN u OPERARIO): el operario reporta un medidor hallado en campo `{ numeroSerie, tipoServicio, numeroCaja?, estadoPrecinto?, localidadId?, direccionReferencia?, observaciones? }`; `POST /:id/foto` adjunta la foto.
* `GET ?estado=PENDIENTE|APROBADO|RECHAZADO`, `GET /:id` (ADMIN).
* `POST /:id/aprobar`: `{ socioId, localidadId?, rutaId?, ordenSecuencia?, numeroCaja?, estadoPrecinto? }` crea el medidor oficial vinculado al socio.
* `POST /:id/rechazar`: `{ motivo }`. 409 si la solicitud ya fue revisada.

### Usuarios (`/api/usuarios`)
* `GET`, `GET /:id`, `POST { email, nombre, password, rol }`, `PATCH /:id` (nombre, email, rol, password, activo), `DELETE /:id` (baja lógica). Un administrador no puede darse de baja ni cambiarse el rol a sí mismo.
