import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { watchlistAPI } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import Button from '../../components/Button';
import Pagination from '../../components/ott/Pagination';
import LoadingSkeleton from '../../components/ott/LoadingSkeleton';

function WatchlistItem({ item, onRemove, onViewDetails }) {
  const [removing, setRemoving] = useState(false);
  const isTV = item.type === 'tv';

  const handleRemove = async () => {
    setRemoving(true);
    await onRemove(item.id);
  };

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-accent/20 transition-all duration-200 group">
      {/* Poster */}
      <div className="w-16 h-24 sm:w-20 sm:h-28 rounded-lg overflow-hidden bg-gradient-to-br from-accent/5 to-card shrink-0">
        {item.poster ? (
          <img src={item.poster} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-6 h-6 text-accent-text/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm sm:text-base font-semibold text-text-textPrimary group-hover:text-accent-text transition-colors truncate">
          {item.title}
        </h3>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[11px] font-medium px-1.5 py-0.5 rounded bg-accent/10 text-accent-text border border-accent/20">
            {isTV ? 'TV SERIES' : 'MOVIE'}
          </span>
          {item.releaseYear && (
            <span className="text-xs text-textSecondary">{item.releaseYear}</span>
          )}
          {item.rating > 0 && (
            <span className="text-xs text-textSecondary">★ {item.rating}</span>
          )}
        </div>
        <div className="flex flex-wrap gap-1 mt-2">
          {item.genres?.slice(0, 3).map((g) => (
            <span key={g} className="text-[10px] text-text-textSecondary/70 bg-hover px-1.5 py-0.5 rounded">
              {g}
            </span>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2 shrink-0">
        <Button
          variant="primary"
          size="sm"
          onClick={() => onViewDetails?.(item.id)}
        >
          View
        </Button>
        <Button
          variant="ghost"
          size="sm"
          loading={removing}
          onClick={handleRemove}
          className="text-danger hover:text-danger hover:bg-danger/10"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </Button>
      </div>
    </div>
  );
}

export default function UserWatchlist() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  const fetchWatchlist = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await watchlistAPI.getWatchlist({ page, limit: 12 });
      if (res.data.success) {
        setItems(res.data.data);
        setPagination({
          page: res.data.meta.page,
          totalPages: res.data.meta.totalPages,
          total: res.data.meta.total
        });
      }
    } catch (err) {
      setError('Failed to load watchlist');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWatchlist();
  }, [fetchWatchlist]);

  const handleRemove = async (contentId) => {
    try {
      const res = await watchlistAPI.removeFromWatchlist(contentId);
      if (res.data.success) {
        addToast('Removed from watchlist', 'success');
        fetchWatchlist(pagination.page);
      }
    } catch (err) {
      addToast('Failed to remove from watchlist', 'error');
    }
  };

  const handleViewDetails = (contentId) => {
    navigate(`/search?content=${contentId}`);
  };

  const handlePageChange = (newPage) => {
    fetchWatchlist(newPage);
  };

  return (
    <div className="space-y-6">
      {/* My Watchlist Section */}
      <section className="relative py-8 sm:py-10 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(var(--color-accent), 0.04) 0%, transparent 70%)'
          }}
        />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider mb-4 sm:mb-5 border"
            style={{
              backgroundColor: 'rgba(var(--color-accent), 0.12)',
              borderColor: 'rgba(var(--color-accent), 0.20)',
              color: 'rgb(var(--color-accent-text))'
            }}
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            {pagination.total > 0 ? `${pagination.total} saved` : 'Watchlist'}
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight">
            My <span className="text-gradient">Watchlist</span>
          </h2>
          <p className="text-sm sm:text-base mt-2 sm:mt-3" style={{ color: 'var(--color-textSecondary)' }}>
            {pagination.total > 0
              ? `${pagination.total} ${pagination.total === 1 ? 'item' : 'items'} saved for later`
              : 'Your saved content for later'}
          </p>
          <div className="mt-4">
            <Button variant="secondary" size="sm" onClick={() => navigate('/search')}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Browse Content
            </Button>
          </div>
        </div>
      </section>

      {/* Content */}
      {error ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <div className="w-16 h-16 rounded-full bg-danger/10 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.77.832 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-text-textPrimary mb-2">Something went wrong</h3>
          <p className="text-sm text-text-textSecondary mb-4">{error}</p>
          <Button variant="primary" size="sm" onClick={() => fetchWatchlist(pagination.page)}>
            Try Again
          </Button>
        </div>
      ) : loading ? (
        <LoadingSkeleton count={6} />
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-accent-text" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-text-textPrimary mb-2">Your watchlist is empty</h3>
          <p className="text-sm text-text-textSecondary mb-6">Start browsing and save content you love!</p>
          <Button variant="primary" onClick={() => navigate('/search')}>
            Browse Content
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <WatchlistItem
              key={item.id}
              item={item}
              onRemove={handleRemove}
              onViewDetails={handleViewDetails}
            />
          ))}
          {/* Pagination */}
          <div className="pt-4">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      )}
    </div>
  );
}
