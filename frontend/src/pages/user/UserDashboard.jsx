import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { watchlistAPI, reviewAPI, recommendationAPI } from '../../services/api';
import Card from '../../components/Card';
import StatCard from '../../components/StatCard';
import Button from '../../components/Button';


function ProfileIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

function WatchlistIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  );
}

export default function UserDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [watchlistCount, setWatchlistCount] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [recommendations, setRecommendations] = useState([]);
  const [recsLoading, setRecsLoading] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [watchlistRes, reviewRes, recsRes] = await Promise.all([
          watchlistAPI.getWatchlist({ limit: 1 }),
          reviewAPI.getMyReviews({ limit: 1 }),
          recommendationAPI.getRecommendations().catch(() => null)
        ]);
        if (watchlistRes.data.success) setWatchlistCount(watchlistRes.data.meta.total);
        if (reviewRes.data.success) setReviewCount(reviewRes.data.meta.total);
        if (recsRes?.data?.success) setRecommendations(recsRes.data.data || []);
      } catch (err) {
        console.warn('UserDashboard fetch warning (non-critical):', err.message);
      } finally {
        setLoading(false);
        setRecsLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-6 animate-pageIn">
      {/* Welcome Banner — LandingPage-style */}
      <section className="relative py-8 sm:py-12 overflow-hidden">
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-[10px] sm:text-[11px] text-accent-text font-semibold tracking-widest uppercase">{user?.name || 'User'}</span>
          </div>

          {/* Heading */}
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text-textPrimary mb-3 animate-fade-in-up tracking-tight">
            Welcome{' '}
            <span className="text-gradient">back!</span>
          </h2>

          {/* Subtitle */}
          <p className="text-text-textSecondary/60 text-sm sm:text-base max-w-xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            Discover new content, manage your watchlist, and explore what's trending.
          </p>
        </div>
      </section>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="My Watchlist" value={loading ? '...' : watchlistCount} icon={WatchlistIcon} color="accent" onClick={() => navigate('/user/watchlist')} />
        <StatCard label="My Reviews" value={loading ? '...' : reviewCount} icon={StarIcon} color="success" onClick={() => navigate('/user/reviews')} />
        <StatCard label="Profile" value={user?.name || '—'} icon={ProfileIcon} color="warning" onClick={() => navigate('/user/profile')} />
      </div>

      {/* Personalized Recommendations - FR-57/FR-60 */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg sm:text-xl font-bold text-text-textPrimary tracking-tight">
            {recommendations.length > 0 ? 'Recommended For You' : 'Personalized Recommendations'}
          </h3>
          <Button variant="ghost" size="sm" onClick={() => navigate('/search')}>
            Browse All
          </Button>
        </div>

        {recsLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="skeleton rounded-xl aspect-[2/3]" />
            ))}
          </div>
        ) : recommendations.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {recommendations.slice(0, 8).map((item, idx) => (
              <div
                key={item._id}
                className="group relative rounded-xl overflow-hidden bg-card border border-border cursor-pointer hover:border-accent/30 hover:shadow-lg transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: `${idx * 0.05}s` }}
                onClick={() => navigate(`/search?content=${item._id}`)}
              >
                <div className="aspect-[2/3] relative overflow-hidden bg-gradient-to-br from-accent/3 to-card">
                  {item.poster ? (
                    <img src={item.poster} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-10 h-10 text-accent-text/15" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  {item.rating > 0 && (
                    <span className="absolute top-2 right-2 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-accent-text flex items-center gap-1">
                      <svg className="w-3 h-3 text-warning" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                      {item.rating}
                    </span>
                  )}
                </div>
                <div className="p-3">
                  <h4 className="text-xs font-semibold text-text-textPrimary truncate group-hover:text-accent-text transition-colors">{item.title}</h4>
                  <p className="text-[10px] text-text-textSecondary mt-0.5">{item.type?.toLowerCase() === 'movie' ? 'Movie' : 'Series'}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-accent-text" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-sm text-text-textSecondary mb-1">Start building your watchlist to get personalized recommendations!</p>
            <p className="text-xs text-text-textSecondary mb-4">Add content to your watchlist and we'll recommend similar titles you'll love.</p>
            <Button variant="primary" size="sm" onClick={() => navigate('/search')}>
              Browse Content
            </Button>
          </div>
        )}
      </Card>

      {/* Quick Links — LandingPage-style */}
      <section className="relative py-8 sm:py-12 overflow-hidden">
        {/* Background glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] sm:w-[800px] h-[400px] rounded-full blur-[120px] sm:blur-[140px] pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(var(--color-accent), 0.06) 0%, transparent 70%)'
          }}
        />

        <div className="relative">
          {/* Section Header */}
          <div className="text-center mb-8 sm:mb-10">
            <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full animate-fade-in" style={{ background: 'rgba(var(--color-accent), 0.10)', border: '1px solid rgba(var(--color-accent), 0.18)' }}>
              <span className="text-[10px] sm:text-[11px] text-accent-text font-semibold tracking-widest uppercase">Navigate</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text-textPrimary mb-3 animate-fade-in-up tracking-tight">
              Quick{' '}
              <span className="text-gradient">Links</span>
            </h2>
            <p className="text-text-textSecondary/50 text-sm sm:text-base max-w-xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              Jump to your most-used sections and features.
            </p>
          </div>

          {/* Quick Links Grid — LandingPage-style cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {[
              { title: 'Browse Content', description: 'Discover movies, TV series, web series, anime, and more.', icon: WatchlistIcon, link: '/search' },
              { title: 'My Profile', description: 'View and edit your personal information.', icon: ProfileIcon, link: '/user/profile' },
              { title: 'My Watchlist', description: `Manage your ${watchlistCount} saved ${watchlistCount === 1 ? 'item' : 'items'} for later.`, icon: WatchlistIcon, link: '/user/watchlist' },
              { title: 'My Reviews', description: `You've written ${reviewCount} ${reviewCount === 1 ? 'review' : 'reviews'}.`, icon: StarIcon, link: '/user/reviews' },
              { title: 'Live Sports', description: 'Check live scores and upcoming matches.', icon: () => <span className="text-lg">⚽</span>, link: '/sports' },
              { title: 'Company Login', description: 'Are you an entertainment company? Promote your content.', icon: () => <span className="text-lg">🏢</span>, link: '/login' }
            ].map((item, idx) => (
              <div
                key={idx}
                className="group relative rounded-2xl p-5 sm:p-6 border border-border hover:border-accent/20 transition-all duration-300 cursor-pointer animate-fade-in-up"
                style={{
                  backgroundColor: 'var(--color-card)',
                  boxShadow: 'var(--shadow-card)',
                  animationDelay: `${idx * 0.06}s`
                }}
                onClick={() => navigate(item.link)}
              >
                {/* Hover gradient overlay */}
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{
                    background: 'linear-gradient(135deg, rgba(var(--color-accent), 0.04) 0%, transparent 50%, rgba(var(--color-accent), 0.02) 100%)'
                  }}
                />

                <div className="relative">
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                      style={{
                        background: 'rgba(var(--color-accent), 0.08)',
                        color: 'rgb(var(--color-accent-text))'
                      }}
                    >
                      <item.icon />
                    </div>
                    <h3 className="text-sm font-semibold text-text-textPrimary group-hover:text-accent-text transition-colors duration-200">
                      {item.title}
                    </h3>
                  </div>
                  <p className="text-xs text-textSecondary/55 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Bottom accent line */}
                <div
                  className="absolute bottom-0 left-6 right-6 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: 'linear-gradient(90deg, transparent, rgba(var(--color-accent),0.3), transparent)' }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
