import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import OrderStatusStepper from '../../components/superapp/OrderStatusStepper';
import { RootStackParamList } from '../../navigation/types';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchOrders } from '../../store/superOrdersSlice';

export default function OrdersScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const dispatch = useAppDispatch();
  const { orders } = useAppSelector((state) => state.superOrders);

  React.useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  return (
    <View style={{ flex: 1, backgroundColor: '#fff', padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: '800', marginBottom: 12 }}>Mis pedidos</Text>
      {orders.map((order) => (
        <TouchableOpacity key={order.id} onPress={() => navigation.navigate('OrderDetail', { orderId: order.id })} style={{ borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, padding: 12, marginBottom: 10 }}>
          <Text style={{ fontWeight: '700' }}>{order.businessName}</Text>
          <Text style={{ color: '#475569', marginVertical: 4 }}>Total: ${order.total.toFixed(2)}</Text>
          <OrderStatusStepper status={order.status} />
        </TouchableOpacity>
      ))}
    </View>
  );
}
