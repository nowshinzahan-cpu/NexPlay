import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { companyAPI, notificationAPI, upcomingContentAPI } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import StatCard from '../../components/StatCard';

function AdsIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
    </svg>
  );
}

function CampaignsIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
    </svg>
  );
}

function ContentIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
    </svg>
  );
}

function NotificationIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  );
}

export default function CompanyDashboard() {
  const { user, refreshUser } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adCount, setAdCount] = useState(0);
  const [campaignCount, setCampaignCount] = useState(0);
  const [contentCount, setContentCount] = useState(0);

  const verificationStatus = profile?.verificationStatus || user?.verificationStatus || 'pending';

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      try {
        const profilePromise = companyAPI.getProfile();
        const notifPromise = notificationAPI.getNotifications({ limit: 5 });

        const results = await Promise.all([
          profilePromise,
          notifPromise,
          // Always attempt to fetch counts; APIs return empty for unverified
          companyAPI.getAdvertisements({ limit: 1 }).catch(() => ({ data: { success: true, meta: { total: 0 } } })),
          companyAPI.getCampaigns({ limit: 1 }).catch(() => ({ data: { success: true, meta: { total: 0 } } })),
          upcomingContentAPI.getMyAllContent({ limit: 1 }).catch(() => ({ data: { success: true, meta: { total: 0 } } }))
        ]);

        if (cancelled) return;

        const [profileRes, notifRes, adRes, campaignRes, contentRes] = results;

        if (profileRes.data.success) {
          setProfile(profileRes.data.data.company);
        }
        if (notifRes.data.success) {
          setNotifications(notifRes.data.data);
        }
        if (adRes.data.success) setAdCount(adRes.data.meta?.total || 0);
        if (campaignRes.data.success) setCampaignCount(campaignRes.data.meta?.total || 0);
        if (contentRes.data.success) setContentCount(contentRes.data.meta?.total || 0);
      } catch (error) {
        if (!cancelled) addToast('Failed to load dashboard data', 'error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const getVerificationBanner = () => {
    switch (verificationStatus) {
      case 'pending':
        return (
          <div className="bg-warning/10 border border-warning/20 rounded-xl p-4 flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-warning font-semibold text-sm">Pending Verification</p>
              <p className="text-warning/80 text-xs mt-1">
                Your company profile is under review. You'll get access to all features once verified.
              </p>
            </div>
          </div>
        );

      case 'verified':
        return (
          <section className="relative py-8 sm:py-12 overflow-hidden scroll-mt-16">
            {/* Background glow */}
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] sm:w-[800px] h-[400px] rounded-full blur-[120px] sm:blur-[140px] pointer-events-none"
              style={{
                background: 'radial-gradient(circle, rgba(var(--color-accent), 0.06) 0%, transparent 70%)'
              }}
            />

            <div className="relative text-center">
              {/* Pill badge */}
              <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full animate-fade-in" style={{ background: 'rgba(var(--color-accent), 0.10)', border: '1px solid rgba(var(--color-accent), 0.18)' }}>
                <svg className="w-3.5 h-3.5 text-accent-text" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-[10px] sm:text-[11px] text-accent-text font-semibold tracking-widest uppercase">Verified</span>
              </div>

              {/* Heading */}
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text-textPrimary mb-3 animate-fade-in-up tracking-tight">
                Verified{' '}
                <span className="text-gradient">Company</span>
              </h2>

              {/* Subtitle */}
              <p className="text-textSecondary/75 text-sm sm:text-base max-w-xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                Congratulations! Your company has been verified successfully. All features are now available.
              </p>
            </div>
          </section>
        );

      case 'rejected':
        return (
          <div className="bg-danger/10 border border-danger/20 rounded-xl p-4 flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-danger/20 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <p className="text-danger font-semibold text-sm">Verification Rejected</p>
              {profile?.rejectionReason && (
                <p className="text-danger/80 text-xs mt-1">
                  Reason: {profile.rejectionReason}
                </p>
              )}
              <p className="text-danger/80 text-xs mt-1">
                Please update your profile and contact support for re-verification.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-accent/30 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Verification Banner */}
      {getVerificationBanner()}

      {/* Company Profile Card */}
      <Card>
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center text-accent-text font-bold text-2xl">
            {profile?.companyName?.charAt(0)?.toUpperCase() || 'C'}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-textPrimary">{profile?.companyName || 'Company Name'}</h2>
              <Badge status={verificationStatus}>
                {verificationStatus.charAt(0).toUpperCase() + verificationStatus.slice(1)}
              </Badge>
            </div>
            <p className="text-sm text-text-textSecondary mt-1">{profile?.industry}</p>
            <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-textSecondary">
              {profile?.email && (
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {profile?.email}
                </span>
              )}
              {profile?.website && (
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-accent-text hover:text-accent-text/80 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                  {(() => { try { return new URL(profile.website).hostname; } catch { return profile.website; } })()}
                </a>
              )}
              {profile?.location && (
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {profile?.location}
                </span>
              )}
              {profile?.foundedYear && (
                <span>Founded {profile.foundedYear}</span>
              )}
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={() => navigate('/company/profile')}>
            Edit Profile
          </Button>
        </div>
      </Card>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          label="Total Advertisements"
          value={adCount}
          icon={AdsIcon}
          color="accent"
          onClick={() => navigate('/company/advertisements')}
        />
        <StatCard
          label="Active Campaigns"
          value={campaignCount}
          icon={CampaignsIcon}
          color="success"
          onClick={() => navigate('/company/campaigns')}
        />
        <StatCard
          label="Upcoming Contents"
          value={contentCount}
          icon={ContentIcon}
          color="accent"
          onClick={() => navigate('/company/upcoming')}
        />
      </div>

      {/* Feature Access Status — styled like LandingPage Sponsored section */}
      <section className="relative py-8 sm:py-12 overflow-hidden">
        {/* Background glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] sm:w-[800px] h-[400px] rounded-full blur-[120px] sm:blur-[140px] pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(var(--color-accent), 0.06) 0%, transparent 70%)'
          }}
        />

        <div className="relative">
          {/* Section Header — centered */}
          <div className="text-center mb-10 sm:mb-12">
            <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full animate-fade-in" style={{ background: 'rgba(var(--color-accent), 0.10)', border: '1px solid rgba(var(--color-accent), 0.18)' }}>
              <span className="text-[10px] sm:text-[11px] text-accent-text font-semibold tracking-widest uppercase">Features</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text-textPrimary mb-3 animate-fade-in-up tracking-tight">
              Feature{' '}
              <span className="text-gradient">Access</span>
            </h2>
            <p className="text-text-textSecondary/70 text-sm sm:text-base max-w-xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              All features are now available for your company.
            </p>
          </div>

          {/* Features Grid — styled like LandingPage features cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
            {[
              { name: 'Advertisements', status: verificationStatus === 'verified', icon: AdsIcon, description: 'Create and manage your ad campaigns to reach your target audience.' },
              { name: 'Campaigns', status: verificationStatus === 'verified', icon: CampaignsIcon, description: 'Launch promotional campaigns and track their performance.' },
              { name: 'Upcoming Contents', status: verificationStatus === 'verified', icon: ContentIcon, description: 'Schedule and showcase your upcoming releases and events.' }
            ].map((feature, idx) => (
              <div
                key={feature.name}
                className="group relative rounded-2xl p-5 sm:p-6 border border-border hover:border-accent/20 transition-all duration-300 animate-fade-in-up"
                style={{
                  backgroundColor: 'var(--color-card)',
                  boxShadow: 'var(--shadow-card)',
                  animationDelay: `${idx * 0.06}s`
                }}
              >
                {/* Hover gradient overlay */}
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{
                    background: 'linear-gradient(135deg, rgba(var(--color-accent), 0.04) 0%, transparent 50%, rgba(var(--color-accent), 0.02) 100%)'
                  }}
                />

                <div className="relative">
                  {/* Icon */}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-all duration-300 group-hover:scale-110"
                    style={{
                      background: 'rgba(var(--color-accent), 0.08)',
                      color: 'rgb(var(--color-accent-text))'
                    }}
                  >
                    <feature.icon />
                  </div>

                  {/* Name + Status */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h3 className="text-sm font-semibold text-text-textPrimary group-hover:text-accent-text transition-colors duration-200">
                      {feature.name}
                    </h3>
                    {feature.status && (
                      <span className="flex items-center gap-1 text-[11px] font-medium text-success shrink-0">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Available
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-xs text-text-textSecondary/70 leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                {/* Bottom accent line on hover */}
                <div
                  className="absolute bottom-0 left-6 right-6 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: 'linear-gradient(90deg, transparent, rgba(var(--color-accent),0.3), transparent)' }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Notifications */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-textPrimary">Recent Notifications</h3>
          <NotificationIcon />
        </div>

        {notifications.length === 0 ? (
          <p className="text-sm text-text-textSecondary text-center py-4">No notifications yet</p>
        ) : (
          <div className="space-y-2">
            {notifications.map((notif) => (
              <div
                key={notif._id}
                className={`p-3 rounded-lg ${
                  notif.isRead ? 'bg-hover' : 'bg-accent/5'
                } border border-border text-sm`}
              >
                <p className="text-text-textPrimary font-medium">{notif.title}</p>
                <p className="text-text-textSecondary text-xs mt-0.5">{notif.message}</p>
                <p className="text-text-textSecondary/70 text-xs mt-1">
                  {new Date(notif.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
