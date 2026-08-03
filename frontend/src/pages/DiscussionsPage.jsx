import { useState, useEffect, useCallback } from 'react';
import { discussionAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import Button from '../components/Button';
import Modal from '../components/Modal';
import LoadingSkeleton from '../components/ott/LoadingSkeleton';
import ErrorState from '../components/ott/ErrorState';

export default function DiscussionsPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [newTags, setNewTags] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchDiscussions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit: 20 };
      if (search) params.search = search;
      const res = await discussionAPI.getDiscussions(params);
      if (res.data.success) {
        setDiscussions(res.data.data);
        setTotalPages(res.data.meta?.totalPages || 1);
      }
    } catch (err) {
      setError('Failed to load discussions. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [page, search, addToast]);

  useEffect(() => { fetchDiscussions(); }, [fetchDiscussions]);

  const handleCreate = async () => {
    if (!newTitle.trim() || !newBody.trim()) {
      addToast('Title and body are required', 'warning');
      return;
    }
    setSubmitting(true);
    try {
      const tags = newTags.split(',').map(t => t.trim()).filter(Boolean);
      const res = await discussionAPI.createDiscussion({ title: newTitle, body: newBody, tags });
      if (res.data.success) {
        addToast('Discussion created!', 'success');
        setShowNew(false);
        setNewTitle('');
        setNewBody('');
        setNewTags('');
        setPage(1);
        fetchDiscussions();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to create discussion', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchDiscussions();
  };

  return (
    <div className="min-h-screen bg-background animate-pageIn">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-text-textPrimary tracking-tight">
              <span className="text-gradient">Discussions</span>
            </h1>
            <p className="text-textSecondary/60 text-sm mt-0.5">Join the conversation</p>
          </div>
          {user && (
            <Button variant="primary" size="sm" onClick={() => setShowNew(true)}>
              New Discussion
            </Button>
          )}
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative">
            <input
              type="text"
              className="input-field pl-10"
              placeholder="Search discussions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textSecondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </form>

        {/* New Discussion Modal */}
        {showNew && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowNew(false)}>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
            <div className="relative bg-card border border-border rounded-2xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-textPrimary">New Discussion</h2>
                <button onClick={() => setShowNew(false)} className="p-1 text-text-textSecondary hover:text-textPrimary rounded-lg hover:bg-hover transition-all">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="space-y-4">
                <input className="input-field" placeholder="Title" value={newTitle} onChange={e => setNewTitle(e.target.value)} maxLength={200} />
                <textarea className="input-field min-h-[150px]" placeholder="What's on your mind?" value={newBody} onChange={e => setNewBody(e.target.value)} />
                <input className="input-field" placeholder="Tags (comma-separated): movies, sports, reviews" value={newTags} onChange={e => setNewTags(e.target.value)} />
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setShowNew(false)}>Cancel</Button>
                  <Button variant="primary" size="sm" onClick={handleCreate} disabled={submitting}>
                    {submitting ? 'Creating...' : 'Create Discussion'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Discussion List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => <div key={i} className="skeleton h-24 rounded-xl" />)}
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={fetchDiscussions} />
        ) : discussions.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-accent/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-accent-text/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-text-textPrimary mb-2">No discussions yet</h3>
            <p className="text-text-textSecondary text-sm">Be the first to start a conversation!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {discussions.map(d => (
              <a
                key={d._id}
                href={`/discussions/${d._id}`}
                className="block card-hover"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {d.pinned && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-accent/10 text-accent-text uppercase">Pinned</span>
                      )}
                      {d.locked && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-warning/10 text-warning uppercase">Locked</span>
                      )}
                      <h3 className="text-sm font-semibold text-text-textPrimary truncate">{d.title}</h3>
                    </div>
                    <p className="text-xs text-textSecondary line-clamp-2 mb-2">{d.body}</p>
                    <div className="flex items-center gap-3 text-[10px] text-text-textSecondary/60">
                      <span>by {d.authorId?.fullName || d.authorId?.username || 'Anonymous'}</span>
                      <span>{d.commentCount || 0} comments</span>
                      <span>{d.viewCount || 0} views</span>
                      {d.tags?.length > 0 && d.tags.map(tag => (
                        <span key={tag} className="px-1.5 py-0.5 rounded bg-hover text-text-textSecondary/70">{tag}</span>
                      ))}
                    </div>
                  </div>
                  <span className="text-[10px] text-textSecondary/40 shrink-0">
                    {new Date(d.lastActivityAt || d.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </a>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            {page > 1 && (
              <button onClick={() => setPage(page - 1)} className="px-3 py-1.5 rounded-lg text-xs font-medium text-text-textSecondary hover:text-text-textPrimary hover:bg-hover transition-all">
                Previous
              </button>
            )}
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                    page === pageNum ? 'bg-accent text-accent-contrast' : 'text-textSecondary hover:text-text-textPrimary hover:bg-hover'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            {page < totalPages && (
              <button onClick={() => setPage(page + 1)} className="px-3 py-1.5 rounded-lg text-xs font-medium text-text-textSecondary hover:text-text-textPrimary hover:bg-hover transition-all">
                Next
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
