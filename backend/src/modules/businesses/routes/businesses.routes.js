const express = require('express');
const businessesController = require('../controllers/businesses.controller');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({
    success: true,
    module: req.baseUrl,
    status: 'ready',
  });
});

router.get('/network-status', businessesController.getNetworkStatus);
router.get('/:businessId/network-status', businessesController.getNetworkStatus);
router.patch('/:businessId/network-status', businessesController.updateNetworkStatus);
router.get('/connected', businessesController.listConnectedBusinesses);

module.exports = router;
