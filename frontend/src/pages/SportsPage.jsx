import { useState, useEffect, useCallback, useRef } from 'react';
import { sportsAPI, favoriteAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import Button from '../components/Button';
import LoadingSkeleton from '../components/ott/LoadingSkeleton';

const SPORT_ICONS = {
  Football: String.fromCodePoint(0x26BD),
  Cricket: String.fromCodePoint(0x1F3CF),
  Basketball: String.fromCodePoint(0x1F3C0),
  Tennis: String.fromCodePoint(0x1F3BE),
  Soccer: String.fromCodePoint(0x26BD),
  Baseball: String.fromCodePoint(0x26BE),
  Hockey: String.fromCodePoint(0x1F3D2),
  MMA: String.fromCodePoint(0x1F94A),
  Boxing: String.fromCodePoint(0x1F94A),
  Golf: String.fromCodePoint(0x26F3),
  Rugby: String.fromCodePoint(0x1F3C9)
};

const SPORT_COLORS = {
  Football: { light: '#10b981', dark: '#34d399' },
  Cricket: { light: '#3b82f6', dark: '#60a5fa' },
  Basketball: { light: '#f97316', dark: '#fb923c' },
  Tennis: { light: '#22c55e', dark: '#4ade80' },
  Soccer: { light: '#10b981', dark: '#34d399' },
  Baseball: { light: '#ef4444', dark: '#f87171' },
  Hockey: { light: '#0ea5e9', dark: '#38bdf8' },
  MMA: { light: '#a855f7', dark: '#c084fc' },
  Boxing: { light: '#a855f7', dark: '#c084fc' },
  Golf: { light: '#14b8a6', dark: '#2dd4bf' },
  Rugby: { light: '#f43f5e', dark: '#fb7185' }
};

function FollowButton({ eventId, eventName, isFavorited, onToggle }) {
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onToggle(eventId, eventName);
      }}
      className={`p-1.5 rounded-lg transition-all ${
        isFavorited
          ? 'text-accent-text bg-accent/15 hover:bg-accent/25'
          : 'textSecondary/40 hover:text-accent-text hover:bg-accent/10'
      }`}
      aria-label={isFavorited ? 'Unfollow event' : 'Follow event'}
      title={isFavorited ? 'Unfollow' : 'Follow event'}
    >
      <svg className="w-4 h-4" fill={isFavorited ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    </button>
  );
}

function SportCard({ event, isFavorited, onFollowToggle }) {
  const isLive = event.status === 'Live';
  const isUpcoming = event.status === 'Upcoming';
  const isCompleted = event.status === 'Completed';

  const colors = SPORT_COLORS[event.sportType] || { light: 'rgb(var(--color-accent))', dark: 'rgb(var(--color-accent))' };
  const accentColor = isLive ? 'rgb(225, 80, 70)' : 'rgb(var(--color-accent))';

  return (
    <div
      className="group relative overflow-hidden rounded-xl border transition-all duration-300 hover:-translate-y-1"
      style={{
        backgroundColor: isLive ? 'rgba(225, 80, 70, 0.04)' : 'var(--color-card)',
        borderColor: isLive ? 'rgba(225, 80, 70, 0.12)' : isUpcoming ? 'rgba(var(--color-accent), 0.1)' : 'var(--color-border)',
        boxShadow: 'var(--shadow-card)'
      }}
    >
      {/* Live Badge */}
      {isLive && (
        <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-danger/15 backdrop-blur-sm z-10 shadow-sm shadow-danger/10">
          <span className="w-1.5 h-1.5 rounded-full bg-danger animate-pulse" />
          <span className="text-[10px] font-bold text-danger uppercase tracking-wider">LIVE</span>
        </div>
      )}

      <div className="p-4">
        {/* Sport Type Header */}
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-lg border"
            style={{
              backgroundColor: isLive ? 'rgba(225, 80, 70, 0.08)' : isUpcoming ? 'rgba(var(--color-accent), 0.08)' : 'var(--hover-bg)',
              borderColor: isLive ? 'rgba(225, 80, 70, 0.12)' : isUpcoming ? 'rgba(var(--color-accent), 0.12)' : 'var(--color-border)'
            }}
          >
            {SPORT_ICONS[event.sportType] || '\u{1F3C6}'}
          </div>
          <div className="min-w-0">
            <span className="text-xs font-semibold uppercase tracking-wider textAccent">
              {event.sportType}
            </span>
            {event.tournamentName && (
              <p className="text-[11px] text-text-textSecondary/60 truncate flex items-center gap-1">
                <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                {event.tournamentName}
              </p>
            )}
          </div>
        </div>

        {/* Teams & Score */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex-1 text-right">
            <p className={`text-sm font-semibold truncate ${
              isCompleted && event.homeScore > event.awayScore ? 'textAccent' : 'textPrimary'
            }`}>
              {event.homeTeam}
            </p>
          </div>

          <div className="shrink-0 text-center min-w-[80px]">
            {isUpcoming ? (
              <div className="flex flex-col items-center">
                <div className="w-9 h-9 rounded-full bg-accent/[0.06] border border-accent/10 flex items-center justify-center">
                  <span className="text-xs font-bold text-accent-text uppercase tracking-wider">VS</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <span className={`text-2xl font-extrabold tabular-nums leading-none ${
                  isCompleted && event.homeScore > event.awayScore ? 'textAccent' : 'textPrimary'
                }`}>
                  {event.homeScore}
                </span>
                <span className={`text-sm ${isLive ? 'text-danger/40' : 'textSecondary/20'}`}>:</span>
                <span className={`text-2xl font-extrabold tabular-nums leading-none ${
                  isCompleted && event.awayScore > event.homeScore ? 'textAccent' : 'textPrimary'
                }`}>
                  {event.awayScore}
                </span>
              </div>
            )}
          </div>

          <div className="flex-1 text-left">
            <p className={`text-sm font-semibold truncate ${
              isCompleted && event.awayScore > event.homeScore ? 'textAccent' : 'textPrimary'
            }`}>
              {event.awayTeam}
            </p>
          </div>
        </div>

        {/* Match Progress Bar (Live only) */}
        {isLive && event.minute && (
          <div className="mb-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-medium text-danger">{event.minute}'</span>
              <div className="flex-1 h-1 bg-danger/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-danger to-danger/60 rounded-full"
                  style={{ width: `${Math.min((event.minute / 120) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Follow Button */}
        <div className="flex justify-end px-4 pt-0 pb-1">
          <FollowButton
            eventId={event._id}
            eventName={`${event.homeTeam} vs ${event.awayTeam}`}
            isFavorited={isFavorited}
            onToggle={onFollowToggle}
          />
        </div>

        {/* Footer Info */}
        <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid var(--color-border)' }}>
          <div className="flex items-center gap-2 text-xs text-text-textSecondary/60 min-w-0">
            {event.venue && (
              <>
                <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="truncate max-w-[100px]">{event.venue}</span>
              </>
            )}
            {isUpcoming && event.startDate && (
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {new Date(event.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
            {isCompleted && event.startDate && (
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {new Date(event.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            )}
          </div>

          {event.streamingLinks?.length > 0 && (
            <div className="flex items-center gap-1 shrink-0">
              {event.streamingLinks.map((link, idx) => (
                <a
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-accent/[0.06] text-accent-text/70 hover:bg-accent/10 hover:text-accent-text transition-all"
                >
                  {link.name}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, label, onClick, count }) {
  return (
    <button
      onClick={onClick}
      className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 min-h-[44px] ${
        active
          ? 'text-accent-contrast font-bold shadow-md shadow-accent/30 border-0'
          : 'text-textSecondary hover:text-text-textPrimary hover:bg-hover border border-transparent'
      }`}
      style={active ? { background: 'var(--gradient-accent)' } : undefined}
      aria-label={`${label}${count > 0 ? ` (${count})` : ''}`}
    >
      {label}
      {count > 0 && (
        <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
          active ? 'bg-surface/20 text-accent-contrast' : 'bg-hover textSecondary'
        }`}>
          {count}
        </span>
      )}
    </button>
  );
}

function SportFilterDropdown({ selected, types, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClick);
    }
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  const currentLabel = selected
    ? `${SPORT_ICONS[selected] || String.fromCodePoint(0x1F3C6)} ${selected}`
    : `${String.fromCodePoint(0x1F3C6)} All Sports`;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm min-h-[44px] whitespace-nowrap w-full sm:w-auto transition-all ${
          selected
            ? 'bg-accent/10 text-accent-text border border-accent/30 font-semibold ring-1 ring-accent/20'
            : 'bg-card text-text-textSecondary border border-border hover:border-border-light'
        }`}
        aria-label="Filter by sport"
        aria-expanded={isOpen}
      >
        <span>{currentLabel}</span>
        <svg className={`w-3.5 h-3.5 transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />
          <div
            className="absolute right-0 top-full mt-1 z-40 w-56 py-1 rounded-xl shadow-xl border backdrop-blur-xl max-h-72 overflow-y-auto"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border-light)',
              boxShadow: 'var(--shadow-elevated)'
            }}
          >
            <button
              onClick={() => { onChange(''); setIsOpen(false); }}
              className={`w-full text-left px-4 py-2.5 text-sm transition-all flex items-center gap-2 ${
                !selected
                  ? 'bg-accent/10 text-accent-text font-semibold'
                  : 'text-text-textSecondary hover:text-text-textPrimary hover:bg-hover'
              }`}
            >
              {!selected && (
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
              )}
              <span className={!selected ? '' : 'ml-[22px]'}>{String.fromCodePoint(0x1F3C6)} All Sports</span>
            </button>
            {types.map(type => (
              <button
                key={type}
                onClick={() => { onChange(type); setIsOpen(false); }}
                className={`w-full text-left px-4 py-2.5 text-sm transition-all flex items-center gap-2 ${
                  selected === type
                    ? 'bg-accent/10 text-accent-text font-semibold'
                    : 'text-text-textSecondary hover:text-text-textPrimary hover:bg-hover'
                }`}
              >
                {selected === type && (
                  <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                )}
                <span className={selected === type ? '' : 'ml-[22px]'}>{SPORT_ICONS[type] || String.fromCodePoint(0x1F3C6)} {type}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function SportsPage() {
  const { addToast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('live');
  const [liveEvents, setLiveEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSport, setSelectedSport] = useState('');
  const [sportTypes, setSportTypes] = useState([]);
  const [favoritedEvents, setFavoritedEvents] = useState(new Set());

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [liveRes, upcomingRes, typesRes] = await Promise.all([
        sportsAPI.getLiveSports(),
        sportsAPI.getUpcomingSports(),
        sportsAPI.getSportTypes()
      ]);

      if (liveRes.data.success) setLiveEvents(liveRes.data.data);
      if (upcomingRes.data.success) setUpcomingEvents(upcomingRes.data.data);
      if (typesRes.data.success) setSportTypes(typesRes.data.data);

      // Load favorited events
      if (user) {
        try {
          const favRes = await favoriteAPI.getFavorites({ type: 'match', limit: 100 });
          if (favRes.data.success) {
            const favIds = new Set((favRes.data.data || []).map(f => f.refId?.toString()));
            setFavoritedEvents(favIds);
          }
        } catch (e) { /* non-critical */ }
      }
    } catch (err) {
      addToast('Failed to load sports data', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast, user]);

  const handleFollowToggle = async (eventId, eventName) => {
    if (!user) {
      addToast('Sign in to follow events', 'info');
      return;
    }
    const isFav = favoritedEvents.has(eventId);
    // Optimistic update
    setFavoritedEvents(prev => {
      const next = new Set(prev);
      if (isFav) next.delete(eventId);
      else next.add(eventId);
      return next;
    });
    try {
      if (isFav) {
        await favoriteAPI.removeFavorite({ type: 'match', refId: eventId });
      } else {
        await favoriteAPI.addFavorite({ type: 'match', refId: eventId, refName: eventName || '', sportType: null });
      }
    } catch (err) {
      // Rollback on failure
      setFavoritedEvents(prev => {
        const next = new Set(prev);
        if (isFav) next.add(eventId);
        else next.delete(eventId);
        return next;
      });
      addToast(err.response?.data?.message || 'Failed to update follow', 'error');
    }
  };

  useEffect(() => { fetchData(); }, [fetchData]);

  const getActiveEvents = () => {
    switch (activeTab) {
      case 'live': return liveEvents;
      case 'upcoming': return upcomingEvents;
      default: return [...liveEvents, ...upcomingEvents];
    }
  };

  const filteredEvents = getActiveEvents().filter(e =>
    !selectedSport || e.sportType === selectedSport
  );

  const activeEventCount = liveEvents.length + upcomingEvents.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="skeleton w-1 h-6 rounded-full shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="skeleton h-8 w-48 rounded-lg" />
                <div className="skeleton h-4 w-64 rounded-lg" />
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="skeleton rounded-xl h-40" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background animate-pageIn">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          <div className="mb-4 sm:mb-5">
            <div className="flex items-center gap-3">
              <div
                className="w-1 h-5 sm:h-6 rounded-full shrink-0"
                style={{ backgroundColor: activeTab === 'live' ? 'rgb(var(--color-danger))' : 'rgb(var(--color-accent))' }}
              />
              <div>
                <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold text-text-textPrimary tracking-tight">
                  {activeTab === 'live' ? 'Live' : activeTab === 'upcoming' ? 'Upcoming' : 'All'}{' '}
                  <span className="text-gradient">Sports</span>
                </h1>
                <p className="text-text-textSecondary/60 text-xs sm:text-sm mt-0.5">
                  {activeTab === 'live'
                    ? 'Follow live scores and match updates from around the world'
                    : 'Browse upcoming matches, schedules, and streaming links for your favorite sports'}
                </p>
              </div>
              {activeEventCount > 0 && (
                <div className="ml-auto shrink-0">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/[0.06] text-xs font-medium text-accent-text/70 border border-accent/10">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                    {activeEventCount} event{activeEventCount !== 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Tabs & Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="inline-flex items-center gap-1 p-1 rounded-lg" style={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
              <TabButton
                active={activeTab === 'live'}
                label="Live Now"
                onClick={() => setActiveTab('live')}
                count={liveEvents.length}
              />
              <TabButton
                active={activeTab === 'upcoming'}
                label="Upcoming"
                onClick={() => setActiveTab('upcoming')}
                count={upcomingEvents.length}
              />
              <TabButton
                active={activeTab === 'all'}
                label="All Events"
                onClick={() => setActiveTab('all')}
              />
            </div>

            <div className="w-full sm:w-auto">
              <SportFilterDropdown
                selected={selectedSport}
                types={sportTypes}
                onChange={setSelectedSport}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Main ───────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* ── Events Grid ─────────────────────────────────────── */}
        {filteredEvents.length === 0 ? (
          <div className="text-center py-16 sm:py-20">
            <div className="w-20 h-20 mx-auto mb-5 rounded-xl bg-accent/10 flex items-center justify-center border border-accent/10">
              <span className="text-4xl">{String.fromCodePoint(0x1F3DF) + String.fromCodePoint(0xFE0F)}</span>
            </div>
            <h3 className="text-lg font-semibold text-text-textPrimary mb-2">
              {selectedSport 
                ? `No ${activeTab} events in ${selectedSport}`
                : activeTab === 'live'
                ? 'No Live Events Right Now'
                : 'No Upcoming Events Found'
              }
            </h3>
            <p className="text-text-textSecondary text-sm mb-6 max-w-md mx-auto">
              {activeTab === 'live'
                ? 'There are no live events at the moment. Check the upcoming matches or browse all events!'
                : 'No upcoming events are scheduled at this time. Check back later for new match listings.'}
            </p>
            <div className="flex items-center justify-center gap-3">
              {activeTab !== 'all' && (
                <Button variant="primary" size="sm" onClick={() => setActiveTab('all')}>
                  View All Events
                </Button>
              )}
              {selectedSport && (
                <Button variant="ghost" size="sm" onClick={() => setSelectedSport('')}>
                  Clear Sport Filter
                </Button>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Results count */}
            <div className="flex items-center gap-2 text-sm text-textSecondary">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span>
                Showing {filteredEvents.length} {activeTab} event{filteredEvents.length !== 1 ? 's' : ''}
                {selectedSport ? ` in ${selectedSport}` : ''}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEvents.map((event, idx) => (
                <div key={event._id} className="animate-fade-in-up h-full" style={{ animationDelay: `${idx * 0.05}s` }}>
                  <SportCard event={event} isFavorited={favoritedEvents.has(event._id)} onFollowToggle={handleFollowToggle} />
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── Info Notice (sponsored card style) ──────────────── */}
        <div className="relative rounded-2xl overflow-hidden border border-border hover:border-accent/20 transition-all duration-300" style={{ backgroundColor: 'var(--color-card)', boxShadow: 'var(--shadow-card)' }}>
          <div className="relative p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border" style={{ backgroundColor: 'rgba(var(--color-accent), 0.08)', borderColor: 'rgba(var(--color-accent), 0.15)' }}>
                <svg className="w-5 h-5 text-accent-text" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-text-textPrimary mb-1">Sports Information</p>
                <p className="text-xs text-text-textSecondary/70 leading-relaxed text-justify">
                  Sports data is provided for informational purposes. NexPlay does not host live sports streams.
                  All streaming links redirect to official broadcasters. Scores and schedules are updated
                  periodically through third-party sports APIs.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
