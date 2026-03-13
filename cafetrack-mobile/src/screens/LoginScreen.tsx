import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../store/authSlice';

const LoginScreen: React.FC = () => {
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state: any) => state.auth);
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Por favor ingresa usuario y contraseña');
      return;
    }

    try {
      await dispatch(loginUser({ username, password }) as any);
    } catch (error) {
      Alert.alert('Error', 'Credenciales inválidas');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoEmoji}>☕</Text>
          <Text style={styles.logoTitle}>CafeTrack</Text>
          <Text style={styles.logoSubtitle}>MOBILE POS</Text>
        </View>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Usuario"
            placeholderTextColor="#8b6f4e"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            editable={!isLoading}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            placeholderTextColor="#8b6f4e"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!isLoading}
          />

          <TouchableOpacity 
            style={[styles.button, isLoading && styles.buttonDisabled]} 
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#1a0f0a" />
            ) : (
              <Text style={styles.buttonText}>INICIAR SESIÓN</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.hint}>
            Usuario: admin | Contraseña: admin
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a0f0a",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    padding: 30,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 50,
  },
  logoEmoji: {
    fontSize: 80,
    marginBottom: 10,
  },
  logoTitle: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#f5f1e8",
  },
  logoSubtitle: {
    fontSize: 18,
    color: "#d4a574",
    letterSpacing: 3,
  },
  form: {
    width: "100%",
  },
  input: {
    backgroundColor: "#2c1810",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    color: "#f5f1e8",
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#4a3428",
  },
  button: {
    backgroundColor: "#d4a574",
    borderRadius: 12,
    padding: 18,
    alignItems: "center",
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
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
});

export default LoginScreen;