const mongoose = require('mongoose');

const generateCustomerId = () => {
  const date = new Date();
  const prefix = `CUST-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
  const suffix = `${Date.now().toString().slice(-5)}${Math.floor(Math.random() * 90 + 10)}`;
  return `${prefix}-${suffix}`;
};

const customerSchema = new mongoose.Schema(
  {
    customerId: {
      type: String,
      unique: true,
      required: true,
      default: generateCustomerId,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Customer', customerSchema);
