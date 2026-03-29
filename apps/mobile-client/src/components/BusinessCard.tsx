import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import Card from './ui/Card';
import { BusinessItem, BusinessType } from '../types/superApp';
import { theme } from '../theme/theme';

interface Props {
  business: BusinessItem;
  onPress: () => void;
}

const businessTypeLabel: Record<BusinessType, string> = {
  cafeteria: 'Cafetería',
  ferreteria: 'Ferretería',
  supermercado: 'Supermercado',
  colmado: 'Colmado',
  barberia_salon: 'Barbería y Salón',
};

export default function BusinessCard({ business, onPress }: Props) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
      <Card style={{ marginBottom: theme.spacing.md, padding: 0, overflow: 'hidden' }}>
        {business.bannerUrl ? (
          <Image source={{ uri: business.bannerUrl }} style={{ width: '100%', height: 140 }} resizeMode="cover" />
        ) : null}

        <View style={{ padding: theme.spacing.lg }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: theme.colors.textPrimary }}>{business.name}</Text>
          <Text style={{ marginTop: 4, color: theme.colors.primary, fontWeight: '600' }}>
            {businessTypeLabel[business.businessType]}
          </Text>
          <Text style={{ marginTop: 8, color: theme.colors.textPrimary }}>
            ⭐ {business.rating.toFixed(1)} · {business.distanceKm.toFixed(1)} km · {business.etaMinutes} min
          </Text>
        </View>
      </Card>
    </TouchableOpacity>
  );
}
