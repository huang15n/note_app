import express from 'express';
import User from '../models/User.js';
import Post from '../models/Post.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public author profile
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -email');
    if (!user || !user.isActive) {
      return res.status(404).json({ message: 'User not found' });
    }
    const postsCount = await Post.countDocuments({
      author: user._id,
      status: 'published',
    });
    res.json({ ...user.toObject(), postsCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: list users
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password').sort('-createdAt');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: update role / status
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (req.body.role) user.role = req.body.role;
    if (req.body.isActive !== undefined) user.isActive = req.body.isActive;
    if (req.body.name) user.name = req.body.name;

    await user.save();
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
