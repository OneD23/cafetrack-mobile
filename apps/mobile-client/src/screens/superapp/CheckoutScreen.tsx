import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { superAppApi } from '../../services/superAppApi';
import { clearCart, setSelectedAddress, setSelectedPaymentMethod } from '../../store/superCartSlice';

type Props = StackScreenProps<RootStackParamList, 'Checkout'>;

export default function CheckoutScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const cart = useAppSelector((state) => state.superCart);
  const [addresses, setAddresses] = React.useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = React.useState<any[]>([]);

  React.useEffect(() => {
    superAppApi.getAddresses().then((list) => {
      setAddresses(list);
      if (!cart.selectedAddress && list.length) dispatch(setSelectedAddress(list[0]));
    });
    superAppApi.getPaymentMethods().then((list) => {
      setPaymentMethods(list);
      if (!cart.selectedPaymentMethod && list.length) dispatch(setSelectedPaymentMethod(list[0]));
    });
  }, [dispatch]);

  const total = cart.items.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0);

  return (
    <View style={{ flex: 1, backgroundColor: '#fff', padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: '800', marginBottom: 12 }}>Checkout</Text>

      <Text style={{ fontWeight: '700', marginBottom: 6 }}>Selecciona dirección</Text>
      {addresses.map((address) => (
        <TouchableOpacity
          key={address.id}
          onPress={() => dispatch(setSelectedAddress(address))}
          style={{ borderWidth: 1, borderColor: cart.selectedAddress?.id === address.id ? '#1f6feb' : '#e2e8f0', borderRadius: 10, padding: 10, marginBottom: 8 }}
        >
          <Text style={{ fontWeight: '700' }}>{address.label}</Text>
          <Text style={{ color: '#475569' }}>{address.street}</Text>
        </TouchableOpacity>
      ))}

      <Text style={{ fontWeight: '700', marginVertical: 6 }}>Método de pago</Text>
      {paymentMethods.map((method) => (
        <TouchableOpacity
          key={method.id}
          onPress={() => dispatch(setSelectedPaymentMethod(method))}
          style={{ borderWidth: 1, borderColor: cart.selectedPaymentMethod?.id === method.id ? '#1f6feb' : '#e2e8f0', borderRadius: 10, padding: 10, marginBottom: 8 }}
        >
          <Text>{method.label}</Text>
        </TouchableOpacity>
      ))}

      <View style={{ marginTop: 10, padding: 12, backgroundColor: '#f8fafc', borderRadius: 10 }}>
        <Text style={{ fontWeight: '700' }}>Resumen</Text>
        <Text style={{ marginTop: 4 }}>Items: {cart.items.length}</Text>
        <Text style={{ marginTop: 4 }}>Total: ${total.toFixed(2)}</Text>
      </View>

      <TouchableOpacity
        onPress={() => {
          dispatch(clearCart());
          navigation.navigate('MainTabs');
        }}
        style={{ marginTop: 14, backgroundColor: '#16a34a', padding: 14, borderRadius: 10, alignItems: 'center' }}
      >
        <Text style={{ color: '#fff', fontWeight: '700' }}>Confirmar pedido</Text>
      </TouchableOpacity>
    </View>
  );
}
