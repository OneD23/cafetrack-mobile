import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import BusinessCard from '../../components/BusinessCard';
import { mockBusinessesData } from '../../data/businesses';
import { RootStackParamList } from '../../navigation/types';
import { theme } from '../../theme/theme';

export default function HomeScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const nearbyBusinesses = mockBusinessesData.slice(0, 3);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }} contentContainerStyle={{ padding: theme.spacing.lg }}>
      <Text style={{ fontSize: 26, fontWeight: '800', color: theme.colors.textPrimary }}>Hola 👋</Text>
      <Text style={{ color: theme.colors.textSecondary, marginTop: 4 }}>Descubre opciones para pedir cerca de ti.</Text>

      <View style={{ marginTop: theme.spacing.lg, marginBottom: theme.spacing.md }}>
        <TouchableOpacity
          onPress={() => navigation.navigate('BusinessList')}
          style={{
            backgroundColor: theme.colors.primary,
            borderRadius: theme.borderRadius.md,
            paddingVertical: theme.spacing.md,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '700' }}>Ver todos los negocios</Text>
        </TouchableOpacity>
      </View>

      <Text style={{ fontSize: 20, fontWeight: '700', color: theme.colors.textPrimary, marginBottom: theme.spacing.md }}>
        Negocios cercanos
      </Text>
      {nearbyBusinesses.map((business) => (
        <BusinessCard
          key={business.id}
          business={business}
          onPress={() => navigation.navigate('BusinessDetail', { business })}
        />
      ))}
    </ScrollView>
  );
}
