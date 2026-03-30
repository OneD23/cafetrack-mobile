const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'El nombre es obligatorio'],
    trim: true
  },
  unit: { 
    type: String, 
    required: true,
    enum: ['g', 'ml', 'unidad', 'oz'],
    default: 'g'
  },
  stock: { 
    type: Number, 
    required: true,
    default: 0,
    min: 0
  },
  minStock: { 
    type: Number, 
    required: true,
    default: 10,
    min: 0
  },
  costPerUnit: { 
    type: Number, 
    required: true,
    default: 0,
    min: 0
  },
  supplier: {
    type: String,
    trim: true
  },
  lastRestocked: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  syncId: {
    type: String,
    unique: true,
    sparse: true
  },
  lastModified: {
    type: Date,
    default: Date.now
  },
  modifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    default: null,
    index: true,
  },
  type: {
    type: String,
    default: 'inventory_item',
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual para valor total del inventario
ingredientSchema.virtual('totalValue').get(function() {
  return this.stock * this.costPerUnit;
});

// Middleware pre-save para actualizar lastModified
ingredientSchema.pre('save', function(next) {
  this.lastModified = Date.now();
  next();
});

// Índices para búsqueda
ingredientSchema.index({ name: 'text' });
ingredientSchema.index({ stock: 1, minStock: 1 }); // Para alertas de stock bajo
ingredientSchema.index({ businessId: 1, name: 1 }, { unique: true, partialFilterExpression: { isActive: true } });

module.exports = mongoose.model('Ingredient', ingredientSchema);
