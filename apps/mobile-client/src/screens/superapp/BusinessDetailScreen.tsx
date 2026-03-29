import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { addToCart } from '../../store/superCartSlice';

type Props = StackScreenProps<RootStackParamList, 'BusinessDetail'>;

export default function BusinessDetailScreen({ route, navigation }: Props) {
  const dispatch = useAppDispatch();
  const business = useAppSelector((state) =>
    state.superBusiness.businesses.find((entry) => entry.id === route.params.businessId)
  );

  if (!business) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>No encontramos este negocio.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fff' }} contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: '800' }}>{business.name}</Text>
      <Text style={{ color: '#475569', marginTop: 8 }}>{business.description}</Text>
      <Text style={{ color: '#334155', marginTop: 8 }}>⭐ {business.rating} · {business.etaMinutes} min</Text>

      <Text style={{ fontSize: 18, fontWeight: '700', marginTop: 20, marginBottom: 10 }}>Productos / Servicios</Text>
      {business.products.map((product) => (
        <View
          key={product.id}
          style={{
            borderWidth: 1,
            borderColor: '#e2e8f0',
            borderRadius: 10,
            padding: 12,
            marginBottom: 10,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={{ fontWeight: '700' }}>{product.name}</Text>
            <Text style={{ color: '#475569' }}>${product.price.toFixed(2)}</Text>
          </View>

          <TouchableOpacity onPress={() => dispatch(addToCart(product))} style={{ backgroundColor: '#1f6feb', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8 }}>
            <Text style={{ color: '#fff', fontWeight: '700' }}>Agregar</Text>
          </TouchableOpacity>
        </View>
      ))}

      <TouchableOpacity onPress={() => navigation.navigate('Cart')} style={{ marginTop: 16, backgroundColor: '#16a34a', padding: 14, borderRadius: 10, alignItems: 'center' }}>
        <Text style={{ color: '#fff', fontWeight: '700' }}>Ver carrito</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
