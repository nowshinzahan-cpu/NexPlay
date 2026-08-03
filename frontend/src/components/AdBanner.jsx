import { useState, useEffect } from 'react';
import api from '../services/api';

/**
 * AdBanner — fetches and displays active advertisements on public pages.
 * Implements FR-16: "The system shall display active advertisements on designated
 * sections of the platform."
 *
 * Props:
 *   placement  - 'banner' | 'sidebar' | 'featured' (default: 'banner')
 *   limit      - Max number of ads to fetch (default: 3)
 *   className  - Additional CSS classes
 */

/* ── Shared sponsored badge ────────────────────────────────── */
function SponsoredBadge() {
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border text-accent-text"
      style={{
        backgroundColor: 'rgba(var(--color-accent), 0.12)',
        borderColor: 'rgba(var(--color-accent), 0.20)'
      }}
    >
      <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
      </svg>
      Sponsored
    </span>
  );
}

/* ── Shared card content (identical for banner & featured) ── */
function AdCardContent({ ad, textColor, secondaryColor, accentColor }) {
  return (
    <div className="relative flex flex-col flex-1 w-full">
      <div className="relative flex flex-col flex-1 p-5 sm:p-6 gap-2.5">
        {/* Header row */}
        <div className="flex items-center justify-between gap-2">
          <SponsoredBadge />
          {ad.companyId?.companyName && (
            <span className="text-[9px] sm:text-[10px] font-medium truncate" style={{ color: secondaryColor }}>
              {ad.companyId.companyName}
            </span>
          )}
        </div>

        {/* Title */}
        <h4 className="text-sm sm:text-base font-bold leading-snug transition-colors duration-200" style={{ color: textColor }}>
          {ad.title}
        </h4>

        {/* Description */}
        <div className="flex-1 min-h-0">
          {ad.description && (
            <p className="text-xs sm:text-sm leading-relaxed line-clamp-3" style={{ color: secondaryColor }}>
              {ad.description}
            </p>
          )}
        </div>

        {/* CTA */}
        <div className="pt-3 mt-auto">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold transition-colors duration-200" style={{ color: accentColor }}>
            Explore Campaign
            <svg className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── Card wrapper (same for banner & featured) ────────────── */
function CardWrapper({ children, href, className = '' }) {
  return (
    <a
      href={href || '#'}
      target="_blank"
      rel="noopener noreferrer"
      className={`group relative flex flex-col h-full rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-0.5 border border-border hover:border-accent/20 ${className}`}
      style={{
        backgroundColor: 'var(--color-card)',
        boxShadow: 'var(--shadow-card)'
      }}
    >
      {children}
    </a>
  );
}

/* ── Image overlay wrapper (with min-height for image ads) ── */
function ImageAdWrapper({ children }) {
  return (
    <div className="relative w-full min-h-[200px] sm:min-h-[220px] flex flex-col overflow-hidden">
      {children}
    </div>
  );
}

export default function AdBanner({ placement = 'banner', limit = 3, className = '' }) {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const fetchAds = async () => {
      try {
        const params = { limit };
        if (placement && placement !== 'all') {
          params.placement = placement;
        }
        const { data } = await api.get('/api/advertisements/active', { params });
        if (!cancelled && data?.success) {
          setAds(data.data || []);
        }
      } catch {
        // Silently fail — ads are non-critical
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchAds();
    return () => { cancelled = true; };
  }, [placement, limit]);

  // Auto-rotate banner ads every 6 seconds
  useEffect(() => {
    if (ads.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % ads.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [ads.length]);

  if (loading) return null;
  if (ads.length === 0) return null;

  /* ── Renders an ad inside a CardWrapper (used by both) ──── */
  function renderAd(ad, isBanner) {
    const textColor = ad.imageUrl ? '#fff' : 'var(--color-textPrimary)';
    const secondaryColor = ad.imageUrl ? 'rgba(255,255,255,0.7)' : 'var(--color-textSecondary)';
    const accentColor = ad.imageUrl ? 'rgba(255,255,255,0.85)' : 'rgb(var(--color-accent-text))';

    if (ad.imageUrl) {
      return (
        <ImageAdWrapper>
          <img
            src={ad.imageUrl}
            alt={ad.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
          <AdCardContent ad={ad} textColor={textColor} secondaryColor={secondaryColor} accentColor={accentColor} />
        </ImageAdWrapper>
      );
    }
    return <AdCardContent ad={ad} textColor={textColor} secondaryColor={secondaryColor} accentColor={accentColor} />;
  }

  /* ── Banner Carousel ────────────────────────────────────── */
  if (placement === 'banner') {
    const ad = ads[currentIndex];
    return (
      <div className="rounded-2xl overflow-hidden border border-border hover:border-accent/25 transition-all duration-300">
        <CardWrapper href={ad?.targetUrl} className="!border-0">
          {renderAd(ad || {}, true)}
        </CardWrapper>

        {ads.length > 1 && (
          <div className="flex items-center justify-center gap-2 py-3 bg-card border-t border-border">
            {ads.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`rounded-full transition-all duration-300 ${
                  idx === currentIndex
                    ? 'bg-accent w-6 h-2'
                    : 'bg-textSecondary/20 hover:bg-textSecondary/40 w-2 h-2'
                }`}
                aria-label={`Show ad ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  /* ── Featured Card Grid ────────────────────────────────── */
  if (placement === 'featured' || placement === 'all') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 items-stretch">
        {ads.map((ad, idx) => (
          <div key={ad._id} className="animate-fade-in-up" style={{ animationDelay: `${idx * 0.08}s` }}>
            <CardWrapper href={ad.targetUrl}>
              {renderAd(ad, false)}
            </CardWrapper>
          </div>
        ))}
      </div>
    );
  }

  /* ── Sidebar Ads Stack ──────────────────────────────────── */
  if (placement === 'sidebar') {
    return (
      <div className="space-y-3">
        {ads.map((ad) => (
          <CardWrapper key={ad._id} href={ad.targetUrl} className="!flex-row !items-start !p-4">
            {ad.imageUrl && (
              <div className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0">
                <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="relative min-w-0 flex-1">
              <p className="text-sm font-medium truncate transition-colors duration-200" style={{ color: 'var(--color-textPrimary)' }}>
                {ad.title}
              </p>
              {ad.description && (
                <p className="text-xs mt-0.5 line-clamp-2" style={{ color: 'var(--color-textSecondary)' }}>
                  {ad.description}
                </p>
              )}
              <span className="text-[9px] mt-1 block text-textSecondary">
                Sponsored
              </span>
            </div>
          </CardWrapper>
        ))}
      </div>
    );
  }

  return null;
}
