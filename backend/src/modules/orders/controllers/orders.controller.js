const ordersService = require('../services/orders.service');

const createOrder = async (req, res, next) => {
  try {
    const order = await ordersService.createOrder(req.body || {});
    return res.status(201).json({ success: true, data: order });
  } catch (error) {
    return next(error);
  }
};

const getMyOrders = async (req, res, next) => {
  try {
    const orders = await ordersService.getMyOrders({ userId: req.query.userId });
    return res.json({ success: true, data: orders });
  } catch (error) {
    return next(error);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const order = await ordersService.getOrderById({ orderId: req.params.id });
    return res.json({ success: true, data: order });
  } catch (error) {
    return next(error);
  }
};

const getBusinessOrders = async (req, res, next) => {
  try {
    const orders = await ordersService.getBusinessOrders({ businessId: req.params.businessId });
    return res.json({ success: true, data: orders });
  } catch (error) {
    return next(error);
  }
};

const patchOrderStatus = async (req, res, next) => {
  try {
    const order = await ordersService.updateOrderStatus({
      orderId: req.params.id,
      status: req.body?.status,
    });

    return res.json({ success: true, data: order });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getBusinessOrders,
  patchOrderStatus,
};
