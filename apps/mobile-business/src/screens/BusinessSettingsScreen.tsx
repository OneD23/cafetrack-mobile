import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Modal, TextInput, Alert, Switch } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../../mobile-client/src/store/authSlice";
import { setTaxConfig } from "../../../mobile-client/src/store/cartSlice";
import { api } from "../../../mobile-client/src/api/client";
import { businessNetworkService } from "../services/businessNetworkService";

const TAX_SETTINGS_KEY = "settings:tax_enabled";

const BusinessSettingsScreen: React.FC = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: any) => state.auth);
  const { taxEnabled, taxRate } = useSelector((state: any) => state.cart);
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [mode, setMode] = useState<"bootstrap" | "register">("register");
  const [form, setForm] = useState({
    username: "",
    email: "",
    name: "",
    password: "",
    role: "cashier" as "admin" | "manager" | "cashier",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [businessId, setBusinessId] = useState<string | null>(process.env.EXPO_PUBLIC_BUSINESS_ID || null);
  const [isConnectedToNetwork, setIsConnectedToNetwork] = useState(false);
  const [isSyncingNetworkStatus, setIsSyncingNetworkStatus] = useState(false);

  React.useEffect(() => {
    const syncStatus = async () => {
      try {
        setIsSyncingNetworkStatus(true);
        const status = await businessNetworkService.getNetworkStatus(businessId || undefined);
        setBusinessId(status.businessId);
        setIsConnectedToNetwork(status.isConnectedToNetwork);
      } catch (error: any) {
        Alert.alert("Red OneD Hub", error?.message || "No se pudo obtener el estado de conexión.");
      } finally {
        setIsSyncingNetworkStatus(false);
      }
    };

    syncStatus();
  }, []);

  const toggleBusinessNetwork = async (nextValue: boolean) => {
    if (!businessId) {
      Alert.alert("Red OneD Hub", "No se encontró identificador de negocio para actualizar el estado.");
      return;
    }

    try {
      setIsSyncingNetworkStatus(true);
      const status = await businessNetworkService.updateNetworkStatus(businessId, nextValue);
      setIsConnectedToNetwork(status.isConnectedToNetwork);
      Alert.alert(
        "Red OneD Hub",
        status.isConnectedToNetwork
          ? "Tu negocio ahora está visible para clientes en OneD Hub."
          : "Tu negocio dejó de ser visible en OneD Hub, pero tu POS sigue operativo."
      );
    } catch (error: any) {
      Alert.alert("Red OneD Hub", error?.message || "No se pudo actualizar la conexión.");
    } finally {
      setIsSyncingNetworkStatus(false);
    }
  };

  const toggleTaxes = async () => {
    try {
      const next = !taxEnabled;
      dispatch(setTaxConfig({ enabled: next, rate: taxRate || 0.16 }));
      await AsyncStorage.setItem(TAX_SETTINGS_KEY, JSON.stringify({ enabled: next, rate: taxRate || 0.16 }));
      Alert.alert("Impuestos", next ? "Impuestos activados" : "Impuestos desactivados");
    } catch (error: any) {
      Alert.alert("Error", error?.message || "No se pudo actualizar la configuración de impuestos");
    }
  };

  const handleCreateUser = async () => {
    if (!form.username || !form.email || !form.name || !form.password) {
      Alert.alert("Datos incompletos", "Completa todos los campos.");
      return;
    }

    try {
      setIsSaving(true);

      if (mode === "bootstrap") {
        await api.bootstrapAdmin({
          username: form.username,
          email: form.email,
          name: form.name,
          password: form.password,
        });
      } else {
        await api.registerUser(form);
      }

      Alert.alert("Éxito", "Usuario creado correctamente.");
      setForm({
        username: "",
        email: "",
        name: "",
        password: "",
        role: "cashier",
      });
    } catch (error: any) {
      Alert.alert("Error", error?.message || "No fue posible crear el usuario.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>⚙️ Ajustes</Text>
      
      <View style={styles.card}>
        <Text style={styles.name}>{user?.name || "Usuario"}</Text>
        <Text style={styles.role}>
          {user?.role === "admin" ? "Administrador" : "Cajero"}
        </Text>
      </View>

      <TouchableOpacity 
        style={styles.logoutButton} 
        onPress={() => dispatch(logout())}
      >
        <Text style={styles.logoutText}>Cerrar Sesión</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.usersButton}
        onPress={() => {
          if (user?.role !== "admin") {
            Alert.alert("Acceso denegado", "Solo administradores pueden gestionar usuarios.");
            return;
          }
          setShowUsersModal(true);
        }}
      >
        <Text style={styles.usersButtonText}>Gestión de Usuarios</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.taxButton, taxEnabled ? styles.taxButtonOn : styles.taxButtonOff]}
        onPress={toggleTaxes}
      >
        <Text style={styles.taxButtonText}>
          {taxEnabled ? "Desactivar impuestos" : "Activar impuestos"}
        </Text>
        <Text style={styles.taxButtonSub}>
          Estado actual: {taxEnabled ? "ACTIVO" : "INACTIVO"} ({Math.round((taxRate || 0.16) * 100)}%)
        </Text>
      </TouchableOpacity>

      <View style={styles.networkCard}>
        <View style={styles.networkHeader}>
          <View style={{ flex: 1, paddingRight: 12 }}>
            <Text style={styles.networkTitle}>Conectado a la red de OneD Hub</Text>
            <Text style={styles.networkDescription}>
              Al activar esta opción, tu negocio aparecerá en OneD Hub para que los clientes puedan encontrarte,
              ver tus productos o servicios y hacer pedidos desde la app del consumidor final.
            </Text>
            <Text style={styles.networkState}>
              Estado: {isConnectedToNetwork ? "Activo en OneD Hub" : "No visible en OneD Hub"}
            </Text>
          </View>
          <Switch
            value={isConnectedToNetwork}
            onValueChange={toggleBusinessNetwork}
            disabled={isSyncingNetworkStatus}
            thumbColor={isConnectedToNetwork ? "#2ecc71" : "#c0392b"}
            trackColor={{ false: "#6c5c4e", true: "#3b7a57" }}
          />
        </View>
      </View>

      <View style={styles.info}>
        <Text style={styles.version}>CafeTrack v2.0.0</Text>
      </View>

      <Modal visible={showUsersModal} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Crear usuario</Text>

            <View style={styles.switchRow}>
              <TouchableOpacity
                style={[styles.modeBtn, mode === "register" && styles.modeBtnActive]}
                onPress={() => setMode("register")}
              >
                <Text style={styles.modeText}>Registro normal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modeBtn, mode === "bootstrap" && styles.modeBtnActive]}
                onPress={() => setMode("bootstrap")}
              >
                <Text style={styles.modeText}>Bootstrap admin</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Nombre"
              value={form.name}
              onChangeText={(name) => setForm((prev) => ({ ...prev, name }))}
              placeholderTextColor="#8b6f4e"
            />
            <TextInput
              style={styles.input}
              placeholder="Usuario"
              value={form.username}
              onChangeText={(username) => setForm((prev) => ({ ...prev, username }))}
              autoCapitalize="none"
              placeholderTextColor="#8b6f4e"
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={form.email}
              onChangeText={(email) => setForm((prev) => ({ ...prev, email }))}
              autoCapitalize="none"
              placeholderTextColor="#8b6f4e"
            />
            <TextInput
              style={styles.input}
              placeholder="Contraseña"
              value={form.password}
              onChangeText={(password) => setForm((prev) => ({ ...prev, password }))}
              secureTextEntry
              placeholderTextColor="#8b6f4e"
            />

            {mode === "register" && (
              <View style={styles.roleRow}>
                {(["cashier", "manager", "admin"] as const).map((role) => (
                  <TouchableOpacity
                    key={role}
                    style={[styles.roleBtn, form.role === role && styles.roleBtnActive]}
                    onPress={() => setForm((prev) => ({ ...prev, role }))}
                  >
                    <Text style={styles.roleBtnText}>{role}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.secondaryBtn} onPress={() => setShowUsersModal(false)}>
                <Text style={styles.secondaryBtnText}>Cerrar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.primaryBtn} onPress={handleCreateUser} disabled={isSaving}>
                <Text style={styles.primaryBtnText}>{isSaving ? "Guardando..." : "Crear"}</Text>
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
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#f5f1e8",
    padding: 20,
  },
  card: {
    backgroundColor: "#2c1810",
    margin: 15,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#4a3428",
  },
  name: {
    color: "#f5f1e8",
    fontSize: 20,
    fontWeight: "bold",
  },
  role: {
    color: "#d4a574",
    marginTop: 5,
  },
  logoutButton: {
    backgroundColor: "#c0392b",
    margin: 15,
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  usersButton: {
    backgroundColor: "#2c1810",
    marginHorizontal: 15,
    marginTop: 10,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#4a3428",
  },
  usersButtonText: {
    color: "#d4a574",
    fontWeight: "bold",
  },
  taxButton: {
    marginHorizontal: 15,
    marginTop: 10,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#4a3428",
  },
  taxButtonOn: {
    backgroundColor: "#1f6f43",
  },
  taxButtonOff: {
    backgroundColor: "#5b2c2c",
  },
  taxButtonText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  taxButtonSub: {
    color: "#f5f1e8",
    fontSize: 12,
    textAlign: "center",
    marginTop: 4,
  },
  networkCard: {
    backgroundColor: "#2c1810",
    marginHorizontal: 15,
    marginTop: 10,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#4a3428",
  },
  networkHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  networkTitle: {
    color: "#f5f1e8",
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 6,
  },
  networkDescription: {
    color: "#d2b8a3",
    fontSize: 12,
    lineHeight: 18,
  },
  networkState: {
    color: "#d4a574",
    marginTop: 10,
    fontWeight: "700",
  },
  info: {
    alignItems: "center",
    marginTop: 20,
  },
  version: {
    color: "#8b6f4e",
    fontSize: 12,
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
    marginBottom: 10,
  },
  input: {
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
    justifyContent: "space-between",
    marginTop: 8,
    gap: 10,
  },
  secondaryBtn: {
    flex: 1,
    backgroundColor: "#3a2a20",
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
  },
  secondaryBtnText: {
    color: "#f5f1e8",
    fontWeight: "700",
  },
  primaryBtn: {
    flex: 1,
    backgroundColor: "#d4a574",
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
  },
  primaryBtnText: {
    color: "#1a0f0a",
    fontWeight: "700",
  },
  switchRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },
  modeBtn: {
    flex: 1,
    backgroundColor: "#2c1810",
    borderColor: "#4a3428",
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: "center",
  },
  modeBtnActive: {
    borderColor: "#d4a574",
  },
  modeText: {
    color: "#f5f1e8",
    fontSize: 12,
    fontWeight: "600",
  },
  roleRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  roleBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#4a3428",
    backgroundColor: "#2c1810",
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: "center",
  },
  roleBtnActive: {
    borderColor: "#d4a574",
    backgroundColor: "#4a3428",
  },
  roleBtnText: {
    color: "#f5f1e8",
    fontSize: 12,
    fontWeight: "700",
  },
});

export default BusinessSettingsScreen;
