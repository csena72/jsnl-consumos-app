import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useEffect, useRef, useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '../components/Button';
import { Chips } from '../components/Chips';
import { Input } from '../components/Input';
import { colors } from '../components/theme';
import { useSync } from '../context/SyncContext';
import { crearMedidorNuevo } from '../database/medidoresNuevosRepository';
import { listarLocalidades } from '../database/rutaRepository';
import type { RootStackParamList } from '../navigation/types';
import { guardarFotoLocal } from '../services/PhotoService';
import { ETIQUETA_SERVICIO, type LocalidadApi, type TipoServicio } from '../types';
import { parsearLectura } from '../utils/consumo';

type Props = NativeStackScreenProps<RootStackParamList, 'AltaMedidorNuevo'>;

/** Alta offline de un medidor instalado que no figura en la ruta. Se guarda en SQLite y se envía al sincronizar. */
export function AltaMedidorNuevoScreen({ navigation }: Props) {
  const { refrescarContadores } = useSync();
  const [localidades, setLocalidades] = useState<LocalidadApi[]>([]);
  const [numeroSerie, setNumeroSerie] = useState('');
  const [tipoServicio, setTipoServicio] = useState<TipoServicio>('ENERGIA');
  const [localidadId, setLocalidadId] = useState<string | null>(null);
  const [numeroCaja, setNumeroCaja] = useState('');
  const [direccion, setDireccion] = useState('');
  const [numeroSocio, setNumeroSocio] = useState('');
  const [lecturaTexto, setLecturaTexto] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [fotoUri, setFotoUri] = useState<string | null>(null);
  const [camaraAbierta, setCamaraAbierta] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const camara = useRef<CameraView>(null);
  const [permiso, pedirPermiso] = useCameraPermissions();

  useEffect(() => {
    void listarLocalidades().then(setLocalidades);
  }, []);

  const lecturaInicial = parsearLectura(lecturaTexto);
  const errorLectura = lecturaTexto.length > 0 && lecturaInicial === null ? 'Ingresá un número válido.' : null;
  const valido = numeroSerie.trim().length > 0 && fotoUri !== null && !errorLectura;

  const abrirCamara = async () => {
    if (!permiso?.granted && !(await pedirPermiso()).granted) {
      Alert.alert('Permiso denegado', 'La foto del medidor es obligatoria: habilitá la cámara en los ajustes.');
      return;
    }
    setCamaraAbierta(true);
  };

  const tomarFoto = async () => {
    try {
      const foto = await camara.current?.takePictureAsync({ quality: 0.6 });
      if (foto) setFotoUri(await guardarFotoLocal(foto.uri));
    } catch {
      Alert.alert('Error', 'No se pudo tomar la foto. Probá de nuevo.');
    } finally {
      setCamaraAbierta(false);
    }
  };

  const guardar = async () => {
    if (!valido || !fotoUri) return;
    setGuardando(true);
    try {
      await crearMedidorNuevo({
        numeroSerie: numeroSerie.trim(),
        // El N° de socio informado viaja como referencia; el administrador lo vincula al aprobar.
        socioId: numeroSocio.trim() || null,
        tipoServicio,
        localidadId,
        numeroCaja: numeroCaja.trim() || null,
        direccionReferencia: direccion.trim() || null,
        lecturaInicial,
        observaciones: observaciones.trim() || null,
        fotoPathLocal: fotoUri,
      });
      await refrescarContadores();
      Alert.alert('Medidor guardado', 'Se enviará al administrador cuando haya conexión.');
      navigation.goBack();
    } catch {
      Alert.alert('No se pudo guardar', 'Ocurrió un error al guardar en el dispositivo. Probá de nuevo.');
      setGuardando(false);
    }
  };

  if (camaraAbierta) {
    return (
      <View style={styles.camaraContenedor}>
        <CameraView ref={camara} style={styles.camara} facing="back" />
        <View style={styles.camaraAcciones}>
          <Button title="Tomar foto" onPress={tomarFoto} />
          <Button title="Cancelar" variant="secondary" onPress={() => setCamaraAbierta(false)} />
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Input label="N° de serie del medidor *" value={numeroSerie} onChangeText={setNumeroSerie} autoCapitalize="characters" />

        <View style={styles.grupo}>
          <Text style={styles.label}>Servicio *</Text>
          <Chips<TipoServicio>
            opciones={[
              { valor: 'ENERGIA', etiqueta: ETIQUETA_SERVICIO.ENERGIA },
              { valor: 'AGUA', etiqueta: ETIQUETA_SERVICIO.AGUA },
            ]}
            seleccionado={tipoServicio}
            onChange={setTipoServicio}
          />
        </View>

        <View style={styles.grupo}>
          <Text style={styles.label}>Pueblo / Localidad</Text>
          <Chips<string | null>
            opciones={[{ valor: null, etiqueta: 'Sin indicar' }, ...localidades.map((l) => ({ valor: l.id, etiqueta: l.nombre }))]}
            seleccionado={localidadId}
            onChange={setLocalidadId}
          />
        </View>

        <Input label="N° de caja" value={numeroCaja} onChangeText={setNumeroCaja} />
        <Input label="Dirección / referencia" value={direccion} onChangeText={setDireccion} placeholder="Ej: casa esquina, portón verde" />
        <Input label="N° de socio (si se conoce)" value={numeroSocio} onChangeText={setNumeroSocio} keyboardType="number-pad" />
        <Input
          label="Lectura inicial"
          value={lecturaTexto}
          onChangeText={setLecturaTexto}
          keyboardType="decimal-pad"
          error={errorLectura}
        />
        <Input label="Observaciones" value={observaciones} onChangeText={setObservaciones} multiline />

        <View style={styles.grupo}>
          <Text style={styles.label}>Foto del medidor * (obligatoria)</Text>
          {fotoUri ? <Image source={{ uri: fotoUri }} style={styles.preview} /> : null}
          <Button title={fotoUri ? 'Volver a tomar foto' : 'Tomar foto'} variant="secondary" onPress={abrirCamara} />
        </View>

        <Button title="Guardar medidor" onPress={guardar} loading={guardando} disabled={!valido} />
        <Text style={styles.nota}>Se guarda en el dispositivo y se envía al administrador para su aprobación cuando haya conexión.</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  container: { padding: 16, gap: 16 },
  grupo: { gap: 8 },
  label: { fontSize: 14, fontWeight: '600', color: colors.text },
  preview: { width: '100%', aspectRatio: 4 / 3, borderRadius: 10, backgroundColor: colors.border },
  nota: { fontSize: 12, color: colors.muted, textAlign: 'center' },
  camaraContenedor: { flex: 1, backgroundColor: '#000' },
  camara: { flex: 1 },
  camaraAcciones: { padding: 16, gap: 10, backgroundColor: colors.bg },
});
