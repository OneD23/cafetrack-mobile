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
  Platform,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import { addToCart, processSale } from "../store/cartSlice";

const POSScreen: React.FC = () => {
  const dispatch = useDispatch();
  const { items: cartItems, totals } = useSelector((state: any) => state.cart);
  const { products, recipes } = useSelector((state: any) => state.recipes);
  const { ingredients } = useSelector((state: any) => state.inventory);
  
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const hasInventoryData = ingredients.length > 0;

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
  }, [products, recipes, ingredients]);

  const filteredProducts = useMemo(() => {
    return availableProducts.filter((p: any) => {
      const matchesCategory = selectedCategory === "all" || p.category === selectedCategory;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const hasStock = hasInventoryData ? p.stock > 0 : true;
      return p.isActive && matchesCategory && matchesSearch && hasStock;
    });
  }, [availableProducts, selectedCategory, searchQuery, hasInventoryData]);
      return p.isActive && matchesCategory && matchesSearch && p.stock > 0;
    });
  }, [availableProducts, selectedCategory, searchQuery]);

  const handleAddToCart = (product: any) => {
    if (product.stock <= 0) {
      Alert.alert("Sin Stock", "Producto agotado");
      return;
    }
    dispatch(addToCart(product));
  };

  const handleCompleteSale = async () => {
    const saleItems = [...cartItems];
    const saleTotals = { ...totals };

    try {
      const result = await dispatch(processSale({ paymentMethod: "cash" }) as any).unwrap();
      Alert.alert("Venta completada", "Se descontaron ingredientes del inventario.");
      printInvoice(result.saleId, saleItems, saleTotals);
    } catch (error: any) {
      Alert.alert("No se pudo completar", error?.message || "Error al procesar la venta");
    }
  };

  const printInvoice = (saleId: string, items: any[], saleTotals: any) => {
    if (Platform.OS === "web" && typeof window !== "undefined") {
      const rows = items
        .map(
          (item: any) => `
            <tr>
              <td>${item.name}</td>
              <td>${item.quantity}</td>
              <td>$${item.price.toFixed(2)}</td>
              <td>$${(item.price * item.quantity).toFixed(2)}</td>
            </tr>
          `
        )
        .join("");

      const html = `
        <html>
          <head><title>Factura ${saleId}</title></head>
          <body style="font-family: Arial; padding: 20px;">
            <h2>CafeTrack - Factura</h2>
            <p><strong>Folio:</strong> ${saleId}</p>
            <p><strong>Fecha:</strong> ${new Date().toLocaleString()}</p>
            <table border="1" cellspacing="0" cellpadding="8" width="100%">
              <thead><tr><th>Producto</th><th>Cant.</th><th>Precio</th><th>Total</th></tr></thead>
              <tbody>${rows}</tbody>
            </table>
            <h3>Subtotal: $${saleTotals.subtotal.toFixed(2)}</h3>
            <h3>Impuesto: $${saleTotals.tax.toFixed(2)}</h3>
            <h2>Total: $${saleTotals.total.toFixed(2)}</h2>
          </body>
        </html>
      `;

      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
      }
      return;
    }

    Alert.alert("Factura", `Venta ${saleId} registrada. Impresión web no disponible en esta plataforma.`);
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
            <Text style={styles.productStock}>
              Stock: {hasInventoryData ? item.stock : "—"}
            </Text>
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
          <TouchableOpacity style={styles.checkoutButton} onPress={handleCompleteSale}>
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
