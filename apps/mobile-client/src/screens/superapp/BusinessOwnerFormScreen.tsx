import React from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { BusinessType } from '../../types/superApp';
import { theme } from '../../theme/theme';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setOwnerConfig } from '../../store/superServicesSlice';

const businessTypeOptions: Array<{ value: BusinessType; label: string }> = [
  { value: 'cafeteria', label: 'Cafetería' },
  { value: 'ferreteria', label: 'Ferretería' },
  { value: 'supermercado', label: 'Supermercado' },
  { value: 'colmado', label: 'Colmado' },
  { value: 'barberia_salon', label: 'Barbería y Salón' },
];

export default function BusinessOwnerFormScreen() {
  const dispatch = useAppDispatch();
  const ownerConfig = useAppSelector((state) => state.superServices.ownerConfig);

  const [ownerName, setOwnerName] = React.useState(ownerConfig?.ownerName ?? '');
  const [businessName, setBusinessName] = React.useState(ownerConfig?.businessName ?? '');
  const [phone, setPhone] = React.useState(ownerConfig?.phone ?? '');
  const [businessType, setBusinessType] = React.useState<BusinessType>(ownerConfig?.businessType ?? 'cafeteria');

  const onSubmit = () => {
    if (!ownerName.trim() || !businessName.trim() || !phone.trim()) {
      Alert.alert('Campos requeridos', 'Completa nombre del dueño, negocio y teléfono.');
      return;
    }

    dispatch(
      setOwnerConfig({
        ownerName: ownerName.trim(),
        businessName: businessName.trim(),
        phone: phone.trim(),
        businessType,
        updatedAt: new Date().toISOString(),
      })
    );

    Alert.alert('Configuración guardada', 'Tus datos se guardaron correctamente.');
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }} contentContainerStyle={{ padding: theme.spacing.lg }}>
      <View style={{ width: '100%', maxWidth: 760, alignSelf: 'center' }}>
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

        {ownerConfig ? (
          <View style={{ marginTop: theme.spacing.lg, padding: theme.spacing.md, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.borderRadius.md, backgroundColor: theme.colors.card }}>
            <Text style={{ fontWeight: '700', color: theme.colors.textPrimary }}>Configuración actual</Text>
            <Text style={{ color: theme.colors.textSecondary, marginTop: 6 }}>{ownerConfig.businessName} • {ownerConfig.ownerName}</Text>
            <Text style={{ color: theme.colors.textSecondary }}>{ownerConfig.phone}</Text>
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
}
