const mongoose = require('mongoose');

let listenersRegistered = false;
let disconnectWarnTimer = null;

const clearDisconnectWarn = () => {
  if (disconnectWarnTimer) {
    clearTimeout(disconnectWarnTimer);
    disconnectWarnTimer = null;
  }
};

const registerConnectionListeners = () => {
  if (listenersRegistered) return;
  listenersRegistered = true;

  mongoose.connection.on('connected', () => {
    clearDisconnectWarn();
    console.log(`✅ MongoDB conectado (${mongoose.connection.host})`);
  });

  mongoose.connection.on('reconnected', () => {
    clearDisconnectWarn();
    console.log('♻️ MongoDB reconectado');
  });

  mongoose.connection.on('error', (err) => {
    console.error(`❌ Error de MongoDB: ${err.message}`);
  });

  mongoose.connection.on('disconnected', () => {
    // Evita ruido por micro-cortes/transiciones internas del driver.
    clearDisconnectWarn();
    disconnectWarnTimer = setTimeout(() => {
      console.warn('⚠️ MongoDB sigue desconectado por más de 5s');
    }, 5000);
  });
};

const connectDB = async () => {
  try {
    registerConnectionListeners();

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 15,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    console.log(`✅ MongoDB Atlas Conectado: ${conn.connection.host}`);
    clearDisconnectWarn();
    return conn;
  } catch (error) {
    console.error(`❌ Error de conexión: ${error.message}`);
    throw error;
  }
};

module.exports = connectDB;
