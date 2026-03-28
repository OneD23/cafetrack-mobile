const express = require('express');
const Customer = require('../models/Customer');
const Sale = require('../models/Sale');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/customers
// @desc    Listar clientes
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { search = '' } = req.query;
    const query = { isActive: true };

    if (search) {
      query.$or = [
        { customerId: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const customers = await Customer.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: customers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   POST /api/customers
// @desc    Crear cliente
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { customerId, name, email, phone, address } = req.body;

    const customer = await Customer.create({
      ...(customerId ? { customerId } : {}),
      name,
      email,
      phone,
      address,
    });

    res.status(201).json({
      success: true,
      data: customer,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   PUT /api/customers/:id
// @desc    Editar cliente
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const { customerId, name, email, phone, address, isActive } = req.body;

    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado',
      });
    }

    if (customerId !== undefined) customer.customerId = customerId;
    if (name !== undefined) customer.name = name;
    if (email !== undefined) customer.email = email;
    if (phone !== undefined) customer.phone = phone;
    if (address !== undefined) customer.address = address;
    if (isActive !== undefined) customer.isActive = Boolean(isActive);

    await customer.save();

    res.json({
      success: true,
      data: customer,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   DELETE /api/customers/:id
// @desc    Eliminar/desactivar cliente
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado',
      });
    }

    customer.isActive = false;
    await customer.save();

    res.json({
      success: true,
      message: 'Cliente eliminado',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   GET /api/customers/:id/history
// @desc    Historial de compras por cliente
// @access  Private
router.get('/:id/history', protect, async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado',
      });
    }

    const sales = await Sale.find({ customerId: customer._id })
      .populate('items.product', 'name')
      .sort({ createdAt: -1 });

    const totals = sales.reduce(
      (acc, sale) => {
        acc.sales += 1;
        acc.total += Number(sale.total || 0);
        return acc;
      },
      { sales: 0, total: 0 }
    );

    res.json({
      success: true,
      data: {
        customer,
        totals: {
          ...totals,
          averageTicket: totals.sales ? totals.total / totals.sales : 0,
        },
        sales,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
