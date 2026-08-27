import { Router, Request, Response } from 'express';
import { db } from '../config/db.js';
import { ICommunityPost, IComment, INotification } from '../models/index.js';
import { authenticate, optionalAuth, AuthRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/community/posts
router.get('/posts', optionalAuth, (req: AuthRequest, res: Response) => {
  try {
    const { category, sort, search } = req.query;
    const postsColl = db.collection<ICommunityPost>('communityPosts');
    const commentsColl = db.collection<IComment>('comments');
    let posts = postsColl.find();

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      posts = posts.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.content.toLowerCase().includes(q) ||
        p.userName.toLowerCase().includes(q)
      );
    }

    if (category && typeof category === 'string' && category !== 'All') {
      posts = posts.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }

    if (sort === 'popular') {
      posts.sort((a, b) => ((Array.isArray(b.likes) ? b.likes.length : (b.likes || 0)) + (b.commentsCount || 0)) - ((Array.isArray(a.likes) ? a.likes.length : (a.likes || 0)) + (a.commentsCount || 0)));
    } else {
      // Default: latest first
      posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    // Attach populated comments to each post
    const populated = posts.map(p => {
      const comments = commentsColl.find(c => c.postId === p._id);
      comments.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      return {
        ...p,
        likes: Array.isArray(p.likes) ? p.likes.length : (typeof p.likes === 'number' ? p.likes : 0),
        likesList: Array.isArray(p.likes) ? p.likes : [],
        comments: comments || [],
        commentsCount: (comments || []).length
      };
    });

    res.json({
      success: true,
      count: populated.length,
      data: populated
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/community/posts/:id
router.get('/posts/:id', (req: Request, res: Response) => {
  try {
    const postsColl = db.collection<ICommunityPost>('communityPosts');
    const commentsColl = db.collection<IComment>('comments');

    const post = postsColl.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    const comments = commentsColl.find(c => c.postId === post._id);
    comments.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    res.json({
      success: true,
      data: {
        ...post,
        comments
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/community/posts
router.post('/posts', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const { title, content, category, imageUrl } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are required.' });
    }

    const postsColl = db.collection<ICommunityPost>('communityPosts');
    const newPost = postsColl.insertOne({
      userId: req.user!._id,
      userName: req.user!.name,
      userRole: req.user!.role === 'admin' ? 'Agriculture Officer / Admin' : 'Farmer',
      userLocation: req.user!.location || `${req.user!.district}, ${req.user!.state}`,
      title: title.trim(),
      content: content.trim(),
      category: category || 'General Farming',
      likes: [],
      commentsCount: 0,
      imageUrl: imageUrl || undefined
    });

    const populated = {
      ...newPost,
      likes: 0,
      likesList: [],
      comments: [],
      commentsCount: 0
    };

    res.status(201).json({
      success: true,
      message: 'Post created successfully.',
      data: populated
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/community/posts/:id
router.put('/posts/:id', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const { title, content, category, imageUrl } = req.body;
    const postsColl = db.collection<ICommunityPost>('communityPosts');
    const commentsColl = db.collection<IComment>('comments');
    const post = postsColl.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    if (post.userId !== req.user!._id && req.user!.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'You can only edit your own posts.' });
    }

    const updated = postsColl.updateOne(post._id, {
      ...(title && { title: title.trim() }),
      ...(content && { content: content.trim() }),
      ...(category && { category }),
      ...(imageUrl !== undefined && { imageUrl })
    });

    const comments = commentsColl.find(c => c.postId === post._id);
    comments.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    res.json({
      success: true,
      message: 'Post updated successfully.',
      data: {
        ...updated,
        likes: Array.isArray(updated.likes) ? updated.likes.length : (typeof updated.likes === 'number' ? updated.likes : 0),
        likesList: Array.isArray(updated.likes) ? updated.likes : [],
        comments: comments || [],
        commentsCount: (comments || []).length
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/community/posts/:id
router.delete('/posts/:id', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const postsColl = db.collection<ICommunityPost>('communityPosts');
    const commentsColl = db.collection<IComment>('comments');
    const post = postsColl.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    if (post.userId !== req.user!._id && req.user!.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'You can only delete your own posts.' });
    }

    postsColl.deleteOne(post._id);

    // Clean up associated comments
    const allComments = commentsColl.find(c => c.postId === post._id);
    allComments.forEach(c => commentsColl.deleteOne(c._id));

    res.json({
      success: true,
      message: 'Post and comments deleted successfully.'
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/community/posts/:id/like
router.post('/posts/:id/like', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const postsColl = db.collection<ICommunityPost>('communityPosts');
    const commentsColl = db.collection<IComment>('comments');
    const post = postsColl.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    const userId = req.user!._id;
    let likes = Array.isArray(post.likes) ? [...post.likes] : [];

    const hasLiked = likes.includes(userId);
    if (hasLiked) {
      likes = likes.filter(id => id !== userId);
    } else {
      likes.push(userId);

      // Notify post author if not self
      if (post.userId !== userId) {
        db.collection<INotification>('notifications').insertOne({
          userId: post.userId,
          title: '❤️ New Post Like',
          message: `${req.user!.name} liked your post: "${post.title.substring(0, 30)}..."`,
          type: 'community',
          read: false,
          link: '/farmer-community'
        });
      }
    }

    const updated = postsColl.updateOne(post._id, { likes });
    const comments = commentsColl.find(c => c.postId === post._id);
    comments.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    const populated = {
      ...updated,
      likes: likes.length,
      likesList: likes,
      comments: comments || [],
      commentsCount: (comments || []).length
    };

    res.json({
      success: true,
      liked: !hasLiked,
      likesCount: likes.length,
      data: populated
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/community/posts/:id/comments
router.post('/posts/:id/comments', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const { comment } = req.body;
    if (!comment || !comment.trim()) {
      return res.status(400).json({ success: false, message: 'Comment text cannot be empty.' });
    }

    const postsColl = db.collection<ICommunityPost>('communityPosts');
    const commentsColl = db.collection<IComment>('comments');

    const post = postsColl.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    const newComment = commentsColl.insertOne({
      postId: post._id,
      userId: req.user!._id,
      userName: req.user!.name,
      comment: comment.trim()
    });

    const currentCount = (post.commentsCount || 0) + 1;
    postsColl.updateOne(post._id, { commentsCount: currentCount });

    // Notify author if not self
    if (post.userId !== req.user!._id) {
      db.collection<INotification>('notifications').insertOne({
        userId: post.userId,
        title: '💬 New Comment on your Post',
        message: `${req.user!.name} commented on "${post.title.substring(0, 30)}..."`,
        type: 'community',
        read: false,
        link: '/farmer-community'
      });
    }

    const comments = commentsColl.find(c => c.postId === post._id);
    comments.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    const populated = {
      ...post,
      commentsCount: currentCount,
      likes: Array.isArray(post.likes) ? post.likes.length : (typeof post.likes === 'number' ? post.likes : 0),
      likesList: Array.isArray(post.likes) ? post.likes : [],
      comments: comments || []
    };

    res.status(201).json({
      success: true,
      message: 'Comment added.',
      data: populated
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/community/comments/:id
router.delete('/comments/:id', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const commentsColl = db.collection<IComment>('comments');
    const postsColl = db.collection<ICommunityPost>('communityPosts');

    const comment = commentsColl.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found.' });
    }

    if (comment.userId !== req.user!._id && req.user!.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'You can only delete your own comments.' });
    }

    commentsColl.deleteOne(comment._id);

    const post = postsColl.findById(comment.postId);
    if (post && post.commentsCount > 0) {
      postsColl.updateOne(post._id, { commentsCount: post.commentsCount - 1 });
    }

    res.json({
      success: true,
      message: 'Comment deleted successfully.'
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
