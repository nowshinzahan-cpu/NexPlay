import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import MatchCenter from '../pages/MatchCenter';
import { ToastProvider } from '../context/ToastContext';

// Mock useAuth so AuthProvider is not needed
vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: '1', name: 'Test', role: 'user' },
    isAuthenticated: true,
    isAdmin: false,
  }),
}));

import { matchAPI } from '../services/api';

vi.mock('../services/api', () => ({
  matchAPI: {
    getLiveMatches: vi.fn(),
    getTodayMatches: vi.fn(),
    getUpcomingMatches: vi.fn(),
  },
}));

// Mock socket
vi.mock('../services/socket', () => ({
  joinMatchRoom: vi.fn(),
  leaveMatchRoom: vi.fn(),
  onScoreUpdate: vi.fn(() => vi.fn()),
  onMatchEvent: vi.fn(() => vi.fn()),
}));

const mockMatches = {
  live: [
    { _id: '1', homeTeam: 'Barcelona', awayTeam: 'Madrid', homeScore: 2, awayScore: 1, status: 'live', minute: 67, competition: 'La Liga', sportType: 'Football', venue: 'Camp Nou', kickoffTime: new Date().toISOString() },
    { _id: '2', homeTeam: 'City', awayTeam: 'Arsenal', homeScore: 0, awayScore: 0, status: 'live', minute: 15, competition: 'Premier League', sportType: 'Football', venue: 'Etihad', kickoffTime: new Date().toISOString() },
  ],
  today: [],
  upcoming: [
    { _id: '3', homeTeam: 'Lakers', awayTeam: 'Celtics', homeScore: 0, awayScore: 0, status: 'scheduled', competition: 'NBA', sportType: 'Basketball', venue: 'Arena', kickoffTime: new Date(Date.now() + 86400000).toISOString() },
  ],
};

function renderMatchCenter() {
  return render(
    <BrowserRouter>
      <ToastProvider>
        <MatchCenter />
      </ToastProvider>
    </BrowserRouter>
  );
}

describe('MatchCenter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    matchAPI.getLiveMatches.mockResolvedValue({ data: { success: true, data: mockMatches.live } });
    matchAPI.getTodayMatches.mockResolvedValue({ data: { success: true, data: mockMatches.today } });
    matchAPI.getUpcomingMatches.mockResolvedValue({ data: { success: true, data: mockMatches.upcoming } });
  });

  it('shows loading skeleton initially', () => {
    renderMatchCenter();
    const skeletons = document.querySelectorAll('.skeleton');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders match cards after loading', async () => {
    renderMatchCenter();

    await waitFor(() => {
      expect(screen.getByText('Barcelona')).toBeInTheDocument();
    });

    expect(screen.getByText('Madrid')).toBeInTheDocument();
    expect(screen.getByText('City')).toBeInTheDocument();
  });

  it('shows live indicator for live matches', async () => {
    renderMatchCenter();

    await waitFor(() => {
      expect(screen.getAllByText('LIVE').length).toBe(2);
    });
  });

  it('switches tabs and shows upcoming matches', async () => {
    renderMatchCenter();

    await waitFor(() => {
      expect(screen.getAllByText('LIVE').length).toBe(2);
    });

    const upcomingTab = screen.getByRole('button', { name: /upcoming/i });
    await userEvent.click(upcomingTab);

    await waitFor(() => {
      expect(screen.getByText('Lakers')).toBeInTheDocument();
      expect(screen.getByText('Celtics')).toBeInTheDocument();
    });
  });

  it('shows empty state when no matches', async () => {
    matchAPI.getLiveMatches.mockResolvedValue({ data: { success: true, data: [] } });
    matchAPI.getTodayMatches.mockResolvedValue({ data: { success: true, data: [] } });
    matchAPI.getUpcomingMatches.mockResolvedValue({ data: { success: true, data: [] } });

    renderMatchCenter();

    await waitFor(() => {
      expect(screen.getByText(/No Live Matches/i)).toBeInTheDocument();
    });
  });

  it('shows error state on API failure', async () => {
    matchAPI.getLiveMatches.mockRejectedValue(new Error('Network error'));
    matchAPI.getTodayMatches.mockRejectedValue(new Error('Network error'));
    matchAPI.getUpcomingMatches.mockRejectedValue(new Error('Network error'));

    renderMatchCenter();

    await waitFor(() => {
      expect(screen.getByText(/Failed to load matches/i)).toBeInTheDocument();
    });

    // Use role query to target the retry button specifically
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });
});
