const express = require('express');
const ordersController = require('../controllers/orders.controller');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({
    success: true,
    module: req.baseUrl,
    status: 'ready',
  });
});

router.post('/', ordersController.createOrder);
router.get('/my-orders', ordersController.getMyOrders);
router.get('/business/:businessId', ordersController.getBusinessOrders);
router.get('/:id', ordersController.getOrderById);
router.patch('/:id/status', ordersController.patchOrderStatus);

module.exports = router;
