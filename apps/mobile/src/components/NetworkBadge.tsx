import { StyleSheet, Text, View } from 'react-native';
import { useSync } from '../context/SyncContext';
import { colors } from './theme';

export function NetworkBadge() {
  const { red, contadores } = useSync();
  const pendientes = contadores.lecturasPendientes + contadores.fotosPendientes;
  return (
    <View style={[styles.badge, red.conectado ? styles.online : styles.offline]}>
      <Text style={[styles.text, { color: red.conectado ? colors.success : colors.warning }]}>
        {red.conectado ? 'En línea' : 'Sin conexión'}
        {pendientes > 0 ? ` · ${pendientes} pend.` : ''}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  online: { backgroundColor: colors.successBg },
  offline: { backgroundColor: colors.warningBg },
  text: { fontSize: 12, fontWeight: '600' },
});
