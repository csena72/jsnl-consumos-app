import { StyleSheet, Text, View } from 'react-native';
import { colors } from './theme';

type Tono = 'danger' | 'warning' | 'success' | 'info';

const PALETA: Record<Tono, { bg: string; fg: string }> = {
  danger: { bg: colors.dangerBg, fg: colors.danger },
  warning: { bg: colors.warningBg, fg: colors.warning },
  success: { bg: colors.successBg, fg: colors.success },
  info: { bg: '#e8f1fb', fg: colors.primaryDark },
};

export function Banner({ tono, titulo, texto }: { tono: Tono; titulo: string; texto?: string }) {
  const { bg, fg } = PALETA[tono];
  return (
    <View style={[styles.box, { backgroundColor: bg, borderColor: fg }]}>
      <Text style={[styles.titulo, { color: fg }]}>{titulo}</Text>
      {texto ? <Text style={[styles.texto, { color: fg }]}>{texto}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { borderWidth: 1, borderRadius: 10, padding: 12, gap: 4 },
  titulo: { fontSize: 15, fontWeight: '700' },
  texto: { fontSize: 14 },
});
