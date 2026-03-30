const express = require('express');
const Sale = require('../models/Sale');
const Product = require('../models/Product');
const Ingredient = require('../models/Ingredient');
const InventoryMovement = require('../models/InventoryMovement');
const Expense = require('../models/Expense');
const { protect } = require('../middleware/auth');

const router = express.Router();

const buildDateRange = (req) => {
  const { startDate, endDate } = req.query;
  if (!startDate || !endDate) return {};
  return {
    createdAt: {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    },
  };
};

const buildBusinessMatch = (req) => {
  const businessId = req.query.businessId || req.auth?.businessId || req.user?.businessId || null;
  if (!businessId) return {};
  return { businessId };
};

const toCsv = (rows) => {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  const escape = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  return [
    headers.join(','),
    ...rows.map((row) => headers.map((h) => escape(row[h])).join(',')),
  ].join('\n');
};

// KPIs principales
router.get('/kpis', protect, async (req, res) => {
  try {
    const match = { ...buildDateRange(req), ...buildBusinessMatch(req) };
    const sales = await Sale.find(match);
    const ingredients = await Ingredient.find({ isActive: true, ...buildBusinessMatch(req) });
    const expenseMatch = match.createdAt ? { date: match.createdAt, isActive: true } : { isActive: true };
    const expenses = await Expense.find(expenseMatch);

    const totals = sales.reduce(
      (acc, sale) => {
        const subtotal = Number(sale.subtotal || 0);
        const discount = Number(sale.discount?.amount || 0);
        const tax = Number(sale.tax || 0);
        const total = Number(sale.total || 0);
        const cost = (sale.items || []).reduce(
          (sum, item) => sum + Number(item.cost || 0) * Number(item.quantity || 0),
          0
        );
        const qty = (sale.items || []).reduce((sum, item) => sum + Number(item.quantity || 0), 0);

        acc.grossSales += subtotal;
        acc.netSales += total;
        acc.discount += discount;
        acc.tax += tax;
        acc.cogs += cost;
        acc.transactions += 1;
        acc.itemsSold += qty;
        return acc;
      },
      {
        grossSales: 0,
        netSales: 0,
        discount: 0,
        tax: 0,
        cogs: 0,
        transactions: 0,
        itemsSold: 0,
      }
    );

    const lowStockCount = ingredients.filter(
      (i) => Number(i.stock || 0) <= Number(i.minStock || 0)
    ).length;

    const inventoryValue = ingredients.reduce(
      (sum, i) => sum + Number(i.stock || 0) * Number(i.costPerUnit || 0),
      0
    );

    const grossProfit = totals.netSales - totals.cogs;
    const operatingExpenses = expenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
    const netAfterExpenses = grossProfit - operatingExpenses;
    const averageTicket = totals.transactions ? totals.netSales / totals.transactions : 0;
    const avgMargin = totals.netSales ? (grossProfit / totals.netSales) * 100 : 0;

    res.json({
      success: true,
      data: {
        grossSales: totals.grossSales,
        netSales: totals.netSales,
        grossProfit,
        operatingExpenses,
        netAfterExpenses,
        averageTicket,
        transactions: totals.transactions,
        itemsSold: totals.itemsSold,
        avgMargin,
        lowStockPercent: ingredients.length ? (lowStockCount / ingredients.length) * 100 : 0,
        inventoryValue,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Resumen operativo para OneHub Business Core
router.get('/summary', protect, async (req, res) => {
  try {
    const match = { ...buildDateRange(req), ...buildBusinessMatch(req) };
    const sales = await Sale.find(match);
    const inventoryItems = await Ingredient.find({ isActive: true, ...buildBusinessMatch(req) });

    const summary = sales.reduce(
      (acc, sale) => {
        acc.salesCount += 1;
        acc.subtotal += Number(sale.subtotal || 0);
        acc.discount += Number(sale.discount?.amount || 0);
        acc.tax += Number(sale.tax || 0);
        acc.total += Number(sale.total || 0);
        return acc;
      },
      { salesCount: 0, subtotal: 0, discount: 0, tax: 0, total: 0 }
    );

    const lowStockCount = inventoryItems.filter((item) => Number(item.stock || 0) <= Number(item.minStock || 0)).length;

    res.json({
      success: true,
      data: {
        ...summary,
        inventoryItems: inventoryItems.length,
        lowStockCount,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Gastos operativos
router.get('/expenses', protect, async (req, res) => {
  try {
    const range = buildDateRange(req);
    const match = {
      isActive: true,
      ...(range.createdAt ? { date: range.createdAt } : {}),
    };
    const expenses = await Expense.find(match).sort({ date: -1 });
    res.json({ success: true, data: expenses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/expenses', protect, async (req, res) => {
  try {
    const { date, category, description, amount, paymentMethod, reference } = req.body;
    const expense = await Expense.create({
      date: date ? new Date(date) : new Date(),
      category,
      description,
      amount,
      paymentMethod: paymentMethod || 'cash',
      reference,
      createdBy: req.user?._id,
    });
    res.status(201).json({ success: true, data: expense });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.put('/expenses/:id', protect, async (req, res) => {
  try {
    const { date, category, description, amount, paymentMethod, reference, isActive } = req.body;
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Gasto no encontrado' });
    }

    if (date !== undefined) expense.date = new Date(date);
    if (category !== undefined) expense.category = category;
    if (description !== undefined) expense.description = description;
    if (amount !== undefined) expense.amount = amount;
    if (paymentMethod !== undefined) expense.paymentMethod = paymentMethod;
    if (reference !== undefined) expense.reference = reference;
    if (isActive !== undefined) expense.isActive = Boolean(isActive);

    await expense.save();

    res.json({ success: true, data: expense });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.delete('/expenses/:id', protect, async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Gasto no encontrado' });
    }
    expense.isActive = false;
    await expense.save();
    res.json({ success: true, message: 'Gasto eliminado' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Ventas por hora y día
router.get('/sales/heatmap', protect, async (req, res) => {
  try {
    const match = { ...buildDateRange(req), ...buildBusinessMatch(req) };
    const rows = await Sale.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            dayOfWeek: { $dayOfWeek: '$createdAt' },
            hour: { $hour: '$createdAt' },
          },
          totalSales: { $sum: '$total' },
          tickets: { $sum: 1 },
        },
      },
      { $sort: { '_id.dayOfWeek': 1, '_id.hour': 1 } },
    ]);

    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Rentabilidad por producto
router.get('/products/profitability', protect, async (req, res) => {
  try {
    const match = { ...buildDateRange(req), ...buildBusinessMatch(req) };
    const rows = await Sale.aggregate([
      { $match: match },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          qty: { $sum: '$items.quantity' },
          revenue: { $sum: '$items.total' },
          cost: { $sum: { $multiply: ['$items.cost', '$items.quantity'] } },
        },
      },
      {
        $project: {
          qty: 1,
          revenue: 1,
          cost: 1,
          profit: { $subtract: ['$revenue', '$cost'] },
          margin: {
            $cond: [{ $gt: ['$revenue', 0] }, { $multiply: [{ $divide: [{ $subtract: ['$revenue', '$cost'] }, '$revenue'] }, 100] }, 0],
          },
        },
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
      { $sort: { profit: -1 } },
    ]);

    const format = String(req.query.format || 'json');
    if (format === 'csv') {
      const csv = toCsv(
        rows.map((r) => ({
          product: r.product?.name || 'Desconocido',
          qty: r.qty,
          revenue: r.revenue.toFixed(2),
          cost: r.cost.toFixed(2),
          profit: r.profit.toFixed(2),
          margin: r.margin.toFixed(2),
        }))
      );
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      return res.send(csv);
    }

    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Consumo de ingredientes y mermas
router.get('/inventory/consumption', protect, async (req, res) => {
  try {
    const range = buildDateRange(req);
    const match = range.createdAt ? { createdAt: range.createdAt } : {};
    const rows = await InventoryMovement.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$ingredient',
          consumed: {
            $sum: {
              $cond: [{ $lt: ['$quantity', 0] }, { $abs: '$quantity' }, 0],
            },
          },
          restocked: {
            $sum: {
              $cond: [{ $gt: ['$quantity', 0] }, '$quantity', 0],
            },
          },
          adjustments: {
            $sum: {
              $cond: [{ $eq: ['$type', 'adjustment'] }, 1, 0],
            },
          },
        },
      },
      {
        $lookup: {
          from: 'ingredients',
          localField: '_id',
          foreignField: '_id',
          as: 'ingredient',
        },
      },
      { $unwind: { path: '$ingredient', preserveNullAndEmptyArrays: true } },
      { $sort: { consumed: -1 } },
    ]);

    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
