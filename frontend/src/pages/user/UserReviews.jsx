import { useState, useEffect, useCallback } from 'react';
import { reviewAPI } from '../../services/api';
import { useToast } from '../../hooks/useToast';
import Pagination from '../../components/ott/Pagination';
import LoadingSkeleton from '../../components/ott/LoadingSkeleton';
import { formatDate } from '../../utils/index';

/* ── Review Badge (matches sponsored badge from AdBanner) ── */
function ReviewBadge() {
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border"
      style={{
        backgroundColor: 'rgba(var(--color-accent), 0.18)',
        borderColor: 'rgba(var(--color-accent), 0.20)',
        color: 'rgb(var(--color-accent-text))'
      }}
    >
      <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
      Review
    </span>
  );
}

/* ── Star Rating Display ─────────────────────────────────── */
function StarRatingDisplay({ rating }) {
  const stars = Math.round(rating / 2);
  return (
    <div className="flex items-center gap-1 shrink-0">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-3 h-3 ${star <= stars ? 'text-warning' : 'text-textSecondary/20'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="inline-flex items-baseline gap-0.5 ml-1">
        <span className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>{rating}</span>
        <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>/10</span>
      </span>
    </div>
  );
}

export default function UserReviews() {
  const { addToast } = useToast();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  const fetchReviews = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await reviewAPI.getMyReviews({ page, limit: 10 });
      if (res.data.success) {
        setReviews(res.data.data);
        setPagination({
          page: res.data.meta.page,
          totalPages: res.data.meta.totalPages,
          total: res.data.meta.total
        });
      }
    } catch (err) {
      addToast('Failed to load reviews', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleDeleteReview = async (contentId) => {
    try {
      const res = await reviewAPI.deleteReview(contentId);
      if (res.data.success) {
        addToast('Review deleted', 'success');
        fetchReviews(pagination.page);
      }
    } catch (err) {
      addToast('Failed to delete review', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* My Reviews — LandingPage-style */}
      <section className="relative py-8 sm:py-10 overflow-hidden">
        {/* Background glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] sm:w-[800px] h-[400px] rounded-full blur-[120px] sm:blur-[140px] pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(var(--color-accent), 0.06) 0%, transparent 70%)'
          }}
        />

        <div className="relative text-center">
          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full animate-fade-in" style={{ background: 'rgba(var(--color-accent), 0.10)', border: '1px solid rgba(var(--color-accent), 0.18)' }}>
            <svg className="w-3.5 h-3.5 text-accent-text" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            <span className="text-[10px] sm:text-[11px] text-accent-text font-semibold tracking-widest uppercase">Reviews</span>
          </div>

          {/* Heading */}
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text-textPrimary mb-3 animate-fade-in-up tracking-tight">
            My{' '}
            <span className="text-gradient">Reviews</span>
          </h2>

          {/* Subtitle */}
          <p className="text-text-textSecondary/60 text-sm sm:text-base max-w-xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            {pagination.total > 0
              ? `You've written ${pagination.total} ${pagination.total === 1 ? 'review' : 'reviews'}`
              : 'Reviews you have written for content'}
          </p>
        </div>
      </section>

      {loading ? (
        <LoadingSkeleton count={4} />
      ) : reviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-accent-text" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-text-textPrimary mb-2">No reviews yet</h3>
          <p className="text-sm text-textSecondary">You haven't reviewed any content yet. Browse content and share your thoughts!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review, idx) => (
            <div
              key={review._id}
              className="animate-fade-in-up group relative flex flex-col rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-0.5 border border-border hover:border-accent/20"
              style={{
                backgroundColor: 'var(--color-card)',
                boxShadow: 'var(--shadow-card)',
                animationDelay: `${idx * 0.06}s`
              }}
            >
              <div className="flex flex-col sm:flex-row sm:items-stretch gap-0">
                {/* Content Poster — like ad image, full-height on mobile */}
                <div className="relative w-full sm:w-24 sm:min-h-[120px] aspect-[3/2] sm:aspect-auto overflow-hidden shrink-0 bg-gradient-to-br from-accent/5 to-card">
                  {review.contentId?.poster ? (
                    <img
                      src={review.contentId.poster}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg className="w-7 h-7 sm:w-9 sm:h-9" style={{ color: 'rgba(var(--color-accent), 0.15)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  {/* Gradient overlay on hover (like ad cards) */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 p-4 sm:p-5 flex flex-col gap-2">
                  {/* Header row: badge + rating */}
                  <div className="flex items-center justify-between gap-2">
                    <ReviewBadge />
                    <StarRatingDisplay rating={review.rating} />
                  </div>

                  {/* Title */}
                  <h3 className="text-sm sm:text-base font-bold leading-snug transition-colors duration-200" style={{ color: 'var(--color-text-primary)' }}>
                    {review.contentId?.title || 'Unknown Content'}
                  </h3>

                  {/* Meta: type + date */}
                  <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                    {review.contentId?.type === 'MOVIE' ? 'Movie' : 'TV Series'} · {formatDate(review.createdAt)}
                  </p>

                  {/* Review text */}
                  {review.review && (
                    <p className="text-sm leading-relaxed line-clamp-3" style={{ color: 'var(--color-text-secondary)' }}>
                      {review.review}
                    </p>
                  )}

                  {/* Delete action */}
                  <div className="pt-2 mt-auto">
                    <button
                      onClick={() => handleDeleteReview(review.contentId?._id)}
                      className="inline-flex items-center gap-1.5 text-xs font-medium transition-all duration-200 hover:scale-[1.04] active:scale-[0.97] group/delete"
                      style={{ color: 'rgba(var(--color-danger), 0.65)' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = 'rgb(var(--color-danger))'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(var(--color-danger), 0.65)'}
                    >
                      <svg className="w-3.5 h-3.5 transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={fetchReviews}
          />
        </div>
      )}
    </div>
  );
}
