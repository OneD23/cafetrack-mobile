const express = require('express');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/notifications
// @desc    Listar notificaciones/pedidos externos
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { status, unreadOnly } = req.query;
    const query = { isActive: true };

    if (status) query.status = status;
    if (String(unreadOnly).toLowerCase() === 'true') query.isRead = false;

    const notifications = await Notification.find(query).sort({ createdAt: -1 }).limit(200);

    res.json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   POST /api/notifications
// @desc    Crear notificación (integración futura app externa)
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const payload = req.body || {};
    const notification = await Notification.create({
      type: payload.type || 'delivery_order',
      title: payload.title || 'Nuevo pedido entrante',
      message: payload.message || '',
      orderNumber: payload.orderNumber,
      driverName: payload.driverName,
      customerName: payload.customerName,
      customerPhone: payload.customerPhone,
      deliveryAddress: payload.deliveryAddress,
      source: payload.source || 'external-app',
      metadata: payload.metadata || {},
    });

    req.app.get('io').emit('notification:new', notification);

    res.status(201).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   PATCH /api/notifications/:id
// @desc    Actualizar estado/lectura
// @access  Private
router.patch('/:id', protect, async (req, res) => {
  try {
    const { status, isRead, isActive } = req.body;
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notificación no encontrada',
      });
    }

    if (status !== undefined) notification.status = status;
    if (isRead !== undefined) notification.isRead = Boolean(isRead);
    if (isActive !== undefined) notification.isActive = Boolean(isActive);

    await notification.save();

    req.app.get('io').emit('notification:updated', notification);

    res.json({
      success: true,
      data: notification,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
