import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import { colors } from '../components/theme';
import { NetworkBadge } from '../components/NetworkBadge';
import { useAuth } from '../context/AuthContext';
import { CargarLecturaScreen } from '../screens/CargarLecturaScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { RutaLecturasScreen } from '../screens/RutaLecturasScreen';
import { SincronizacionScreen } from '../screens/SincronizacionScreen';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  const { cargando, usuario } = useAuth();

  if (cargando) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: '#fff',
          headerRight: () => <NetworkBadge />,
        }}
      >
        {usuario ? (
          <>
            <Stack.Screen name="RutaLecturas" component={RutaLecturasScreen} options={{ title: 'Ruta de lecturas' }} />
            <Stack.Screen name="CargarLectura" component={CargarLecturaScreen} options={{ title: 'Cargar lectura' }} />
            <Stack.Screen name="Sincronizacion" component={SincronizacionScreen} options={{ title: 'Sincronización' }} />
          </>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
