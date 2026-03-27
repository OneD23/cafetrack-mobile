import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../api/client';

const CustomersScreen: React.FC = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [name, setName] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [historyModal, setHistoryModal] = useState(false);
  const [historyData, setHistoryData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const loadCustomers = useCallback(async (term?: string) => {
    try {
      setLoading(true);
      const response = await api.getCustomers(term || '');
      setCustomers(response?.data || []);
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'No se pudieron cargar clientes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const handleCreateCustomer = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'El nombre del cliente es obligatorio');
      return;
    }

    try {
      const response = await api.createCustomer({
        customerId: customerId.trim() || undefined,
        name: name.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
      });

      const created = response?.data;
      if (created) {
        setCustomers((prev) => [created, ...prev]);
      }

      setName('');
      setCustomerId('');
      setEmail('');
      setPhone('');
      setAddress('');
      Alert.alert('Cliente creado', `ID: ${created?.customerId || 'generado automáticamente'}`);
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'No se pudo crear el cliente');
    }
  };

  const openHistory = async (customer: any) => {
    try {
      const response = await api.getCustomerHistory(String(customer.id || customer._id));
      setHistoryData(response?.data || null);
      setHistoryModal(true);
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'No se pudo cargar historial');
    }
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return customers.filter((c) =>
      `${c.customerId || ''} ${c.name || ''} ${c.email || ''}`.toLowerCase().includes(q)
    );
  }, [customers, search]);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>👥 Clientes</Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Nuevo cliente</Text>
        <TextInput
          style={styles.input}
          placeholder="ID cliente (opcional)"
          placeholderTextColor="#8b6f4e"
          value={customerId}
          onChangeText={setCustomerId}
        />
        <TextInput
          style={styles.input}
          placeholder="Nombre *"
          placeholderTextColor="#8b6f4e"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Correo (opcional)"
          placeholderTextColor="#8b6f4e"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Teléfono (opcional)"
          placeholderTextColor="#8b6f4e"
          value={phone}
          onChangeText={setPhone}
        />
        <TextInput
          style={styles.input}
          placeholder="Dirección (opcional)"
          placeholderTextColor="#8b6f4e"
          value={address}
          onChangeText={setAddress}
        />

        <TouchableOpacity style={styles.createBtn} onPress={handleCreateCustomer}>
          <Text style={styles.createBtnText}>Guardar cliente</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchRow}>
        <Ionicons name="search" size={18} color="#8b6f4e" />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar cliente por ID, nombre o email..."
          placeholderTextColor="#8b6f4e"
          value={search}
          onChangeText={(value) => {
            setSearch(value);
            loadCustomers(value);
          }}
        />
      </View>

      <FlatList
        data={filtered}
        refreshing={loading}
        onRefresh={() => loadCustomers(search)}
        keyExtractor={(item) => String(item.id || item._id)}
        contentContainerStyle={{ paddingBottom: 30 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.customerRow} onPress={() => openHistory(item)}>
            <View style={{ flex: 1 }}>
              <Text style={styles.customerName}>{item.name}</Text>
              <Text style={styles.customerMeta}>ID: {item.customerId}</Text>
              {item.email ? <Text style={styles.customerMeta}>{item.email}</Text> : null}
            </View>
            <Ionicons name="receipt-outline" size={20} color="#d4a574" />
          </TouchableOpacity>
        )}
      />

      <Modal visible={historyModal} animationType="slide" onRequestClose={() => setHistoryModal(false)}>
        <SafeAreaView style={styles.container}>
          <View style={styles.historyHeader}>
            <Text style={styles.title}>🧾 Historial</Text>
            <TouchableOpacity onPress={() => setHistoryModal(false)}>
              <Ionicons name="close" size={28} color="#f5f1e8" />
            </TouchableOpacity>
          </View>

          <ScrollView>
            <Text style={styles.sectionTitle}>
              {historyData?.customer?.name} ({historyData?.customer?.customerId})
            </Text>
            <Text style={styles.historyStat}>
              Compras: {historyData?.totals?.sales || 0} | Total: $
              {Number(historyData?.totals?.total || 0).toFixed(2)} | Ticket promedio: $
              {Number(historyData?.totals?.averageTicket || 0).toFixed(2)}
            </Text>

            {(historyData?.sales || []).map((sale: any) => (
              <View key={String(sale.id || sale._id)} style={styles.saleCard}>
                <Text style={styles.saleTitle}>
                  {sale.saleId} - ${Number(sale.total || 0).toFixed(2)}
                </Text>
                <Text style={styles.customerMeta}>
                  {new Date(sale.createdAt).toLocaleString()}
                </Text>
              </View>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a0f0a', padding: 16 },
  title: { color: '#f5f1e8', fontSize: 24, fontWeight: '700', marginBottom: 12 },
  card: { backgroundColor: '#2c1810', borderRadius: 16, padding: 12, marginBottom: 12 },
  sectionTitle: { color: '#d4a574', fontSize: 16, fontWeight: '700', marginBottom: 8 },
  input: {
    backgroundColor: '#1a0f0a',
    borderColor: '#4a3428',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    color: '#f5f1e8',
    marginBottom: 8,
  },
  createBtn: { backgroundColor: '#27ae60', borderRadius: 10, padding: 12, alignItems: 'center' },
  createBtnText: { color: '#fff', fontWeight: '700' },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#4a3428',
    borderRadius: 12,
    backgroundColor: '#2c1810',
    paddingHorizontal: 10,
    marginBottom: 12,
  },
  searchInput: { flex: 1, color: '#f5f1e8', paddingVertical: 10 },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2c1810',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  customerName: { color: '#f5f1e8', fontWeight: '700', fontSize: 15 },
  customerMeta: { color: '#c9b39b', marginTop: 2 },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  historyStat: { color: '#c9b39b', marginBottom: 12 },
  saleCard: { backgroundColor: '#2c1810', borderRadius: 12, padding: 10, marginBottom: 8 },
  saleTitle: { color: '#f5f1e8', fontWeight: '700' },
});

export default CustomersScreen;
