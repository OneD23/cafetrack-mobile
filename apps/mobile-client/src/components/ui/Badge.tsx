import React from 'react';
import { Text, View } from 'react-native';

type BadgeVariant = 'success' | 'error' | 'neutral' | 'warning';

const palette: Record<BadgeVariant, { bg: string; text: string }> = {
  success: { bg: '#DCFCE7', text: '#166534' },
  error: { bg: '#FEE2E2', text: '#991B1B' },
  neutral: { bg: '#F3F4F6', text: '#374151' },
  warning: { bg: '#FEF3C7', text: '#92400E' },
};

export default function Badge({ label, variant = 'neutral' }: { label: string; variant?: BadgeVariant }) {
  return (
    <View style={{ backgroundColor: palette[variant].bg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 }}>
      <Text style={{ color: palette[variant].text, fontSize: 12, fontWeight: '700' }}>{label}</Text>
    </View>
  );
}
