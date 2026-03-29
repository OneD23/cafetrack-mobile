import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logoutClient } from '../../store/superAuthSlice';
import { superAppApi } from '../../services/superAppApi';
import { RootStackParamList } from '../../navigation/types';
import { theme } from '../../theme/theme';

export default function ProfileScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.superAuth.user);
  const [addresses, setAddresses] = React.useState<any[]>([]);

  React.useEffect(() => {
    superAppApi.getAddresses().then(setAddresses);
  }, []);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }} contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: '800', color: theme.colors.textPrimary }}>Perfil</Text>
      <Text style={{ marginTop: 8, color: theme.colors.textPrimary }}>Nombre: {user?.fullName}</Text>
      <Text style={{ color: theme.colors.textPrimary }}>Email: {user?.email}</Text>

      <Text style={{ fontWeight: '700', marginTop: 16, color: theme.colors.textPrimary }}>Mis direcciones</Text>
      {addresses.map((address) => (
        <View key={address.id} style={{ borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, padding: 10, marginTop: 8, backgroundColor: '#fff' }}>
          <Text style={{ fontWeight: '700' }}>{address.label}</Text>
          <Text>{address.street}</Text>
          <Text>{address.city}</Text>
        </View>
      ))}

      <TouchableOpacity
        onPress={() => navigation.navigate('BusinessOwnerForm')}
        style={{ marginTop: 16, backgroundColor: theme.colors.primary, padding: 12, borderRadius: 10, alignItems: 'center' }}
      >
        <Text style={{ color: '#fff', fontWeight: '700' }}>Soy dueño: configurar tipo de negocio</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => dispatch(logoutClient())} style={{ marginTop: 16, backgroundColor: '#ef4444', padding: 12, borderRadius: 10, alignItems: 'center' }}>
        <Text style={{ color: '#fff', fontWeight: '700' }}>Cerrar sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
