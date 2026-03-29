import React from 'react';
import { FlatList, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import BusinessCard from '../../components/BusinessCard';
import { mockBusinessesData } from '../../data/businesses';
import { RootStackParamList } from '../../navigation/types';
import { theme } from '../../theme/theme';

export default function BusinessListScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background, padding: theme.spacing.lg }}>
      <Text style={{ fontSize: 24, fontWeight: '800', color: theme.colors.textPrimary, marginBottom: theme.spacing.md }}>
        Negocios cercanos
      </Text>

      <FlatList
        data={mockBusinessesData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <BusinessCard business={item} onPress={() => navigation.navigate('BusinessDetail', { business: item })} />
        )}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
