import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import UserProfile from '../pages/user/UserProfile';
import { ToastProvider } from '../context/ToastContext';

// Mock useAuth to provide a logged-in user so gamification section renders
// Path relative to __tests__/ dir -> resolves to hooks/useAuth.js
vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    user: {
      id: 'test-user-id',
      name: 'Test User',
      fullName: 'Test User',
      email: 'testuser@example.com',
      role: 'user',
      username: 'testuser',
    },
    refreshUser: vi.fn(),
    isAuthenticated: true,
    isAdmin: false,
  }),
}));

import { gamificationAPI } from '../services/api';

vi.mock('../services/api', () => ({
  userAPI: {
    updateProfile: vi.fn(),
    changePassword: vi.fn(),
  },
  gamificationAPI: {
    getUserStats: vi.fn(),
  },
}));

const mockGamificationData = {
  data: {
    stats: {
      points: 1250,
      level: 4,
      totalReviews: 3,
      totalDiscussions: 2,
      totalComments: 8,
    },
    levelProgress: {
      currentLevel: { level: 4, title: 'Enthusiast', minPoints: 500 },
      nextLevel: { level: 5, title: 'Expert', minPoints: 1000 },
      progress: 0.75,
      pointsToNext: 250,
    },
    badges: [
      {
        key: 'first_review',
        name: 'First Review',
        description: 'Write your first review',
        earnedAt: new Date('2026-06-01').toISOString(),
      },
      {
        key: 'first_discussion',
        name: 'First Discussion',
        description: 'Start your first discussion',
        earnedAt: new Date('2026-06-15').toISOString(),
      },
    ],
  },
};

function renderUserProfile() {
  return render(
    <BrowserRouter>
      <ToastProvider>
        <UserProfile />
      </ToastProvider>
    </BrowserRouter>
  );
}

describe('UserProfile — Gamification & Badges', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    gamificationAPI.getUserStats.mockResolvedValue({
      data: { success: true, data: mockGamificationData.data },
    });
  });

  it('shows profile header', async () => {
    renderUserProfile();
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /personal/i })).toBeInTheDocument();
    });
  });

  it('shows profile section heading', async () => {
    renderUserProfile();
    await waitFor(() => {
      expect(screen.getByText(/Manage your personal information/i)).toBeInTheDocument();
    });
  });

  it('renders achievements section with level and points', async () => {
    renderUserProfile();

    await waitFor(() => {
      expect(screen.getByText('Achievements')).toBeInTheDocument();
    });

    // Level display
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('Enthusiast')).toBeInTheDocument();

    // Points display
    expect(screen.getByText('1250')).toBeInTheDocument();
  });

  it('renders activity counters for reviews, discussions, and comments', async () => {
    renderUserProfile();

    await waitFor(() => {
      expect(screen.getByText('Achievements')).toBeInTheDocument();
    });

    // Check activity stats are shown
    expect(screen.getByText('3')).toBeInTheDocument(); // Reviews count
    expect(screen.getByText('2')).toBeInTheDocument(); // Discussions count
    expect(screen.getByText('8')).toBeInTheDocument(); // Comments count
  });

  it('renders earned badges', async () => {
    renderUserProfile();

    await waitFor(() => {
      expect(screen.getByText('Achievements')).toBeInTheDocument();
    });

    // Badge names displayed
    expect(screen.getByText('First Review')).toBeInTheDocument();
    expect(screen.getByText('First Discussion')).toBeInTheDocument();
  });

  it('shows progress bar for level advancement', async () => {
    renderUserProfile();

    await waitFor(() => {
      expect(screen.getByText(/Progress to Lv\.5/)).toBeInTheDocument();
    });

    expect(screen.getByText(/1250 \/ 1000 pts/)).toBeInTheDocument();
  });

  it('shows empty state when no badges earned', async () => {
    gamificationAPI.getUserStats.mockResolvedValue({
      data: {
        success: true,
        data: {
          stats: { points: 0, level: 1 },
          levelProgress: {
            currentLevel: { level: 1, title: 'Newcomer', minPoints: 0 },
            nextLevel: { level: 2, title: 'Explorer', minPoints: 100 },
            progress: 0,
            pointsToNext: 100,
          },
          badges: [],
        },
      },
    });

    renderUserProfile();

    await waitFor(() => {
      expect(screen.getByText(/No badges yet/)).toBeInTheDocument();
    });
  });
});
