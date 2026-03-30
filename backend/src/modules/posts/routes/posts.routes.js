const express = require('express');
const postsController = require('../controllers/posts.controller');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ success: true, module: req.baseUrl, status: 'ready' });
});

router.post('/seed', postsController.seedDefaultPosts);
router.post('/', postsController.createPost);
router.get('/', postsController.listPosts);
router.get('/category/:category', postsController.listPostsByCategory);
router.get('/business/:businessId', postsController.listPostsByBusiness);
router.get('/:id', postsController.getPostById);
router.patch('/:id', postsController.patchPost);
router.delete('/:id', postsController.deletePost);

module.exports = router;
