# App móvil — Consumos App (React Native + Expo)

Aplicación para operarios: toma de lecturas de medidores **sin conexión** (SQLite local), captura de foto de evidencia y sincronización diferida con la API NestJS.

## Funcionamiento

1. **Login** (requiere red): `POST /api/auth/login`. El JWT se guarda en `expo-secure-store` (en web, `localStorage`, solo para pruebas) y se descarga la ruta con `GET /api/lecturas/ruta`.
2. **Ruta**: lista de medidores/socios sin lectura en el periodo actual (AAAAMM). Funciona 100% offline.
3. **Cargar lectura**: muestra socio, medidor y lectura anterior. Calcula en vivo el consumo (`actual − anterior`) y, si supera en más de 40% el promedio histórico, muestra la alerta de **consumo atípico** y exige foto. La lectura no puede ser menor a la anterior.
4. **Sincronización**: automática al recuperar la red, o manual con "Sincronizar ahora". Envía el lote (`POST /api/lecturas/sincronizar-lote`, hasta 500 lecturas por lote) y luego cada foto (`POST /api/lecturas/:id/evidencia`, multipart, campo `foto`). Si una foto falla queda pendiente y se reintenta en la siguiente sincronización.
5. **Cerrar sesión**: avisa si hay lecturas o fotos sin enviar; al salir se borran los datos locales.

## Estructura

```text
apps/mobile/
├── App.tsx
├── metro.config.js         # soporte de SQLite en web (wasm + headers COOP/COEP)
└── src/
    ├── api/                # cliente Axios + JWT, endpoints, almacenamiento del token
    ├── components/         # Button, Card, Input, Banner, NetworkBadge
    ├── context/            # AuthContext (sesión/ruta), SyncContext (red + sincronización)
    ├── database/           # expo-sqlite: esquema y repositorios (sesión, ruta, lecturas, lotes)
    ├── hooks/              # useNetworkStatus
    ├── navigation/         # React Navigation (stack)
    ├── screens/            # Login, RutaLecturas, CargarLectura, Sincronizacion
    ├── services/           # SyncService, PhotoService
    ├── types/
    └── utils/              # cálculo de consumo atípico (+ tests)
```

Base local `consumos_local.db`: `usuarios_session`, `socios_local`, `medidores_local`, `lecturas_offline` (`estadoSync`: `PENDIENTE` | `SINCRONIZADO`) y `lotes_offline` (`PENDIENTE` | `ENVIADO`).

## Cómo conectarse (paso a paso)

### 1. Levantar la API

Desde la raíz del repositorio (ver el README principal):

```bash
docker compose up -d
npm install && npm run migration:run && npm run seed
npm run start:dev          # http://localhost:3000/api
```

Usuarios de prueba (seed): `operario1@tacural.com` / `operario2@tacural.com`. La contraseña es el valor de `SEED_PASSWORD` de tu `.env` raíz.

### 2. Configurar la URL de la API en la app

```bash
cd apps/mobile
cp .env.example .env
npm install
```

Editá `EXPO_PUBLIC_API_URL` (debe incluir `/api`) según dónde corras la app:

| Dónde corre la app | `EXPO_PUBLIC_API_URL` |
|---|---|
| **Web** (navegador de la misma PC) | `http://localhost:3000/api` |
| **Emulador Android** | `http://10.0.2.2:3000/api` |
| **Simulador iOS** (macOS) | `http://localhost:3000/api` |
| **Celular físico, misma red WiFi** | `http://<IP-de-tu-PC>:3000/api` |
| **Celular físico, redes distintas / WSL2** | URL pública de un túnel hacia la API (ver abajo) |

Las variables `EXPO_PUBLIC_*` se leen al iniciar Metro: después de cambiar `.env` reiniciá con `npm start -- --clear`.

### 3. Iniciar la app

```bash
npm start            # menú de Expo
```

* **Web:** presioná `w`. Sirve para probar la interfaz y el flujo. La base y el token quedan en el almacenamiento del navegador.
* **Android emulador:** `a`. **iOS simulador (macOS):** `i`.
* **Celular físico (Expo Go):** escaneá el QR. Si el celular no alcanza a la PC (WSL2, otra red, firewall), usá `npm start -- --tunnel` para exponer Metro.

> `expo-secure-store` y la cámara requieren un SDK compatible con tu app Expo Go. Si Expo Go indica que el proyecto usa un SDK más nuevo, generá un development build: `npx expo run:android`.

### 4. Exponer la API a un celular físico (túnel)

`--tunnel` solo publica Metro, **no la API**. Para que el celular llegue a la API sin estar en la misma red, usá un túnel hacia el puerto 3000, por ejemplo con Cloudflare:

```bash
cloudflared tunnel --url http://localhost:3000
# → https://xxxx.trycloudflare.com
```

Y en `.env`: `EXPO_PUBLIC_API_URL=https://xxxx.trycloudflare.com/api`, luego `npm start -- --clear`.
Evitá `localtunnel` (`loca.lt`): intercala una página de aviso que rompe las llamadas de la app. El túnel debe seguir corriendo mientras uses la app.

Con **WiFi compartida** y WSL2, además hay que reenviar el puerto desde Windows (PowerShell como administrador):

```powershell
netsh interface portproxy add v4tov4 listenport=3000 listenaddress=0.0.0.0 connectport=3000 connectaddress=<IP-de-WSL>
```

### 5. Probar el flujo offline

1. Iniciá sesión con red (descarga la ruta).
2. Activá modo avión y cargá lecturas. Probá una que supere 40% el promedio: pide foto.
3. Desactivá el modo avión: se sincroniza solo, o usá **Sincronización → Sincronizar ahora**.
4. En la consola web (`/atipicas`) aparecen las lecturas atípicas con su foto.

## Comandos

| Comando | Descripción |
|---|---|
| `npm start` | Servidor de desarrollo Expo |
| `npm run android` / `npm run ios` / `npm run web` | Inicia directo en la plataforma |
| `npm run typecheck` | Verificación de tipos (TypeScript estricto) |
| `npm test` | Tests de la lógica de consumo atípico |

## Problemas frecuentes

| Síntoma | Causa y solución |
|---|---|
| `No se pudo conectar con el servidor` | URL de API incorrecta, API apagada o túnel caído. Probá la URL en el navegador del dispositivo y reiniciá Metro con `--clear` tras editar `.env`. |
| `getValueWithKeyAsync is not a function` | Versión previa corriendo en web sin el fallback, o Expo Go incompatible. Actualizá el código y reiniciá con `--clear`. |
| Expo Go: "proyecto con SDK más nuevo" | Expo Go del store no soporta este SDK. Usá `npx expo run:android` (development build) o la versión web. |
| Error de CORS en web | La API debe estar corriendo con `enableCors()` (activo por defecto en `main.ts`). |
| Las lecturas no se reenvían | Revisá **Sincronización**: las rechazadas por la API muestran el motivo (medidor inactivo/inexistente). |

## Limitaciones conocidas

* El criterio de "atípico" local (consumo vs. promedio de consumos, solo al alza) difiere del servidor (valor de lectura vs. promedio de lecturas, en valor absoluto). La API es la que decide en el dashboard.
* La API no es idempotente: si un lote llega pero se pierde la respuesta, el reintento puede duplicar lecturas.
* Si el token vence, las lecturas sin enviar se conservan; otro usuario que inicie sesión en el mismo dispositivo las enviaría con su cuenta.

## Generar el APK de Android (EAS Build)

La URL de la API se define en `eas.json` (el `.env` no se sube a EAS). Cuenta gratuita en [expo.dev](https://expo.dev).

```bash
npm install -g eas-cli
eas login
cd apps/mobile
eas build -p android --profile preview   # APK instalable directo (~15-20 min)
```

Al terminar, EAS entrega un link/QR: abrilo en el celular, descargá el APK e instalalo (permitir instalar de orígenes desconocidos). El perfil `production` genera un `.aab` para Google Play. Para cambiar de API, editá `EXPO_PUBLIC_API_URL` en `eas.json`.
