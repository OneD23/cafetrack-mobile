import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logoutClient } from '../../store/superAuthSlice';
import { superAppApi } from '../../services/superAppApi';

export default function ProfileScreen() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.superAuth.user);
  const [addresses, setAddresses] = React.useState<any[]>([]);

  React.useEffect(() => {
    superAppApi.getAddresses().then(setAddresses);
  }, []);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fff' }} contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: '800' }}>Perfil</Text>
      <Text style={{ marginTop: 8 }}>Nombre: {user?.fullName}</Text>
      <Text>Email: {user?.email}</Text>

      <Text style={{ fontWeight: '700', marginTop: 16 }}>Mis direcciones</Text>
      {addresses.map((address) => (
        <View key={address.id} style={{ borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, padding: 10, marginTop: 8 }}>
          <Text style={{ fontWeight: '700' }}>{address.label}</Text>
          <Text>{address.street}</Text>
          <Text>{address.city}</Text>
        </View>
      ))}

      <Text style={{ fontWeight: '700', marginTop: 16 }}>Configuración básica</Text>
      <View style={{ marginTop: 8, padding: 10, backgroundColor: '#f8fafc', borderRadius: 10 }}>
        <Text>- Notificaciones push (pendiente)</Text>
        <Text>- Preferencias de pago (pendiente)</Text>
      </View>

      <TouchableOpacity onPress={() => dispatch(logoutClient())} style={{ marginTop: 16, backgroundColor: '#ef4444', padding: 12, borderRadius: 10, alignItems: 'center' }}>
        <Text style={{ color: '#fff', fontWeight: '700' }}>Cerrar sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
