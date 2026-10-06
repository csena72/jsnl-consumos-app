import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Banner } from '../components/Banner';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { colors } from '../components/theme';
import { crearLectura } from '../database/lecturasRepository';
import { obtenerItemRuta } from '../database/rutaRepository';
import type { RootStackParamList } from '../navigation/types';
import { guardarFotoLocal } from '../services/PhotoService';
import { ETIQUETA_SERVICIO, type ItemRuta } from '../types';
import { calcularConsumo, calcularDesvio, esConsumoAtipico, parsearLectura, periodoActual } from '../utils/consumo';

type Props = NativeStackScreenProps<RootStackParamList, 'CargarLectura'>;

export function CargarLecturaScreen({ route, navigation }: Props) {
  const { idMedidor } = route.params;
  const periodo = periodoActual();
  const [item, setItem] = useState<ItemRuta | null>(null);
  const [texto, setTexto] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [fotoUri, setFotoUri] = useState<string | null>(null);
  const [camaraAbierta, setCamaraAbierta] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const camara = useRef<CameraView>(null);
  const [permiso, pedirPermiso] = useCameraPermissions();

  useEffect(() => {
    void obtenerItemRuta(idMedidor, periodo).then(setItem);
  }, [idMedidor, periodo]);

  const lectura = parsearLectura(texto);
  const anterior = item?.lecturaAnterior ?? null;
  const menorQueAnterior = lectura !== null && anterior !== null && lectura < anterior;
  const lecturaValida = lectura !== null && !menorQueAnterior;

  const analisis = useMemo(() => {
    if (!item || !lecturaValida || lectura === null) return null;
    return {
      consumo: calcularConsumo(lectura, item.lecturaAnterior),
      desvio: calcularDesvio(lectura, item.lecturaAnterior, item.promedioHistorico),
      atipico: esConsumoAtipico(lectura, item.lecturaAnterior, item.promedioHistorico),
    };
  }, [item, lectura, lecturaValida]);

  const errorCampo =
    texto.length > 0 && lectura === null
      ? 'Ingresá un número válido (hasta 2 decimales).'
      : menorQueAnterior
        ? `No puede ser menor a la lectura anterior (${anterior}).`
        : null;

  const requiereFoto = analisis?.atipico === true;

  const abrirCamara = async () => {
    if (!permiso?.granted && !(await pedirPermiso()).granted) {
      Alert.alert('Permiso denegado', 'Habilitá la cámara en los ajustes o elegí una foto de la galería.');
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

  const elegirDeGaleria = async () => {
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.6 });
    if (!r.canceled && r.assets[0]) setFotoUri(await guardarFotoLocal(r.assets[0].uri));
  };

  const guardar = async () => {
    if (!item || lectura === null || !lecturaValida || !analisis) return;
    if (analisis.atipico && !fotoUri) {
      Alert.alert('Foto obligatoria', 'El consumo es atípico: tomá una foto del medidor para continuar.');
      return;
    }
    setGuardando(true);
    try {
      await crearLectura({
        idMedidor: item.idMedidor,
        periodo,
        lecturaActual: lectura,
        esAtipico: analisis.atipico,
        fotoPath: fotoUri,
        observaciones: observaciones.trim() || null,
      });
      navigation.goBack();
    } catch {
      Alert.alert('No se pudo guardar', 'Ya existe una lectura de este medidor para el periodo.');
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

  if (!item) return <View style={styles.flex} />;

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Card>
          <Text style={styles.socio}>
            #{item.numeroSocio} · {item.nombreSocio}
          </Text>
          <Text style={styles.dato}>{item.direccion}</Text>
          <Text style={styles.dato}>
            {ETIQUETA_SERVICIO[item.tipoServicio]} · Caja {item.numeroCaja ?? 'sin número'} · Medidor {item.numeroMedidor}
          </Text>
          {item.ordenSecuencia !== null ? <Text style={styles.dato}>Orden de recorrido: {item.ordenSecuencia}</Text> : null}
          <Text style={styles.dato}>Lectura anterior: {anterior ?? 'sin dato'}</Text>
          <Text style={styles.dato}>
            Consumo promedio: {item.promedioHistorico !== null ? item.promedioHistorico : 'sin historial'}
          </Text>
        </Card>

        <Input
          label="Lectura actual"
          value={texto}
          onChangeText={setTexto}
          keyboardType="decimal-pad"
          placeholder="Ej: 1250.5"
          error={errorCampo}
          style={styles.inputGrande}
        />

        {analisis ? (
          analisis.atipico ? (
            <Banner
              tono="danger"
              titulo="⚠ Consumo atípico (>40%)"
              texto={`Consumo ${analisis.consumo.toFixed(2)} — ${((analisis.desvio ?? 0) * 100).toFixed(1)}% sobre el promedio. Es obligatorio adjuntar una foto del medidor.`}
            />
          ) : (
            <Banner
              tono="success"
              titulo="Consumo normal"
              texto={
                analisis.desvio === null
                  ? `Consumo ${analisis.consumo.toFixed(2)} (sin historial para comparar).`
                  : `Consumo ${analisis.consumo.toFixed(2)} — desvío ${(analisis.desvio * 100).toFixed(1)}%.`
              }
            />
          )
        ) : null}

        <View style={styles.foto}>
          <Text style={styles.label}>Foto del medidor{requiereFoto ? ' (obligatoria)' : ' (opcional)'}</Text>
          {fotoUri ? <Image source={{ uri: fotoUri }} style={styles.preview} /> : null}
          <Button title={fotoUri ? 'Volver a tomar foto' : 'Tomar foto'} variant="secondary" onPress={abrirCamara} />
          <Button title="Elegir de la galería" variant="secondary" onPress={elegirDeGaleria} />
        </View>

        <Input label="Observaciones" value={observaciones} onChangeText={setObservaciones} multiline placeholder="Opcional" />

        <Button
          title="Guardar lectura"
          onPress={guardar}
          loading={guardando}
          disabled={!lecturaValida || (requiereFoto && !fotoUri)}
        />
        <Text style={styles.nota}>La lectura se guarda en el dispositivo y se envía cuando haya conexión.</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  container: { padding: 16, gap: 16 },
  socio: { fontSize: 18, fontWeight: '700', color: colors.text },
  dato: { fontSize: 14, color: colors.muted, marginTop: 2 },
  inputGrande: { fontSize: 24, fontWeight: '700' },
  label: { fontSize: 14, fontWeight: '600', color: colors.text },
  foto: { gap: 10 },
  preview: { width: '100%', aspectRatio: 4 / 3, borderRadius: 10, backgroundColor: colors.border },
  nota: { fontSize: 12, color: colors.muted, textAlign: 'center' },
  camaraContenedor: { flex: 1, backgroundColor: '#000' },
  camara: { flex: 1 },
  camaraAcciones: { padding: 16, gap: 10, backgroundColor: colors.bg },
});
