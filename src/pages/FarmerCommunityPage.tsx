import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  MessageSquare,
  ThumbsUp,
  Share2,
  Plus,
  Send,
  Trash2,
  Sparkles,
  MapPin,
  Tag,
  AlertCircle,
  Clock
} from 'lucide-react';
import { CommunityPost, PageId } from '../types.js';
import { useLanguage } from '../context/LanguageContext.js';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';
import { Modal } from '../components/Modal.js';

interface FarmerCommunityPageProps {
  setCurrentPage?: (page: PageId) => void;
}

const CATEGORIES = [
  'All',
  'Crop Cultivation',
  'Disease Alert',
  'Soil & Fertilizer',
  'Market & Sales',
  'Government Schemes',
  'General Discussion'
];

export const FarmerCommunityPage: React.FC<FarmerCommunityPageProps> = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();

  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [search, setSearch] = useState<string>('');

  // New Post modal state
  const [isNewPostOpen, setIsNewPostOpen] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('Crop Cultivation');
  const [newTags, setNewTags] = useState('organic, farming');
  const [newImageUrl, setNewImageUrl] = useState('');

  // Comment input per post state
  const [activeCommentsPostId, setActiveCommentsPostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await api.getCommunityPosts({
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        search: search || undefined
      });
      setPosts(res);
    } catch (err) {
      console.warn('Failed to load posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [selectedCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPosts();
  };

  const handleLike = async (postId: string) => {
    try {
      const updated = await api.likePost(postId);
      setPosts(posts.map(p => p._id === postId ? updated : p));
    } catch (err: any) {
      alert(err.message || 'Please log in to like posts.');
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Please log in to participate in community discussions.');
      return;
    }

    try {
      await api.createCommunityPost({
        title: newTitle,
        content: newContent,
        category: newCategory,
        tags: newTags.split(',').map(s => s.trim()).filter(Boolean),
        imageUrl: newImageUrl || undefined
      });

      setIsNewPostOpen(false);
      setNewTitle('');
      setNewContent('');
      setNewImageUrl('');
      fetchPosts();
    } catch (err: any) {
      alert(err.message || 'Failed to publish post.');
    }
  };

  const handleAddComment = async (postId: string) => {
    if (!commentText.trim() || !user) return;
    try {
      const updated = await api.commentOnPost(postId, commentText.trim());
      setPosts(posts.map(p => p._id === postId ? updated : p));
      setCommentText('');
    } catch (err: any) {
      alert(err.message || 'Failed to submit comment.');
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      await api.deletePost(postId);
      setPosts(posts.filter(p => p._id !== postId));
    } catch (err: any) {
      alert(err.message || 'Failed to delete post.');
    }
  };

  return (
    <div id="farmer-community-root" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-stone-200 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold mb-2">
            <Users className="w-3.5 h-3.5 text-emerald-700" />
            <span>{language === 'ta' ? 'விவசாயிகள் சமூகம் & அனுபவப் பகிர்வு' : 'Farmer Peer Forum & Field Knowledge'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-emerald-950 tracking-tight">
            {t.community.title}
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl">
            {t.community.subtitle}
          </p>
        </div>

        <button
          id="btn-open-create-post"
          onClick={() => setIsNewPostOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md flex items-center gap-2 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t.community.newPost}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-stone-200 shadow-xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
            <input
              id="input-community-search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={language === 'ta' ? 'விவாதங்களைத் தேடுக...' : 'Search farm discussions, pest remedies, mandi tips...'}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-stone-300 text-xs bg-stone-50 focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shrink-0"
          >
            Search
          </button>
        </form>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedCategory === cat
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {posts.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-stone-200 text-center text-stone-500">
            No community posts found. Be the first farmer to share insights!
          </div>
        ) : (
          posts.map(p => (
            <div
              key={p._id}
              className="bg-white rounded-3xl border border-stone-200 shadow-xs p-6 space-y-4"
            >
              {/* Post Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm">
                    {p.userName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-stone-900">{p.userName}</h4>
                    <p className="text-[11px] text-stone-400 flex items-center gap-1">
                      {p.userLocation && (
                        <>
                          <MapPin className="w-3 h-3 text-emerald-600" />
                          <span>{p.userLocation} • </span>
                        </>
                      )}
                      <Clock className="w-3 h-3" />
                      <span>{new Date(p.createdAt).toLocaleDateString()}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {p.category}
                  </span>

                  {(user?.role === 'admin' || user?._id === p.userId) && (
                    <button
                      onClick={() => handleDeletePost(p._id)}
                      className="p-1 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                      title="Delete post"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Title & Body */}
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-stone-900 leading-snug">{p.title}</h3>
                <p className="text-xs text-stone-700 leading-relaxed whitespace-pre-line">{p.content}</p>
              </div>

              {/* Post Image (if any) */}
              {p.imageUrl && (
                <div className="rounded-2xl overflow-hidden max-h-72 border border-stone-200 bg-stone-950 flex items-center justify-center">
                  <img
                    src={p.imageUrl}
                    alt={p.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-72 object-cover"
                  />
                </div>
              )}

              {/* Tags */}
              {p.tags && p.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {p.tags.map((t, idx) => (
                    <span key={idx} className="text-[10px] font-semibold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Tag className="w-2.5 h-2.5" />
                      <span>{t}</span>
                    </span>
                  ))}
                </div>
              )}

              {/* Actions Footer */}
              <div className="flex items-center justify-between border-t border-stone-100 pt-3">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleLike(p._id)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-emerald-700 transition-colors"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    <span>{typeof p.likes === 'number' ? p.likes : (Array.isArray(p.likes) ? p.likes.length : 0)} {language === 'ta' ? 'விருப்பங்கள்' : 'Helpful'}</span>
                  </button>

                  <button
                    onClick={() => setActiveCommentsPostId(activeCommentsPostId === p._id ? null : p._id)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-emerald-700 transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>{(p.comments || []).length} {t.community.comments}</span>
                  </button>
                </div>
              </div>

              {/* Threaded Comments Section */}
              {activeCommentsPostId === p._id && (
                <div className="mt-3 pt-3 border-t border-stone-100 space-y-3 bg-stone-50/70 p-4 rounded-2xl">
                  {/* Comments list */}
                  <div className="space-y-2 max-h-56 overflow-y-auto">
                    {(!p.comments || p.comments.length === 0) ? (
                      <p className="text-[11px] text-stone-500">No replies yet. Join the conversation below!</p>
                    ) : (
                      p.comments.map((c, i) => (
                        <div key={i} className="p-2.5 rounded-xl bg-white border border-stone-200 text-xs">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="font-bold text-stone-900">{c.userName}</span>
                            <span className="text-[10px] text-stone-400">
                              {new Date(c.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-stone-700">{c.comment}</p>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add comment input */}
                  {user ? (
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Write a helpful response to this farmer..."
                        className="flex-1 px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white focus:ring-2 focus:ring-emerald-500"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddComment(p._id);
                        }}
                      />
                      <button
                        onClick={() => handleAddComment(p._id)}
                        className="p-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <p className="text-[11px] text-stone-500">Please sign in to post a comment.</p>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* New Post Modal */}
      {isNewPostOpen && (
        <Modal
          isOpen={isNewPostOpen}
          onClose={() => setIsNewPostOpen(false)}
          title="Create New Farmer Discussion"
          maxWidth="lg"
        >
          <form onSubmit={handleCreatePost} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Title *</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Best organic spray for Tomato leaf curling?"
                required
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white"
                >
                  {CATEGORIES.filter(c => c !== 'All').map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="pest, tomato, organic"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Field Observation / Question *</label>
              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                rows={4}
                required
                placeholder="Describe what you observed in your field, soil type, irrigation schedule, or questions for fellow farmers..."
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Photo URL (Optional)</label>
              <input
                type="url"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsNewPostOpen(false)}
                className="px-4 py-2 rounded-xl bg-stone-100 text-stone-700 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold shadow-md"
              >
                Publish Post
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
