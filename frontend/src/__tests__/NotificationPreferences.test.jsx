import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import NotificationPreferencesPage from '../pages/NotificationPreferencesPage';
import { ToastProvider } from '../context/ToastContext';

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: '1', name: 'Test', role: 'user' },
  }),
}));

import { notificationPreferenceAPI } from '../services/api';

vi.mock('../services/api', () => ({
  notificationPreferenceAPI: {
    get: vi.fn(),
    update: vi.fn(),
  },
}));

const mockPreferences = {
  data: {
    success: true,
    data: {
      preferences: {
        matchReminders: true,
        goalAlerts: false,
        tournamentAnnouncements: true,
        discussionReplies: false,
        reminderMinutesBefore: 30,
      },
    },
  },
};

function renderNotifications() {
  return render(
    <BrowserRouter>
      <ToastProvider>
        <NotificationPreferencesPage />
      </ToastProvider>
    </BrowserRouter>
  );
}

describe('NotificationPreferencesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    notificationPreferenceAPI.get.mockResolvedValue(mockPreferences);
  });

  it('shows loading skeleton initially', () => {
    renderNotifications();
    const skeletons = document.querySelectorAll('.skeleton');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders all preference toggles after loading', async () => {
    renderNotifications();

    await waitFor(() => {
      expect(screen.getByText('Match Reminders')).toBeInTheDocument();
    });

    expect(screen.getByText('Goal Alerts')).toBeInTheDocument();
    expect(screen.getByText('Tournament Announcements')).toBeInTheDocument();
    expect(screen.getByText('Discussion Replies')).toBeInTheDocument();
  });

  it('shows reminder time selector when match reminders are enabled', async () => {
    renderNotifications();

    await waitFor(() => {
      expect(screen.getByText('Match Reminders')).toBeInTheDocument();
    });

    // Since matchReminders is true in mock, the reminder minutes selector should show
    expect(screen.getByText(/Remind me/i)).toBeInTheDocument();
  });

  it('calls update API when toggling a preference', async () => {
    notificationPreferenceAPI.update.mockResolvedValue({
      data: {
        success: true,
        data: {
          preferences: { ...mockPreferences.data.data.preferences, goalAlerts: true },
        },
      },
    });

    renderNotifications();

    await waitFor(() => {
      expect(screen.getByText('Goal Alerts')).toBeInTheDocument();
    });

    // Find all toggle checkboxes and click the second one (Goal Alerts)
    const checkboxes = screen.getAllByRole('checkbox');
    await userEvent.click(checkboxes[1]);

    await waitFor(() => {
      expect(notificationPreferenceAPI.update).toHaveBeenCalledWith({ goalAlerts: true });
    });
  });

  it('shows error state on API failure', async () => {
    notificationPreferenceAPI.get.mockRejectedValue(new Error('Network error'));

    renderNotifications();

    await waitFor(() => {
      expect(screen.getByText(/Failed to load preferences/i)).toBeInTheDocument();
    });
  });
});
