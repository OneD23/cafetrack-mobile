import React from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { BusinessType } from '../../types/superApp';
import { theme } from '../../theme/theme';

const businessTypeOptions: Array<{ value: BusinessType; label: string }> = [
  { value: 'cafeteria', label: 'Cafetería' },
  { value: 'ferreteria', label: 'Ferretería' },
  { value: 'supermercado', label: 'Supermercado' },
  { value: 'colmado', label: 'Colmado' },
  { value: 'barberia_salon', label: 'Barbería y Salón' },
];

export default function BusinessOwnerFormScreen() {
  const [ownerName, setOwnerName] = React.useState('');
  const [businessName, setBusinessName] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [businessType, setBusinessType] = React.useState<BusinessType>('cafeteria');

  const onSubmit = () => {
    if (!ownerName || !businessName || !phone) {
      Alert.alert('Campos requeridos', 'Completa nombre del dueño, negocio y teléfono.');
      return;
    }

    Alert.alert('Formulario enviado', `Tipo de negocio seleccionado: ${businessType}`);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }} contentContainerStyle={{ padding: theme.spacing.lg }}>
      <Text style={{ fontSize: 24, fontWeight: '800', color: theme.colors.textPrimary }}>Registro de negocio</Text>
      <Text style={{ color: theme.colors.textSecondary, marginTop: 4 }}>
        Los dueños pueden especificar su tipo de negocio para activar su flujo de operación.
      </Text>

      <View style={{ marginTop: theme.spacing.lg, gap: theme.spacing.md }}>
        <Input value={ownerName} onChangeText={setOwnerName} placeholder="Nombre del dueño" />
        <Input value={businessName} onChangeText={setBusinessName} placeholder="Nombre del negocio" />
        <Input value={phone} onChangeText={setPhone} placeholder="Teléfono" keyboardType="phone-pad" />
      </View>

      <Text style={{ marginTop: theme.spacing.xl, fontWeight: '700', color: theme.colors.textPrimary }}>Tipo de negocio</Text>
      <View style={{ marginTop: theme.spacing.md }}>
        {businessTypeOptions.map((option) => {
          const selected = option.value === businessType;
          return (
            <TouchableOpacity
              key={option.value}
              onPress={() => setBusinessType(option.value)}
              style={{
                backgroundColor: selected ? theme.colors.primary : theme.colors.card,
                borderWidth: 1,
                borderColor: selected ? theme.colors.primary : theme.colors.border,
                borderRadius: theme.borderRadius.md,
                padding: theme.spacing.md,
                marginBottom: theme.spacing.sm,
              }}
            >
              <Text style={{ color: selected ? '#fff' : theme.colors.textPrimary, fontWeight: '600' }}>{option.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={{ marginTop: theme.spacing.md }}>
        <Button title="Guardar configuración" onPress={onSubmit} />
      </View>
    </ScrollView>
  );
}
