import React, { useState, useMemo } from "react";
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
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../store/authSlice';
import { api } from '../api/client';

const POSScreen: React.FC = () => {
  const dispatch = useDispatch();
  const { items: cartItems, totals, processingSale } = useSelector((state: any) => state.cart);
  const { products, recipes } = useSelector((state: any) => state.recipes);
  const { ingredients } = useSelector((state: any) => state.inventory);
  
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const hasInventoryData = ingredients.length > 0;
  const categories = useMemo<string[]>(() => {
    const allCategories = Array.from(
      new Set<string>(products.map((p: any) => String(p.category || "")).filter(Boolean))
    );
    return ["all", ...allCategories];
  }, [products]);
>>>>>>> main

  const availableProducts = useMemo(() => {
    return products.map((product: any) => {
      const recipe = recipes.find((r: any) => r.productId === product.id);
      if (!recipe) {
        return { ...product, stock: 9999 };
      }

      if (!hasInventoryData) {
        return { ...product, stock: 9999 };
      }

      const maxFromIngredients = recipe.items.reduce((minQty: number, ri: any) => {
        const ingredient = ingredients.find((ing: any) => ing.id === ri.ingredientId);
        const possible = ingredient ? Math.floor(ingredient.stock / ri.quantity) : 0;
        return Math.min(minQty, possible);
      }, Number.MAX_SAFE_INTEGER);

      return {
        ...product,
        stock: Number.isFinite(maxFromIngredients) ? maxFromIngredients : 0,
      };
    });
  }, [products, recipes, ingredients, hasInventoryData]);

  const filteredProducts = useMemo(() => {
    return availableProducts.filter((p: any) => {
      const matchesCategory = selectedCategory === "all" || p.category === selectedCategory;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const hasStock = hasInventoryData ? p.stock > 0 : true;
      return p.isActive && matchesCategory && matchesSearch && hasStock;
    });
  }, [availableProducts, selectedCategory, searchQuery, hasInventoryData]);

  const handleAddToCart = (product: any) => {
    if (product.stock <= 0) {
      Alert.alert("Sin Stock", "Producto agotado");
      return;
    }
    dispatch(addToCart(product));
  };

  const handleCompleteSale = async () => {
    if (!cartItems.length) {
      Alert.alert("Carrito vacío", "Agrega al menos un producto para continuar.");
      return;
    }
    setShowPaymentModal(true);
  };

  const handleConfirmPayment = async (paymentData: {
    method: "cash" | "card" | "transfer";
    discount: number;
    customer?: { name: string } | null;
  }) => {
    const saleItems = [...cartItems];
    const saleTotals = { ...totals };

    try {
      if (paymentData.discount > 0) {
        dispatch(setDiscount({ type: "fixed", value: paymentData.discount }));
      }

      const result = await dispatch(
        processSale({
          paymentMethod: paymentData.method,
          customerName: paymentData.customer?.name,
        }) as any
      ).unwrap();
      Alert.alert("Venta completada", "Se descontaron ingredientes del inventario.");
      setShowPaymentModal(false);
      printInvoice(result.saleId, saleItems, saleTotals);
    } catch (error: any) {
      Alert.alert("No se pudo completar", error?.message || "Error al procesar la venta");
    }
  };

  const handleBootstrapAdmin = async () => {
    if (!bootstrapForm.username || !bootstrapForm.email || !bootstrapForm.name || !bootstrapForm.password) {
      Alert.alert('Datos incompletos', 'Completa todos los campos para crear el admin');
      return;
    }

    try {
      setCreatingAdmin(true);
      await api.bootstrapAdmin(bootstrapForm);
      Alert.alert('Éxito', 'Admin inicial creado. Ya puedes iniciar sesión.');
      setShowBootstrapModal(false);
      setBootstrapForm({ username: '', email: '', name: '', password: '' });
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'No fue posible crear el admin inicial');
    } finally {
      setCreatingAdmin(false);
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

      <View style={styles.categoriesRow}>
        {categories.map((category) => {
          const isActive = selectedCategory === category;
          return (
            <TouchableOpacity
              key={category}
              style={[styles.categoryChip, isActive && styles.categoryChipActive]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text style={[styles.categoryChipText, isActive && styles.categoryChipTextActive]}>
                {category === "all" ? "Todo" : category}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <FlatList
        data={filteredProducts}
        numColumns={2}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.productsGrid}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>No hay productos para mostrar</Text>
            <Text style={styles.emptyStateSubtitle}>
              Verifica búsqueda, categorías o inventario disponible.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.productCard}
            onPress={() => handleAddToCart(item)}
          >
            <Text style={styles.productIcon}>{item.icon}</Text>
            <Text style={styles.productName}>{item.name}</Text>
            <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
            <Text style={styles.productStock}>
              Stock: {hasInventoryData ? item.stock : "—"}
            </Text>
          </TouchableOpacity>
        )}
      />

          <Text style={styles.hint}>
            Usa tus credenciales del backend
          </Text>

          <TouchableOpacity onPress={() => setShowBootstrapModal(true)}>
            <Text style={styles.bootstrapLink}>Configurar primer usuario</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal visible={showBootstrapModal} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Crear admin inicial</Text>
            <Text style={styles.modalDescription}>
              Este formulario solo funcionará si no existen usuarios en el sistema.
            </Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Nombre"
              placeholderTextColor="#8b6f4e"
              value={bootstrapForm.name}
              onChangeText={(name) => setBootstrapForm((prev) => ({ ...prev, name }))}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Usuario"
              placeholderTextColor="#8b6f4e"
              value={bootstrapForm.username}
              onChangeText={(username) => setBootstrapForm((prev) => ({ ...prev, username }))}
              autoCapitalize="none"
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Email"
              placeholderTextColor="#8b6f4e"
              value={bootstrapForm.email}
              onChangeText={(email) => setBootstrapForm((prev) => ({ ...prev, email }))}
              autoCapitalize="none"
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Contraseña"
              placeholderTextColor="#8b6f4e"
              value={bootstrapForm.password}
              onChangeText={(password) => setBootstrapForm((prev) => ({ ...prev, password }))}
              secureTextEntry
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowBootstrapModal(false)}>
                <Text style={styles.cancelBtnText}>Cerrar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={handleBootstrapAdmin} disabled={creatingAdmin}>
                <Text style={styles.confirmBtnText}>{creatingAdmin ? 'Creando...' : 'Crear admin'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a0f0a",
  },
  header: {
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    color: "#f5f1e8",
    fontSize: 20,
    fontWeight: "bold",
  },
  stats: {
    alignItems: "flex-end",
  },
  stat: {
    color: "#8b6f4e",
    fontSize: 12,
  },
  statTotal: {
    color: "#d4a574",
    fontSize: 18,
    fontWeight: "bold",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2c1810",
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#4a3428",
  },
  searchInput: {
    flex: 1,
    padding: 12,
    color: "#f5f1e8",
    fontSize: 16,
  },
  categoriesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  categoryChip: {
    backgroundColor: "#2c1810",
    borderColor: "#4a3428",
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  categoryChipActive: {
    backgroundColor: "#d4a574",
    borderColor: "#d4a574",
  },
  categoryChipText: {
    color: "#d4a574",
    fontSize: 12,
    textTransform: "capitalize",
    fontWeight: "600",
  },
  categoryChipTextActive: {
    color: "#1a0f0a",
  },
  productsGrid: {
    padding: 8,
    paddingBottom: 300,
  },
  emptyState: {
    marginTop: 28,
    alignItems: "center",
    paddingHorizontal: 16,
  },
  emptyStateTitle: {
    color: "#f5f1e8",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
  emptyStateSubtitle: {
    marginTop: 6,
    color: "#8b6f4e",
    fontSize: 13,
    textAlign: "center",
  },
  productCard: {
    flex: 1,
    backgroundColor: "#2c1810",
    margin: 6,
    borderRadius: 16,
    padding: 15,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#4a3428",
    maxWidth: "47%",
  },
  productIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  productName: {
    color: "#f5f1e8",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  productPrice: {
    color: "#d4a574",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 5,
  },
  productStock: {
    color: "#8b6f4e",
    fontSize: 11,
    marginTop: 4,
  },
  cartSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#1a0f0a",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderTopWidth: 3,
    borderTopColor: "#d4a574",
    padding: 20,
    paddingBottom: 30,
    maxHeight: 400,
  },
  cartTitle: {
    color: "#f5f1e8",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  cartTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  clearCart: {
    color: "#d96d61",
    fontWeight: "700",
  },
  cartItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    alignItems: "center",
  },
  cartItemLeft: {
    flex: 1,
  },
  cartItemRight: {
    alignItems: "flex-end",
    gap: 8,
  },
  cartItemName: {
    color: "#f5f1e8",
  },
  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 5,
  },
  qtyBtn: {
    backgroundColor: "#2c1810",
    borderColor: "#4a3428",
    borderWidth: 1,
    borderRadius: 8,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyBtnText: {
    color: "#d4a574",
    fontWeight: "700",
  },
  qtyValue: {
    color: "#f5f1e8",
    fontWeight: "700",
    minWidth: 16,
    textAlign: "center",
  },
  cartItemPrice: {
    color: "#d4a574",
  },
  cartTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#4a3428",
  },
  cartTotalLabel: {
    color: "#f5f1e8",
    fontSize: 16,
    fontWeight: "bold",
  },
  cartTotalValue: {
    color: "#27ae60",
    fontSize: 24,
    fontWeight: "bold",
  },
  checkoutButton: {
    backgroundColor: "#d4a574",
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
    marginTop: 15,
  },
  checkoutText: {
    color: "#1a0f0a",
    fontSize: 18,
    fontWeight: "bold",
  },
  hint: {
    color: "#8b6f4e",
    textAlign: "center",
    marginTop: 20,
    fontSize: 12,
  },
  bootstrapLink: {
    color: "#d4a574",
    textAlign: "center",
    marginTop: 12,
    textDecorationLine: "underline",
    fontSize: 13,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: {
    backgroundColor: "#1a0f0a",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#4a3428",
  },
  modalTitle: {
    color: "#f5f1e8",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
  },
  modalDescription: {
    color: "#d8c6b2",
    marginBottom: 12,
    fontSize: 13,
  },
  modalInput: {
    backgroundColor: "#2c1810",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#f5f1e8",
    borderWidth: 1,
    borderColor: "#4a3428",
    marginBottom: 10,
  },
  modalActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: "#3a2a20",
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
  },
  cancelBtnText: {
    color: "#f5f1e8",
    fontWeight: "700",
  },
  confirmBtn: {
    flex: 1,
    backgroundColor: "#d4a574",
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
  },
  confirmBtnText: {
    color: "#1a0f0a",
    fontWeight: "700",
  },
});

export default LoginScreen;
