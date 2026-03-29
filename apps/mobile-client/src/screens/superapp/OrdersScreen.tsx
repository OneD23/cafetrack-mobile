import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import OrderStatusStepper from '../../components/superapp/OrderStatusStepper';
import { RootStackParamList } from '../../navigation/types';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchMyOrders } from '../../store/superOrdersSlice';

export default function OrdersScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const dispatch = useAppDispatch();
  const { orders } = useAppSelector((state) => state.superOrders);
  const userId = useAppSelector((state) => state.superAuth.user?.id);

  React.useEffect(() => {
    if (!userId) return;

    const refresh = () => dispatch(fetchMyOrders({ userId }));
    refresh();

    const intervalId = setInterval(refresh, 7000);
    return () => clearInterval(intervalId);
  }, [dispatch, userId]);

  return (
    <View style={{ flex: 1, backgroundColor: '#fff', padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: '800', marginBottom: 12 }}>Mis pedidos</Text>
      {orders.length === 0 ? <Text style={{ color: '#64748b' }}>Aún no tienes pedidos.</Text> : null}
      {orders.map((order) => (
        <TouchableOpacity
          key={order.id}
          onPress={() => navigation.navigate('OrderDetail', { orderId: order.id })}
          style={{ borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, padding: 12, marginBottom: 10 }}
        >
          <Text style={{ fontWeight: '700' }}>{order.businessName || 'Negocio OneD Hub'}</Text>
          <Text style={{ color: '#475569', marginVertical: 4 }}>Total: ${order.total.toFixed(2)}</Text>
          <OrderStatusStepper status={order.status} />
        </TouchableOpacity>
      ))}
    </View>
  );
}
