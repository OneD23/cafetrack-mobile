const express = require('express');

const router = express.Router();

// TODO: agregar endpoints de este módulo.
router.get('/health', (req, res) => {
  res.json({
    success: true,
    module: req.baseUrl,
    status: 'ready',
  });
});

module.exports = router;
