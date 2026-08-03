import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LeaderboardPage from '../pages/LeaderboardPage';
import { ToastProvider } from '../context/ToastContext';

// Mock useAuth so AuthProvider is not needed
vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: '1', name: 'Test', role: 'user' },
    isAuthenticated: true,
    isAdmin: false,
  }),
}));

import { gamificationAPI } from '../services/api';

vi.mock('../services/api', () => ({
  gamificationAPI: {
    getLeaderboard: vi.fn(),
  },
}));

const mockLeaderboard = {
  data: [
    { user: { _id: '1', fullName: 'Alice', username: 'alice' }, points: 1500, level: 5 },
    { user: { _id: '2', fullName: 'Bob', username: 'bob' }, points: 1200, level: 4 },
    { user: { _id: '3', fullName: 'Charlie', username: 'charlie' }, points: 800, level: 3 },
  ],
  meta: { page: 1, limit: 20, total: 3, totalPages: 1 },
};

function renderLeaderboard() {
  return render(
    <BrowserRouter>
      <ToastProvider>
        <LeaderboardPage />
      </ToastProvider>
    </BrowserRouter>
  );
}

describe('LeaderboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    gamificationAPI.getLeaderboard.mockResolvedValue({
      data: { success: true, data: mockLeaderboard.data, meta: mockLeaderboard.meta },
    });
  });

  it('shows loading skeleton initially', () => {
    renderLeaderboard();
    const skeletons = document.querySelectorAll('.skeleton');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders leaderboard entries after loading', async () => {
    renderLeaderboard();

    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument();
    });

    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('Charlie')).toBeInTheDocument();
  });

  it('shows rank badges', async () => {
    renderLeaderboard();

    await waitFor(() => {
      expect(screen.getByText('Rank')).toBeInTheDocument();
      expect(screen.getByText('Level')).toBeInTheDocument();
      expect(screen.getByText('Points')).toBeInTheDocument();
    });
  });

  it('shows level and point values', async () => {
    renderLeaderboard();

    await waitFor(() => {
      expect(screen.getByText('Lv.5')).toBeInTheDocument();
      expect(screen.getByText('1500')).toBeInTheDocument();
    });
  });

  it('shows empty state when no entries', async () => {
    gamificationAPI.getLeaderboard.mockResolvedValue({
      data: { success: true, data: [], meta: { page: 1, limit: 20, total: 0, totalPages: 0 } },
    });

    renderLeaderboard();

    await waitFor(() => {
      expect(screen.getByText(/No entries yet/i)).toBeInTheDocument();
    });
  });

  it('shows error state on API failure', async () => {
    gamificationAPI.getLeaderboard.mockRejectedValue(new Error('Network error'));

    renderLeaderboard();

    await waitFor(() => {
      expect(screen.getByText(/Failed to load leaderboard/i)).toBeInTheDocument();
    });

    // Use role query to avoid matching both the message text and button
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });
});
