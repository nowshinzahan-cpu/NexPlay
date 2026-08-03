import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { reviewAPI, watchlistAPI } from '../../services/api';
import Modal from '../Modal';
import WatchPlatformButton from './WatchPlatformButton';
import Button from '../Button';

function StarRating({ rating, interactive, onChange, size = 'sm' }) {
  const stars = interactive ? (rating || 0) : Math.round((rating || 0) / 2);
  const sizeClass = size === 'lg' ? 'w-5 h-5' : 'w-3.5 h-3.5';

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onChange?.(star * 2)}
          className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
        >
          <svg
            className={`${sizeClass} ${star <= stars ? 'text-warning' : 'text-textSecondary/30'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
    </div>
  );
}

function ReviewSection({ contentId }) {
  const { user, isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myReview, setMyReview] = useState(null);
  const [newRating, setNewRating] = useState(0);
  const [newReviewText, setNewReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [averageRating, setAverageRating] = useState(0);

  const fetchReviews = useCallback(async () => {
    try {
      const res = await reviewAPI.getContentReviews(contentId, { limit: 10 });
      if (res.data.success) {
        setReviews(res.data.data);
        if (res.data.data.length > 0) {
          const avg = res.data.data.reduce((sum, r) => sum + r.rating, 0) / res.data.data.length;
          setAverageRating(Math.round(avg * 10) / 10);
        }
        if (isAuthenticated) {
          const my = res.data.data.find(r => r.userId?._id === user.id);
          if (my) {
            setMyReview(my);
            setNewRating(my.rating);
            setNewReviewText(my.review || '');
          }
        }
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }, [contentId, isAuthenticated, user?.id]);

  useEffect(() => {
    if (contentId) fetchReviews();
  }, [contentId, fetchReviews]);

  const handleSubmitReview = async () => {
    if (newRating === 0) {
      addToast('Please select a rating', 'warning');
      return;
    }
    setSubmitting(true);
    try {
      if (myReview) {
        await reviewAPI.updateReview(contentId, { rating: newRating, review: newReviewText });
        addToast('Review updated!', 'success');
      } else {
        await reviewAPI.createReview(contentId, { rating: newRating, review: newReviewText });
        addToast('Review submitted!', 'success');
      }
      setMyReview(null);
      setNewRating(0);
      setNewReviewText('');
      fetchReviews();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to submit review', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="border-t pt-4 mt-4" style={{ borderColor: 'var(--color-border)' }}>
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-semibold text-textPrimary">
          Reviews {averageRating > 0 && <span className="text-accent-text ml-1">★ {averageRating}</span>}
        </h4>
        <span className="text-xs text-textSecondary">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</span>
      </div>

      {/* My Review Form */}
      {isAuthenticated && (
        <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
          <p className="text-xs text-text-textSecondary mb-2">{myReview ? 'Update your review' : 'Write a review'}</p>
          <div className="flex items-center gap-2 mb-2">
            <StarRating rating={newRating} interactive onChange={setNewRating} size="lg" />
            <span className="text-xs text-textSecondary">{newRating > 0 ? `${newRating}/10` : 'Tap to rate'}</span>
          </div>
          <textarea
            value={newReviewText}
            onChange={(e) => setNewReviewText(e.target.value)}
            placeholder="Share your thoughts (optional)..."
            className="input-field text-xs min-h-[60px] mb-2"
            maxLength={1000}
          />
          <div className="flex items-center gap-2">
            <Button size="sm" variant="primary" onClick={handleSubmitReview} loading={submitting}>
              {myReview ? 'Update' : 'Submit'}
            </Button>
            {myReview && (
              <Button size="sm" variant="ghost" onClick={() => { setMyReview(null); setNewRating(0); setNewReviewText(''); }}>
                Cancel
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => <div key={i} className="skeleton h-16 rounded-lg" />)}
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-xs text-text-textSecondary text-center py-3">
          {isAuthenticated ? 'Be the first to review!' : 'Sign in to leave a review'}
        </p>
      ) : (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {reviews.map((review) => (
            <div key={review._id} className="p-3 rounded-lg" style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--color-border)' }}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center">
                    <span className="text-[9px] font-bold text-accent-text">
                      {review.userId?.fullName?.[0] || review.userId?.username?.[0] || 'U'}
                    </span>
                  </div>
                  <span className="text-xs font-medium text-textPrimary">
                    {review.userId?.fullName || review.userId?.username || 'Anonymous'}
                  </span>
                </div>
                <span className="text-[10px] text-textSecondary">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-2 mb-1">
                <StarRating rating={review.rating} />
                <span className="text-[10px] text-textSecondary">{review.rating}/10</span>
              </div>
              {review.review && (
                <p className="text-xs text-text-textSecondary leading-relaxed">{review.review}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function WatchlistButton({ contentId, isAuthenticated }) {
  const { addToast } = useToast();
  const [inWatchlist, setInWatchlist] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !contentId) {
      setChecking(false);
      return;
    }
    const check = async () => {
      try {
        const res = await watchlistAPI.checkWatchlist(contentId);
        if (res.data.success) setInWatchlist(res.data.data.isInWatchlist);
      } catch { /* ignore */ }
      setChecking(false);
    };
    check();
  }, [contentId, isAuthenticated]);

  const handleToggle = async () => {
    setLoading(true);
    try {
      if (inWatchlist) {
        await watchlistAPI.removeFromWatchlist(contentId);
        setInWatchlist(false);
        addToast('Removed from watchlist', 'success');
      } else {
        await watchlistAPI.addToWatchlist(contentId);
        setInWatchlist(true);
        addToast('Added to watchlist!', 'success');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update watchlist', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || checking) return null;

  return (
    <Button
      variant={inWatchlist ? 'outline' : 'primary'}
      size="sm"
      loading={loading}
      onClick={handleToggle}
    >
      {inWatchlist ? (
        <>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
          </svg>
          In Watchlist
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add to Watchlist
        </>
      )}
    </Button>
  );
}

export default function DetailsModal({ isOpen, onClose, content }) {
  const { isAuthenticated } = useAuth();
  const { addToast } = useToast();

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!content) return null;

  const isTV = content.type === 'tv' || content.type === 'web' || content.type === 'anime';

  const PLATFORM_URLS = {
    'Netflix': 'https://www.netflix.com',
    'Amazon Prime': 'https://www.primevideo.com',
    'Prime Video': 'https://www.primevideo.com',
    'Disney+': 'https://www.disneyplus.com',
    'Apple TV+': 'https://tv.apple.com',
    'HBO Max': 'https://www.hbomax.com',
    'Hulu': 'https://www.hulu.com',
    'Crunchyroll': 'https://www.crunchyroll.com',
    'Sony LIV': 'https://www.sonyliv.com',
    'Zee5': 'https://www.zee5.com',
    'Viki': 'https://www.viki.com'
  };

  const handleWatchNow = (platformName) => {
    if (!platformName) {
      addToast('Streaming link not available for this content', 'warning');
      return;
    }
    let url = PLATFORM_URLS[platformName];
    if (!url) {
      const slug = platformName.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
      url = `https://www.${slug}.com`;
    }
    window.open(url, '_blank', 'noopener noreferrer');
  };

  const statusColor = (s) => {
    const status = (s || '').toLowerCase();
    switch (status) {
      case 'released': case 'completed': return 'bg-success/10 text-success border-success/20';
      case 'ongoing': return 'bg-accent/10 text-accent-text border-accent/20';
      case 'upcoming': return 'bg-warning/10 text-warning border-warning/20';
      default: return 'bg-hover text-text-textSecondary border-border';
    }
  };

  const getTypeLabel = (type) => {
    const typeMap = {
      movie: 'MOVIE', tv: 'TV SERIES', web: 'WEB SERIES',
      anime: 'ANIME', documentary: 'DOCUMENTARY'
    };
    return typeMap[type] || type?.toUpperCase() || 'CONTENT';
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" showClose={false}>
      <div className="relative">
        <button
          onClick={onClose}
          className="absolute top-0 right-0 z-10 p-2 text-text-textSecondary hover:text-textPrimary rounded-lg hover:bg-hover transition-all"
          aria-label="Close details"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex flex-col sm:flex-row gap-6 sm:gap-8">
          {/* Poster */}
          <div className="w-full sm:w-56 shrink-0">
            <div className="aspect-[2/3] rounded-lg overflow-hidden" style={{ background: 'linear-gradient(to bottom right, rgba(var(--color-accent), 0.05), var(--color-card))', border: '1px solid var(--color-border)' }}>
              {content.poster ? (
                <img src={content.poster} alt={content.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg className="w-14 h-14 text-accent-text/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 className="text-2xl sm:text-3xl font-bold text-text-textPrimary mb-1">{content.title}</h2>
                {content.alternativeTitles?.[0] && (
                  <p className="text-sm text-text-textSecondary mb-2">{content.alternativeTitles[0]}</p>
                )}
              </div>
              <WatchlistButton contentId={content.id} isAuthenticated={isAuthenticated} />
            </div>

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-accent/10 text-accent-text border border-accent/20">
                {getTypeLabel(content.type)}
              </span>
              {content.status && (
                <span className={`text-xs font-medium px-2.5 py-1 rounded-md border ${statusColor(content.status)}`}>
                  {content.status.charAt(0).toUpperCase() + content.status.slice(1)}
                </span>
              )}
              {content.rating > 0 && (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-accent/5 border border-accent/10">
                  <svg className="w-3.5 h-3.5 text-warning" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-sm font-bold text-textPrimary">{content.rating}</span>
                  <span className="text-xs text-textSecondary">/10</span>
                </span>
              )}
            </div>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-3 mb-4 text-sm text-textSecondary">
              {content.releaseYear && <span>{content.releaseYear}</span>}
              {content.languages?.[0] && <><span style={{ color: 'var(--color-border)' }}>|</span><span>{content.languages[0]}</span></>}
              {isTV && content.episodeCount > 0 && <><span style={{ color: 'var(--color-border)' }}>|</span><span>{content.episodeCount} Episodes</span></>}
              {isTV && content.currentEpisode > 0 && <><span style={{ color: 'var(--color-border)' }}>|</span><span>Episode {content.currentEpisode}</span></>}
            </div>

            {/* Genres */}
            {content.genres?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {content.genres.map((g) => (
                  <span key={g} className="px-2.5 py-1 text-xs rounded-lg" style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--color-border)', color: 'rgb(var(--color-text-secondary))' }}>{g}</span>
                ))}
              </div>
            )}

            {/* Tags */}
            {content.tags?.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <svg className="w-4 h-4 text-text-textSecondary/50 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
                </svg>
                {content.tags.map((tag) => (
                  <span key={tag} className="text-xs text-text-textSecondary px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--surface-subtle)' }}>#{tag}</span>
                ))}
              </div>
            )}

            {/* Description */}
            {content.description && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-text-textPrimary mb-2">Synopsis</h4>
                <p className="text-sm text-text-textSecondary leading-relaxed">{content.description}</p>
              </div>
            )}

            {/* Platform buttons */}
            {content.platform?.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-semibold text-text-textPrimary mb-3">Available On</h4>
                <div className="flex flex-wrap gap-2">
                  {content.platform.map((p) => (
                    <button
                      key={p}
                      onClick={() => handleWatchNow(p)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all group"
                      style={{ backgroundColor: 'var(--surface-subtle)', border: '1px solid var(--color-border)' }}
                    >
                      <div className="w-6 h-6 rounded bg-accent/20 flex items-center justify-center shrink-0">
                        <span className="text-accent-text text-[10px] font-bold">{p[0]}</span>
                      </div>
                      <span className="text-xs text-textSecondary group-hover:text-text-textPrimary transition-colors truncate">
                        Watch on {p}
                      </span>
                      <svg className="w-3 h-3 text-text-textSecondary/50 group-hover:text-accent-text transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        {content.id && <ReviewSection contentId={content.id} />}
      </div>
    </Modal>
  );
}
