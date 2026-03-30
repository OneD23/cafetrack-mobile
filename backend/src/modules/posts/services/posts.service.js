const mongoose = require('mongoose');
const Post = require('../../../models/Post');
const Business = require('../../../models/Business');

const toPlainPost = (postDoc) => ({
  id: postDoc._id,
  businessId: postDoc.businessId,
  businessCategory: postDoc.businessCategory,
  title: postDoc.title,
  content: postDoc.content,
  imageUrl: postDoc.imageUrl,
  tags: postDoc.tags,
  isActive: postDoc.isActive,
  createdAt: postDoc.createdAt,
  updatedAt: postDoc.updatedAt,
});

const ensureBusiness = async (businessId) => {
  if (!mongoose.Types.ObjectId.isValid(String(businessId || ''))) {
    throw new Error('businessId inválido');
  }

  const business = await Business.findById(businessId);
  if (!business || !business.isActive) {
    throw new Error('Negocio no encontrado o inactivo');
  }

  return business;
};

const createPost = async ({ businessId, title, content, imageUrl, tags }) => {
  const business = await ensureBusiness(businessId);

  const post = await Post.create({
    businessId: business._id,
    businessCategory: business.category || 'general',
    title,
    content,
    imageUrl,
    tags: Array.isArray(tags) ? tags : [],
  });

  return toPlainPost(post);
};

const listPosts = async ({ category, businessId, includeInactive = false }) => {
  const query = {};
  if (!includeInactive) query.isActive = true;
  if (category) query.businessCategory = category;
  if (businessId) query.businessId = businessId;

  const posts = await Post.find(query).sort({ createdAt: -1 });
  return posts.map(toPlainPost);
};

const getPostById = async ({ postId }) => {
  const post = await Post.findById(postId);
  if (!post) {
    throw new Error('Post no encontrado');
  }
  return toPlainPost(post);
};

const updatePost = async ({ postId, payload }) => {
  const post = await Post.findById(postId);
  if (!post) {
    throw new Error('Post no encontrado');
  }

  if (payload.title !== undefined) post.title = payload.title;
  if (payload.content !== undefined) post.content = payload.content;
  if (payload.imageUrl !== undefined) post.imageUrl = payload.imageUrl;
  if (payload.tags !== undefined) post.tags = Array.isArray(payload.tags) ? payload.tags : [];
  if (payload.isActive !== undefined) post.isActive = Boolean(payload.isActive);

  await post.save();
  return toPlainPost(post);
};

const deletePost = async ({ postId }) => {
  const post = await Post.findById(postId);
  if (!post) {
    throw new Error('Post no encontrado');
  }

  post.isActive = false;
  await post.save();

  return toPlainPost(post);
};

const createDefaultPosts = async () => {
  const businesses = await Business.find({ isActive: true });
  const created = [];

  for (const business of businesses) {
    const existing = await Post.findOne({ businessId: business._id, isActive: true });
    if (existing) continue;

    const post = await Post.create({
      businessId: business._id,
      businessCategory: business.category || 'general',
      title: `Novedades de ${business.name}`,
      content: `Descubre promociones y recomendaciones de ${business.name}.`,
      tags: [business.category || 'general', 'promociones'],
    });
    created.push(toPlainPost(post));
  }

  return created;
};

module.exports = {
  createPost,
  listPosts,
  getPostById,
  updatePost,
  deletePost,
  createDefaultPosts,
};
