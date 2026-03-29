import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';
import LoginScreen from '../screens/superapp/LoginScreen';
import RegisterScreen from '../screens/superapp/RegisterScreen';
import HomeScreen from '../screens/superapp/HomeScreen';
import OrdersScreen from '../screens/superapp/OrdersScreen';
import ProfileScreen from '../screens/superapp/ProfileScreen';
import BusinessListScreen from '../screens/superapp/BusinessListScreen';
import BusinessDetailScreen from '../screens/superapp/BusinessDetailScreen';
import CartScreen from '../screens/superapp/CartScreen';
import CheckoutScreen from '../screens/superapp/CheckoutScreen';
import OrderDetailScreen from '../screens/superapp/OrderDetailScreen';
import { MainTabsParamList, RootStackParamList } from './types';
import { useAppSelector } from '../store/hooks';
import { theme } from '../theme/theme';

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabsParamList>();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
            InicioTab: 'home-outline',
            PedidosTab: 'receipt-outline',
            PerfilTab: 'person-outline',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.card,
          borderTopColor: theme.colors.border,
        },
        headerStyle: {
          backgroundColor: theme.colors.card,
        },
        headerTintColor: theme.colors.textPrimary,
      })}
    >
      <Tab.Screen name="InicioTab" component={HomeScreen} options={{ title: 'Inicio' }} />
      <Tab.Screen name="PedidosTab" component={OrdersScreen} options={{ title: 'Pedidos' }} />
      <Tab.Screen name="PerfilTab" component={ProfileScreen} options={{ title: 'Perfil' }} />
    </Tab.Navigator>
  );
}

function AuthOrApp() {
  const { user, isLoading } = useAppSelector((state) => state.superAuth);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <Text style={{ color: theme.colors.textPrimary }}>Restaurando sesión...</Text>
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.card },
        headerTintColor: theme.colors.textPrimary,
        cardStyle: { backgroundColor: theme.colors.background },
      }}
    >
      {!user ? (
        <>
          <Stack.Screen name="AuthLogin" component={LoginScreen} options={{ title: 'Login' }} />
          <Stack.Screen name="AuthRegister" component={RegisterScreen} options={{ title: 'Registro' }} />
        </>
      ) : (
        <>
          <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
          <Stack.Screen name="BusinessList" component={BusinessListScreen} options={{ title: 'Negocios' }} />
          <Stack.Screen name="BusinessDetail" component={BusinessDetailScreen} options={{ title: 'Detalle del negocio' }} />
          <Stack.Screen name="Cart" component={CartScreen} options={{ title: 'Carrito' }} />
          <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ title: 'Checkout' }} />
          <Stack.Screen name="OrderDetail" component={OrderDetailScreen} options={{ title: 'Detalle del pedido' }} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <AuthOrApp />
    </NavigationContainer>
  );
}
