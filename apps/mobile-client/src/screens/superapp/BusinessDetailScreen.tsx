import React from 'react';
import { Image, ScrollView, Text, View } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import ProductItem from '../../components/ProductItem';
import Button from '../../components/ui/Button';
import { RootStackParamList } from '../../navigation/types';
import { useAppDispatch } from '../../store/hooks';
import { addToCart } from '../../store/superCartSlice';
import { theme } from '../../theme/theme';

type Props = StackScreenProps<RootStackParamList, 'BusinessDetail'>;

export default function BusinessDetailScreen({ route, navigation }: Props) {
  const dispatch = useAppDispatch();
  const { business } = route.params;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }} contentContainerStyle={{ padding: theme.spacing.lg }}>
      {business.bannerUrl ? (
        <Image
          source={{ uri: business.bannerUrl }}
          style={{ width: '100%', height: 180, borderRadius: theme.borderRadius.lg, marginBottom: theme.spacing.lg }}
          resizeMode="cover"
        />
      ) : null}

      <Text style={{ fontSize: 26, fontWeight: '800', color: theme.colors.textPrimary }}>{business.name}</Text>
      <Text style={{ color: theme.colors.textSecondary, marginTop: 8 }}>{business.description}</Text>

      <Text style={{ fontSize: 20, fontWeight: '700', color: theme.colors.textPrimary, marginTop: theme.spacing.xl, marginBottom: theme.spacing.md }}>
        Productos
      </Text>

      {business.products.map((product) => (
        <ProductItem key={product.id} product={product} onAdd={() => dispatch(addToCart(product))} />
      ))}

      <View style={{ marginTop: theme.spacing.md }}>
        <Button title="Ver carrito" onPress={() => navigation.navigate('Cart')} />
      </View>
    </ScrollView>
  );
}
