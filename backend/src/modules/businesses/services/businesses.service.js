const Business = require('../../../models/Business');
const Product = require('../../../models/Product');

const DEFAULT_BUSINESS_NAME = 'Mi negocio CafeTrack';

const ensureBusiness = async (businessId) => {
  if (businessId) {
    const existing = await Business.findById(businessId);
    if (existing) return existing;
  }

  const fallback = await Business.findOne().sort({ createdAt: 1 });
  if (fallback) return fallback;

  return Business.create({
    name: DEFAULT_BUSINESS_NAME,
    description: 'Negocio creado automáticamente para configuración inicial.',
    isConnectedToNetwork: false,
  });
};

const serializeBusiness = (business) => ({
  id: business._id,
  name: business.name,
  description: business.description,
  category: business.category,
  rating: business.rating,
  etaMinutes: business.etaMinutes,
  distanceKm: business.distanceKm,
  isActive: business.isActive,
  isConnectedToNetwork: business.isConnectedToNetwork,
});

const getNetworkStatus = async ({ businessId }) => {
  const business = await ensureBusiness(businessId);

  return {
    businessId: business._id,
    isConnectedToNetwork: business.isConnectedToNetwork,
    isActive: business.isActive,
  };
};

const updateNetworkStatus = async ({ businessId, isConnectedToNetwork }) => {
  const business = await ensureBusiness(businessId);
  business.isConnectedToNetwork = isConnectedToNetwork;
  await business.save();

  return {
    businessId: business._id,
    isConnectedToNetwork: business.isConnectedToNetwork,
    isActive: business.isActive,
  };
};


const getBusinessProducts = async ({ businessId }) => {
  if (!businessId) {
    throw new Error('businessId inválido');
  }

  const business = await Business.findById(businessId);
  if (!business || !business.isActive || !business.isConnectedToNetwork) {
    throw new Error('Negocio no disponible en OneD Hub');
  }

  const scopedProducts = await Product.find({ businessId, isActive: true }).sort({ category: 1, name: 1 });
  const products = scopedProducts.length
    ? scopedProducts
    : await Product.find({ isActive: true }).sort({ category: 1, name: 1 });

  return products.map((product) => ({
    id: product._id,
    businessId,
    name: product.name,
    description: product.category,
    price: product.price,
    imageUrl: product.image,
    available: product.isActive,
  }));
};

const getConnectedBusinesses = async () => {
  const businesses = await Business.find({ isActive: true, isConnectedToNetwork: true }).sort({ createdAt: -1 });
  return businesses.map(serializeBusiness);
};

module.exports = {
  getNetworkStatus,
  updateNetworkStatus,
  getConnectedBusinesses,
  getBusinessProducts,
};
