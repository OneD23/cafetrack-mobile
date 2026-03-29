import React from 'react';
import { Text, View } from 'react-native';
import Button from './ui/Button';
import Card from './ui/Card';
import { ProductItem as ProductItemType } from '../types/superApp';
import { theme } from '../theme/theme';

interface Props {
  product: ProductItemType;
  onAdd: () => void;
}

export default function ProductItem({ product, onAdd }: Props) {
  return (
    <Card style={{ marginBottom: theme.spacing.md }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flex: 1, marginRight: theme.spacing.md }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: theme.colors.textPrimary }}>{product.name}</Text>
          <Text style={{ marginTop: 4, color: theme.colors.textSecondary }}>${product.price.toFixed(2)}</Text>
        </View>
        <View style={{ minWidth: 110 }}>
          <Button title="Agregar" onPress={onAdd} />
        </View>
      </View>
    </Card>
  );
}
