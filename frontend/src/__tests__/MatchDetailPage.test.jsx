import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter, MemoryRouter, Routes, Route } from 'react-router-dom';
import MatchDetailPage from '../pages/MatchDetailPage';
import { ToastProvider } from '../context/ToastContext';

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: '1', name: 'Test', role: 'user' },
    isAuthenticated: true,
  }),
}));

import { matchAPI } from '../services/api';

vi.mock('../services/api', () => ({
  matchAPI: {
    getMatchById: vi.fn(),
    getMatchStreams: vi.fn(),
  },
}));

vi.mock('../services/socket', () => ({
  joinMatchRoom: vi.fn(),
  leaveMatchRoom: vi.fn(),
  onScoreUpdate: vi.fn(() => vi.fn()),
  onMatchEvent: vi.fn(() => vi.fn()),
}));

const mockMatch = {
  _id: '1',
  homeTeam: 'Barcelona',
  awayTeam: 'Madrid',
  homeScore: 2,
  awayScore: 1,
  status: 'live',
  minute: 67,
  competition: 'La Liga',
  sportType: 'Football',
  venue: 'Camp Nou',
  referee: 'John Smith',
  kickoffTime: new Date().toISOString(),
  events: [
    { _id: 'e1', minute: 23, type: 'goal', playerName: 'L. Messi', team: 'home' },
    { _id: 'e2', minute: 45, type: 'yellow_card', playerName: 'S. Ramos', team: 'away' },
    { _id: 'e3', minute: 67, type: 'goal', playerName: 'K. Benzema', team: 'away' },
  ],
  lineups: [
    {
      team: 'home',
      formation: '4-3-3',
      players: [
        { number: 10, name: 'L. Messi', position: 'FW' },
        { number: 5, name: 'S. Busquets', position: 'MF' },
      ],
      substitutes: [{ number: 17, name: 'A. Griezmann' }],
    },
    {
      team: 'away',
      formation: '4-4-2',
      players: [
        { number: 9, name: 'K. Benzema', position: 'FW' },
        { number: 4, name: 'S. Ramos', position: 'DF' },
      ],
      substitutes: [],
    },
  ],
  stats: {
    homePossession: 58,
    awayPossession: 42,
    homeShots: 12,
    awayShots: 8,
    homeShotsOnTarget: 5,
    awayShotsOnTarget: 3,
    homeFouls: 10,
    awayFouls: 14,
    homeCorners: 6,
    awayCorners: 3,
    homeYellowCards: 2,
    awayYellowCards: 3,
    homeRedCards: 0,
    awayRedCards: 0,
  },
};

const mockStreams = {
  data: {
    success: true,
    data: [
      {
        broadcasterId: { name: 'Sky Sports', logoUrl: '' },
        quality: 'HD',
        isFree: false,
        isOfficial: true,
        language: 'English',
        url: 'https://example.com/stream',
      },
    ],
  },
};

function renderMatchDetail(matchId = '1') {
  return render(
    <MemoryRouter initialEntries={[`/matches/${matchId}`]}>
      <ToastProvider>
        <Routes>
          <Route path="/matches/:id" element={<MatchDetailPage />} />
        </Routes>
      </ToastProvider>
    </MemoryRouter>
  );
}

describe('MatchDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    matchAPI.getMatchById.mockResolvedValue({
      data: { success: true, data: mockMatch },
    });
    matchAPI.getMatchStreams.mockResolvedValue(mockStreams);
  });

  it('shows loading skeleton initially', () => {
    renderMatchDetail();
    const skeletons = document.querySelectorAll('.skeleton');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders match score and details after loading', async () => {
    renderMatchDetail();

    await waitFor(() => {
      expect(screen.getByText('Barcelona')).toBeInTheDocument();
    });

    expect(screen.getByText('Madrid')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('shows live indicator with minute', async () => {
    renderMatchDetail();

    await waitFor(() => {
      expect(screen.getByText(/LIVE/i)).toBeInTheDocument();
    });
  });

  it('shows timeline tab with events', async () => {
    renderMatchDetail();

    await waitFor(() => {
      expect(screen.getByText('Barcelona')).toBeInTheDocument();
    });

    // Timeline tab is active by default - should show match events
    expect(screen.getByText(/L\. Messi/)).toBeInTheDocument();
    expect(screen.getByText(/23/)).toBeInTheDocument();
  });

  it('switches to lineups tab and shows formations', async () => {
    renderMatchDetail();

    await waitFor(() => {
      expect(screen.getByText('Barcelona')).toBeInTheDocument();
    });

    const lineupsTab = screen.getByRole('button', { name: /lineups/i });
    await userEvent.click(lineupsTab);

    await waitFor(() => {
      expect(screen.getByText(/4-3-3/)).toBeInTheDocument();
    });
    expect(screen.getByText(/4-4-2/)).toBeInTheDocument();
  });

  it('switches to stats tab and shows match statistics', async () => {
    renderMatchDetail();

    await waitFor(() => {
      expect(screen.getByText('Barcelona')).toBeInTheDocument();
    });

    const statsTab = screen.getByRole('button', { name: /stats/i });
    await userEvent.click(statsTab);

    await waitFor(() => {
      expect(screen.getByText(/Possession/)).toBeInTheDocument();
    });
    expect(screen.getByText(/Total Shots/)).toBeInTheDocument();
    // Match stats bar values
    expect(screen.getAllByText('58').length).toBeGreaterThanOrEqual(1);
  });

  it('switches to streams tab and shows streaming options', async () => {
    renderMatchDetail();

    await waitFor(() => {
      expect(screen.getByText('Barcelona')).toBeInTheDocument();
    });

    const streamsTab = screen.getByRole('button', { name: /streams/i });
    await userEvent.click(streamsTab);

    await waitFor(() => {
      expect(screen.getByText('Sky Sports')).toBeInTheDocument();
    });
  });

  it('shows error state on API failure', async () => {
    matchAPI.getMatchById.mockRejectedValue(new Error('Network error'));

    renderMatchDetail();

    // The error message text may also appear in a toast - query the specific button instead
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /back to matches/i })).toBeInTheDocument();
    });
  });
});
