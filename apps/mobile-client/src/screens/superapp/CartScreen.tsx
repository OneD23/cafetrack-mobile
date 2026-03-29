import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { decrementQty, incrementQty } from '../../store/superCartSlice';

type Props = StackScreenProps<RootStackParamList, 'Cart'>;

export default function CartScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const items = useAppSelector((state) => state.superCart.items);
  const total = items.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0);

  return (
    <View style={{ flex: 1, backgroundColor: '#fff', padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: '800', marginBottom: 12 }}>Carrito</Text>

      {items.length === 0 ? (
        <Text style={{ color: '#64748b' }}>Tu carrito está vacío.</Text>
      ) : (
        <>
          {items.map((line) => (
            <View key={line.productId} style={{ borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, padding: 12, marginBottom: 10 }}>
              <Text style={{ fontWeight: '700' }}>{line.productName}</Text>
              <Text style={{ color: '#475569' }}>${line.unitPrice.toFixed(2)}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                <TouchableOpacity onPress={() => dispatch(decrementQty(line.productId))} style={{ padding: 6, backgroundColor: '#f1f5f9', borderRadius: 6 }}>
                  <Text>-</Text>
                </TouchableOpacity>
                <Text style={{ marginHorizontal: 10 }}>{line.quantity}</Text>
                <TouchableOpacity onPress={() => dispatch(incrementQty(line.productId))} style={{ padding: 6, backgroundColor: '#f1f5f9', borderRadius: 6 }}>
                  <Text>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}

          <Text style={{ fontSize: 18, fontWeight: '700' }}>Total: ${total.toFixed(2)}</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Checkout')} style={{ marginTop: 12, backgroundColor: '#1f6feb', padding: 14, borderRadius: 10, alignItems: 'center' }}>
            <Text style={{ color: '#fff', fontWeight: '700' }}>Continuar a checkout</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}
