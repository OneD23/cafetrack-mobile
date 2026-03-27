import React, { useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import {
  addToCart,
  removeFromCart,
  updateQuantity,
  processSale,
} from '../store/cartSlice';
import { PaymentModal } from '../components/PaymentModal';
import { fetchProducts } from '../store/recipesSlice';

const POSScreen: React.FC = () => {
  const dispatch = useDispatch<any>();
  const { items: cartItems, totals, processingSale } = useSelector((state: any) => state.cart);
  const { products = [] } = useSelector((state: any) => state.recipes);

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [cashRegister, setCashRegister] = useState({
    isOpen: false,
    openingAmount: 0,
  });

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const categories = useMemo(() => {
    const unique = new Set<string>();
    products.forEach((p: any) => {
      if (p?.category) unique.add(String(p.category));
    });
    return ['all', ...Array.from(unique)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p: any) => {
      const matchesCategory =
        selectedCategory === 'all' || String(p.category) === selectedCategory;
      const matchesSearch = String(p.name || '')
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const isActive = p.isActive !== false;
      return matchesCategory && matchesSearch && isActive;
    });
  }, [products, selectedCategory, searchQuery]);

  const handleOpenRegister = () => {
    setCashRegister({ isOpen: true, openingAmount: 0 });
  };

  const handleCloseRegister = () => {
    setCashRegister({ isOpen: false, openingAmount: 0 });
  };

  const handleAddToCart = (product: any) => {
    if (!cashRegister.isOpen) {
      Alert.alert('Caja cerrada', 'Debes abrir la caja antes de vender.');
      return;
    }

    dispatch(addToCart(product));
  };

  const handleCheckout = () => {
    if (!cashRegister.isOpen) {
      Alert.alert('Caja cerrada', 'Debes abrir la caja antes de completar una venta.');
      return;
    }

    if (!cartItems.length) {
      Alert.alert('Carrito vacío', 'Agrega productos antes de cobrar.');
      return;
    }

    setShowPaymentModal(true);
  };

  const handleConfirmPayment = async (data: any) => {
    const soldItems = cartItems.map((item: any) => ({ ...item }));

    const printTicket = (sale: any) => {
      const saleId = sale?.saleId || 'N/A';
      const createdAt = sale?.createdAt ? new Date(sale.createdAt).toLocaleString() : new Date().toLocaleString();
      const lines = soldItems
        .map((item: any) => `${item.quantity} x ${item.name}  $${(Number(item.price || 0) * Number(item.quantity || 0)).toFixed(2)}`)
        .join('\n');
      const ticketText = [
        '☕ CAFE TRACK',
        `Ticket: ${saleId}`,
        `Fecha: ${createdAt}`,
        '----------------------',
        lines,
        '----------------------',
        `Subtotal: $${Number(totals.subtotal || 0).toFixed(2)}`,
        `IVA: $${Number(totals.tax || 0).toFixed(2)}`,
        `Total: $${Number(totals.total || 0).toFixed(2)}`,
        `Pago: ${data?.method || 'cash'}`,
      ].join('\n');

      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        const printWindow = window.open('', '_blank', 'width=380,height=600');
        if (printWindow) {
          printWindow.document.write(`<pre style="font-family: monospace; font-size: 14px; padding: 16px;">${ticketText}</pre>`);
          printWindow.document.close();
          printWindow.focus();
          printWindow.print();
          return;
        }
      }

      Alert.alert('Ticket de venta', ticketText);
    };

    try {
      const response = await dispatch(
        processSale({
          paymentMethod: data?.method || 'cash',
          customerName: data?.customer?.name || undefined,
          discount: Number(data?.discount || 0),
        })
      ).unwrap();

      setShowPaymentModal(false);
      printTicket(response?.data);
      Alert.alert('Venta completada', 'La venta se registró correctamente.');
    } catch (error: any) {
      const message = String(error?.message || 'No se pudo completar la venta.');
      if (message.toLowerCase().includes('stock insuficiente')) {
        Alert.alert(
          'Stock insuficiente',
          `${message}\n\nTip: repón ingredientes desde Inventario antes de volver a cobrar.`
        );
        return;
      }

      Alert.alert('Error al vender', message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a0f0a" />

      <View style={styles.header}>
        <Text style={styles.title}>☕ CafeTrack POS</Text>
        <View style={styles.stats}>
          <Text style={styles.stat}>Items: {cartItems.length}</Text>
          <Text style={styles.statTotal}>${totals.total.toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.cashBox}>
        <Text style={styles.cashLabel}>
          {cashRegister.isOpen ? 'Caja abierta' : 'Caja cerrada'}
        </Text>
        <TouchableOpacity
          style={[
            styles.cashBtn,
            cashRegister.isOpen ? styles.cashBtnClose : styles.cashBtnOpen,
          ]}
          onPress={cashRegister.isOpen ? handleCloseRegister : handleOpenRegister}
        >
          <Text style={styles.cashBtnText}>
            {cashRegister.isOpen ? 'Cerrar caja' : 'Abrir caja'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#8b6f4e" />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar producto..."
          placeholderTextColor="#8b6f4e"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesRow}>
        {categories.map((category) => {
          const isActive = selectedCategory === category;
          return (
            <TouchableOpacity
              key={category}
              style={[styles.categoryChip, isActive && styles.categoryChipActive]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  isActive && styles.categoryChipTextActive,
                ]}
              >
                {category === 'all' ? 'Todo' : category}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <FlatList
        data={filteredProducts}
        numColumns={2}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.productsGrid}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.productCard} onPress={() => handleAddToCart(item)}>
            <Text style={styles.productIcon}>{item.icon || '☕'}</Text>
            <Text style={styles.productName}>{item.name}</Text>
            <Text style={styles.productPrice}>${Number(item.price || 0).toFixed(2)}</Text>
          </TouchableOpacity>
        )}
      />

      {cartItems.length > 0 && (
        <View style={styles.cartSheet}>
          <Text style={styles.cartTitle}>🛒 Carrito ({cartItems.length})</Text>

          <ScrollView style={{ maxHeight: 160 }}>
            {cartItems.map((item: any) => (
              <View key={String(item.id)} style={styles.cartItem}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cartItemName}>{item.name}</Text>
                  <View style={styles.qtyRow}>
                    <TouchableOpacity
                      style={styles.qtyBtn}
                      onPress={() =>
                        item.quantity <= 1
                          ? dispatch(removeFromCart(String(item.id)))
                          : dispatch(updateQuantity({ id: String(item.id), qty: item.quantity - 1 }))
                      }
                    >
                      <Text style={styles.qtyBtnText}>-</Text>
                    </TouchableOpacity>

                    <Text style={styles.qtyValue}>{item.quantity}</Text>

                    <TouchableOpacity
                      style={styles.qtyBtn}
                      onPress={() =>
                        dispatch(updateQuantity({ id: String(item.id), qty: item.quantity + 1 }))
                      }
                    >
                      <Text style={styles.qtyBtnText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <Text style={styles.cartItemPrice}>
                  ${(Number(item.price || 0) * Number(item.quantity || 0)).toFixed(2)}
                </Text>
              </View>
            ))}
          </ScrollView>

          <View style={styles.cartTotal}>
            <Text style={styles.cartTotalLabel}>TOTAL</Text>
            <Text style={styles.cartTotalValue}>${totals.total.toFixed(2)}</Text>
          </View>

          <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
            <Text style={styles.checkoutText}>
              {processingSale ? 'PROCESANDO...' : 'COMPLETAR VENTA'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <PaymentModal
        visible={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onConfirm={handleConfirmPayment}
        total={totals.total}
        loading={processingSale}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a0f0a' },
  header: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { color: '#f5f1e8', fontSize: 20, fontWeight: 'bold' },
  stats: { alignItems: 'flex-end' },
  stat: { color: '#8b6f4e', fontSize: 12 },
  statTotal: { color: '#d4a574', fontSize: 18, fontWeight: 'bold' },
  cashBox: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: '#2c1810',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#4a3428',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cashLabel: { color: '#f5f1e8', fontSize: 13, flex: 1, marginRight: 12 },
  cashBtn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 },
  cashBtnOpen: { backgroundColor: '#27ae60' },
  cashBtnClose: { backgroundColor: '#c0392b' },
  cashBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2c1810',
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#4a3428',
  },
  searchInput: { flex: 1, padding: 12, color: '#f5f1e8', fontSize: 16 },
  categoriesRow: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 8,
  },
  categoryChip: {
    backgroundColor: '#2c1810',
    borderColor: '#4a3428',
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  categoryChipActive: {
    backgroundColor: '#d4a574',
    borderColor: '#d4a574',
  },
  categoryChipText: {
    color: '#d4a574',
    fontSize: 12,
    textTransform: 'capitalize',
    fontWeight: '600',
  },
  categoryChipTextActive: {
    color: '#1a0f0a',
  },
  productsGrid: { padding: 8, paddingBottom: 320 },
  productCard: {
    flex: 1,
    backgroundColor: '#2c1810',
    margin: 6,
    borderRadius: 16,
    padding: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4a3428',
    maxWidth: '47%',
  },
  productIcon: { fontSize: 40, marginBottom: 8 },
  productName: {
    color: '#f5f1e8',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  productPrice: { color: '#d4a574', fontSize: 18, fontWeight: 'bold', marginTop: 5 },
  cartSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1a0f0a',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderTopWidth: 3,
    borderTopColor: '#d4a574',
    padding: 20,
    paddingBottom: 30,
    maxHeight: 420,
  },
  cartTitle: { color: '#f5f1e8', fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    alignItems: 'center',
  },
  cartItemName: { color: '#f5f1e8', fontWeight: '600' },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  qtyBtn: {
    backgroundColor: '#2c1810',
    borderColor: '#4a3428',
    borderWidth: 1,
    borderRadius: 8,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnText: { color: '#d4a574', fontWeight: '700' },
  qtyValue: { color: '#f5f1e8', fontWeight: '700', minWidth: 18, textAlign: 'center' },
  cartItemPrice: { color: '#d4a574', fontWeight: '700' },
  cartTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#4a3428',
  },
  cartTotalLabel: { color: '#f5f1e8', fontSize: 16, fontWeight: 'bold' },
  cartTotalValue: { color: '#27ae60', fontSize: 24, fontWeight: 'bold' },
  checkoutButton: {
    backgroundColor: '#d4a574',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginTop: 15,
  },
  checkoutText: { color: '#1a0f0a', fontSize: 18, fontWeight: 'bold' },
});

export default POSScreen;
