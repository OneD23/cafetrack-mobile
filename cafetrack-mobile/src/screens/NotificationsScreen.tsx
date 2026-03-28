import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../api/client';

const NotificationsScreen: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [search, setSearch] = useState('');

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.getNotifications({
        unreadOnly: showUnreadOnly,
      });
      setNotifications(response?.data || []);
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'No se pudieron cargar notificaciones');
    } finally {
      setLoading(false);
    }
  }, [showUnreadOnly]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return notifications;
    return notifications.filter((item) =>
      `${item.title || ''} ${item.message || ''} ${item.orderNumber || ''} ${item.driverName || ''} ${item.customerName || ''}`
        .toLowerCase()
        .includes(q)
    );
  }, [notifications, search]);

  const markAsRead = async (item: any) => {
    try {
      const id = String(item.id || item._id);
      await api.updateNotification(id, { isRead: true });
      setNotifications((prev) => prev.map((n) => (String(n.id || n._id) === id ? { ...n, isRead: true } : n)));
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'No se pudo marcar como leída');
    }
  };

  const updateStatus = async (item: any, status: 'in_progress' | 'completed') => {
    try {
      const id = String(item.id || item._id);
      await api.updateNotification(id, { status, isRead: true });
      setNotifications((prev) =>
        prev.map((n) => (String(n.id || n._id) === id ? { ...n, status, isRead: true } : n))
      );
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'No se pudo actualizar el estado');
    }
  };

  const renderStatus = (status: string) => {
    if (status === 'completed') return '✅ Completado';
    if (status === 'in_progress') return '🛵 En progreso';
    if (status === 'cancelled') return '❌ Cancelado';
    return '🆕 Nuevo';
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>🔔 Notificaciones</Text>
        <TouchableOpacity style={styles.refreshBtn} onPress={loadNotifications}>
          <Ionicons name="refresh" size={18} color="#1a0f0a" />
        </TouchableOpacity>
      </View>

      <View style={styles.filterRow}>
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar por pedido, repartidor o cliente..."
          placeholderTextColor="#8b6f4e"
        />
        <TouchableOpacity
          style={[styles.unreadBtn, showUnreadOnly && styles.unreadBtnActive]}
          onPress={() => setShowUnreadOnly((v) => !v)}
        >
          <Text style={[styles.unreadBtnText, showUnreadOnly && styles.unreadBtnTextActive]}>
            Solo no leídas
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id || item._id)}
        refreshing={loading}
        onRefresh={loadNotifications}
        contentContainerStyle={{ paddingBottom: 30 }}
        ListEmptyComponent={<Text style={styles.emptyText}>Sin notificaciones por ahora.</Text>}
        renderItem={({ item }) => (
          <View style={[styles.card, !item.isRead && styles.cardUnread]}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{item.title || 'Notificación'}</Text>
              <Text style={styles.cardStatus}>{renderStatus(item.status)}</Text>
            </View>
            {item.message ? <Text style={styles.cardMessage}>{item.message}</Text> : null}

            <Text style={styles.metaLine}>Pedido: {item.orderNumber || 'N/A'}</Text>
            <Text style={styles.metaLine}>Repartidor: {item.driverName || 'Pendiente'}</Text>
            <Text style={styles.metaLine}>Cliente: {item.customerName || 'N/A'}</Text>
            <Text style={styles.metaLine}>Dirección: {item.deliveryAddress || 'N/A'}</Text>
            <Text style={styles.metaLine}>Teléfono: {item.customerPhone || 'N/A'}</Text>

            <View style={styles.actionsRow}>
              {!item.isRead ? (
                <TouchableOpacity style={styles.actionBtn} onPress={() => markAsRead(item)}>
                  <Text style={styles.actionBtnText}>Marcar leída</Text>
                </TouchableOpacity>
              ) : null}

              {item.status !== 'in_progress' && item.status !== 'completed' ? (
                <TouchableOpacity
                  style={[styles.actionBtn, styles.actionBlue]}
                  onPress={() => updateStatus(item, 'in_progress')}
                >
                  <Text style={styles.actionBtnText}>Tomar pedido</Text>
                </TouchableOpacity>
              ) : null}

              {item.status !== 'completed' ? (
                <TouchableOpacity
                  style={[styles.actionBtn, styles.actionGreen]}
                  onPress={() => updateStatus(item, 'completed')}
                >
                  <Text style={styles.actionBtnText}>Completar</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a0f0a', padding: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  title: { color: '#f5f1e8', fontSize: 24, fontWeight: '700' },
  refreshBtn: {
    backgroundColor: '#d4a574',
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterRow: { marginBottom: 12, gap: 8 },
  searchInput: {
    backgroundColor: '#2c1810',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#4a3428',
    color: '#f5f1e8',
    padding: 10,
  },
  unreadBtn: {
    borderWidth: 1,
    borderColor: '#4a3428',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    backgroundColor: '#2c1810',
  },
  unreadBtnActive: { backgroundColor: '#d4a574', borderColor: '#d4a574' },
  unreadBtnText: { color: '#c9b39b', fontWeight: '700' },
  unreadBtnTextActive: { color: '#1a0f0a' },
  emptyText: { color: '#c9b39b', textAlign: 'center', marginTop: 30 },
  card: {
    backgroundColor: '#2c1810',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4a3428',
    padding: 12,
    marginBottom: 10,
  },
  cardUnread: { borderColor: '#d4a574' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6, gap: 8 },
  cardTitle: { color: '#f5f1e8', fontWeight: '700', flex: 1 },
  cardStatus: { color: '#d4a574', fontWeight: '700' },
  cardMessage: { color: '#d9c8b1', marginBottom: 8 },
  metaLine: { color: '#c9b39b', fontSize: 12, marginBottom: 2 },
  actionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  actionBtn: {
    backgroundColor: '#4a3428',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  actionBlue: { backgroundColor: '#2e86c1' },
  actionGreen: { backgroundColor: '#27ae60' },
  actionBtnText: { color: '#fff', fontWeight: '700', fontSize: 12 },
});

export default NotificationsScreen;
