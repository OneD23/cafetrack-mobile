import React from 'react';
import { Text, View } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import OrderStatusStepper from '../../components/superapp/OrderStatusStepper';
import { RootStackParamList } from '../../navigation/types';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchOrderById } from '../../store/superOrdersSlice';

type Props = StackScreenProps<RootStackParamList, 'OrderDetail'>;

export default function OrderDetailScreen({ route }: Props) {
  const dispatch = useAppDispatch();
  const order = useAppSelector(
    (state) => state.superOrders.orders.find((entry) => entry.id === route.params.orderId) || state.superOrders.selectedOrder
  );

  React.useEffect(() => {
    const refresh = () => dispatch(fetchOrderById({ orderId: route.params.orderId }));
    refresh();
    const intervalId = setInterval(refresh, 7000);
    return () => clearInterval(intervalId);
  }, [dispatch, route.params.orderId]);

  if (!order) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Pedido no encontrado.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#fff', padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: '800' }}>Detalle del pedido</Text>
      <Text style={{ marginTop: 8, color: '#334155' }}>Negocio: {order.businessName || 'Negocio OneD Hub'}</Text>
      <Text style={{ marginTop: 4, color: '#334155' }}>Creado: {new Date(order.createdAt).toLocaleString()}</Text>
      <Text style={{ marginTop: 4, color: '#334155' }}>Subtotal: ${order.subtotal?.toFixed?.(2) || order.total.toFixed(2)}</Text>
      <Text style={{ marginTop: 4, color: '#334155' }}>Impuestos: ${order.tax?.toFixed?.(2) || '0.00'}</Text>

      <View style={{ marginTop: 14 }}>
        <OrderStatusStepper status={order.status} />
      </View>

      <Text style={{ fontWeight: '700', marginTop: 14 }}>Items</Text>
      {order.items.map((item) => (
        <Text key={item.productId} style={{ marginTop: 4 }}>
          {item.quantity} x {item.name || item.productName} - ${item.unitPrice.toFixed(2)}
        </Text>
      ))}
    </View>
  );
}
