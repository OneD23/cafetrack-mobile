const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Business = require('../models/Business');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

const normalizeBusinessType = (value) => {
  const safe = String(value || '').toLowerCase();
  return ['cafe', 'colmado', 'ferreteria'].includes(safe) ? safe : 'cafe';
};

const defaultModulesByType = {
  cafe: ['pos', 'inventory', 'reports', 'recipes'],
  colmado: ['pos', 'inventory', 'reports'],
  ferreteria: ['pos', 'inventory', 'reports'],
};

const ensureBusinessForUser = async (user, payload = {}) => {
  if (user?.businessId) {
    const business = await Business.findById(user.businessId);
    if (business) return business;
  }

  const chosenType = normalizeBusinessType(payload.type);
  const business = await Business.create({
    name: payload.name || `${user?.name || 'Negocio'} Business`,
    type: chosenType,
    status: 'active',
    email: user?.email || '',
    enabledModules: defaultModulesByType[chosenType] || ['pos', 'inventory', 'reports'],
    settings: payload.settings || {},
  });

  user.businessId = business._id;
  await user.save();
  return business;
};

// Generar JWT
const generateToken = (user) => {
  const payload = {
    id: user._id,
    businessId: user.businessId || null,
    role: user.role,
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

const serializeUser = (user) => ({
  id: user._id,
  username: user.username,
  name: user.name,
  email: user.email,
  role: user.role,
  businessId: user.businessId || null,
  status: user.status || (user.isActive ? 'active' : 'inactive'),
});

const serializeBusiness = (business) => ({
  id: business._id,
  name: business.name,
  slug: business.slug,
  type: business.type,
  status: business.status,
  phone: business.phone,
  email: business.email,
  address: business.address,
  logoUrl: business.logoUrl,
  settings: business.settings || {},
  enabledModules: business.enabledModules || [],
  createdAt: business.createdAt,
  updatedAt: business.updatedAt,
});

// @route   POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const identifier = username || email;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Por favor proporciona usuario/email y contraseña',
      });
    }

    const user = await User.findOne({
      $or: [{ username: identifier }, { email: identifier }],
    }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    }

    if (!user.isActive || user.status === 'inactive' || user.status === 'suspended') {
      return res.status(401).json({ success: false, message: 'Usuario desactivado' });
    }

    const business = await ensureBusinessForUser(user);

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user);

    return res.json({
      success: true,
      token,
      user: serializeUser(user),
      business: serializeBusiness(business),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error en login', error: error.message });
  }
});

router.get('/me', protect, async (req, res) => {
  try {
    const business = req.user.businessId ? await Business.findById(req.user.businessId) : null;
    res.json({
      success: true,
      user: serializeUser(req.user),
      business: business ? serializeBusiness(business) : null,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/register', protect, restrictTo('owner', 'admin'), async (req, res) => {
  try {
    const { username, email, password, name, role } = req.body;

    const user = await User.create({
      username,
      email,
      password,
      name,
      role: role || 'cashier',
      businessId: req.user.businessId || null,
    });

    res.status(201).json({ success: true, user: serializeUser(user) });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.post('/bootstrap', async (req, res) => {
  try {
    const usersCount = await User.countDocuments();
    if (usersCount > 0) {
      return res.status(403).json({ success: false, message: 'Bootstrap deshabilitado: ya existen usuarios' });
    }

    const { username, email, password, name, businessName, businessType } = req.body;
    if (!username || !email || !password || !name) {
      return res.status(400).json({ success: false, message: 'username, email, password y name son obligatorios' });
    }

    const type = normalizeBusinessType(businessType);
    const business = await Business.create({
      name: businessName || `${name} Business`,
      type,
      status: 'active',
      email,
      enabledModules: defaultModulesByType[type],
    });

    const user = await User.create({
      username,
      email,
      password,
      name,
      role: 'owner',
      businessId: business._id,
      status: 'active',
    });

    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      message: 'Usuario administrador inicial creado',
      token,
      user: serializeUser(user),
      business: serializeBusiness(business),
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
