import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { discussionAPI, reportAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import Button from '../components/Button';
import Modal from '../components/Modal';
import LoadingSkeleton from '../components/ott/LoadingSkeleton';

const REPORT_REASONS = [
  { value: 'spam', label: 'Spam' },
  { value: 'harassment', label: 'Harassment' },
  { value: 'inappropriate', label: 'Inappropriate Content' },
  { value: 'misinformation', label: 'Misinformation' },
  { value: 'other', label: 'Other' }
];

function ReportModal({ isOpen, onClose, targetType, targetId, onSubmit }) {
  const [reason, setReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    const finalReason = reason === 'other' ? customReason : reason;
    if (!finalReason.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit(targetType, targetId, finalReason);
      setReason('');
      setCustomReason('');
      onClose();
    } catch (err) {
      // Error handled by parent
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-bold text-textPrimary">Report Content</h3>
          <p className="text-sm text-text-textSecondary mt-1">Help us keep the community safe. Select a reason for reporting this {targetType}.</p>
        </div>

        <div className="space-y-2">
          {REPORT_REASONS.map(r => (
            <label
              key={r.value}
              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                reason === r.value
                  ? 'border-accent/50 bg-accent/5 text-accent-text'
                  : 'border-border hover:border-border-light hover:bg-hover'
              }`}
            >
              <input
                type="radio"
                name="reportReason"
                value={r.value}
                checked={reason === r.value}
                onChange={() => setReason(r.value)}
                className="accent-accent"
              />
              <span className="text-sm font-medium text-textPrimary">{r.label}</span>
            </label>
          ))}
        </div>

        {reason === 'other' && (
          <textarea
            className="input-field min-h-[80px]"
            placeholder="Please describe the issue..."
            value={customReason}
            onChange={e => setCustomReason(e.target.value)}
            maxLength={500}
          />
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            disabled={submitting || !reason.trim() || (reason === 'other' && !customReason.trim())}
            style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}
          >
            {submitting ? 'Submitting...' : 'Submit Report'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function CommentItem({ comment, currentUserId, onLike, onDelete, onReport, depth = 0 }) {
  const isOwner = currentUserId && comment.authorId?._id === currentUserId;
  const isLiked = currentUserId && comment.likes?.includes(currentUserId);

  return (
    <div className={`${depth > 0 ? 'ml-6 pl-4 border-l border-border' : ''}`}>
      <div className="card mb-3">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-accent/20 text-accent-text flex items-center justify-center text-[10px] font-bold">
              {(comment.authorId?.fullName || comment.authorId?.username || 'U').charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-xs font-medium text-textPrimary">{comment.authorId?.fullName || comment.authorId?.username || 'Anonymous'}</p>
              <p className="text-[10px] text-textSecondary">{new Date(comment.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
        <p className="text-sm textPrimary/80 whitespace-pre-wrap">{comment.body}</p>
        <div className="flex items-center gap-3 mt-2 pt-2 border-t border-border">
          <button
            onClick={() => onLike?.(comment._id)}
            className={`flex items-center gap-1 text-xs transition-all ${isLiked ? 'text-accent-text' : 'text-textSecondary hover:text-accent-text'}`}
          >
            <svg className="w-3.5 h-3.5" fill={isLiked ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
            </svg>
            {comment.likeCount || 0}
          </button>
          {isOwner && (
            <button onClick={() => onDelete?.(comment._id)} className="text-xs text-danger/70 hover:text-danger transition-all">
              Delete
            </button>
          )}
          {!isOwner && (
            <button onClick={() => onReport?.('comment', comment._id)} className="text-xs text-text-textSecondary/50 hover:text-danger ml-auto transition-all">
              Report
            </button>
          )}
        </div>
      </div>

      {/* Nested Replies */}
      {comment.replies?.map(reply => (
        <CommentItem
          key={reply._id}
          comment={reply}
          currentUserId={currentUserId}
          onLike={onLike}
          onDelete={onDelete}
          onReport={onReport}
          depth={depth + 1}
        />
      ))}
    </div>
  );
}

export default function DiscussionDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToast } = useToast();
  const [discussion, setDiscussion] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [reportModal, setReportModal] = useState({ isOpen: false, targetType: null, targetId: null });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [discRes, commentsRes] = await Promise.all([
        discussionAPI.getDiscussionById(id),
        discussionAPI.getComments(id, { page: 1, limit: 50 })
      ]);
      if (discRes.data.success) setDiscussion(discRes.data.data);
      if (commentsRes.data.success) setComments(commentsRes.data.data);
    } catch (err) {
      addToast('Failed to load discussion', 'error');
    } finally {
      setLoading(false);
    }
  }, [id, addToast]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleComment = async () => {
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      const res = await discussionAPI.createComment(id, { body: newComment });
      if (res.data.success) {
        addToast('Comment posted!', 'success');
        setNewComment('');
        fetchData();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to post comment', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (commentId) => {
    try {
      await discussionAPI.toggleCommentLike(commentId);
      fetchData();
    } catch (err) {
      // ignore
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await discussionAPI.deleteComment(commentId);
      addToast('Comment deleted', 'success');
      fetchData();
    } catch (err) {
      addToast('Failed to delete comment', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="skeleton h-8 w-64 rounded-lg mb-4" />
          <div className="skeleton h-32 rounded-xl mb-6" />
          <div className="space-y-4">{[1, 2, 3].map(i => <div key={i} className="skeleton h-20 rounded-xl" />)}</div>
        </div>
      </div>
    );
  }

  if (!discussion) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="textSecondary">Discussion not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background animate-pageIn">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Discussion Content */}
        <div className="card mb-6">
          <div className="flex items-center gap-2 mb-3">
            {discussion.pinned && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-accent/10 text-accent-text uppercase">Pinned</span>}
            {discussion.locked && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-warning/10 text-warning uppercase">Locked</span>}
            <span className="text-[10px] text-text-textSecondary/50">{discussion.viewCount || 0} views</span>
          </div>
          <h1 className="text-xl font-bold text-text-textPrimary mb-2">{discussion.title}</h1>
          <p className="text-sm textPrimary/80 whitespace-pre-wrap mb-4">{discussion.body}</p>
          <div className="flex items-center justify-between text-xs text-text-textSecondary/60">
            <div className="flex items-center gap-2">
              <span>Posted by {discussion.authorId?.fullName || discussion.authorId?.username || 'Anonymous'}</span>
              <span>{new Date(discussion.createdAt).toLocaleDateString()}</span>
            </div>                {discussion.tags?.length > 0 && (
              <div className="flex gap-1">
                {discussion.tags.map(tag => (
                  <span key={tag} className="px-1.5 py-0.5 rounded bg-hover text-text-textSecondary/70 text-[10px]">{tag}</span>
                ))}
              </div>
            )}
          </div>
          <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
            <div />
            <button
              onClick={() => setReportModal({ isOpen: true, targetType: 'discussion', targetId: id })}
              className="flex items-center gap-1.5 text-xs text-text-textSecondary/50 hover:text-danger transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
              </svg>
              Report
            </button>
          </div>
        </div>

        {/* Comment Form */}
        {user && !discussion.locked && (
          <div className="card mb-6">
            <textarea
              className="input-field min-h-[80px] mb-3"
              placeholder="Share your thoughts..."
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
            />
            <div className="flex justify-end">
              <Button variant="primary" size="sm" onClick={handleComment} disabled={submitting || !newComment.trim()}>
                {submitting ? 'Posting...' : 'Post Comment'}
              </Button>
            </div>
          </div>
        )}
        {discussion.locked && (
          <div className="card mb-6 text-center">
            <p className="text-sm text-textSecondary">This discussion is locked. No new comments can be added.</p>
          </div>
        )}

        {/* Comments */}
        <div className="space-y-1">
          {comments.length === 0 ? (
            <p className="text-center text-sm text-text-textSecondary py-10">No comments yet. Be the first to share your thoughts!</p>
          ) : (
            comments.map(comment => (
              <CommentItem
                key={comment._id}
                comment={comment}
                currentUserId={user?.id}
                onLike={handleLike}
                onDelete={handleDeleteComment}
                onReport={(type, id) => setReportModal({ isOpen: true, targetType: type, targetId: id })}
              />
            ))
          )}
        </div>

        {/* Report Modal */}
        <ReportModal
          isOpen={reportModal.isOpen}
          onClose={() => setReportModal({ isOpen: false, targetType: null, targetId: null })}
          targetType={reportModal.targetType}
          targetId={reportModal.targetId}
          onSubmit={async (type, id, reason) => {
            try {
              const res = await reportAPI.createReport({
                targetType: type,
                targetId: id,
                reason
              });
              if (res.data.success) {
                addToast('Report submitted. Our moderation team will review it.', 'success');
              }
            } catch (err) {
              addToast(err.response?.data?.message || 'Failed to submit report', 'error');
              throw err;
            }
          }}
        />
      </div>
    </div>
  );
}
