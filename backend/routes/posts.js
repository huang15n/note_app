import express from 'express';
import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import { protect, authorize, optionalAuth } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// @route   GET /api/posts  (public published + optional search/filter)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      search,
      category,
      tag,
      author,
      status,
      featured,
      sort = '-publishedAt',
    } = req.query;

    const query = {};

    // Public sees only published public posts unless authenticated author/admin
    if (!req.user || (req.user.role === 'subscriber' && !status)) {
      query.status = 'published';
      query.visibility = { $in: ['public', 'members'] };
    } else if (status) {
      query.status = status;
    }

    if (search) {
      // Partial / prefix match (e.g. "bu" → "Building...")
      const escaped = String(search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const re = new RegExp(escaped, 'i');
      query.$or = [
        { title: re },
        { excerpt: re },
        { content: re },
      ];
    }
    if (category) query.category = category;
    if (tag) query.tags = tag;
    if (author) query.author = author;
    if (featured === 'true') query.featured = true;

    // Authors can see their own drafts
    if (req.user?.role === 'author' && status === 'draft') {
      query.author = req.user._id;
    }

    const skip = (Number(page) - 1) * Number(limit);
    const posts = await Post.find(query)
      .populate('author', 'name avatar bio')
      .populate('category', 'name slug color')
      .populate('tags', 'name slug')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await Post.countDocuments(query);

    res.json({
      posts,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/posts/:slugOrId
router.get('/:slugOrId', optionalAuth, async (req, res) => {
  try {
    const { slugOrId } = req.params;
    let post;
    if (slugOrId.match(/^[0-9a-fA-F]{24}$/)) {
      post = await Post.findById(slugOrId);
    } else {
      post = await Post.findOne({ slug: slugOrId });
    }
    if (!post) return res.status(404).json({ message: 'Post not found' });

    // Visibility check
    if (post.status !== 'published' || post.visibility === 'private') {
      if (!req.user || (req.user.role !== 'admin' && post.author.toString() !== req.user._id.toString())) {
        return res.status(403).json({ message: 'Not authorized to view this post' });
      }
    }

    // Increment views (fire and forget)
    Post.findByIdAndUpdate(post._id, { $inc: { views: 1 } }).exec();

    await post.populate([
      { path: 'author', select: 'name avatar bio website' },
      { path: 'category', select: 'name slug color' },
      { path: 'tags', select: 'name slug' },
    ]);

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/posts
router.post('/', protect, authorize('admin', 'author'), async (req, res) => {
  try {
    const post = await Post.create({
      ...req.body,
      author: req.user._id,
    });
    await post.populate([
      { path: 'author', select: 'name avatar' },
      { path: 'category', select: 'name slug color' },
      { path: 'tags', select: 'name slug' },
    ]);
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/posts/:id
router.put('/:id', protect, authorize('admin', 'author'), async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (req.user.role !== 'admin' && post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this post' });
    }

    Object.assign(post, req.body);
    const updated = await post.save();
    await updated.populate([
      { path: 'author', select: 'name avatar' },
      { path: 'category', select: 'name slug color' },
      { path: 'tags', select: 'name slug' },
    ]);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/posts/:id
router.delete('/:id', protect, authorize('admin', 'author'), async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (req.user.role !== 'admin' && post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    await Comment.deleteMany({ post: post._id });
    await post.deleteOne();
    res.json({ message: 'Post removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/posts/upload
router.post('/upload', protect, authorize('admin', 'author'), upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  const url = `/uploads/${req.file.filename}`;
  res.json({ url, filename: req.file.filename });
});

export default router;
