const Business = require('../../../models/Business');

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

const getConnectedBusinesses = async () => {
  const businesses = await Business.find({ isActive: true, isConnectedToNetwork: true }).sort({ createdAt: -1 });
  return businesses.map(serializeBusiness);
};

module.exports = {
  getNetworkStatus,
  updateNetworkStatus,
  getConnectedBusinesses,
};
