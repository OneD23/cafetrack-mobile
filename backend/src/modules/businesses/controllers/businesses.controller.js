const businessesService = require('../services/businesses.service');

const getNetworkStatus = async (req, res, next) => {
  try {
    const payload = await businessesService.getNetworkStatus({
      businessId: req.params.businessId || req.query.businessId,
    });

    return res.json({
      success: true,
      data: payload,
    });
  } catch (error) {
    return next(error);
  }
};

const updateNetworkStatus = async (req, res, next) => {
  try {
    const payload = await businessesService.updateNetworkStatus({
      businessId: req.params.businessId,
      isConnectedToNetwork: Boolean(req.body?.isConnectedToNetwork),
    });

    return res.json({
      success: true,
      data: payload,
      message: payload.isConnectedToNetwork
        ? 'Negocio conectado a la red OneD Hub'
        : 'Negocio desconectado de la red OneD Hub',
    });
  } catch (error) {
    return next(error);
  }
};

const getBusinessProducts = async (req, res, next) => {
  try {
    const payload = await businessesService.getBusinessProducts({ businessId: req.params.businessId });

    return res.json({
      success: true,
      data: payload,
    });
  } catch (error) {
    return next(error);
  }
};

const listConnectedBusinesses = async (req, res, next) => {
  try {
    const payload = await businessesService.getConnectedBusinesses();

    return res.json({
      success: true,
      data: payload,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getNetworkStatus,
  updateNetworkStatus,
  listConnectedBusinesses,
  getBusinessProducts,
};
