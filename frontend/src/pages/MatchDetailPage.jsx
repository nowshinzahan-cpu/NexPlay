import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { matchAPI } from '../services/api';
import { joinMatchRoom, leaveMatchRoom, onScoreUpdate, onMatchEvent } from '../services/socket';
import { useToast } from '../hooks/useToast';
import Button from '../components/Button';
import LoadingSkeleton from '../components/ott/LoadingSkeleton';

function TimelineTab({ events, match }) {
  if (!events?.length) {
    return (
      <div className="text-center py-10">
        <p className="text-sm text-textSecondary">No events yet</p>
      </div>
    );
  }

  const getEventIcon = (type) => {
    switch (type) {
      case 'goal': return <span className="text-lg">⚽</span>;
      case 'yellow_card': return <span className="text-warning text-lg">🟨</span>;
      case 'red_card': return <span className="text-red-500 text-lg">🟥</span>;
      case 'substitution': return <span className="text-lg">🔄</span>;
      case 'penalty': return <span className="text-lg">⚽</span>;
      case 'own_goal': return <span className="text-lg">🔄</span>;
      case 'corner': return <span className="text-lg">⛳</span>;
      default: return <span className="text-lg">•</span>;
    }
  };

  return (
    <div className="space-y-1">
      {events.map((event, idx) => (
        <div key={event._id || idx} className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-hover transition-colors">
          <div className="w-12 text-right text-sm font-mono text-textSecondary">{event.minute}'{event.addedTime ? `+${event.addedTime}` : ''}</div>
          <div className="w-8 flex justify-center">{getEventIcon(event.type)}</div>
          <div className={`flex-1 ${event.team === 'home' ? 'text-left' : 'text-right'}`}>
            <span className="text-sm font-medium text-textPrimary">{event.playerName || 'Unknown'}</span>
            {event.assistedBy && <span className="text-xs text-textSecondary ml-1">(assist: {event.assistedBy})</span>}
            {event.description && <p className="text-[10px] text-text-textSecondary/60">{event.description}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}

function LineupsTab({ lineups }) {
  if (!lineups?.length) {
    return (
      <div className="text-center py-10">
        <p className="text-sm text-textSecondary">Lineups not yet available</p>
      </div>
    );
  }

  const homeLineup = lineups.find(l => l.team === 'home');
  const awayLineup = lineups.find(l => l.team === 'away');

  const renderLineup = (lineup, teamLabel) => {
    if (!lineup) return null;
    return (
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-textPrimary">{teamLabel}</h4>
          <span className="text-xs text-textSecondary">Formation: {lineup.formation || 'N/A'}</span>
        </div>
        {lineup.coach && <p className="text-[10px] text-text-textSecondary/60 mb-2">Coach: {lineup.coach}</p>}
        <div className="space-y-1">
          {lineup.players?.map((player, idx) => (
            <div key={idx} className="flex items-center gap-2 py-1">
              <span className="text-xs font-mono text-textSecondary w-6 text-right">{player.number}</span>
              <span className="text-sm text-textPrimary">{player.name}</span>
              <span className="text-[10px] text-text-textSecondary/50 ml-auto">{player.position}</span>
              {player.isCaptain && <span className="text-xs text-accent-text">(C)</span>}
              {player.isGoalkeeper && <span className="text-xs text-accent-text">GK</span>}
            </div>
          ))}
        </div>
        {lineup.substitutes?.length > 0 && (
          <>
            <p className="text-xs font-semibold text-text-textSecondary mt-3 mb-1">Substitutes</p>
            {lineup.substitutes.map((sub, idx) => (
              <div key={idx} className="flex items-center gap-2 py-0.5">
                <span className="text-xs font-mono text-textSecondary w-6 text-right">{sub.number}</span>
                <span className="text-sm text-textPrimary">{sub.name}</span>
              </div>
            ))}
          </>
        )}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {renderLineup(homeLineup, 'Home')}
      {renderLineup(awayLineup, 'Away')}
    </div>
  );
}

function StatsTab({ match }) {
  if (!match?.stats) {
    return (
      <div className="text-center py-10">
        <p className="text-sm text-textSecondary">Stats not available</p>
      </div>
    );
  }

  const stats = match.stats;
  const statItems = [
    { label: 'Possession', home: stats.homePossession, away: stats.awayPossession, unit: '%' },
    { label: 'Total Shots', home: stats.homeShots, away: stats.awayShots },
    { label: 'Shots on Target', home: stats.homeShotsOnTarget, away: stats.awayShotsOnTarget },
    { label: 'Fouls', home: stats.homeFouls, away: stats.awayFouls },
    { label: 'Corners', home: stats.homeCorners, away: stats.awayCorners },
    { label: 'Yellow Cards', home: stats.homeYellowCards, away: stats.awayYellowCards },
    { label: 'Red Cards', home: stats.homeRedCards, away: stats.awayRedCards }
  ];

  const maxVal = (a, b) => Math.max(a || 0, b || 0, 1);

  return (
    <div className="space-y-4">
      {statItems.map((stat, idx) => {
        const max = maxVal(stat.home, stat.away);
        const homePct = ((stat.home || 0) / max) * 80;
        const awayPct = ((stat.away || 0) / max) * 80;
        return (
          <div key={idx} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-text-textPrimary w-12 text-right">{stat.home || 0}</span>
              <span className="text-xs text-text-textSecondary/60 font-medium">{stat.label}{stat.unit || ''}</span>
              <span className="font-semibold text-text-textPrimary w-12">{stat.away || 0}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 rounded-full bg-hover overflow-hidden">
                <div className="h-full rounded-full bg-accent/60" style={{ width: `${homePct}%`, marginLeft: `${80 - homePct}%` }} />
              </div>
              <div className="flex-1 h-1.5 rounded-full bg-hover overflow-hidden">
                <div className="h-full rounded-full bg-accent/60" style={{ width: `${awayPct}%` }} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function StreamsTab({ matchId }) {
  const [streams, setStreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(null);

  useEffect(() => {
    const fetchStreams = async () => {
      try {
        const res = await matchAPI.getMatchStreams(matchId);
        if (res.data.success) setStreams(res.data.data || []);
      } catch (err) {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchStreams();
  }, [matchId]);

  const handleWatch = (stream) => {
    setShowConfirm(stream);
  };

  if (loading) {
    return <div className="space-y-3">{[1, 2].map(i => <div key={i} className="skeleton h-16 rounded-xl" />)}</div>;
  }

  if (!streams.length) {
    return (
      <div className="text-center py-10">
        <p className="text-sm text-textSecondary">No streaming links available for your region</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {streams.map((stream, idx) => (
        <div key={idx} className="card flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              {stream.broadcasterId?.logoUrl ? (
                <img src={stream.broadcasterId.logoUrl} alt="" className="w-8 h-8 object-contain" />
              ) : (
                <span className="text-accent-text font-bold text-sm">{stream.broadcasterId?.name?.charAt(0) || 'TV'}</span>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-textPrimary">{stream.broadcasterId?.name || 'Stream'}</p>
              <div className="flex items-center gap-2 text-[10px] text-text-textSecondary/60">
                <span>{stream.quality || 'HD'}</span>
                {stream.isFree && <span className="text-success">Free</span>}
                {stream.isOfficial && <span className="text-accent-text">Official</span>}
                <span>{stream.language || 'English'}</span>
              </div>
            </div>
          </div>
          <Button variant="primary" size="sm" onClick={() => handleWatch(stream)}>
            Watch
          </Button>
        </div>
      ))}

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowConfirm(null)}>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-text-textPrimary mb-2">External Link</h3>
            <p className="text-sm text-text-textSecondary mb-4">
              You're about to leave the app to watch on <strong className="textPrimary">{showConfirm.broadcasterId?.name}</strong>.
            </p>
            <div className="flex items-center gap-3">
              <a href={showConfirm.url} target="_blank" rel="noopener noreferrer" className="flex-1">
                <Button variant="primary" className="w-full">Continue to Stream</Button>
              </a>
              <Button variant="ghost" onClick={() => setShowConfirm(null)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MatchDetailPage() {
  const { id } = useParams();
  const { addToast } = useToast();
  const [match, setMatch] = useState(null);
  const [events, setEvents] = useState([]);
  const [lineups, setLineups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('timeline');

  const fetchMatch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await matchAPI.getMatchById(id);
      if (res.data.success) {
        const data = res.data.data;
        setMatch(data);
        setEvents(data.events || []);
        setLineups(data.lineups || []);
        joinMatchRoom(id);
      }
    } catch (err) {
      setError('Failed to load match details');
      addToast('Failed to load match', 'error');
    } finally {
      setLoading(false);
    }
  }, [id, addToast]);

  useEffect(() => {
    fetchMatch();
    return () => leaveMatchRoom(id);
  }, [fetchMatch, id]);

  // Socket real-time updates
  useEffect(() => {
    const unsubScore = onScoreUpdate(id, (data) => {
      setMatch(prev => prev ? { ...prev, homeScore: data.homeScore, awayScore: data.awayScore, minute: data.minute } : prev);
    });
    const unsubEvent = onMatchEvent(id, (data) => {
      if (data.event) setEvents(prev => [...prev, data.event]);
      if (data.match) setMatch(prev => prev ? { ...prev, ...data.match } : prev);
    });
    return () => { unsubScore?.(); unsubEvent?.(); };
  }, [id]);

  const isLive = match?.status === 'live' || match?.status === 'halftime';

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="skeleton h-32 rounded-2xl mb-6" />
          <div className="skeleton h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !match) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-text-textSecondary mb-4">{error || 'Match not found'}</p>
          <Link to="/matches"><Button variant="primary" size="sm">Back to Matches</Button></Link>
        </div>
      </div>
    );
  }

  const tabs = [
    { key: 'timeline', label: 'Timeline' },
    { key: 'lineups', label: 'Lineups' },
    { key: 'stats', label: 'Stats' },
    { key: 'streams', label: 'Streams' }
  ];

  return (
    <div className="min-h-screen bg-background animate-pageIn">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Score Header */}
        <div className="card mb-6 text-center">
          {isLive && (
            <div className="flex items-center justify-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-danger animate-pulse" />
              <span className="text-xs font-bold text-danger uppercase tracking-wider">
                {match.status === 'halftime' ? 'Halftime' : 'LIVE'} • {match.minute}'
              </span>
            </div>
          )}
          <div className="flex items-center justify-center gap-4 sm:gap-8">
            <div className="flex-1 text-right">
              <p className="text-lg sm:text-xl font-bold text-textPrimary">{match.homeTeam}</p>
            </div>
            <div className="shrink-0">
              {match.status === 'scheduled' ? (
                <div>
                  <span className="text-2xl sm:text-3xl font-bold textAccent">VS</span>
                  <p className="text-xs text-text-textSecondary mt-1">
                    {new Date(match.kickoffTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="text-3xl sm:text-5xl font-extrabold tabular-nums text-textPrimary">{match.homeScore}</span>
                  <span className="text-lg text-textSecondary/30">:</span>
                  <span className="text-3xl sm:text-5xl font-extrabold tabular-nums text-textPrimary">{match.awayScore}</span>
                </div>
              )}
            </div>
            <div className="flex-1 text-left">
              <p className="text-lg sm:text-xl font-bold text-textPrimary">{match.awayTeam}</p>
            </div>
          </div>
          <div className="flex items-center justify-center gap-3 mt-3 text-xs text-text-textSecondary/60">
            <span>{match.competition}</span>
            {match.venue && <span>• {match.venue}</span>}
            {match.referee && <span>• Ref: {match.referee}</span>}
          </div>
        </div>

        {/* Tabs */}
        <div className="inline-flex items-center gap-1 p-1 rounded-lg mb-6" style={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? 'text-accent-contrast font-bold shadow-md shadow-accent/30'
                  : 'text-textSecondary hover:text-text-textPrimary hover:bg-hover'
              }`}
              style={activeTab === tab.key ? { background: 'var(--gradient-accent)' } : undefined}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="card">
          {activeTab === 'timeline' && <TimelineTab events={events} match={match} />}
          {activeTab === 'lineups' && <LineupsTab lineups={lineups} />}
          {activeTab === 'stats' && <StatsTab match={match} />}
          {activeTab === 'streams' && <StreamsTab matchId={match._id} />}
        </div>
      </div>
    </div>
  );
}
