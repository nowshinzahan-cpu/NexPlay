import { useState, useEffect, useCallback } from 'react';
import { matchAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { favoriteAPI } from '../services/api';
import { joinMatchRoom, leaveMatchRoom, onScoreUpdate, onMatchEvent } from '../services/socket';
import LoadingSkeleton from '../components/ott/LoadingSkeleton';
import ErrorState from '../components/ott/ErrorState';
import { useToast } from '../hooks/useToast';

const STATUS_COLORS = {
  live: 'rgb(225, 80, 70)',
  halftime: 'rgb(220, 185, 60)',
  finished: 'rgb(60, 190, 125)',
  scheduled: 'rgb(var(--color-accent))',
  postponed: 'rgb(95, 95, 102)'
};

function MatchCard({ match, favoritedMatches = new Set(), onFollowToggle = () => {} }) {
  const isLive = match.status === 'live' || match.status === 'halftime';
  const statusColor = STATUS_COLORS[match.status] || 'rgb(var(--color-accent))';

  const matchFavId = match._id;
  const isFav = favoritedMatches.has(matchFavId);

  return (
    <div
      className="group relative overflow-hidden rounded-xl border transition-all duration-300 hover:-translate-y-1 cursor-pointer"
      style={{
        backgroundColor: isLive ? 'rgba(225, 80, 70, 0.04)' : 'var(--color-card)',
        borderColor: isLive ? 'rgba(225, 80, 70, 0.12)' : 'var(--color-border)',
        boxShadow: 'var(--shadow-card)'
      }}
    >
      {isLive && (
        <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-danger/15 backdrop-blur-sm z-10">
          <span className="w-1.5 h-1.5 rounded-full bg-danger animate-pulse" />
          <span className="text-[10px] font-bold text-danger uppercase tracking-wider">
            {match.status === 'halftime' ? 'HT' : 'LIVE'}
          </span>
        </div>
      )}

      <div className="p-4">
        {/* Competition */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: statusColor }} />
          <span className="text-xs font-semibold uppercase tracking-wider textAccent">{match.competition}</span>
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded" style={{ backgroundColor: `${statusColor}15`, color: statusColor }}>
            {match.sportType}
          </span>
        </div>

        {/* Teams & Score */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex-1 text-right">
            <p className="text-sm font-semibold truncate text-textPrimary">{match.homeTeam}</p>
          </div>
          <div className="shrink-0 text-center min-w-[80px]">
            {match.status === 'scheduled' ? (
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-medium text-textSecondary">
                  {new Date(match.kickoffTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </span>
                <div className="w-9 h-9 rounded-full bg-accent/[0.06] border border-accent/10 flex items-center justify-center mt-1">
                  <span className="text-xs font-bold text-accent-text uppercase">VS</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl font-extrabold tabular-nums leading-none text-textPrimary">{match.homeScore}</span>
                <span className="text-sm text-textSecondary/20">:</span>
                <span className="text-2xl font-extrabold tabular-nums leading-none text-textPrimary">{match.awayScore}</span>
              </div>
            )}
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-semibold truncate text-textPrimary">{match.awayTeam}</p>
          </div>
        </div>

        {/* Minute/Progress Bar (Live/Halftime) */}
        {isLive && (
          <div className="mb-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-medium text-danger">{match.minute}'</span>
              <div className="flex-1 h-1 bg-danger/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-danger to-danger/60 rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min((match.minute / 120) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Footer Info */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div className="flex items-center gap-2 text-xs text-text-textSecondary/60 min-w-0">
            {match.venue && (
              <span className="truncate max-w-[120px] flex items-center gap-1">
                <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {match.venue}
              </span>
            )}
          </div>
          {match.kickoffTime && match.status === 'scheduled' && (
            <span className="text-[10px] text-textSecondary/40">
              {new Date(match.kickoffTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          )}
          <FollowButton
            matchId={match._id}
            matchName={`${match.homeTeam} vs ${match.awayTeam}`}
            isFavorited={isFav}
            onToggle={onFollowToggle}
          />
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
    >
      {label}
      {count > 0 && (
        <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${active ? 'bg-surface/20 text-accent-contrast' : 'bg-hover textSecondary'}`}>
          {count}
        </span>
      )}
    </button>
  );
}

function StandingsTable({ standings, competition }) {
  if (!standings || standings.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-textSecondary">No standings available for {competition}.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border" style={{ backgroundColor: 'var(--color-card)' }}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-xs uppercase tracking-wider text-text-textSecondary/60">
            <th className="text-left px-4 py-3 font-semibold">#</th>
            <th className="text-left px-4 py-3 font-semibold">Team</th>
            <th className="text-center px-3 py-3 font-semibold">Pld</th>
            <th className="text-center px-3 py-3 font-semibold">W</th>
            <th className="text-center px-3 py-3 font-semibold">D</th>
            <th className="text-center px-3 py-3 font-semibold">L</th>
            <th className="text-center px-3 py-3 font-semibold">GF</th>
            <th className="text-center px-3 py-3 font-semibold">GA</th>
            <th className="text-center px-3 py-3 font-semibold">GD</th>
            <th className="text-center px-3 py-3 font-semibold text-accent-text">Pts</th>
            <th className="text-left px-3 py-3 font-semibold">Form</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((row, idx) => (
            <tr
              key={row._id || idx}
              className="border-b border-border/50 hover:bg-hover transition-colors"
            >
              <td className={`px-4 py-3 font-bold text-center w-8 ${
                idx < 4 ? 'text-accent-text' : 'text-textSecondary'
              }`}>
                {row.position || idx + 1}
              </td>
              <td className="px-4 py-3 font-medium text-textPrimary">{row.teamName}</td>
              <td className="px-3 py-3 text-center text-textSecondary">{row.played}</td>
              <td className="px-3 py-3 text-center text-success">{row.wins}</td>
              <td className="px-3 py-3 text-center text-textSecondary">{row.draws}</td>
              <td className="px-3 py-3 text-center text-danger">{row.losses}</td>
              <td className="px-3 py-3 text-center text-text-textPrimary font-medium">{row.goalsFor}</td>
              <td className="px-3 py-3 text-center text-textPrimary">{row.goalsAgainst}</td>
              <td className={`px-3 py-3 text-center font-semibold ${
                row.goalDifference > 0 ? 'text-success' : row.goalDifference < 0 ? 'text-danger' : 'textSecondary'
              }`}>
                {row.goalDifference > 0 ? '+' : ''}{row.goalDifference}
              </td>
              <td className="px-3 py-3 text-center font-extrabold text-accent-text">{row.points}</td>
              <td className="px-3 py-3">
                <div className="flex gap-0.5">
                  {(row.form || []).slice(-5).map((result, i) => (
                    <span
                      key={i}
                      className={`inline-flex items-center justify-center w-5 h-5 rounded text-[9px] font-bold ${
                        result === 'W' ? 'bg-success/20 text-success' :
                        result === 'D' ? 'bg-warning/20 text-warning' :
                        'bg-danger/20 text-danger'
                      }`}
                    >
                      {result}
                    </span>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FollowButton({ matchId, matchName, isFavorited, onToggle }) {
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onToggle(matchId, matchName);
      }}
      className={`p-1.5 rounded-lg transition-all ${
        isFavorited
          ? 'text-accent-text bg-accent/15 hover:bg-accent/25'
          : 'textSecondary/40 hover:text-accent-text hover:bg-accent/10'
      }`}
      aria-label={isFavorited ? 'Unfollow match' : 'Follow match'}
      title={isFavorited ? 'Unfollow' : 'Follow match'}
    >
      <svg className="w-4 h-4" fill={isFavorited ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    </button>
  );
}

export default function MatchCenter() {
  const { addToast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('live');
  const [liveMatches, setLiveMatches] = useState([]);
  const [todayMatches, setTodayMatches] = useState([]);
  const [upcomingMatches, setUpcomingMatches] = useState([]);
  const [standings, setStandings] = useState([]);
  const [standingsCompetition, setStandingsCompetition] = useState('Premier League');
  const [standingsLoading, setStandingsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favoritedMatches, setFavoritedMatches] = useState(new Set());

  const fetchMatches = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [liveRes, todayRes, upcomingRes] = await Promise.all([
        matchAPI.getLiveMatches(),
        matchAPI.getTodayMatches(),
        matchAPI.getUpcomingMatches({ limit: 20 })
      ]);

      if (liveRes.data.success) setLiveMatches(liveRes.data.data || []);
      if (todayRes.data.success) setTodayMatches(todayRes.data.data || []);
      if (upcomingRes.data.success) setUpcomingMatches(upcomingRes.data.data || []);

      // Subscribe to socket rooms for live matches
      (liveRes.data.data || []).forEach(m => joinMatchRoom(m._id));

      // Load user's favorited matches for follow buttons
      if (user) {
        try {
          const favRes = await favoriteAPI.getFavorites({ type: 'match', limit: 100 });
          if (favRes.data.success) {
            const favIds = new Set((favRes.data.data || []).map(f => f.refId?.toString()));
            setFavoritedMatches(favIds);
          }
        } catch (e) { /* non-critical */ }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load matches. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchMatches();
    const interval = setInterval(fetchMatches, 30000); // Refresh every 30s
    return () => {
      clearInterval(interval);
      // Leave all match rooms
      liveMatches.forEach(m => leaveMatchRoom(m._id));
    };  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch standings when competition changes
  useEffect(() => {
    if (activeTab !== 'standings') return;
    const fetchStandings = async () => {
      setStandingsLoading(true);
      try {
        const res = await matchAPI.getStandings(standingsCompetition);
        if (res.data.success) setStandings(res.data.data || []);
      } catch (err) {
        addToast('Failed to load standings', 'error');
      } finally {
        setStandingsLoading(false);
      }
    };
    fetchStandings();
  }, [activeTab, standingsCompetition, addToast]);

  // Listen for real-time score updates
  useEffect(() => {
    const unsubScore = onScoreUpdate('*', (data) => {
      setLiveMatches(prev =>
        prev.map(m => m._id === data.matchId ? { ...m, homeScore: data.homeScore, awayScore: data.awayScore, minute: data.minute } : m)
      );
    });
    const unsubEvent = onMatchEvent('*', (data) => {
      setLiveMatches(prev =>
        prev.map(m => m._id === data.matchId ? { ...m, ...data.match } : m)
      );
    });
    return () => {
      if (unsubScore) unsubScore();
      if (unsubEvent) unsubEvent();
    };
  }, []);

  const handleFollowToggle = async (matchId, matchName) => {
    if (!user) {
      addToast('Sign in to follow matches', 'info');
      return;
    }
    const isFav = favoritedMatches.has(matchId);
    // Optimistic update
    setFavoritedMatches(prev => {
      const next = new Set(prev);
      if (isFav) next.delete(matchId);
      else next.add(matchId);
      return next;
    });
    try {
      if (isFav) {
        await favoriteAPI.removeFavorite({ type: 'match', refId: matchId });
      } else {
        await favoriteAPI.addFavorite({
          type: 'match',
          refId: matchId,
          refName: matchName || '',
          sportType: null
        });
      }
    } catch (err) {
      // Rollback on failure
      setFavoritedMatches(prev => {
        const next = new Set(prev);
        if (isFav) next.add(matchId);
        else next.delete(matchId);
        return next;
      });
      addToast(err.response?.data?.message || 'Failed to update follow', 'error');
    }
  };

  const getActiveMatches = () => {
    switch (activeTab) {
      case 'live': return liveMatches;
      case 'today': return todayMatches;
      case 'upcoming': return upcomingMatches;
      default: return [...liveMatches, ...todayMatches, ...upcomingMatches];
    }
  };

  const COMPETITIONS = [
    'Premier League', 'La Liga', 'Serie A', 'Bundesliga', 'Ligue 1',
    'UEFA Champions League', 'UEFA Europa League', 'MLS', 'NBA', 'NFL'
  ];

  const matches = getActiveMatches();

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="skeleton h-8 w-48 rounded-lg mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="skeleton rounded-xl h-40" />)}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ErrorState message={error} onRetry={fetchMatches} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background animate-pageIn">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-1 h-6 rounded-full shrink-0"
              style={{ backgroundColor: activeTab === 'live' ? 'rgb(225, 80, 70)' : 'rgb(var(--color-accent))' }}
            />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-text-textPrimary tracking-tight">
                Match <span className="text-gradient">Center</span>
              </h1>
              <p className="text-textSecondary/60 text-sm mt-0.5">
                Live scores, match updates, and upcoming fixtures from around the world
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="inline-flex items-center gap-1 p-1 rounded-lg" style={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
            <TabButton active={activeTab === 'live'} label="Live Now" onClick={() => setActiveTab('live')} count={liveMatches.length} />
            <TabButton active={activeTab === 'today'} label="Today" onClick={() => setActiveTab('today')} count={todayMatches.length} />
            <TabButton active={activeTab === 'upcoming'} label="Upcoming" onClick={() => setActiveTab('upcoming')} count={upcomingMatches.length} />
          <TabButton active={activeTab === 'standings'} label="Standings" onClick={() => setActiveTab('standings')} />
          </div>
        </div>

        {/* Standings Tab */}
        {activeTab === 'standings' ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <select
                value={standingsCompetition}
                onChange={(e) => setStandingsCompetition(e.target.value)}
                className="input-field w-full sm:w-64 text-sm"
                aria-label="Select competition"
              >
                {COMPETITIONS.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              {standingsLoading && (
                <div className="flex items-center gap-2 text-xs text-textSecondary">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Loading...
                </div>
              )}
            </div>
            <StandingsTable standings={standings} competition={standingsCompetition} />
          </div>
        ) : matches.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-5 rounded-xl bg-accent/10 flex items-center justify-center border border-accent/10">
              <svg className="w-10 h-10 text-accent-text/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-text-textPrimary mb-2">
              {activeTab === 'live' ? 'No Live Matches' : activeTab === 'today' ? 'No Matches Today' : 'No Upcoming Matches'}
            </h3>
            <p className="text-text-textSecondary text-sm mb-6 max-w-md mx-auto">
              {activeTab === 'live'
                ? 'No matches are currently in progress.'
                : 'Check back later for new match listings.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {matches.map(match => (
              <a key={match._id} href={`/matches/${match._id}`}>
                <MatchCard match={match} favoritedMatches={favoritedMatches} onFollowToggle={handleFollowToggle} />
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
