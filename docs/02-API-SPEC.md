# 02. Especificación de la API REST (NestJS)

## 1. Autenticación (`/api/auth`)
* `POST /api/auth/login`
  * **Body:** `{ "email": "operario@tacural.com", "password": "..." }`
  * **Response:** `{ "access_token": "JWT_TOKEN...", "user": { ... } }`

---

## 2. Sincronización Móvil (`/api/lecturas`)
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

## 3. Consola Web Administrativa (`/api/admin`)
* `GET /api/admin/dashboard/resumen`: Totales procesados y cantidad de lecturas atípicas.
* `GET /api/admin/lecturas/atipicas`: Listado filtrado de lecturas con desvío > 40%.
* `PATCH /api/admin/lecturas/:id/aprobar`: Validación manual de lectura con desvío.
