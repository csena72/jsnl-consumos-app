import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { mensajeDeError } from '../api/client';
import { Banner } from '../components/Banner';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { colors } from '../components/theme';
import { useAuth } from '../context/AuthContext';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

export function LoginScreen() {
  const { iniciarSesion } = useAuth();
  const { conectado } = useNetworkStatus();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ingresar = async () => {
    if (!email.trim() || !password) {
      setError('Ingresá tu email y contraseña.');
      return;
    }
    setCargando(true);
    setError(null);
    try {
      await iniciarSesion(email.trim().toLowerCase(), password);
    } catch (e) {
      setError(mensajeDeError(e));
      setCargando(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Consumos App</Text>
        <Text style={styles.subtitle}>Cooperativa de Agua Potable Tacural</Text>
        <View style={styles.form}>
          {!conectado ? (
            <Banner tono="warning" titulo="Sin conexión" texto="Necesitás internet para iniciar sesión y descargar la ruta." />
          ) : null}
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />
          <Input label="Contraseña" value={password} onChangeText={setPassword} secureTextEntry autoComplete="password" />
          {error ? <Banner tono="danger" titulo="No se pudo ingresar" texto={error} /> : null}
          <Button title="Ingresar y descargar ruta" onPress={ingresar} loading={cargando} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  container: { flexGrow: 1, justifyContent: 'center', padding: 24, gap: 8 },
  title: { fontSize: 30, fontWeight: '800', color: colors.primaryDark, textAlign: 'center' },
  subtitle: { fontSize: 14, color: colors.muted, textAlign: 'center', marginBottom: 24 },
  form: { gap: 16 },
});
