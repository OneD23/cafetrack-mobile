import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { BusinessItem } from '../../types/superApp';

interface Props {
  business: BusinessItem;
  onPress: () => void;
}

export default function BusinessCard({ business, onPress }: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{ backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#eee' }}
    >
      <Text style={{ fontSize: 16, fontWeight: '700' }}>{business.name}</Text>
      <Text style={{ color: '#666', marginTop: 4 }}>{business.description}</Text>
      <Text style={{ color: '#333', marginTop: 8 }}>⭐ {business.rating} · {business.distanceKm} km · {business.etaMinutes} min</Text>
    </TouchableOpacity>
  );
}
