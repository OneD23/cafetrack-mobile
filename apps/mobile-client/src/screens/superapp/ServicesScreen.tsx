import React from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { mockBusinessesData } from '../../data/businesses';
import { theme } from '../../theme/theme';

const salonBusinesses = mockBusinessesData.filter((business) => business.businessType === 'barberia_salon');

export default function ServicesScreen() {
  const [selectedBusinessId, setSelectedBusinessId] = React.useState<string>(salonBusinesses[0]?.id ?? '');
  const [selectedServiceId, setSelectedServiceId] = React.useState<string>(salonBusinesses[0]?.products[0]?.id ?? '');
  const [customerName, setCustomerName] = React.useState('');
  const [appointmentTime, setAppointmentTime] = React.useState('');

  const selectedBusiness = salonBusinesses.find((business) => business.id === selectedBusinessId) ?? salonBusinesses[0];

  React.useEffect(() => {
    const nextService = selectedBusiness?.products[0]?.id ?? '';
    setSelectedServiceId(nextService);
  }, [selectedBusinessId, selectedBusiness?.products]);

  const selectedService = selectedBusiness?.products.find((product) => product.id === selectedServiceId);

  const onBookAppointment = () => {
    if (!selectedBusiness || !selectedService || !customerName.trim() || !appointmentTime.trim()) {
      Alert.alert('Datos incompletos', 'Completa nombre y hora para agendar tu cita.');
      return;
    }

    Alert.alert(
      'Cita agendada',
      `${customerName.trim()} • ${selectedBusiness.name} • ${selectedService.name} • ${appointmentTime.trim()}`
    );

    setCustomerName('');
    setAppointmentTime('');
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }} contentContainerStyle={{ padding: theme.spacing.lg }}>
      <Text style={{ fontSize: 24, fontWeight: '800', color: theme.colors.textPrimary }}>Servicios</Text>
      <Text style={{ color: theme.colors.textSecondary, marginTop: 4 }}>
        Agenda citas y turnos para barberías, peluquerías y salones de belleza.
      </Text>

      <Card style={{ marginTop: theme.spacing.lg }}>
        <Text style={{ fontWeight: '700', color: theme.colors.textPrimary, marginBottom: theme.spacing.sm }}>
          Elige un salón
        </Text>
        {salonBusinesses.map((business) => {
          const selected = business.id === selectedBusinessId;
          return (
            <TouchableOpacity
              key={business.id}
              onPress={() => setSelectedBusinessId(business.id)}
              style={{
                borderWidth: 1,
                borderColor: selected ? theme.colors.primary : theme.colors.border,
                backgroundColor: selected ? '#FFF6ED' : theme.colors.card,
                borderRadius: theme.borderRadius.md,
                padding: theme.spacing.md,
                marginBottom: theme.spacing.sm,
              }}
            >
              <Text style={{ fontWeight: '700', color: theme.colors.textPrimary }}>{business.name}</Text>
              <Text style={{ color: theme.colors.textSecondary, marginTop: 2 }}>{business.description}</Text>
            </TouchableOpacity>
          );
        })}
      </Card>

      <Card style={{ marginTop: theme.spacing.md }}>
        <Text style={{ fontWeight: '700', color: theme.colors.textPrimary, marginBottom: theme.spacing.sm }}>
          Servicio y horario
        </Text>

        <View style={{ marginBottom: theme.spacing.sm }}>
          {selectedBusiness?.products.map((product) => {
            const selected = product.id === selectedServiceId;
            return (
              <TouchableOpacity
                key={product.id}
                onPress={() => setSelectedServiceId(product.id)}
                style={{
                  borderWidth: 1,
                  borderColor: selected ? theme.colors.primary : theme.colors.border,
                  borderRadius: theme.borderRadius.md,
                  padding: theme.spacing.md,
                  marginBottom: theme.spacing.sm,
                  backgroundColor: selected ? '#FFF6ED' : theme.colors.card,
                }}
              >
                <Text style={{ fontWeight: '700', color: theme.colors.textPrimary }}>{product.name}</Text>
                <Text style={{ color: theme.colors.textSecondary }}>${product.price.toFixed(2)}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Input value={customerName} onChangeText={setCustomerName} placeholder="Tu nombre" />
        <View style={{ height: theme.spacing.sm }} />
        <Input value={appointmentTime} onChangeText={setAppointmentTime} placeholder="Hora deseada (ej: 16:30)" />

        <View style={{ marginTop: theme.spacing.md }}>
          <Button title="Agendar cita" onPress={onBookAppointment} />
        </View>
      </Card>
    </ScrollView>
  );
}
