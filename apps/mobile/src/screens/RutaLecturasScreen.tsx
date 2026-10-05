import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { mensajeDeError } from '../api/client';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Chips } from '../components/Chips';
import { colors } from '../components/theme';
import { useAuth } from '../context/AuthContext';
import { useSync } from '../context/SyncContext';
import { listarLocalidades, listarRuta } from '../database/rutaRepository';
import type { RootStackParamList } from '../navigation/types';
import { ETIQUETA_SERVICIO, type FiltroRuta, type ItemRuta, type LocalidadApi, type TipoServicio } from '../types';
import { periodoActual } from '../utils/consumo';

type Props = NativeStackScreenProps<RootStackParamList, 'RutaLecturas'>;

export function RutaLecturasScreen({ navigation }: Props) {
  const { usuario, actualizarRuta, cerrarSesion } = useAuth();
  const { red, contadores, refrescarContadores } = useSync();
  const [items, setItems] = useState<ItemRuta[]>([]);
  const [soloPendientes, setSoloPendientes] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [localidades, setLocalidades] = useState<LocalidadApi[]>([]);
  const [localidadId, setLocalidadId] = useState<string | null>(null);
  const [tipoServicio, setTipoServicio] = useState<TipoServicio | null>(null);

  const cargar = useCallback(async () => {
    const filtro: FiltroRuta = { localidadId, tipoServicio };
    const [ruta, locs] = await Promise.all([listarRuta(periodoActual(), filtro), listarLocalidades()]);
    setItems(ruta);
    setLocalidades(locs);
    await refrescarContadores();
  }, [refrescarContadores, localidadId, tipoServicio]);

  useFocusEffect(
    useCallback(() => {
      void cargar();
    }, [cargar]),
  );

  const descargar = async () => {
    setActualizando(true);
    try {
      const total = await actualizarRuta();
      await cargar();
      Alert.alert('Ruta actualizada', `${total} medidores descargados.`);
    } catch (e) {
      Alert.alert('No se pudo actualizar', mensajeDeError(e));
    } finally {
      setActualizando(false);
    }
  };

  const salir = async () => {
    if (!(await cerrarSesion())) {
      Alert.alert(
        'Hay datos sin enviar',
        'Sincronizá las lecturas y fotos pendientes antes de cerrar sesión. Si salís ahora se perderán.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Salir igual', style: 'destructive', onPress: () => void cerrarSesion(true) },
        ],
      );
    }
  };

  const leidos = items.filter((i) => i.leido).length;
  const visibles = soloPendientes ? items.filter((i) => !i.leido) : items;
  const pendientesDeEnvio = contadores.lecturasPendientes + contadores.fotosPendientes + contadores.nuevosPendientes;

  return (
    <View style={styles.container}>
      <View style={styles.resumen}>
        <Text style={styles.saludo}>Hola, {usuario?.nombre}</Text>
        <Text style={styles.progreso}>
          {leidos} de {items.length} medidores leídos este periodo
        </Text>
      </View>

      <View style={styles.acciones}>
        <View style={styles.accion}>
          <Button
            title={pendientesDeEnvio > 0 ? `Sincronización (${pendientesDeEnvio})` : 'Sincronización'}
            variant="secondary"
            onPress={() => navigation.navigate('Sincronizacion')}
          />
        </View>
        <View style={styles.accion}>
          <Button title="Actualizar ruta" variant="secondary" onPress={descargar} loading={actualizando} disabled={!red.conectado} />
        </View>
      </View>

      <View style={styles.selectores}>
        <Text style={styles.etiqueta}>Pueblo / Localidad</Text>
        <Chips
          opciones={[{ valor: null, etiqueta: 'Todos' }, ...localidades.map((l) => ({ valor: l.id, etiqueta: l.nombre }))]}
          seleccionado={localidadId}
          onChange={setLocalidadId}
        />
        <Text style={styles.etiqueta}>Servicio</Text>
        <Chips<TipoServicio | null>
          opciones={[
            { valor: null, etiqueta: 'Todos' },
            { valor: 'ENERGIA', etiqueta: ETIQUETA_SERVICIO.ENERGIA },
            { valor: 'AGUA', etiqueta: ETIQUETA_SERVICIO.AGUA },
          ]}
          seleccionado={tipoServicio}
          onChange={setTipoServicio}
        />
        <Button title="+ Alta de medidor nuevo" variant="secondary" onPress={() => navigation.navigate('AltaMedidorNuevo')} />
      </View>

      <View style={styles.filtro}>
        <Pressable onPress={() => setSoloPendientes(true)}>
          <Text style={[styles.tab, soloPendientes && styles.tabActiva]}>Pendientes</Text>
        </Pressable>
        <Pressable onPress={() => setSoloPendientes(false)}>
          <Text style={[styles.tab, !soloPendientes && styles.tabActiva]}>Todos</Text>
        </Pressable>
      </View>

      <FlatList
        data={visibles}
        keyExtractor={(i) => i.idMedidor}
        contentContainerStyle={styles.lista}
        ListEmptyComponent={
          <Text style={styles.vacio}>
            {items.length === 0 ? 'No hay ruta descargada. Tocá "Actualizar ruta".' : 'No quedan medidores pendientes. ¡Buen trabajo!'}
          </Text>
        }
        renderItem={({ item }) => (
          <Pressable disabled={item.leido} onPress={() => navigation.navigate('CargarLectura', { idMedidor: item.idMedidor })}>
            <Card style={item.leido ? styles.cardLeida : undefined}>
              <View style={styles.fila}>
                {item.ordenSecuencia !== null ? <Text style={styles.orden}>{item.ordenSecuencia}</Text> : null}
                <Text style={styles.socio}>
                  #{item.numeroSocio} · {item.nombreSocio}
                </Text>
                {item.leido ? <Text style={styles.ok}>✓ Leído</Text> : null}
              </View>
              <Text style={styles.dato}>{item.direccion}</Text>
              <Text style={styles.dato}>
                {ETIQUETA_SERVICIO[item.tipoServicio]} · Caja {item.numeroCaja ?? 's/n'} · Medidor {item.numeroMedidor} · Anterior: {item.lecturaAnterior ?? 'sin dato'}
              </Text>
            </Card>
          </Pressable>
        )}
      />

      <View style={styles.pie}>
        <Button title="Cerrar sesión" variant="secondary" onPress={salir} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  resumen: { padding: 16, gap: 2 },
  saludo: { fontSize: 18, fontWeight: '700', color: colors.text },
  progreso: { fontSize: 14, color: colors.muted },
  acciones: { flexDirection: 'row', gap: 8, paddingHorizontal: 16 },
  accion: { flex: 1 },
  selectores: { paddingHorizontal: 16, paddingTop: 12, gap: 8 },
  etiqueta: { fontSize: 12, fontWeight: '600', color: colors.muted },
  orden: { fontSize: 16, fontWeight: '800', color: colors.primary, minWidth: 28 },
  filtro: { flexDirection: 'row', gap: 20, paddingHorizontal: 16, paddingTop: 16 },
  tab: { fontSize: 15, color: colors.muted, paddingBottom: 4 },
  tabActiva: { color: colors.primary, fontWeight: '700', borderBottomWidth: 2, borderBottomColor: colors.primary },
  lista: { padding: 16, gap: 10 },
  vacio: { textAlign: 'center', color: colors.muted, marginTop: 32 },
  cardLeida: { opacity: 0.6 },
  fila: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  socio: { flex: 1, fontSize: 16, fontWeight: '700', color: colors.text },
  ok: { color: colors.success, fontWeight: '700' },
  dato: { fontSize: 14, color: colors.muted, marginTop: 2 },
  pie: { padding: 16 },
});
