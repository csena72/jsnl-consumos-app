import { Directory, File, Paths } from 'expo-file-system';
import { Platform } from 'react-native';

/** Copia la foto temporal de la cámara a un directorio persistente de la app. */
export async function guardarFotoLocal(uriTemporal: string): Promise<string> {
  // En web no hay sistema de archivos: la URI (blob/data) se usa tal cual.
  if (Platform.OS === 'web') return uriTemporal;
  const directorio = new Directory(Paths.document, 'fotos');
  if (!directorio.exists) {
    directorio.create({ intermediates: true, idempotent: true });
  }
  const destino = new File(directorio, `medidor-${Date.now()}.jpg`);
  await new File(uriTemporal).copy(destino);
  return destino.uri;
}
