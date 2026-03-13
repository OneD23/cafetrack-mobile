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
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import { addToCart, removeFromCart, updateQuantity, clearCart } from "../store/cartSlice";

const defaultProducts = [
  { id: "1", name: "Espresso", price: 2.50, cost: 0.80, category: "coffee", icon: "☕", stock: 100, minStock: 20 },
  { id: "2", name: "Cappuccino", price: 3.50, cost: 1.20, category: "coffee", icon: "☕", stock: 100, minStock: 20 },
  { id: "3", name: "Latte", price: 3.75, cost: 1.30, category: "coffee", icon: "☕", stock: 100, minStock: 20 },
  { id: "4", name: "Croissant", price: 2.75, cost: 1.00, category: "pastry", icon: "🥐", stock: 50, minStock: 10 },
  { id: "5", name: "Muffin", price: 3.25, cost: 1.20, category: "pastry", icon: "🧁", stock: 40, minStock: 10 },
  { id: "6", name: "Té Helado", price: 2.50, cost: 0.70, category: "drink", icon: "🧊", stock: 80, minStock: 15 },
  { id: "7", name: "Sandwich", price: 5.50, cost: 2.50, category: "food", icon: "🥪", stock: 30, minStock: 5 },
];

const POSScreen: React.FC = () => {
  const dispatch = useDispatch();
  const { items: cartItems, totals } = useSelector((state: any) => state.cart);
  
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [products] = useState(defaultProducts);

  const filteredProducts = useMemo(() => {
    return products.filter((p: any) => {
      const matchesCategory = selectedCategory === "all" || p.category === selectedCategory;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch && p.stock > 0;
    });
  }, [products, selectedCategory, searchQuery]);

  const handleAddToCart = (product: any) => {
    if (product.stock <= 0) {
      Alert.alert("Sin Stock", "Producto agotado");
      return;
    }
    dispatch(addToCart(product));
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

      <FlatList
        data={filteredProducts}
        numColumns={2}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.productsGrid}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.productCard}
            onPress={() => handleAddToCart(item)}
          >
            <Text style={styles.productIcon}>{item.icon}</Text>
            <Text style={styles.productName}>{item.name}</Text>
            <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
            <Text style={styles.productStock}>Stock: {item.stock}</Text>
          </TouchableOpacity>
        )}
      />

      {cartItems.length > 0 && (
        <View style={styles.cartSheet}>
          <Text style={styles.cartTitle}>🛒 Carrito ({cartItems.length})</Text>
          {cartItems.map((item: any) => (
            <View key={item.id} style={styles.cartItem}>
              <Text style={styles.cartItemName}>{item.name} x{item.quantity}</Text>
              <Text style={styles.cartItemPrice}>${(item.price * item.quantity).toFixed(2)}</Text>
            </View>
          ))}
          <View style={styles.cartTotal}>
            <Text style={styles.cartTotalLabel}>TOTAL</Text>
            <Text style={styles.cartTotalValue}>${totals.total.toFixed(2)}</Text>
          </View>
          <TouchableOpacity style={styles.checkoutButton} onPress={() => dispatch(clearCart())}>
            <Text style={styles.checkoutText}>COMPLETAR VENTA</Text>
          </TouchableOpacity>
        </View>
      )}
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
  productsGrid: {
    padding: 8,
    paddingBottom: 300,
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
  cartItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  cartItemName: {
    color: "#f5f1e8",
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
});

export default POSScreen;