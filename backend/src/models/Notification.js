const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['delivery_order', 'system', 'inventory'],
      default: 'delivery_order',
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    message: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    orderNumber: {
      type: String,
      trim: true,
      maxlength: 40,
    },
    driverName: {
      type: String,
      trim: true,
      maxlength: 120,
    },
    customerName: {
      type: String,
      trim: true,
      maxlength: 120,
    },
    customerPhone: {
      type: String,
      trim: true,
      maxlength: 40,
    },
    deliveryAddress: {
      type: String,
      trim: true,
      maxlength: 220,
    },
    status: {
      type: String,
      enum: ['new', 'in_progress', 'completed', 'cancelled'],
      default: 'new',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    source: {
      type: String,
      trim: true,
      maxlength: 80,
      default: 'external-app',
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

notificationSchema.index({ createdAt: -1, isActive: 1, status: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
