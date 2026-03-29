import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, View, Text } from 'react-native';

import { store } from '../mobile-client/src/store';
import { fetchIngredients } from '../mobile-client/src/store/inventorySlice';
import { restoreSession } from '../mobile-client/src/store/authSlice';
import { setTaxConfig } from '../mobile-client/src/store/cartSlice';
import { rehydrateOfflineQueue } from '../mobile-client/src/store/offlineSlice';
import { api } from '../mobile-client/src/api/client';

import LoginScreen from '../mobile-client/src/screens/LoginScreen';
import POSScreen from '../mobile-client/src/screens/POSScreen';
import InventoryScreen from '../mobile-client/src/screens/InventoryScreen';
import ReportsScreen from '../mobile-client/src/screens/ReportsScreen';
import BusinessSettingsScreen from './src/screens/BusinessSettingsScreen';
import CustomersScreen from '../mobile-client/src/screens/CustomersScreen';
import OrdersIncomingScreen from './src/screens/OrdersIncomingScreen';

const Tab = createBottomTabNavigator();
const TAX_SETTINGS_KEY = 'settings:tax_enabled';

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          if (route.name === 'POS') {
            iconName = focused ? 'cafe' : 'cafe-outline';
          } else if (route.name === 'Inventario') {
            iconName = focused ? 'cube' : 'cube-outline';
          } else if (route.name === 'Clientes') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Contabilidad') {
            iconName = focused ? 'calculator' : 'calculator-outline';
          } else if (route.name === 'PedidosHub') {
            iconName = focused ? 'receipt' : 'receipt-outline';
          } else if (route.name === 'Ajustes') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#d4a574',
        tabBarInactiveTintColor: '#8b6f4e',
        tabBarStyle: {
          backgroundColor: '#1a0f0a',
          borderTopColor: '#4a3428',
          paddingBottom: 5,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="POS" component={POSScreen} />
      <Tab.Screen name="Inventario" component={InventoryScreen} />
      <Tab.Screen name="Clientes" component={CustomersScreen} />
      <Tab.Screen name="PedidosHub" component={OrdersIncomingScreen} options={{ title: 'Pedidos Hub' }} />
      <Tab.Screen name="Contabilidad" component={ReportsScreen} />
      <Tab.Screen name="Ajustes" component={BusinessSettingsScreen} />
    </Tab.Navigator>
  );
}

function AppContent() {
  const [authState, setAuthState] = React.useState(store.getState().auth);

  React.useEffect(() => {
    store.dispatch(restoreSession() as any);
    store.dispatch(rehydrateOfflineQueue() as any);
    AsyncStorage.getItem(TAX_SETTINGS_KEY)
      .then((raw) => {
        if (!raw) return;
        const parsed = JSON.parse(raw);
        store.dispatch(
          setTaxConfig({
            enabled: parsed?.enabled !== false,
            rate: Number(parsed?.rate || 0.16),
          })
        );
      })
      .catch(() => {
        // configuración default
      });

    const unsubscribe = store.subscribe(() => {
      setAuthState(store.getState().auth);
    });

    return unsubscribe;
  }, []);

  React.useEffect(() => {
    if (authState.user) {
      store.dispatch(fetchIngredients() as any);
      api.warmupOfflineBackup().catch(() => {
        // fallback offline
      });
    }
  }, [authState.user]);

  if (authState.isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a0f0a' }}>
        <ActivityIndicator size="large" color="#d4a574" />
        <Text style={{ color: '#f5f1e8', marginTop: 12 }}>Restaurando sesión...</Text>
      </View>
    );
  }

  return authState.user ? <MainTabs /> : <LoginScreen />;
}

export default function App() {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <AppContent />
      </NavigationContainer>
    </Provider>
  );
}
