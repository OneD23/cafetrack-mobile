const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true,
    },
    type: {
      type: String,
      enum: ['cafe', 'colmado', 'ferreteria', 'barberia', 'salon', 'nails_studio', 'supermercado', 'general'],
      default: 'general',
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended'],
      default: 'active',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },
    address: {
      type: String,
      trim: true,
      default: '',
    },
    logoUrl: {
      type: String,
      default: '',
    },
    settings: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    enabledModules: {
      type: [String],
      default: ['pos', 'inventory', 'reports'],
    },
    description: {
      type: String,
      default: '',
    },
    ownerUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    category: {
      type: String,
      default: 'general',
    },
    rating: {
      type: Number,
      default: 4.5,
    },
    etaMinutes: {
      type: Number,
      default: 35,
    },
    distanceKm: {
      type: Number,
      default: 2,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isConnectedToNetwork: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

businessSchema.pre('save', function preSave(next) {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

module.exports = mongoose.model('Business', businessSchema);
