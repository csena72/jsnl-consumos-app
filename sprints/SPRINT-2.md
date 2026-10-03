# Prompt Orquestador — Sprint 2: Autenticación JWT, Roles y Sincronización Móvil

Copia y pega este prompt directamente en la consola de tu agente de IA (Claude Code / Cursor / Windsurf) parado en la raíz de tu proyecto (`./`) en la rama `dev`:

```text
Actúa como un Senior Backend Engineer especializado en NestJS, TypeORM, JWT y PostgreSQL.

CONTEXTO DEL ENTORNO DE TRABAJO (RUTAS RELATIVAS):
- Repositorio actual (Web + API REST): `./` (rama `dev`)
- Repositorio hermano (App Móvil Flutter): `../consumos_app`
- Documentación técnica: `./docs/`
- Instrucciones de Agentes: `./AGENTS.md`

Documentos de referencia a leer antes de empezar:
- `./docs/00-ARQUITECTURA.md`
- `./docs/01-DATABASE.md`
- `./docs/02-API-SPEC.md`
- `./sprints/03-ROADMAP-SPRINTS.md`

OBJETIVO DEL SPRINT 2:
Implementar el módulo de Autenticación JWT con Control de Acceso basado en Roles (RBAC) y la API REST de Sincronización Móvil Offline-First con cálculo automático de desvío de consumo (> 40%).

TAREAS A EJECUTAR:

1. **Módulo de Autenticación (`./apps/api/src/modules/auth`)**:
   - Implementar `AuthModule`, `AuthController` y `AuthService`.
   - Endpoint `POST /api/auth/login`:
     - Payload: `{ "email": "operario@tacural.com", "password": "..." }`
     - Validación con `bcrypt`.
     - Generación de Token JWT firmado con `JWT_SECRET`.
     - Retorno: `{ "access_token": "...", "user": { "id", "email", "nombre", "rol" } }`.
   - Implementar `JwtStrategy` y `JwtAuthGuard`.
   - Implementar Decorador `@Roles('ADMIN', 'OPERARIO')` y `RolesGuard`.

2. **Módulo de Lecturas y Sincronización (`./apps/api/src/modules/lecturas`)**:
   - Endpoint `POST /api/lecturas/sincronizar-lote` (Protegido con JWT, rol `OPERARIO` o `ADMIN`):
     - Recepción del payload de sincronización offline enviado por la App Flutter.
     - Lógica de procesamiento en transacción TypeORM:
       1. Crear registro en tabla `lotes_sincronizacion`.
       2. Para cada lectura del array:
          - Obtener el promedio histórico del medidor/socio.
          - Calcular desvío porcentual: `desvioPorcentaje = ((valorLectura - promedioHistorico) / promedioHistorico) * 100`.
          - Evaluar desvío atípico: `esAtipico = Math.abs(desvioPorcentaje) > 40`.
          - Guardar entidad `Lectura` vinculada al lote y medidor.
       3. Retornar resumen del lote con IDs procesados y alertas de atípicos generadas.

3. **Subida de Evidencia Fotográfica (`POST /api/lecturas/:id/evidencia`)**:
   - Endpoint con Multer para recibir imágenes (JPG/PNG) asociadas a lecturas atípicas o observaciones.
   - Almacenar temporalmente en carpeta local `./uploads/` o ruta de assets y guardar la URL relativa en `fotografiaUrl`.

4. **Seed / Fixtures de Datos de Prueba**:
   - Crear un script o comando de Seed en NestJS para poblar la DB local con:
     - 1 Usuario Admin y 2 Operarios.
     - 5 Socios con sus respectivos Medidores y consumos promedio históricos.

Por favor, genera los controladores, servicios, DTOs con `class-validator`, estrategias de Passport y tests unitarios iniciales, asegurando TypeScript estricto y código modular.
```
