import React from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { businessNetworkService } from '../services/businessNetworkService';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';
const STATUS_OPTIONS: Array<'pending' | 'accepted' | 'preparing' | 'ready' | 'cancelled'> = [
  'pending',
  'accepted',
  'preparing',
  'ready',
  'cancelled',
];

const labelByStatus: Record<string, string> = {
  pending: 'Pendiente',
  accepted: 'Aceptado',
  preparing: 'Preparando',
  ready: 'Listo',
  cancelled: 'Cancelado',
};

export default function OrdersIncomingScreen() {
  const [businessId, setBusinessId] = React.useState<string | null>(process.env.EXPO_PUBLIC_BUSINESS_ID || null);
  const [orders, setOrders] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  const loadOrders = React.useCallback(async () => {
    try {
      setIsLoading(true);
      let currentBusinessId = businessId;
      if (!currentBusinessId) {
        const status = await businessNetworkService.getNetworkStatus();
        currentBusinessId = status.businessId;
        setBusinessId(status.businessId);
      }

      const response = await fetch(`${API_URL}/v1/orders/business/${currentBusinessId}`);
      const payload = await response.json();
      setOrders(Array.isArray(payload?.data) ? payload.data : []);
    } catch (error: any) {
      Alert.alert('Pedidos OneD Hub', error?.message || 'No se pudieron cargar pedidos entrantes.');
    } finally {
      setIsLoading(false);
    }
  }, [businessId]);

  React.useEffect(() => {
    loadOrders();
    const intervalId = setInterval(loadOrders, 7000);
    return () => clearInterval(intervalId);
  }, [loadOrders]);

  const onUpdateStatus = async (orderId: string, status: 'pending' | 'accepted' | 'preparing' | 'ready' | 'cancelled') => {
    try {
      await fetch(`${API_URL}/v1/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      loadOrders();
    } catch (error: any) {
      Alert.alert('Pedidos OneD Hub', error?.message || 'No se pudo actualizar el estado del pedido.');
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#1a0f0a' }} contentContainerStyle={{ padding: 16 }}>
      <Text style={{ color: '#f5f1e8', fontSize: 24, fontWeight: '700', marginBottom: 8 }}>Pedidos OneD Hub</Text>
      <Text style={{ color: '#d2b8a3', marginBottom: 12 }}>
        Aquí se muestran pedidos externos de clientes (separados de ventas locales POS).
      </Text>

      <TouchableOpacity onPress={loadOrders} style={{ alignSelf: 'flex-start', backgroundColor: '#4a3428', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, marginBottom: 12 }}>
        <Text style={{ color: '#f5f1e8' }}>{isLoading ? 'Actualizando...' : 'Refrescar'}</Text>
      </TouchableOpacity>

      {orders.length === 0 ? <Text style={{ color: '#d2b8a3' }}>No hay pedidos entrantes por ahora.</Text> : null}

      {orders.map((order) => (
        <View key={order.id} style={{ backgroundColor: '#2c1810', borderRadius: 12, borderWidth: 1, borderColor: '#4a3428', padding: 12, marginBottom: 10 }}>
          <Text style={{ color: '#f5f1e8', fontWeight: '700' }}>Pedido #{String(order.id).slice(-6)}</Text>
          <Text style={{ color: '#d2b8a3', marginTop: 4 }}>Estado: {labelByStatus[order.status] || order.status}</Text>
          <Text style={{ color: '#d2b8a3' }}>Total: ${Number(order.total || 0).toFixed(2)}</Text>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 }}>
            {STATUS_OPTIONS.map((status) => (
              <TouchableOpacity
                key={status}
                onPress={() => onUpdateStatus(order.id, status)}
                style={{
                  backgroundColor: order.status === status ? '#d4a574' : '#4a3428',
                  paddingHorizontal: 8,
                  paddingVertical: 6,
                  borderRadius: 8,
                  marginRight: 6,
                  marginBottom: 6,
                }}
              >
                <Text style={{ color: order.status === status ? '#1a0f0a' : '#f5f1e8', fontSize: 12 }}>{labelByStatus[status]}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
