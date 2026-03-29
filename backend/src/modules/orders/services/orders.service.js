const mongoose = require('mongoose');
const Order = require('../../../models/Order');
const Business = require('../../../models/Business');

const ALLOWED_STATUS = ['pending', 'accepted', 'preparing', 'ready', 'cancelled'];

const serializeOrder = (order) => ({
  id: order._id,
  userId: order.userId,
  businessId: String(order.businessId?._id || order.businessId),
  businessName: order.businessId?.name,
  items: order.items,
  subtotal: order.subtotal,
  tax: order.tax,
  total: order.total,
  status: order.status,
  notes: order.notes,
  createdAt: order.createdAt,
  updatedAt: order.updatedAt,
});

const createOrder = async (payload) => {
  const { userId, businessId, items = [], notes = '' } = payload;

  if (!userId || !businessId || !Array.isArray(items) || items.length === 0) {
    throw new Error('Payload de pedido inválido');
  }

  if (!mongoose.Types.ObjectId.isValid(businessId)) {
    throw new Error('businessId inválido');
  }

  const business = await Business.findById(businessId);
  if (!business || !business.isActive || !business.isConnectedToNetwork) {
    throw new Error('El negocio no está disponible en OneD Hub');
  }

  const normalizedItems = items.map((item) => {
    const quantity = Number(item.quantity || 0);
    const unitPrice = Number(item.unitPrice || 0);

    return {
      productId: String(item.productId),
      name: String(item.name || 'Producto'),
      quantity,
      unitPrice,
      totalPrice: Number((quantity * unitPrice).toFixed(2)),
    };
  });

  const subtotal = Number(normalizedItems.reduce((sum, item) => sum + item.totalPrice, 0).toFixed(2));
  const tax = Number((subtotal * 0.16).toFixed(2));
  const total = Number((subtotal + tax).toFixed(2));

  const order = await Order.create({
    userId: String(userId),
    businessId,
    items: normalizedItems,
    subtotal,
    tax,
    total,
    status: 'pending',
    notes,
  });

  const populated = await Order.findById(order._id).populate('businessId', 'name');
  return serializeOrder(populated);
};

const getMyOrders = async ({ userId }) => {
  if (!userId) {
    throw new Error('userId es obligatorio');
  }

  const orders = await Order.find({ userId: String(userId) })
    .populate('businessId', 'name')
    .sort({ createdAt: -1 });

  return orders.map(serializeOrder);
};

const getBusinessOrders = async ({ businessId }) => {
  if (!businessId || !mongoose.Types.ObjectId.isValid(businessId)) {
    throw new Error('businessId inválido');
  }

  const orders = await Order.find({ businessId })
    .populate('businessId', 'name')
    .sort({ createdAt: -1 });

  return orders.map(serializeOrder);
};

const getOrderById = async ({ orderId }) => {
  if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
    throw new Error('orderId inválido');
  }

  const order = await Order.findById(orderId).populate('businessId', 'name');
  if (!order) {
    throw new Error('Pedido no encontrado');
  }

  return serializeOrder(order);
};

const updateOrderStatus = async ({ orderId, status }) => {
  if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
    throw new Error('orderId inválido');
  }

  if (!ALLOWED_STATUS.includes(status)) {
    throw new Error('Estado de pedido inválido');
  }

  const order = await Order.findById(orderId).populate('businessId', 'name');
  if (!order) {
    throw new Error('Pedido no encontrado');
  }

  order.status = status;
  await order.save();

  return serializeOrder(order);
};

module.exports = {
  ALLOWED_STATUS,
  createOrder,
  getMyOrders,
  getBusinessOrders,
  getOrderById,
  updateOrderStatus,
};
