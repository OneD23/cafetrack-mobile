import React from 'react';
import { FlatList, Text, View } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import BusinessCard from '../../components/superapp/BusinessCard';
import { RootStackParamList } from '../../navigation/types';
import { useAppSelector } from '../../store/hooks';

export default function BusinessListScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const businesses = useAppSelector((state) => state.superBusiness.businesses);

  return (
    <View style={{ flex: 1, backgroundColor: '#fff', padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: '800', marginBottom: 12 }}>Negocios activos en OneD Hub</Text>
      <FlatList
        data={businesses}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={{ color: "#64748b" }}>No hay negocios conectados actualmente.</Text>}
        renderItem={({ item }) => <BusinessCard business={item} onPress={() => navigation.navigate('BusinessDetail', { businessId: item.id })} />}
      />
    </View>
  );
}
