import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Banner } from '../components/Banner';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { colors } from '../components/theme';
import { useSync } from '../context/SyncContext';
import { listarRecientes } from '../database/lecturasRepository';
import type { LecturaOffline } from '../types';

function etiqueta(l: LecturaOffline): { texto: string; color: string } {
  if (l.errorSync) return { texto: `Rechazada: ${l.errorSync}`, color: colors.danger };
  if (l.estadoSync === 'PENDIENTE') return { texto: 'Pendiente de envío', color: colors.warning };
  if (l.fotoPath && !l.fotoSubida) return { texto: 'Enviada · foto pendiente', color: colors.warning };
  return { texto: 'Sincronizada', color: colors.success };
}

export function SincronizacionScreen() {
  const { red, contadores, sincronizando, ultimoResultado, ultimoError, sincronizar, refrescarContadores } = useSync();
  const [lecturas, setLecturas] = useState<LecturaOffline[]>([]);

  const cargar = useCallback(async () => {
    setLecturas(await listarRecientes());
    await refrescarContadores();
  }, [refrescarContadores]);

  useFocusEffect(
    useCallback(() => {
      void cargar();
    }, [cargar]),
  );

  // Se recarga la lista cada vez que termina una sincronización.
  const [ultimaVista, setUltimaVista] = useState(sincronizando);
  if (ultimaVista !== sincronizando) {
    setUltimaVista(sincronizando);
    if (!sincronizando) void cargar();
  }

  const hayPendientes = contadores.lecturasPendientes + contadores.fotosPendientes > 0;

  return (
    <View style={styles.container}>
      <Card>
        <View style={styles.contadores}>
          <Contador valor={contadores.lecturasPendientes} titulo="Lecturas sin enviar" />
          <Contador valor={contadores.fotosPendientes} titulo="Fotos sin subir" />
          <Contador valor={contadores.lotesPendientes} titulo="Lotes pendientes" />
        </View>
      </Card>

      {!red.conectado ? (
        <Banner tono="warning" titulo="Sin conexión" texto="Se sincronizará automáticamente al recuperar la red." />
      ) : null}
      {ultimoError ? <Banner tono="danger" titulo="Falló la sincronización" texto={ultimoError} /> : null}
      {ultimoResultado && !ultimoError ? (
        <Banner
          tono={ultimoResultado.fotosFallidas || ultimoResultado.lecturasRechazadas ? 'warning' : 'success'}
          titulo="Última sincronización"
          texto={`${ultimoResultado.lecturasEnviadas} lecturas enviadas, ${ultimoResultado.lecturasRechazadas} rechazadas, ${ultimoResultado.fotosSubidas} fotos subidas, ${ultimoResultado.fotosFallidas} fotos fallidas.`}
        />
      ) : null}

      <Button
        title="Sincronizar ahora"
        onPress={() => void sincronizar()}
        loading={sincronizando}
        disabled={!red.conectado || !hayPendientes}
      />

      <FlatList
        data={lecturas}
        keyExtractor={(l) => String(l.id)}
        contentContainerStyle={styles.lista}
        ListEmptyComponent={<Text style={styles.vacio}>Todavía no cargaste lecturas.</Text>}
        renderItem={({ item }) => {
          const e = etiqueta(item);
          return (
            <Card>
              <Text style={styles.titulo}>
                Lectura {item.lecturaActual} {item.esAtipico ? '· ⚠ atípica' : ''}
              </Text>
              <Text style={styles.sub}>
                Medidor {item.idMedidor.slice(0, 8)} · {new Date(item.fechaLectura).toLocaleString()}
              </Text>
              <Text style={[styles.estado, { color: e.color }]}>{e.texto}</Text>
            </Card>
          );
        }}
      />
    </View>
  );
}

function Contador({ valor, titulo }: { valor: number; titulo: string }) {
  return (
    <View style={styles.contador}>
      <Text style={styles.valor}>{valor}</Text>
      <Text style={styles.contadorTitulo}>{titulo}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: 16, gap: 12 },
  contadores: { flexDirection: 'row', justifyContent: 'space-around' },
  contador: { alignItems: 'center', flex: 1 },
  valor: { fontSize: 28, fontWeight: '800', color: colors.primaryDark },
  contadorTitulo: { fontSize: 12, color: colors.muted, textAlign: 'center' },
  lista: { gap: 8, paddingBottom: 24 },
  vacio: { textAlign: 'center', color: colors.muted, marginTop: 24 },
  titulo: { fontSize: 16, fontWeight: '700', color: colors.text },
  sub: { fontSize: 13, color: colors.muted, marginTop: 2 },
  estado: { fontSize: 13, fontWeight: '600', marginTop: 4 },
});
