import express from 'express';
import Comment from '../models/Comment.js';
import Post from '../models/Post.js';
import { protect, authorize, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/comments?post=ID
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { post, page = 1, limit = 50 } = req.query;
    if (!post) return res.status(400).json({ message: 'post query param is required' });

    const query = { post, parent: null, status: 'approved' };
    const skip = (Number(page) - 1) * Number(limit);

    const comments = await Comment.find(query)
      .populate('author', 'name avatar role')
      .populate({
        path: 'replies',
        match: { status: 'approved' },
        populate: { path: 'author', select: 'name avatar role' },
        options: { sort: { createdAt: 1 } },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Comment.countDocuments(query);
    res.json({ comments, total, page: Number(page) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/comments
router.post('/', protect, async (req, res) => {
  try {
    const { post: postId, content, parent } = req.body;
    if (!content?.trim()) {
      return res.status(400).json({ message: 'Content is required' });
    }

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (!post.allowComments) {
      return res.status(403).json({ message: 'Comments are disabled on this post' });
    }

    const comment = await Comment.create({
      post: postId,
      author: req.user._id,
      content: content.trim(),
      parent: parent || null,
      status: 'approved',
    });

    await comment.populate('author', 'name avatar role');
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/comments/:id
router.put('/:id', protect, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    if (
      req.user.role !== 'admin' &&
      comment.author.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    comment.content = req.body.content || comment.content;
    if (req.body.status && req.user.role === 'admin') {
      comment.status = req.body.status;
    }
    await comment.save();
    await comment.populate('author', 'name avatar role');
    res.json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/comments/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    if (
      req.user.role !== 'admin' &&
      comment.author.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Also remove replies
    await Comment.deleteMany({ parent: comment._id });
    await comment.deleteOne();
    res.json({ message: 'Comment deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/comments/:id/like
router.post('/:id/like', protect, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    const idx = comment.likes.findIndex((id) => id.toString() === req.user._id.toString());
    if (idx === -1) {
      comment.likes.push(req.user._id);
    } else {
      comment.likes.splice(idx, 1);
    }
    await comment.save();
    res.json({ likes: comment.likes.length, liked: idx === -1 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
