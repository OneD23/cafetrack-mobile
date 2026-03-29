import React from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/types';
import CategoryChips from '../../components/superapp/CategoryChips';
import BusinessCard from '../../components/superapp/BusinessCard';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchClientCatalog, setSearch, setSelectedCategory } from '../../store/superBusinessSlice';

export default function HomeScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const dispatch = useAppDispatch();
  const { categories, businesses, search, selectedCategoryId } = useAppSelector((state) => state.superBusiness);

  React.useEffect(() => {
    dispatch(fetchClientCatalog());
  }, [dispatch]);

  const filtered = businesses.filter((business) => {
    const matchSearch = business.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory = !selectedCategoryId || business.categoryId === selectedCategoryId;
    return matchSearch && matchCategory;
  });

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f8fafc' }} contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: '800' }}>Hola 👋</Text>
      <Text style={{ color: '#64748b', marginTop: 4 }}>¿Qué quieres pedir hoy?</Text>

      <TextInput
        value={search}
        onChangeText={(value) => dispatch(setSearch(value))}
        placeholder="Buscar negocios, productos o servicios"
        style={{ marginTop: 14, borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, padding: 12, backgroundColor: '#fff' }}
      />

      <CategoryChips
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        onSelect={(id) => dispatch(setSelectedCategory(id))}
      />

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
        <TouchableOpacity onPress={() => navigation.navigate('BusinessList')} style={{ backgroundColor: '#0ea5e9', padding: 10, borderRadius: 8 }}>
          <Text style={{ color: '#fff', fontWeight: '700' }}>Ver negocios</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Cart')} style={{ backgroundColor: '#16a34a', padding: 10, borderRadius: 8 }}>
          <Text style={{ color: '#fff', fontWeight: '700' }}>Ir al carrito</Text>
        </TouchableOpacity>
      </View>

      <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 10 }}>Negocios conectados en OneD Hub</Text>
      {filtered.length === 0 ? (
        <Text style={{ color: '#64748b' }}>No hay negocios visibles en OneD Hub por el momento.</Text>
      ) : (
        filtered.map((business) => (
          <BusinessCard key={business.id} business={business} onPress={() => navigation.navigate('BusinessDetail', { businessId: business.id })} />
        ))
      )}
    </ScrollView>
  );
}
