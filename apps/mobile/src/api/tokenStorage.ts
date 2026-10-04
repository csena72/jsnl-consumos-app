import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/**
 * En iOS/Android el token va a Keychain/Keystore. En web `expo-secure-store` no existe,
 * por lo que se usa localStorage (solo para desarrollo/pruebas en navegador).
 */
const esWeb = Platform.OS === 'web';

export const guardarItem = (clave: string, valor: string): Promise<void> => {
  if (esWeb) {
    localStorage.setItem(clave, valor);
    return Promise.resolve();
  }
  return SecureStore.setItemAsync(clave, valor);
};

export const leerItem = (clave: string): Promise<string | null> =>
  esWeb ? Promise.resolve(localStorage.getItem(clave)) : SecureStore.getItemAsync(clave);

export const borrarItem = (clave: string): Promise<void> => {
  if (esWeb) {
    localStorage.removeItem(clave);
    return Promise.resolve();
  }
  return SecureStore.deleteItemAsync(clave);
};
