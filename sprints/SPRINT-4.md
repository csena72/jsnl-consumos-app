# SPRINT 4: Aplicación Móvil en React Native (Expo) (Offline-First, Cámara y Sincronización)

## 📋 Objetivo del Sprint
Desarrollar la aplicación móvil nativa en **React Native (Expo + TypeScript)** dentro del monorepo en `./apps/mobile`.
La aplicación funcionará con un enfoque **Offline-First**, permitiendo a los operarios tomar lecturas de medidores en zonas sin cobertura de red, guardar los datos en una base de datos **SQLite local**, capturar evidencia fotográfica y sincronizar los lotes diferidos contra la API REST NestJS (`POST /api/lecturas/sincronizar-lote`) cuando haya conectividad (WiFi/4G).

---

## 🏗️ Ubicación y Estructura en el Monorepo
La aplicación se creará desde cero en:
`./apps/mobile`

```text
jsnl-consumos-app/
├── apps/
│   ├── api/                    # Backend NestJS
│   ├── web/                    # Consola Web React
│   └── mobile/                 # App Móvil React Native (Expo)
│       ├── src/
│       │   ├── api/            # Cliente Axios + Interceptores JWT
│       │   ├── components/     # UI Components (Cards, Buttons, Inputs)
│       │   ├── database/       # expo-sqlite DB initialization & DAOs
│       │   ├── hooks/          # Custom hooks (useNetworkStatus, useLecturas)
│       │   ├── navigation/     # React Navigation / Expo Router
│       │   ├── screens/        # Screens (Login, Rutas, Lectura, Sync)
│       │   ├── services/       # SyncService & PhotoUploadService
│       │   ├── types/          # TypeScript interfaces
│       │   └── utils/          # Calculador de consumo atípico (>40%)
│       ├── App.tsx
│       └── package.json
```

---

## 🤖 Instrucciones para el Agente (Claude Code)

### Tarea 1: Inicialización del Proyecto React Native (Expo)
1. Crear el proyecto React Native con Expo TypeScript en `./apps/mobile`:
   ```bash
   npx create-expo-app@latest apps/mobile --template blank-typescript
   ```
2. Instalar dependencias clave:
   ```bash
   npx expo install expo-sqlite expo-secure-store expo-camera expo-image-picker @react-native-community/netinfo
   npm install @react-navigation/native @react-navigation/native-stack react-native-screens react-native-safe-area-context
   npm install axios
   ```

### Tarea 2: Base de Datos Local SQLite (`expo-sqlite`)
1. Inicializar la base de datos local `consumos_local.db` con las tablas:
   - `usuarios_session` (token, id, email, nombre, rol).
   - `socios_local` (id, numeroSocio, nombre, direccion, idMedidor).
   - `medidores_local` (id, numeroMedidor, lecturaAnterior, promedioHistorico).
   - `lecturas_offline` (id, idMedidor, lecturaActual, esAtipico, fotoPath, estadoSync: 'PENDIENTE' | 'SINCRONIZADO', fechaLectura, idLoteLocal).
   - `lotes_offline` (id, fechaCreacion, estado: 'PENDIENTE' | 'ENVIADO').

2. Implementar repositorios / DAOs para operaciones CRUD offline sin dependencia de red.

### Tarea 3: Módulo de Lectura, Validación Atípica (>40%) y Cámara
1. **Formulario de Carga de Lectura**:
   - Muestra datos del socio, número de medidor y `lecturaAnterior`.
   - Inserción de `lecturaActual`.
   - **Cálculo local en tiempo real**: Si `((lecturaActual - lecturaAnterior) - promedioHistorico) / promedioHistorico > 0.40`, se activa alerta de **Consumo Atípico (>40%)** y exige captura de foto.
2. **Integración con Cámara (`expo-camera` / `expo-image-picker`)**:
   - Captura la foto del medidor y la almacena localmente en el almacenamiento del dispositivo (`file://...`).

### Tarea 4: Motor de Sincronización Diferida (`SyncService`)
1. **Detección de Red con NetInfo**:
   - Hook/Listener de conectividad a Internet.
2. **Sincronización de Lote**:
   - Cuando se recupera la red (o por demanda con botón "Sincronizar Ahora"):
     - Construye el JSON del lote con lecturas pendientes.
     - Envía la petición `POST /api/lecturas/sincronizar-lote` con el header `Authorization: Bearer <token>`.
     - Por cada lectura con imagen local, envía `POST /api/lecturas/:id/evidencia` con `FormData` (multipart/form-data).
     - Actualiza el estado local en SQLite a `estadoSync = 'SINCRONIZADO'`.

### Tarea 5: Pantallas de la Aplicación
1. **LoginScreen**: Autenticación contra `POST /api/auth/login`, guarda JWT en `expo-secure-store` y descarga datos iniciales de medidores/socios asignados.
2. **RutaLecturasScreen**: Lista de medidores/socios pendientes de lectura en el día.
3. **CargarLecturaScreen**: Formulario con cálculo de consumo, alerta de desvío y cámara.
4. **SincronizacionScreen**: Estado de lotes pendientes, contador de lecturas no enviadas y botón manual de sincronización.

---

## ✅ Criterios de Aceptación
1. La app React Native vive en `./apps/mobile` integrándose perfectamente al monorepo.
2. La app inicia y funciona **100% Offline** una vez descargada la ruta inicial.
3. Las lecturas atípicas (>40% de desvío) se detectan localmente antes de enviar los datos.
4. Las fotos tomadas quedan asociadas al registro local en SQLite.
5. Al recuperar la conectividad, el lote de lecturas y sus imágenes se transfieren con éxito a la API NestJS en Render / Local.
