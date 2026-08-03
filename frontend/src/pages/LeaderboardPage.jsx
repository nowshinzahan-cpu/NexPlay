import { useState, useEffect, useCallback } from 'react';
import { gamificationAPI } from '../services/api';
import { useToast } from '../hooks/useToast';
import LoadingSkeleton from '../components/ott/LoadingSkeleton';
import ErrorState from '../components/ott/ErrorState';

const RANGE_LABELS = {
  weekly: 'This Week',
  monthly: 'This Month',
  allTime: 'All Time'
};

function RankBadge({ rank }) {
  const colors = {
    1: 'text-warning',
    2: 'text-textSecondary',
    3: 'text-amber-600'
  };
  const icon = rank <= 3 ? (
    <svg className={`w-5 h-5 ${colors[rank] || 'textSecondary'}`} fill="currentColor" viewBox="0 0 24 24">
      {rank === 1 && <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />}
      {rank === 2 && <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />}
      {rank === 3 && <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />}
    </svg>
  ) : null;

  return (
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
      rank === 1 ? 'bg-warning/10 text-warning' :
      rank === 2 ? 'bg-textSecondary/10 text-textSecondary' :
      rank === 3 ? 'bg-amber-600/10 text-amber-600' :
      'bg-hover textSecondary'
    }`}>
      {icon || rank}
    </div>
  );
}

export default function LeaderboardPage() {
  const { addToast } = useToast();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [range, setRange] = useState('allTime');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await gamificationAPI.getLeaderboard({ range, page, limit: 20 });
      if (res.data.success) {
        setEntries(res.data.data);
        setTotalPages(res.data.meta?.totalPages || 1);
      }
    } catch (err) {
      setError('Failed to load leaderboard. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [range, page, addToast]);

  useEffect(() => { fetchLeaderboard(); }, [fetchLeaderboard]);

  return (
    <div className="min-h-screen bg-background animate-pageIn">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-text-textPrimary tracking-tight">
            <span className="text-gradient">Leaderboard</span>
          </h1>
          <p className="text-textSecondary/60 text-sm mt-0.5">Top contributors and community members</p>
        </div>

        {/* Range Tabs */}
        <div className="inline-flex items-center gap-1 p-1 rounded-lg mb-6" style={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
          {Object.entries(RANGE_LABELS).map(([key, label]) => (
            <button
              key={key}
              onClick={() => { setRange(key); setPage(1); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                range === key
                  ? 'text-accent-contrast font-bold shadow-md shadow-accent/30 border-0'
                  : 'text-textSecondary hover:text-text-textPrimary hover:bg-hover'
              }`}
              style={range === key ? { background: 'var(--gradient-accent)' } : undefined}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Leaderboard Entries */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => <div key={i} className="skeleton h-16 rounded-xl" />)}
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={fetchLeaderboard} />
        ) : entries.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-accent/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-accent-text/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-text-textSecondary text-sm">No entries yet. Start contributing to climb the ranks!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-text-textSecondary/50">
              <span className="w-8 text-center">Rank</span>
              <span className="flex-1">User</span>
              <span className="w-20 text-right">Level</span>
              <span className="w-20 text-right">Points</span>
            </div>

            {entries.map((entry, idx) => {
              const rank = ((page - 1) * 20) + idx + 1;
              return (
                <div
                  key={entry.user?._id || idx}
                  className="card-hover flex items-center gap-3"
                >
                  <RankBadge rank={rank} />
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-accent/20 text-accent-text flex items-center justify-center text-xs font-bold shrink-0">
                      {(entry.user?.fullName || entry.user?.username || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-text-textPrimary truncate">{entry.user?.fullName || entry.user?.username || 'Anonymous'}</p>
                    </div>
                  </div>
                  <div className="w-20 text-right">
                    <span className="text-sm font-semibold text-accent-text">Lv.{entry.level || 1}</span>
                  </div>
                  <div className="w-20 text-right">
                    <span className="text-sm font-bold text-textPrimary">{entry.points}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-text-textSecondary hover:text-text-textPrimary hover:bg-hover transition-all disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-xs text-textSecondary">Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-text-textSecondary hover:text-text-textPrimary hover:bg-hover transition-all disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
