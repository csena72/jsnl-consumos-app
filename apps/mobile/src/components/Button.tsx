import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { colors } from './theme';

interface Props {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  loading?: boolean;
  disabled?: boolean;
}

export function Button({ title, onPress, variant = 'primary', loading = false, disabled = false }: Props) {
  const inactivo = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={inactivo}
      style={({ pressed }) => [styles.base, styles[variant], inactivo && styles.disabled, pressed && styles.pressed]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'secondary' ? colors.primary : '#fff'} />
      ) : (
        <Text style={[styles.text, variant === 'secondary' && styles.textSecondary]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { minHeight: 48, borderRadius: 10, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' },
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.primary },
  danger: { backgroundColor: colors.danger },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.8 },
  text: { color: '#fff', fontSize: 16, fontWeight: '600' },
  textSecondary: { color: colors.primary },
});
