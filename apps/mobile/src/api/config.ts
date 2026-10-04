/**
 * URL base de la API. En Android emulador, `10.0.2.2` apunta al localhost de la PC.
 * En un dispositivo real o en Render, definir EXPO_PUBLIC_API_URL (ver .env.example).
 */
export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:3000/api';
