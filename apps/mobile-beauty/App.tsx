import React from 'react';
import { FlatList, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

type BusinessKind = 'barberia' | 'peluqueria' | 'salon_belleza';
type AppointmentStatus = 'pendiente' | 'confirmada' | 'en_servicio' | 'finalizada';

interface Appointment {
  id: string;
  customerName: string;
  service: string;
  time: string;
  status: AppointmentStatus;
}

const servicesByBusiness: Record<BusinessKind, string[]> = {
  barberia: ['Corte clásico', 'Perfilado de barba', 'Corte + barba'],
  peluqueria: ['Lavado + peinado', 'Corte dama', 'Secado'],
  salon_belleza: ['Manicure', 'Pedicure', 'Maquillaje social'],
};

const palette = {
  background: '#F8F7F4',
  card: '#FFFFFF',
  text: '#1B1B1B',
  primary: '#C68B59',
  muted: '#6B7280',
  border: '#E5E7EB',
};

const initialAppointments: Appointment[] = [
  { id: 'a1', customerName: 'Laura Méndez', service: 'Corte dama', time: '09:30', status: 'confirmada' },
  { id: 'a2', customerName: 'Carlos Ruiz', service: 'Corte clásico', time: '10:00', status: 'en_servicio' },
  { id: 'a3', customerName: 'Ana Pérez', service: 'Manicure', time: '10:30', status: 'pendiente' },
];

const statusOrder: AppointmentStatus[] = ['pendiente', 'confirmada', 'en_servicio', 'finalizada'];

export default function App() {
  const [businessName, setBusinessName] = React.useState('');
  const [ownerName, setOwnerName] = React.useState('');
  const [selectedBusiness, setSelectedBusiness] = React.useState<BusinessKind>('barberia');

  const [appointments, setAppointments] = React.useState<Appointment[]>(initialAppointments);
  const [customerName, setCustomerName] = React.useState('');
  const [service, setService] = React.useState(servicesByBusiness.barberia[0]);
  const [time, setTime] = React.useState('');

  React.useEffect(() => {
    setService(servicesByBusiness[selectedBusiness][0]);
  }, [selectedBusiness]);

  const addAppointment = () => {
    if (!customerName.trim() || !time.trim()) return;

    const newAppointment: Appointment = {
      id: `${Date.now()}`,
      customerName: customerName.trim(),
      service,
      time: time.trim(),
      status: 'pendiente',
    };

    setAppointments((prev) => [...prev, newAppointment].sort((a, b) => a.time.localeCompare(b.time)));
    setCustomerName('');
    setTime('');
  };

  const moveStatus = (id: string) => {
    setAppointments((prev) =>
      prev.map((appointment) => {
        if (appointment.id !== id) return appointment;
        const next = Math.min(statusOrder.indexOf(appointment.status) + 1, statusOrder.length - 1);
        return { ...appointment, status: statusOrder[next] };
      })
    );
  };

  const queue = appointments.filter((item) => item.status !== 'finalizada');

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>App de Citas y Turnos</Text>
        <Text style={styles.subtitle}>Barberías • Peluquerías • Salones de belleza</Text>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Configuración del negocio</Text>
          <TextInput
            value={businessName}
            onChangeText={setBusinessName}
            placeholder="Nombre del negocio"
            style={styles.input}
            placeholderTextColor={palette.muted}
          />
          <TextInput
            value={ownerName}
            onChangeText={setOwnerName}
            placeholder="Nombre del dueño"
            style={styles.input}
            placeholderTextColor={palette.muted}
          />

          <Text style={styles.label}>Tipo de negocio</Text>
          <View style={styles.pillsRow}>
            {([
              ['barberia', 'Barbería'],
              ['peluqueria', 'Peluquería'],
              ['salon_belleza', 'Salón'],
            ] as Array<[BusinessKind, string]>).map(([value, label]) => {
              const selected = selectedBusiness === value;
              return (
                <TouchableOpacity
                  key={value}
                  onPress={() => setSelectedBusiness(value)}
                  style={[styles.pill, selected && styles.pillSelected]}
                >
                  <Text style={[styles.pillText, selected && styles.pillTextSelected]}>{label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Nueva cita / turno</Text>
          <TextInput
            value={customerName}
            onChangeText={setCustomerName}
            placeholder="Nombre del cliente"
            style={styles.input}
            placeholderTextColor={palette.muted}
          />
          <Text style={styles.label}>Servicio</Text>
          <View style={styles.pillsRow}>
            {servicesByBusiness[selectedBusiness].map((serviceName) => {
              const selected = serviceName === service;
              return (
                <TouchableOpacity
                  key={serviceName}
                  onPress={() => setService(serviceName)}
                  style={[styles.pill, selected && styles.pillSelected]}
                >
                  <Text style={[styles.pillText, selected && styles.pillTextSelected]}>{serviceName}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <TextInput
            value={time}
            onChangeText={setTime}
            placeholder="Hora (ej: 14:30)"
            style={styles.input}
            placeholderTextColor={palette.muted}
          />
          <TouchableOpacity style={styles.primaryButton} onPress={addAppointment}>
            <Text style={styles.primaryButtonText}>Agregar turno</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Turnos activos</Text>
          {queue.length === 0 ? <Text style={styles.empty}>No hay turnos activos.</Text> : null}
          <FlatList
            data={queue}
            scrollEnabled={false}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.appointmentRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.customer}>{item.customerName}</Text>
                  <Text style={styles.meta}>{item.service} • {item.time}</Text>
                  <Text style={styles.status}>Estado: {item.status}</Text>
                </View>
                <TouchableOpacity style={styles.secondaryButton} onPress={() => moveStatus(item.id)}>
                  <Text style={styles.secondaryButtonText}>Siguiente estado</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: palette.background },
  container: { padding: 16, gap: 12 },
  title: { fontSize: 26, fontWeight: '800', color: palette.text },
  subtitle: { color: palette.muted, marginBottom: 4 },
  card: {
    backgroundColor: palette.card,
    borderRadius: 12,
    borderColor: palette.border,
    borderWidth: 1,
    padding: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: palette.text, marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: palette.text,
    marginBottom: 10,
  },
  label: { fontWeight: '600', color: palette.text, marginBottom: 6 },
  pillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  pill: {
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: palette.card,
  },
  pillSelected: { backgroundColor: palette.primary, borderColor: palette.primary },
  pillText: { color: palette.text, fontWeight: '500' },
  pillTextSelected: { color: '#fff' },
  primaryButton: {
    marginTop: 6,
    backgroundColor: palette.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryButtonText: { color: '#fff', fontWeight: '700' },
  empty: { color: palette.muted },
  appointmentRow: {
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  customer: { fontWeight: '700', color: palette.text },
  meta: { color: palette.text, marginTop: 2 },
  status: { color: palette.muted, marginTop: 2 },
  secondaryButton: {
    backgroundColor: '#1B1B1B',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  secondaryButtonText: { color: '#fff', fontWeight: '600', fontSize: 12 },
});
