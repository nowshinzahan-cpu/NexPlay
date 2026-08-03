import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { userAPI, gamificationAPI } from '../../services/api';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { getInitials } from '../../utils/index';

export default function UserProfile() {
  const { user, refreshUser } = useAuth();
  const { addToast } = useToast();

  const [profileForm, setProfileForm] = useState({
    fullName: user?.name || '',
    avatar: ''
  });
  const [profileLoading, setProfileLoading] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  const getPasswordStrength = () => {
    const pwd = passwordForm.newPassword;
    if (!pwd) return { label: '', color: '', bars: 0, textColor: '' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/(?=.*[a-z])/.test(pwd)) score++;
    if (/(?=.*[A-Z])/.test(pwd)) score++;
    if (/(?=.*\d)/.test(pwd)) score++;
    if (/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(pwd)) score++;
    if (score <= 2) return { label: 'Weak', color: 'bg-danger', textColor: 'text-danger', bars: Math.max(1, score) };
    if (score <= 3) return { label: 'Fair', color: 'bg-warning', textColor: 'text-warning', bars: score };
    if (score <= 4) return { label: 'Good', color: 'bg-accent', textColor: 'text-accent-text', bars: score };
    return { label: 'Strong', color: 'bg-success', textColor: 'text-success', bars: score };
  };

  const strength = getPasswordStrength();

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      const result = await userAPI.updateProfile({
        fullName: profileForm.fullName
      });
      if (result.data.success) {
        addToast('Profile updated successfully', 'success');
        await refreshUser();
      }
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setProfileLoading(false);
    }
  };

  const validatePasswordForm = () => {
    const errors = {};
    if (!passwordForm.currentPassword) errors.currentPassword = 'Current password is required';
    if (!passwordForm.newPassword) errors.newPassword = 'New password is required';
    else if (passwordForm.newPassword.length < 8) errors.newPassword = 'Password must be at least 8 characters';
    else if (!/(?=.*[a-z])/.test(passwordForm.newPassword)) errors.newPassword = 'Must contain a lowercase letter';
    else if (!/(?=.*[A-Z])/.test(passwordForm.newPassword)) errors.newPassword = 'Must contain an uppercase letter';
    else if (!/(?=.*\d)/.test(passwordForm.newPassword)) errors.newPassword = 'Must contain a number';
    else if (!/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(passwordForm.newPassword))
      errors.newPassword = 'Must contain a special character';
    if (passwordForm.newPassword !== passwordForm.confirmPassword)
      errors.confirmPassword = 'Passwords do not match';
    return errors;
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    const errors = validatePasswordForm();
    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }
    setPasswordLoading(true);
    try {
      const result = await userAPI.changePassword(passwordForm);
      if (result.data.success) {
        addToast('Password changed successfully', 'success');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setPasswordErrors({});
      }
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to change password', 'error');
    } finally {
      setPasswordLoading(false);
    }
  };

  const isAdmin = user?.role === 'admin';

  // ── Gamification Stats ───────────────────────────────
  const [gamification, setGamification] = useState(null);
  const [gamificationLoading, setGamificationLoading] = useState(true);

  useEffect(() => {
    const fetchGamification = async () => {
      try {
        const res = await gamificationAPI.getUserStats();
        if (res.data.success) {
          setGamification(res.data.data);
        }
      } catch (err) {
        // Gamification data is non-critical
      } finally {
        setGamificationLoading(false);
      }
    };
    if (user && !isAdmin) {
      fetchGamification();
    } else {
      setGamificationLoading(false);
    }
  }, [user, isAdmin]);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* User Profile Section */}
      <section className="relative py-8 sm:py-10 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(var(--color-accent), 0.04) 0%, transparent 70%)'
          }}
        />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider mb-4 sm:mb-5 border"
            style={{
              backgroundColor: 'rgba(var(--color-accent), 0.12)',
              borderColor: 'rgba(var(--color-accent), 0.20)',
              color: 'rgb(var(--color-accent-text))'
            }}
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Profile
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight">
            Personal <span className="text-gradient">Profile</span>
          </h2>
          <p className="text-sm sm:text-base mt-2 sm:mt-3" style={{ color: 'var(--color-textSecondary)' }}>
            Manage your personal information and account settings
          </p>
        </div>
      </section>

      {/* Profile Info */}
      <Card>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-accent/20 border border-accent/20 flex items-center justify-center shadow-sm">
            <span className="text-2xl font-bold text-accent-text">
              {getInitials(user?.name) || 'U'}
            </span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-textPrimary">{user?.name || 'User'}</h2>
            <p className="text-sm text-textSecondary">{user?.email}</p>
            <span className="inline-block mt-1 text-xs bg-accent/10 text-accent-text px-2 py-0.5 rounded-full capitalize">
              {user?.role}
            </span>
          </div>
        </div>

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <Input
            label="Full Name"
            name="fullName"
            type="text"
            value={profileForm.fullName}
            onChange={(e) => setProfileForm((prev) => ({ ...prev, fullName: e.target.value }))}
          />
          <Input
            label="Email"
            name="email"
            type="email"
            value={user?.email || ''}
            disabled
          />
          <Button type="submit" loading={profileLoading}>
            Save Changes
          </Button>
        </form>
      </Card>

      {/* Gamification Section — Badges, Level & Points */}
      {!isAdmin && !gamificationLoading && gamification && (
        <Card>
          <h2 className="text-xl font-bold text-text-textPrimary mb-6">Achievements</h2>

          {/* Level & Points */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 rounded-xl bg-accent/10 border border-accent/10">
              <p className="text-xs text-text-textSecondary/60 uppercase tracking-wider mb-1">Current Level</p>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-accent-text">{gamification.stats?.level || 1}</span>
                <span className="text-sm text-textSecondary">{gamification.levelProgress?.currentLevel?.title || 'Newcomer'}</span>
              </div>
              {gamification.levelProgress?.nextLevel && (
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-text-textSecondary/60 mb-1">
                    <span>Progress to Lv.{gamification.levelProgress.nextLevel.level}</span>
                    <span>{gamification.stats?.points || 0} / {gamification.levelProgress.nextLevel.minPoints} pts</span>
                  </div>
                  <div className="h-1.5 bg-hover rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-accent to-accent/60 rounded-full transition-all duration-500"
                      style={{ width: `${(gamification.levelProgress.progress * 100).toFixed(1)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 rounded-xl bg-accent/5 border border-accent/10">
              <p className="text-xs text-text-textSecondary/60 uppercase tracking-wider mb-1">Total Points</p>
              <span className="text-2xl font-bold text-textPrimary">{gamification.stats?.points || 0}</span>
              <div className="mt-2 space-y-1">
                {gamification.stats?.totalReviews > 0 && (
                  <div className="flex justify-between text-[10px] text-text-textSecondary/50">
                    <span>Reviews</span><span>{gamification.stats.totalReviews}</span>
                  </div>
                )}
                {gamification.stats?.totalDiscussions > 0 && (
                  <div className="flex justify-between text-[10px] text-text-textSecondary/50">
                    <span>Discussions</span><span>{gamification.stats.totalDiscussions}</span>
                  </div>
                )}
                {gamification.stats?.totalComments > 0 && (
                  <div className="flex justify-between text-[10px] text-text-textSecondary/50">
                    <span>Comments</span><span>{gamification.stats.totalComments}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Badges */}
          {gamification.badges?.length > 0 ? (
            <>
              <p className="text-sm font-semibold text-text-textPrimary mb-3">Badges Earned ({gamification.badges.length})</p>
              <div className="flex flex-wrap gap-3">
                {gamification.badges.map((badge, idx) => (
                  <div
                    key={idx}
                    className="group relative flex items-center gap-2 px-3 py-2 rounded-lg bg-accent/5 border border-accent/10 hover:bg-accent/10 transition-all cursor-default"
                  >
                    <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                      <span className="text-sm">
                        {badge.key?.includes('review') ? '⭐' :
                         badge.key?.includes('discussion') ? '💬' :
                         badge.key?.includes('comment') ? '💭' :
                         badge.key?.includes('streak') ? '🔥' :
                         badge.key?.includes('fan') ? '🌟' :
                         badge.key?.includes('centurion') ? '💯' :
                         badge.key?.includes('level') ? '🏆' : '🎖️'}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-textPrimary">{badge.name}</p>
                      <p className="text-[10px] text-text-textSecondary/60">{badge.description}</p>
                    </div>
                    {/* Tooltip */}
                    <div className="absolute -top-1 right-0 translate-y-[-100%] hidden group-hover:block z-10">
                      <div className="bg-card border border-border rounded-lg px-3 py-2 text-xs text-textSecondary shadow-lg whitespace-nowrap">
                        Earned: {new Date(badge.earnedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-text-textSecondary/60 text-center py-4">
              No badges yet. Start contributing to earn badges!
            </p>
          )}
        </Card>
      )}

      {/* Change Password — hidden for admin users (admin routes use roleMiddleware(ROLES.USER)) */}
      {!isAdmin && (
        <Card>
          <h2 className="text-xl font-bold text-text-textPrimary mb-6">Change Password</h2>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <Input
            label="Current Password"
            name="currentPassword"
            type="password"
            placeholder="Enter current password"
            value={passwordForm.currentPassword}
            onChange={(e) => {
              setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }));
              if (passwordErrors.currentPassword) setPasswordErrors((prev) => ({ ...prev, currentPassword: '' }));
            }}
            error={passwordErrors.currentPassword}
          />
          <div className="space-y-1">
            <Input
              label="New Password"
              name="newPassword"
              type="password"
              placeholder="Enter new password"
              value={passwordForm.newPassword}
              onChange={(e) => {
                setPasswordTouched(true);
                setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }));
                if (passwordErrors.newPassword) setPasswordErrors((prev) => ({ ...prev, newPassword: '' }));
              }}
              onFocus={() => setPasswordTouched(true)}
              error={passwordErrors.newPassword}
            />
            {passwordTouched && passwordForm.newPassword && (
              <div className="space-y-1 pt-1">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-all ${
                        i <= strength.bars ? strength.color : 'bg-border'
                      }`}
                    />
                  ))}
                </div>
                <p className={`text-xs ${strength.textColor}`}>
                  Password strength: {strength.label}
                </p>
              </div>
            )}
          </div>
          <Input
            label="Confirm New Password"
            name="confirmPassword"
            type="password"
            placeholder="Confirm new password"
            value={passwordForm.confirmPassword}
            onChange={(e) => {
              setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }));
              if (passwordErrors.confirmPassword) setPasswordErrors((prev) => ({ ...prev, confirmPassword: '' }));
            }}
            error={passwordErrors.confirmPassword}
          />
          <Button type="submit" loading={passwordLoading}>
            Change Password
          </Button>
        </form>
      </Card>
      )}
    </div>
  );
}
