import React from 'react';
import { Alert, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { mockBusinessesData } from '../../data/businesses';
import { theme } from '../../theme/theme';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { addServiceBooking, updateServiceBookingStatus } from '../../store/superServicesSlice';
import { ServiceBooking } from '../../types/superApp';

const salonBusinesses = mockBusinessesData.filter((business) => business.businessType === 'barberia_salon');
const statusFlow: ServiceBooking['status'][] = ['pending', 'confirmed', 'in_progress', 'completed'];
const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

type StaffMember = {
  id: string;
  name: string;
  specialty: string;
  rating?: number;
  avatarUrl?: string;
};

const autoAssignEmployee: StaffMember = {
  id: 'auto',
  name: 'Asignar automáticamente',
  specialty: 'Te asignamos el mejor disponible',
};

const staffByBusiness: Record<string, StaffMember[]> = {
  'biz-barberia-elite': [
    autoAssignEmployee,
    {
      id: 'staff-luis',
      name: 'Luis Gómez',
      specialty: 'Barbería clásica',
      rating: 4.9,
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
    },
    {
      id: 'staff-sara',
      name: 'Sara Núñez',
      specialty: 'Colorista',
      rating: 4.8,
      avatarUrl: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200',
    },
    {
      id: 'staff-mateo',
      name: 'Mateo Ruiz',
      specialty: 'Fade y barba',
      rating: 4.7,
    },
  ],
};

const statusLabel: Record<ServiceBooking['status'], string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  in_progress: 'En servicio',
  completed: 'Completada',
  cancelled: 'Cancelada',
};

const formatTime = (minutesFromMidnight: number) => {
  const hours24 = Math.floor(minutesFromMidnight / 60);
  const minutes = minutesFromMidnight % 60;
  const period = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
};

const formatDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const buildDateOptions = (days = 10) => {
  const now = new Date();
  return Array.from({ length: days }, (_, index) => {
    const nextDate = new Date(now);
    nextDate.setDate(now.getDate() + index);
    return {
      key: formatDateKey(nextDate),
      weekday: weekDays[nextDate.getDay()],
      dayOfMonth: nextDate.getDate(),
    };
  });
};

const getServiceDuration = (serviceName: string) => {
  const match = serviceName.match(/(\d+)\s*min/i);
  if (match) {
    return Number(match[1]);
  }

  if (/corte|barba/i.test(serviceName)) {
    return 30;
  }

  return 45;
};

const buildAvailableSlots = (durationMinutes: number) => {
  const openingMinutes = 9 * 60;
  const closingMinutes = 19 * 60;
  const slots: string[] = [];

  for (let current = openingMinutes; current + durationMinutes <= closingMinutes; current += durationMinutes) {
    slots.push(formatTime(current));
  }

  return slots;
};

export default function ServicesScreen() {
  const dispatch = useAppDispatch();
  const bookings = useAppSelector((state) => state.superServices.bookings);
  const ownerConfig = useAppSelector((state) => state.superServices.ownerConfig);

  const [selectedBusinessId, setSelectedBusinessId] = React.useState<string>(salonBusinesses[0]?.id ?? '');
  const [selectedServiceId, setSelectedServiceId] = React.useState<string>(salonBusinesses[0]?.products[0]?.id ?? '');
  const [customerName, setCustomerName] = React.useState('');
  const [selectedDateKey, setSelectedDateKey] = React.useState<string>('');
  const [selectedTime, setSelectedTime] = React.useState<string>('');
  const [selectedEmployeeId, setSelectedEmployeeId] = React.useState<string>(autoAssignEmployee.id);

  const selectedBusiness = salonBusinesses.find((business) => business.id === selectedBusinessId) ?? salonBusinesses[0];

  React.useEffect(() => {
    const nextService = selectedBusiness?.products[0]?.id ?? '';
    if (!selectedBusiness?.products.find((product) => product.id === selectedServiceId)) {
      setSelectedServiceId(nextService);
    }
  }, [selectedBusiness, selectedServiceId]);

  const selectedService = selectedBusiness?.products.find((product) => product.id === selectedServiceId);
  const staffOptions = staffByBusiness[selectedBusiness?.id ?? ''] ?? [autoAssignEmployee];
  const selectedEmployee = staffOptions.find((staff) => staff.id === selectedEmployeeId) ?? autoAssignEmployee;

  const dateOptions = React.useMemo(() => buildDateOptions(10), []);

  React.useEffect(() => {
    if (!selectedDateKey && dateOptions[0]) {
      setSelectedDateKey(dateOptions[0].key);
    }
  }, [dateOptions, selectedDateKey]);

  const availableSlots = React.useMemo(() => {
    if (!selectedService) {
      return [];
    }

    const duration = getServiceDuration(selectedService.name);
    return buildAvailableSlots(duration);
  }, [selectedService]);

  React.useEffect(() => {
    setSelectedTime('');
  }, [selectedServiceId, selectedDateKey]);

  React.useEffect(() => {
    if (!staffOptions.find((staff) => staff.id === selectedEmployeeId)) {
      setSelectedEmployeeId(autoAssignEmployee.id);
    }
  }, [selectedBusinessId, selectedEmployeeId, staffOptions]);

  const selectedDate = dateOptions.find((option) => option.key === selectedDateKey);

  const onBookAppointment = () => {
    if (!selectedBusiness || !selectedService || !customerName.trim()) {
      Alert.alert('Datos incompletos', 'Completa tu nombre y servicio para agendar tu cita.');
      return;
    }

    if (!selectedDate) {
      Alert.alert('Fecha requerida', 'Selecciona una fecha para continuar.');
      return;
    }

    if (!selectedTime) {
      Alert.alert('Hora requerida', 'Selecciona un horario disponible para continuar.');
      return;
    }

    const booking: ServiceBooking = {
      id: `booking-${Date.now()}`,
      businessId: selectedBusiness.id,
      businessName: selectedBusiness.name,
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      employeeId: selectedEmployee.id,
      employeeName: selectedEmployee.name,
      customerName: customerName.trim(),
      scheduledAt: `${selectedDate.key} ${selectedTime}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    dispatch(addServiceBooking(booking));

    Alert.alert(
      'Cita agendada',
      `${booking.customerName} • ${booking.businessName} • ${booking.serviceName} • ${booking.employeeName} • ${booking.scheduledAt}`
    );

    setCustomerName('');
    setSelectedTime('');
  };

  const moveBookingStatus = (booking: ServiceBooking) => {
    const index = statusFlow.indexOf(booking.status);
    const nextStatus = index >= 0 && index < statusFlow.length - 1 ? statusFlow[index + 1] : booking.status;
    dispatch(updateServiceBookingStatus({ id: booking.id, status: nextStatus }));
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }} contentContainerStyle={{ padding: theme.spacing.lg }}>
      <View style={{ width: '100%', maxWidth: 760, alignSelf: 'center' }}>
      <Text style={{ fontSize: 24, fontWeight: '800', color: theme.colors.textPrimary }}>Servicios</Text>
      <Text style={{ color: theme.colors.textSecondary, marginTop: 4 }}>
        Agenda citas y turnos para barberías, peluquerías y salones de belleza.
      </Text>

      {ownerConfig ? (
        <Card style={{ marginTop: theme.spacing.md }}>
          <Text style={{ fontWeight: '700', color: theme.colors.textPrimary }}>Negocio configurado</Text>
          <Text style={{ color: theme.colors.textSecondary, marginTop: 4 }}>
            {ownerConfig.businessName} ({ownerConfig.ownerName})
          </Text>
        </Card>
      ) : null}

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
          Servicio, fecha y horario
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

        <Text style={{ color: theme.colors.textPrimary, fontWeight: '600', marginBottom: theme.spacing.sm }}>
          Profesional
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingBottom: theme.spacing.sm }}>
          {staffOptions.map((staff) => {
            const selected = staff.id === selectedEmployeeId;
            const initials = staff.name
              .split(' ')
              .slice(0, 2)
              .map((word) => word[0])
              .join('')
              .toUpperCase();

            return (
              <TouchableOpacity
                key={staff.id}
                onPress={() => setSelectedEmployeeId(staff.id)}
                style={{
                  width: 168,
                  borderWidth: 1,
                  borderColor: selected ? '#C68B59' : theme.colors.border,
                  backgroundColor: selected ? '#F8ECE0' : theme.colors.card,
                  borderRadius: 18,
                  marginRight: theme.spacing.sm,
                  padding: theme.spacing.md,
                }}
              >
                {staff.avatarUrl ? (
                  <Image
                    source={{ uri: staff.avatarUrl }}
                    style={{ width: 44, height: 44, borderRadius: 22, marginBottom: 10 }}
                  />
                ) : (
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      marginBottom: 10,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#E9D6C1',
                    }}
                  >
                    <Text style={{ color: '#8C5D36', fontWeight: '700' }}>{initials}</Text>
                  </View>
                )}

                <Text numberOfLines={1} style={{ color: theme.colors.textPrimary, fontWeight: '700' }}>
                  {staff.name}
                </Text>
                <Text numberOfLines={1} style={{ color: theme.colors.textSecondary, marginTop: 2 }}>
                  {staff.specialty}
                </Text>
                {staff.rating ? (
                  <Text style={{ color: theme.colors.textSecondary, marginTop: 4, fontWeight: '600' }}>
                    ★ {staff.rating.toFixed(1)}
                  </Text>
                ) : null}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <Text style={{ color: theme.colors.textPrimary, fontWeight: '600', marginBottom: theme.spacing.sm }}>
          Fecha disponible
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingBottom: theme.spacing.sm }}>
          {dateOptions.map((option) => {
            const selected = option.key === selectedDateKey;
            return (
              <TouchableOpacity
                key={option.key}
                onPress={() => setSelectedDateKey(option.key)}
                style={{
                  minWidth: 74,
                  borderRadius: 18,
                  borderWidth: 1,
                  borderColor: selected ? '#C68B59' : theme.colors.border,
                  backgroundColor: selected ? '#F8ECE0' : theme.colors.card,
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  marginRight: theme.spacing.sm,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: selected ? '#C68B59' : theme.colors.textSecondary, fontSize: 12, fontWeight: '600' }}>
                  {option.weekday}
                </Text>
                <Text style={{ color: selected ? '#C68B59' : theme.colors.textPrimary, fontSize: 20, fontWeight: '700' }}>
                  {option.dayOfMonth}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <Text style={{ color: theme.colors.textPrimary, fontWeight: '600', marginBottom: theme.spacing.sm }}>
          Horarios disponibles
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingBottom: theme.spacing.sm }}>
          {availableSlots.map((slot) => {
            const selected = slot === selectedTime;
            return (
              <TouchableOpacity
                key={slot}
                onPress={() => setSelectedTime(slot)}
                style={{
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: selected ? '#C68B59' : theme.colors.border,
                  backgroundColor: selected ? '#C68B59' : theme.colors.card,
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                  marginRight: theme.spacing.sm,
                }}
              >
                <Text style={{ color: selected ? '#FFFFFF' : theme.colors.textPrimary, fontWeight: '600' }}>{slot}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <Input value={customerName} onChangeText={setCustomerName} placeholder="Tu nombre" />

        <View style={{ marginTop: theme.spacing.md }}>
          <Button title="Agendar cita" onPress={onBookAppointment} />
        </View>
      </Card>

      <Card style={{ marginTop: theme.spacing.md }}>
        <Text style={{ fontWeight: '700', color: theme.colors.textPrimary, marginBottom: theme.spacing.sm }}>
          Mis citas
        </Text>
        {bookings.length === 0 ? (
          <Text style={{ color: theme.colors.textSecondary }}>Aún no tienes citas agendadas.</Text>
        ) : (
          bookings.map((booking) => (
            <View
              key={booking.id}
              style={{
                borderWidth: 1,
                borderColor: theme.colors.border,
                borderRadius: theme.borderRadius.md,
                padding: theme.spacing.md,
                marginBottom: theme.spacing.sm,
                backgroundColor: theme.colors.card,
              }}
            >
              <Text style={{ fontWeight: '700', color: theme.colors.textPrimary }}>{booking.businessName}</Text>
              <Text style={{ color: theme.colors.textPrimary }}>{booking.serviceName}</Text>
              <Text style={{ color: theme.colors.textSecondary }}>
                {booking.customerName} • {booking.scheduledAt} • {statusLabel[booking.status]}
              </Text>
              <Text style={{ color: theme.colors.textSecondary }}>
                Profesional: {booking.employeeName ?? 'Asignar automáticamente'}
              </Text>
              <View style={{ marginTop: theme.spacing.sm }}>
                <Button title="Actualizar estado" onPress={() => moveBookingStatus(booking)} variant="outline" />
              </View>
            </View>
          ))
        )}
      </Card>
      </View>
    </ScrollView>
  );
}
