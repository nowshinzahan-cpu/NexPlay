import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import Button from '../components/Button';
import AdBanner from '../components/AdBanner';
import ContentRail from '../components/ott/ContentRail';
import DetailsModal from '../components/ott/DetailsModal';
import { fetchTrending } from '../services/contentService';

const FEATURES = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
      </svg>
    ),
    title: 'Smart Discovery',
    description: 'AI-powered search across Movies, TV Series, Anime, and Documentaries with intelligent filtering.'
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
      </svg>
    ),
    title: 'Live Sports',
    description: 'Real-time scores, match schedules, and streaming links across multiple sports worldwide.'
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      </svg>
    ),
    title: 'Release Calendar',
    description: 'Never miss a premiere. Track upcoming releases by genre, platform, and release date.'
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
      </svg>
    ),
    title: 'Reviews & Ratings',
    description: 'Rate, review, and discover what the community thinks about your favorite content.'
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
      </svg>
    ),
    title: 'Promote Content',
    description: 'Creators and platforms can promote content, run campaigns, and engage target audiences.'
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
      </svg>
    ),
    title: 'Watchlist',
    description: 'Build your personal queue. Save movies, shows, and events to watch later — all in one place.'
  }
];

const STATS = [
  { value: '50K+', label: 'Content Titles' },
  { value: '10K+', label: 'Active Users' },
  { value: '500+', label: 'Sports Events' },
  { value: '99.9%', label: 'Uptime' }
];

const CATEGORIES = [
  { icon: '🎬', label: 'Movies' },
  { icon: '📺', label: 'TV Series' },
  { icon: '🎌', label: 'Anime' },
  { icon: '⚽', label: 'Sports' },
  { icon: '🎭', label: 'Theatre' },
  { icon: '🎙️', label: 'Podcasts' }
];

/* Subtle neutral ambient glow — Apple TV+ cinematic */
function AmbientGlow({ className = '' }) {
  return (
    <div
      className={`pointer-events-none absolute rounded-full blur-[120px] lg:blur-[160px] ${className}`}
      style={{ background: 'radial-gradient(circle, var(--color-border-light) 0%, transparent 70%)' }}
      aria-hidden="true"
    />
  );
}

/* Apple-style section header */
function SectionHeader({ overline, title, accent, description }) {
  return (
    <div className="text-center mb-14 sm:mb-16">
      <p className="overline text-accent-text/70 mb-4">{overline}</p>
      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-text-textPrimary mb-4 animate-fade-in-up tracking-tight">
        {title}{' '}
        {accent && <span className="text-gradient">{accent}</span>}
      </h2>
      {description && (
        <p className="text-textSecondary/50 text-base sm:text-lg max-w-xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          {description}
        </p>
      )}
    </div>
  );
}

export default function LandingPage() {
  const { isAuthenticated, user } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const nextSectionRef = useRef(null);

  // ── Trending content state ──────────────────────────────
  const [trendingItems, setTrendingItems] = useState([]);
  const [trendingLoading, setTrendingLoading] = useState(true);
  const [trendingError, setTrendingError] = useState(null);
  const [selectedContent, setSelectedContent] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setTrendingLoading(true);
    fetchTrending()
      .then((items) => {
        if (!cancelled) {
          setTrendingItems(items.slice(0, 6));
          setTrendingLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setTrendingError(err.message || 'Failed to load trending content');
          setTrendingLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, []);

  const scrollToNextSection = () => {
    nextSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  useEffect(() => {
    if (isAuthenticated) {
      if (user?.role === 'admin') navigate('/admin/dashboard');
      else if (user?.role === 'company') navigate('/company/dashboard');
      else navigate('/user/dashboard');
    }
  }, [isAuthenticated, user, navigate]);

  if (isAuthenticated) {
    return null;
  }

  return (
    <>
      {/* ── Hero Section — Apple TV+ cinematic ─────────────── */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden">
        {/* Cinematic Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0" style={{ backgroundColor: 'var(--color-bg)' }} />
          {/* Soft top light */}
          <AmbientGlow className="-top-48 left-1/2 -translate-x-1/2 w-[600px] sm:w-[800px] lg:w-[1100px] h-[420px] sm:h-[560px] lg:h-[720px] animate-float" />
          {/* Lower-left wash */}
          <AmbientGlow className="bottom-[-10%] left-[-10%] w-[420px] sm:w-[560px] h-[420px] sm:h-[560px] animate-float" />
          {/* Right wash */}
          <AmbientGlow className="top-1/3 right-[-12%] w-[460px] lg:w-[620px] h-[460px] lg:h-[620px] animate-float" />
          {/* Bottom fade */}
          <div
            className="absolute bottom-0 left-0 right-0 h-40"
            style={{ background: 'linear-gradient(to top, var(--color-bg) 0%, transparent 100%)' }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
          <div className="text-center max-w-5xl mx-auto">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2.5 mb-8 sm:mb-10 animate-fade-in">
              <div
                className="flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md"
                style={{
                  background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
                  border: '1px solid var(--color-border-light)',
                  boxShadow: isDark ? 'inset 0 1px 0 rgba(255,255,255,0.06)' : 'inset 0 1px 0 rgba(255,255,255,0.6)'
                }}
              >
                {/* Live Donut Indicator */}
                <span className="relative w-5 h-5 shrink-0">
                  <svg className="w-5 h-5 absolute inset-0" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" className="text-accent/30" />
                  </svg>
                  <svg className="w-5 h-5 absolute inset-0 animate-spin-slow text-accent" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="28 28" />
                  </svg>
                  <svg className="w-5 h-5 absolute inset-0 animate-spin-reverse-slow" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="3" r="1.8" fill="currentColor" className="text-accent/50" />
                  </svg>
                </span>
                <span className="text-[11px] sm:text-xs text-accent-text font-semibold tracking-widest uppercase">
                  Entertainment Discovery Platform
                </span>
              </div>
            </div>

            {/* Main Heading — serif display, Apple TV+ style */}
            <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl font-semibold text-text-textPrimary leading-[1.04] sm:leading-[1.02] mb-6 sm:mb-8 animate-fade-in-up tracking-[-0.015em]">
              Discover,
              <br />
              <span className="text-gradient-hero">Promote</span> &amp;{' '}
              <span className="text-gradient-hero">Engage</span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg lg:text-xl text-text-textSecondary/60 max-w-2xl mx-auto mb-4 leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
              Movies, TV Series, Anime, Sports — all in one place.
            </p>
            <p className="text-sm sm:text-base text-textSecondary/40 max-w-xl mx-auto mb-12 leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              Discover what to watch next, follow live scores, and connect with your favorite entertainment.
            </p>

            {/* Category Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 mb-12 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
              {CATEGORIES.map((cat) => (
                <span
                  key={cat.label}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-default"
                  style={{
                    background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
                    border: '1px solid var(--color-border)',
                    color: 'rgb(var(--color-text-secondary))'
                  }}
                >
                  <span className="text-sm">{cat.icon}</span>
                  {cat.label}
                </span>
              ))}
            </div>

            {/* CTA Buttons — Apple pill buttons */}
            <div className="flex flex-row flex-wrap items-center justify-center gap-3 sm:gap-4 animate-fade-in-up w-full mx-auto" style={{ animationDelay: '0.2s' }}>
              <Link to="/register">
                <Button variant="primary" size="lg" className="whitespace-nowrap">
                  <span className="text-xl leading-none">✨</span>
                  <span className="text-center">Start Free</span>
                </Button>
              </Link>
              <Link to="/search">
                <Button variant="secondary" size="lg" className="whitespace-nowrap">
                  <span className="text-xl leading-none">🔍</span>
                  <span className="text-center">Browse Content</span>
                </Button>
              </Link>
              <Link to="/sports">
                <Button variant="secondary" size="lg" className="group whitespace-nowrap">
                  <span className="relative flex h-2 w-2 mr-0.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-danger opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-danger" />
                  </span>
                  <span className="text-xl leading-none">⚽</span>
                  <span className="text-center">Live Sports</span>
                </Button>
              </Link>
            </div>

            {/* Scroll Indicator */}
            <button
              onClick={scrollToNextSection}
              className="hidden sm:flex items-center justify-center mt-10 animate-fade-in mx-auto transition-all duration-300 hover:opacity-70 group"
              style={{ animationDelay: '0.8s' }}
              aria-label="Scroll to explore more content"
            >
              <div className="flex flex-col items-center gap-2 text-tertiary/30 group-hover:text-tertiary/50 transition-colors duration-300">
                <span className="text-[9px] tracking-[0.2em] uppercase font-medium">Scroll to explore</span>
                <svg className="w-3.5 h-3.5 animate-float group-hover:translate-y-0.5 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* ── Trending Content Showcase ───────────────────── */}
      <section ref={nextSectionRef} className="scroll-mt-16 relative py-16 sm:py-20 overflow-hidden">
        <AmbientGlow className="top-[-20%] left-1/2 -translate-x-1/2 w-[900px] h-[400px] opacity-60" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ContentRail
            title="Trending Now"
            subtitle="Top picks from our collection"
            icon="🔥"
            accentColor="accent"
            layout="grid"
            items={trendingItems}
            loading={trendingLoading}
            error={trendingError}
            onRetry={() => {
              setTrendingLoading(true);
              setTrendingError(null);
              fetchTrending()
                .then((items) => setTrendingItems(items.slice(0, 6)))
                .catch((err) => setTrendingError(err.message))
                .finally(() => setTrendingLoading(false));
            }}
            onViewDetails={(item) => setSelectedContent(item)}
          />
        </div>
      </section>

      {/* ── Sponsored Advertisements ──────────────────────── */}
      <section className="relative py-20 sm:py-28 overflow-hidden">
        <AmbientGlow className="top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[400px] opacity-50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            overline="Sponsored"
            title="Promoted"
            accent="Content"
            description="Discover campaigns and promotions from our trusted partners."
          />
          <AdBanner placement="all" limit={2} />
        </div>
      </section>

      {/* ── Stats Bar ──────────────────────────────────────── */}
      <section className="relative py-10 sm:py-14 overflow-hidden">
        <AmbientGlow className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[250px] opacity-50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat, idx) => (
              <div key={stat.label} className="flex flex-col items-center text-center animate-fade-in-up" style={{ animationDelay: `${idx * 0.1}s` }}>
                <p className="text-3xl sm:text-4xl font-semibold tracking-tight text-textPrimary">{stat.value}</p>
                <p className="text-xs text-text-textSecondary/60 mt-1.5 font-medium tracking-wide uppercase">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Section ──────────────────────────────────── */}
      <section className="relative py-20 sm:py-28 overflow-hidden">
        <AmbientGlow className="top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[400px] opacity-50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            overline="Features"
            title="Everything You"
            accent="Need"
            description="From discovery to promotion — NexPlay brings the entire entertainment ecosystem together."
          />

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {FEATURES.map((feature, idx) => (
              <div
                key={feature.title}
                className="group relative rounded-2xl p-6 sm:p-7 border border-border transition-all duration-300 animate-fade-in-up hover:-translate-y-1"
                style={{
                  backgroundColor: 'var(--color-card)',
                  boxShadow: 'var(--shadow-card)',
                  animationDelay: `${idx * 0.06}s`
                }}
              >
                <div className="relative">
                  {/* Icon */}
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110 text-accent-text"
                    style={{
                      background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                      border: '1px solid var(--color-border)'
                    }}
                  >
                    {feature.icon}
                  </div>

                  {/* Text */}
                  <h3 className="text-base font-semibold text-text-textPrimary mb-2 group-hover:text-accent-text transition-colors duration-200">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-textSecondary/55 leading-relaxed group-hover:textSecondary/75 transition-colors duration-200">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ────────────────────────────────────────── */}
      <section className="relative py-20 sm:py-28 overflow-hidden">
        <AmbientGlow className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[800px] h-[400px] sm:h-[500px] opacity-60" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2.5 mb-8 animate-fade-in">
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md"
              style={{
                background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
                border: '1px solid var(--color-border-light)',
                boxShadow: isDark ? 'inset 0 1px 0 rgba(255,255,255,0.06)' : 'inset 0 1px 0 rgba(255,255,255,0.6)'
              }}
            >
              <span className="relative w-5 h-5 shrink-0">
                <svg className="w-5 h-5 absolute inset-0" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" className="text-accent/30" />
                </svg>
                <svg className="w-5 h-5 absolute inset-0 animate-spin-slow text-accent" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="28 28" />
                </svg>
                <svg className="w-5 h-5 absolute inset-0 animate-spin-reverse-slow" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="3" r="1.8" fill="currentColor" className="text-accent/50" />
                </svg>
              </span>
              <span className="text-[11px] sm:text-xs text-accent-text font-semibold tracking-widest uppercase">
                Entertainment Discovery Platform
              </span>
            </div>
          </div>

          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold text-text-textPrimary mb-4 animate-fade-in-up tracking-[-0.015em]">
            Ready to <span className="text-gradient-hero">Explore</span>?
          </h2>
          <p className="text-base sm:text-lg text-text-textSecondary/50 mb-10 max-w-lg mx-auto animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            Join thousands discovering their next favorite content.
            <br className="hidden sm:block" />
            Sign up free — no credit card required.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <Link to="/register">
              <Button variant="primary" size="lg" className="text-base px-8">
                Create Free Account
              </Button>
            </Link>
            <Link to="/search">
              <Button variant="secondary" size="lg">
                Explore as Guest
              </Button>
            </Link>
          </div>

          {/* Trust signals */}
          <div className="flex items-center justify-center gap-6 mt-10 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center gap-1.5 text-xs text-textSecondary/40">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Free forever
            </div>
            <div className="flex items-center gap-1.5 text-xs text-textSecondary/40">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
              Secure & private
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-textSecondary/40">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
              10K+ users
            </div>
          </div>
        </div>
      </section>

      {/* ── Content Detail Modal ──────────────────────────── */}
      <DetailsModal
        isOpen={!!selectedContent}
        onClose={() => setSelectedContent(null)}
        content={selectedContent}
      />
    </>
  );
}
