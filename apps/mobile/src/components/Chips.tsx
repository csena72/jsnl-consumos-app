import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from './theme';

interface Opcion<T extends string | null> {
  valor: T;
  etiqueta: string;
}

interface Props<T extends string | null> {
  opciones: Opcion<T>[];
  seleccionado: T;
  onChange: (valor: T) => void;
}

/** Selector de una sola opción en formato de botones horizontales (envuelve en varias filas). */
export function Chips<T extends string | null>({ opciones, seleccionado, onChange }: Props<T>) {
  return (
    <View style={styles.fila}>
      {opciones.map((o) => {
        const activo = o.valor === seleccionado;
        return (
          <Pressable
            key={String(o.valor)}
            accessibilityRole="button"
            accessibilityState={{ selected: activo }}
            onPress={() => onChange(o.valor)}
            style={[styles.chip, activo && styles.chipActivo]}
          >
            <Text style={[styles.texto, activo && styles.textoActivo]}>{o.etiqueta}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  fila: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  chipActivo: { backgroundColor: colors.primary, borderColor: colors.primary },
  texto: { fontSize: 14, color: colors.text },
  textoActivo: { color: '#fff', fontWeight: '700' },
});
