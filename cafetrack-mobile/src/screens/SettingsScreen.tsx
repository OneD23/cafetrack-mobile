import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../store/authSlice";

const SettingsScreen: React.FC = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: any) => state.auth);

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

      <View style={styles.info}>
        <Text style={styles.version}>CafeTrack v2.0.0</Text>
      </View>
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
  info: {
    alignItems: "center",
    marginTop: 20,
  },
  version: {
    color: "#8b6f4e",
    fontSize: 12,
  },
});

export default SettingsScreen;