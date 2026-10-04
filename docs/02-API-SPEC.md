# 02. Especificación de la API REST (NestJS)

## 1. Autenticación (`/api/auth`)
* `POST /api/auth/login`
  * **Body:** `{ "email": "operario@tacural.com", "password": "..." }`
  * **Response:** `{ "access_token": "JWT_TOKEN...", "user": { ... } }`

---

## 2. Sincronización Móvil (`/api/lecturas`)
* `GET /api/lecturas/ruta` (ADMIN u OPERARIO): descarga los medidores activos para trabajar offline.
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
* `GET /api/lecturas/exportar?periodo=AAAAMM`: CSV (UTF-8 con BOM) para facturación. Excluye rechazadas y atípicas sin aprobar.
* `POST /api/lecturas/:id/evidencia` (ADMIN u OPERARIO): `multipart/form-data`, campo `foto` (JPG/PNG, máx. 5 MB). Las fotos se sirven en `/uploads/<archivo>`.

### Reclamos (`/api/reclamos`)
* `GET /api/reclamos?estado=PENDIENTE|EN_REVISION|RESUELTO`: más recientes primero, con socio, lectura y `fotoEvidenciaUrl`.
* `PATCH /api/reclamos/:id/estado`: body `{ "estado": "EN_REVISION" }`.
