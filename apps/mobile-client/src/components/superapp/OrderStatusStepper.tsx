import React from 'react';
import { Text, View } from 'react-native';
import { OrderStatus } from '../../types/superApp';

const flow: OrderStatus[] = ['pending', 'accepted', 'preparing', 'on_the_way', 'delivered'];

const labels: Record<OrderStatus, string> = {
  pending: 'Pendiente',
  accepted: 'Aceptado',
  preparing: 'Preparando',
  on_the_way: 'En camino',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
};

export default function OrderStatusStepper({ status }: { status: OrderStatus }) {
  if (status === 'cancelled') {
    return <Text style={{ color: '#c1121f', fontWeight: '700' }}>Pedido cancelado</Text>;
  }

  const currentIdx = flow.indexOf(status);

  return (
    <View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
        {flow.map((step, idx) => (
          <View
            key={step}
            style={{
              width: 14,
              height: 14,
              borderRadius: 7,
              backgroundColor: idx <= currentIdx ? '#16a34a' : '#d4d4d4',
            }}
          />
        ))}
      </View>
      <Text style={{ color: '#334155', fontWeight: '600' }}>{labels[status]}</Text>
    </View>
  );
}
