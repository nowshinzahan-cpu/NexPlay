import { useState, useEffect, useCallback } from 'react';
import { notificationPreferenceAPI } from '../services/api';
import { useToast } from '../hooks/useToast';
import LoadingSkeleton from '../components/ott/LoadingSkeleton';

export default function NotificationPreferencesPage() {
  const { addToast } = useToast();
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchPreferences = useCallback(async () => {
    setLoading(true);
    try {
      const res = await notificationPreferenceAPI.get();
      if (res.data.success) {
        setPreferences(res.data.data.preferences);
      }
    } catch (err) {
      addToast('Failed to load preferences', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => { fetchPreferences(); }, [fetchPreferences]);

  const handleToggle = async (field) => {
    if (!preferences) return;
    const newValue = !preferences[field];
    setSaving(true);
    try {
      const res = await notificationPreferenceAPI.update({ [field]: newValue });
      if (res.data.success) {
        setPreferences(res.data.data.preferences);
        addToast('Preference updated', 'success');
      }
    } catch (err) {
      addToast('Failed to update preference', 'error');
      setPreferences(prev => ({ ...prev, [field]: !newValue }));
    } finally {
      setSaving(false);
    }
  };

  const handleMinutesChange = async (value) => {
    const minutes = parseInt(value, 10);
    if (isNaN(minutes) || minutes < 5 || minutes > 1440) return;
    setSaving(true);
    try {
      const res = await notificationPreferenceAPI.update({ reminderMinutesBefore: minutes });
      if (res.data.success) setPreferences(res.data.data.preferences);
    } catch (err) {
      addToast('Failed to update preference', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-8 w-48 rounded-lg" />
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-16 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-pageIn">
      <h2 className="text-xl font-bold text-text-textPrimary mb-6">Notification Preferences</h2>

      <div className="space-y-4 max-w-2xl">
        {/* Match Reminders */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-textPrimary">Match Reminders</h3>
              <p className="text-xs text-text-textSecondary mt-0.5">Get notified before your favorited teams' matches start</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={preferences?.matchReminders}
                onChange={() => handleToggle('matchReminders')}
                disabled={saving}
              />
              <div className="relative w-[50px] h-[30px] rounded-full transition-all duration-300 peer-checked:bg-[#34C759] peer-checked:[&>div]:translate-x-[20px]" style={{ backgroundColor: 'var(--btn-secondary-bg)' }}>
                <div className="absolute top-[3px] left-[3px] w-[24px] h-[24px] rounded-full bg-white shadow-md transition-all duration-300" />
              </div>
            </label>
          </div>
          {preferences?.matchReminders && (
            <div className="mt-3 pt-3 border-t border-border">
              <label className="text-xs text-text-textSecondary mr-3">Remind me</label>
              <select
                className="input-field text-sm w-auto inline-block"
                value={preferences.reminderMinutesBefore}
                onChange={(e) => handleMinutesChange(e.target.value)}
                disabled={saving}
              >
                <option value={5}>5 minutes before</option>
                <option value={15}>15 minutes before</option>
                <option value={30}>30 minutes before</option>
                <option value={60}>1 hour before</option>
                <option value={120}>2 hours before</option>
                <option value={1440}>1 day before</option>
              </select>
            </div>
          )}
        </div>

        {/* Goal Alerts */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-textPrimary">Goal Alerts</h3>
              <p className="text-xs text-text-textSecondary mt-0.5">Get real-time push when a goal is scored in your favorited teams' matches</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={preferences?.goalAlerts}
                onChange={() => handleToggle('goalAlerts')}
                disabled={saving}
              />
              <div className="relative w-[50px] h-[30px] rounded-full transition-all duration-300 peer-checked:bg-[#34C759] peer-checked:[&>div]:translate-x-[20px]" style={{ backgroundColor: 'var(--btn-secondary-bg)' }}>
                <div className="absolute top-[3px] left-[3px] w-[24px] h-[24px] rounded-full bg-white shadow-md transition-all duration-300" />
              </div>
            </label>
          </div>
        </div>

        {/* Tournament Announcements */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-textPrimary">Tournament Announcements</h3>
              <p className="text-xs text-text-textSecondary mt-0.5">Get notified about tournament updates and announcements</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={preferences?.tournamentAnnouncements}
                onChange={() => handleToggle('tournamentAnnouncements')}
                disabled={saving}
              />
              <div className="relative w-[50px] h-[30px] rounded-full transition-all duration-300 peer-checked:bg-[#34C759] peer-checked:[&>div]:translate-x-[20px]" style={{ backgroundColor: 'var(--btn-secondary-bg)' }}>
                <div className="absolute top-[3px] left-[3px] w-[24px] h-[24px] rounded-full bg-white shadow-md transition-all duration-300" />
              </div>
            </label>
          </div>
        </div>

        {/* Discussion Replies */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-textPrimary">Discussion Replies</h3>
              <p className="text-xs text-text-textSecondary mt-0.5">Get notified when someone replies to your discussion or comment</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={preferences?.discussionReplies}
                onChange={() => handleToggle('discussionReplies')}
                disabled={saving}
              />
              <div className="relative w-[50px] h-[30px] rounded-full transition-all duration-300 peer-checked:bg-[#34C759] peer-checked:[&>div]:translate-x-[20px]" style={{ backgroundColor: 'var(--btn-secondary-bg)' }}>
                <div className="absolute top-[3px] left-[3px] w-[24px] h-[24px] rounded-full bg-white shadow-md transition-all duration-300" />
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
