import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import DiscussionsPage from '../pages/DiscussionsPage';
import { ToastProvider } from '../context/ToastContext';

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: '1', name: 'Test', role: 'user' },
  }),
}));

import { discussionAPI } from '../services/api';

vi.mock('../services/api', () => ({
  discussionAPI: {
    getDiscussions: vi.fn(),
    createDiscussion: vi.fn(),
  },
}));

const mockDiscussions = {
  data: {
    success: true,
    data: [
      {
        _id: '1',
        title: 'Best movies of 2026?',
        body: 'What are your top picks so far this year?',
        authorId: { fullName: 'Alice', username: 'alice' },
        pinned: true,
        locked: false,
        tags: ['movies', 'recommendations'],
        commentCount: 5,
        viewCount: 120,
        createdAt: new Date().toISOString(),
        lastActivityAt: new Date().toISOString(),
      },
      {
        _id: '2',
        title: 'Premier League predictions',
        body: 'Who do you think will win this season?',
        authorId: { fullName: 'Bob', username: 'bob' },
        pinned: false,
        locked: true,
        tags: ['sports', 'football'],
        commentCount: 12,
        viewCount: 340,
        createdAt: new Date().toISOString(),
        lastActivityAt: new Date().toISOString(),
      },
    ],
    meta: { page: 1, limit: 20, total: 2, totalPages: 1 },
  },
};

function renderDiscussions() {
  return render(
    <BrowserRouter>
      <ToastProvider>
        <DiscussionsPage />
      </ToastProvider>
    </BrowserRouter>
  );
}

describe('DiscussionsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    discussionAPI.getDiscussions.mockResolvedValue(mockDiscussions);
  });

  it('shows loading skeleton initially', () => {
    renderDiscussions();
    const skeletons = document.querySelectorAll('.skeleton');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders discussion list after loading', async () => {
    renderDiscussions();

    await waitFor(() => {
      expect(screen.getByText('Best movies of 2026?')).toBeInTheDocument();
    });

    expect(screen.getByText('Premier League predictions')).toBeInTheDocument();
    expect(screen.getByText(/5 comments/)).toBeInTheDocument();
    expect(screen.getByText(/12 comments/)).toBeInTheDocument();
  });

  it('shows pinned and locked badges', async () => {
    renderDiscussions();

    await waitFor(() => {
      expect(screen.getByText('Pinned')).toBeInTheDocument();
    });

    expect(screen.getByText('Locked')).toBeInTheDocument();
  });

  it('shows empty state when no discussions', async () => {
    discussionAPI.getDiscussions.mockResolvedValue({
      data: { success: true, data: [], meta: { page: 1, limit: 20, total: 0, totalPages: 0 } },
    });

    renderDiscussions();

    await waitFor(() => {
      expect(screen.getByText(/No discussions yet/i)).toBeInTheDocument();
    });
  });

  it('shows error state on API failure', async () => {
    discussionAPI.getDiscussions.mockRejectedValue(new Error('Network error'));

    renderDiscussions();

    await waitFor(() => {
      expect(screen.getByText(/Failed to load discussions/i)).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  it('shows create button when user is logged in', async () => {
    renderDiscussions();

    await waitFor(() => {
      expect(screen.getByText('Discussions')).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /new discussion/i })).toBeInTheDocument();
  });
});
