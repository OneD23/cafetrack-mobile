import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { loginClient } from '../../store/superAuthSlice';
import { theme } from '../../theme/theme';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

type Props = StackScreenProps<RootStackParamList, 'AuthLogin'>;

export default function LoginScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.superAuth);
  const [email, setEmail] = React.useState('cliente@demo.com');
  const [password, setPassword] = React.useState('123456');

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: theme.spacing.xl, backgroundColor: theme.colors.background }}>
      <Text style={theme.typography.heading}>OneD Hub</Text>
      <Text style={[theme.typography.body, { color: theme.colors.textSecondary, marginBottom: theme.spacing.lg }]}>Inicia sesión para pedir y rastrear tus órdenes.</Text>

      <Card>
        <Input value={email} onChangeText={setEmail} placeholder="Email" />
        <View style={{ height: theme.spacing.sm }} />
        <Input value={password} secureTextEntry onChangeText={setPassword} placeholder="Contraseña" />

        {error ? (
          <View style={{ marginTop: theme.spacing.sm }}>
            <Badge label={error} variant="error" />
          </View>
        ) : null}

        <View style={{ marginTop: theme.spacing.lg }}>
          <Button title={isLoading ? 'Entrando...' : 'Entrar'} onPress={() => dispatch(loginClient({ email, password }))} disabled={isLoading} />
        </View>

        <View style={{ marginTop: theme.spacing.sm }}>
          <Button title="Crear cuenta" onPress={() => navigation.navigate('AuthRegister')} variant="outline" />
        </View>
      </Card>

      {isLoading ? <ActivityIndicator style={{ marginTop: theme.spacing.md }} color={theme.colors.primary} /> : null}
    </View>
  );
}
