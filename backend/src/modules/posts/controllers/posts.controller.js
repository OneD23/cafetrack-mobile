const postsService = require('../services/posts.service');

const createPost = async (req, res, next) => {
  try {
    const post = await postsService.createPost(req.body || {});
    return res.status(201).json({ success: true, data: post });
  } catch (error) {
    return next(error);
  }
};

const listPosts = async (req, res, next) => {
  try {
    const posts = await postsService.listPosts({
      category: req.query.category,
      businessId: req.query.businessId,
      includeInactive: req.query.includeInactive === 'true',
    });
    return res.json({ success: true, data: posts });
  } catch (error) {
    return next(error);
  }
};

const listPostsByCategory = async (req, res, next) => {
  try {
    const posts = await postsService.listPosts({ category: req.params.category });
    return res.json({ success: true, data: posts });
  } catch (error) {
    return next(error);
  }
};

const listPostsByBusiness = async (req, res, next) => {
  try {
    const posts = await postsService.listPosts({ businessId: req.params.businessId });
    return res.json({ success: true, data: posts });
  } catch (error) {
    return next(error);
  }
};

const getPostById = async (req, res, next) => {
  try {
    const post = await postsService.getPostById({ postId: req.params.id });
    return res.json({ success: true, data: post });
  } catch (error) {
    return next(error);
  }
};

const patchPost = async (req, res, next) => {
  try {
    const post = await postsService.updatePost({ postId: req.params.id, payload: req.body || {} });
    return res.json({ success: true, data: post });
  } catch (error) {
    return next(error);
  }
};

const deletePost = async (req, res, next) => {
  try {
    const post = await postsService.deletePost({ postId: req.params.id });
    return res.json({ success: true, data: post });
  } catch (error) {
    return next(error);
  }
};

const seedDefaultPosts = async (req, res, next) => {
  try {
    const posts = await postsService.createDefaultPosts();
    return res.status(201).json({ success: true, data: posts });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createPost,
  listPosts,
  listPostsByCategory,
  listPostsByBusiness,
  getPostById,
  patchPost,
  deletePost,
  seedDefaultPosts,
};
