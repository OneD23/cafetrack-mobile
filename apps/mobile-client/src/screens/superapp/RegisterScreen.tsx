import React from 'react';
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { registerClient } from '../../store/superAuthSlice';

type Props = StackScreenProps<RootStackParamList, 'AuthRegister'>;

export default function RegisterScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.superAuth);
  const [fullName, setFullName] = React.useState('Cliente Nuevo');
  const [email, setEmail] = React.useState('nuevo@demo.com');
  const [password, setPassword] = React.useState('123456');

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff' }}>
      <Text style={{ fontSize: 26, fontWeight: '800', marginBottom: 8 }}>Registro</Text>
      <Text style={{ color: '#666', marginBottom: 20 }}>Crea tu cuenta para empezar a usar la Super App.</Text>

      <TextInput value={fullName} onChangeText={setFullName} placeholder="Nombre completo" style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, marginBottom: 10 }} />
      <TextInput value={email} onChangeText={setEmail} placeholder="Email" style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, marginBottom: 10 }} />
      <TextInput value={password} secureTextEntry onChangeText={setPassword} placeholder="Contraseña" style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, marginBottom: 10 }} />

      {error ? <Text style={{ color: '#b91c1c', marginBottom: 10 }}>{error}</Text> : null}

      <TouchableOpacity
        onPress={() => dispatch(registerClient({ fullName, email, password }))}
        style={{ backgroundColor: '#1f6feb', padding: 14, borderRadius: 10, alignItems: 'center' }}
      >
        {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '700' }}>Crear cuenta</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 14, alignItems: 'center' }}>
        <Text style={{ color: '#1f6feb' }}>Volver al login</Text>
      </TouchableOpacity>
    </View>
  );
}
