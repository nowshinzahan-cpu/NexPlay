import { useState, useEffect, useCallback } from 'react';
import { itemReviewAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import StarRating from './StarRating';
import Button from './Button';

function RatingDistribution({ distribution, total, average }) {
  if (!total) return null;
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <span className="text-3xl font-bold text-textPrimary">{average.toFixed(1)}</span>
        <div>
          <StarRating value={Math.round(average)} size="sm" readOnly />
          <span className="text-xs text-textSecondary">{total} review{total !== 1 ? 's' : ''}</span>
        </div>
      </div>
      {[5, 4, 3, 2, 1].map(star => {
        const count = distribution[star] || 0;
        const pct = total > 0 ? (count / total) * 100 : 0;
        return (
          <div key={star} className="flex items-center gap-2 text-xs">
            <span className="w-3 text-textSecondary">{star}</span>
            <svg className="w-3 h-3" style={{ color: 'rgb(var(--color-warning))' }} fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <div className="flex-1 h-2 rounded-full bg-border overflow-hidden">
              <div className="h-full rounded-full bg-accent/60 transition-all" style={{ width: `${pct}%` }} />
            </div>
            <span className="w-8 text-right text-textSecondary">{count}</span>
          </div>
        );
      })}
    </div>
  );
}

function ReviewCard({ review, currentUserId, onDelete, onHelpful }) {
  const isOwner = currentUserId && review.userId?._id === currentUserId;

  return (
    <div className="card">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-accent/20 text-accent-text flex items-center justify-center text-xs font-bold">
            {(review.userId?.fullName || review.userId?.username || 'U').charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-medium text-textPrimary">{review.userId?.fullName || review.userId?.username || 'Anonymous'}</p>
            <p className="text-[10px] text-textSecondary">{new Date(review.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
        <StarRating value={review.rating} size="sm" readOnly />
      </div>

      {review.body && <p className="text-sm textPrimary/80 mt-2">{review.body}</p>}

      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border">
        <button
          onClick={() => onHelpful?.(review._id)}
          className="flex items-center gap-1 text-xs text-text-textSecondary hover:text-accent-text transition-all"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
          </svg>
          Helpful ({review.helpfulVotes || 0})
        </button>
        {isOwner && (
          <button
            onClick={() => onDelete?.(review._id)}
            className="flex items-center gap-1 text-xs text-danger hover:text-danger transition-all ml-auto"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}

export default function ReviewsSection({ itemId, itemType = 'content' }) {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('recent');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [newBody, setNewBody] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const [reviewsRes, summaryRes] = await Promise.all([
        itemReviewAPI.getItemReviews(itemId, { page, sort, limit: 10 }),
        itemReviewAPI.getRatingSummary(itemId, itemType)
      ]);
      if (reviewsRes.data.success) {
        setReviews(reviewsRes.data.data);
        setTotalPages(reviewsRes.data.meta?.totalPages || 1);
      }
      if (summaryRes.data.success) setSummary(summaryRes.data.data);
    } catch (err) {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [itemId, itemType, page, sort]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const handleSubmitReview = async () => {
    if (!newRating) { addToast('Please select a rating', 'warning'); return; }
    setSubmitting(true);
    try {
      const res = await itemReviewAPI.createReview({ itemId, itemType, rating: newRating, body: newBody });
      if (res.data.success) {
        addToast('Review submitted!', 'success');
        setShowForm(false);
        setNewRating(0);
        setNewBody('');
        fetchReviews();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit review';
      addToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (id) => {
    try {
      await itemReviewAPI.deleteReview(id);
      addToast('Review deleted', 'success');
      fetchReviews();
    } catch (err) {
      addToast('Failed to delete review', 'error');
    }
  };

  const handleHelpful = async (id) => {
    try {
      await itemReviewAPI.markHelpful(id);
      fetchReviews();
    } catch (err) {
      addToast('Already voted', 'warning');
    }
  };

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      {summary && <RatingDistribution {...summary} />}

      {/* Review Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-textSecondary">Sort by:</span>
          <select
            className="input-field text-sm w-auto"
            value={sort}
            onChange={(e) => { setSort(e.target.value); setPage(1); }}
          >
            <option value="recent">Most Recent</option>
            <option value="helpful">Most Helpful</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>
        {user && (
          <Button variant="primary" size="sm" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : 'Write Review'}
          </Button>
        )}
      </div>

      {/* Review Form */}
      {showForm && (
        <div className="card space-y-4">
          <h3 className="text-sm font-semibold text-textPrimary">Write Your Review</h3>
          <div className="flex items-center gap-3">
            <span className="text-sm text-textSecondary">Rating:</span>
            <StarRating value={newRating} onChange={setNewRating} size="lg" />
          </div>
          <textarea
            className="input-field"
            rows={4}
            placeholder="Share your thoughts (optional)"
            value={newBody}
            onChange={(e) => setNewBody(e.target.value)}
            maxLength={2000}
          />
          <div className="flex justify-end">
            <Button variant="primary" size="sm" onClick={handleSubmitReview} disabled={submitting || !newRating}>
              {submitting ? 'Submitting...' : 'Submit Review'}
            </Button>
          </div>
        </div>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="skeleton h-32 rounded-xl" />)}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-text-textSecondary text-sm">No reviews yet. Be the first to review!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map(review => (
            <ReviewCard
              key={review._id}
              review={review}
              currentUserId={user?.id}
              onDelete={handleDeleteReview}
              onHelpful={handleHelpful}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                page === i + 1
                  ? 'bg-accent text-accent-contrast'
                  : 'text-text-textSecondary hover:text-text-textPrimary hover:bg-[var(--hover-bg)]'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
