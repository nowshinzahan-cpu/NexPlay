import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { useToast } from '../../hooks/useToast';
import StatCard from '../../components/StatCard';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';

function UsersIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
    </svg>
  );
}

function CompanyIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  );
}

function PendingIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function AdsIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
    </svg>
  );
}

function MatchIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
}

function DiscussionIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  );
}

function ReviewIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  );
}

function BadgeIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
    </svg>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [pendingCompanies, setPendingCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchData = async () => {
    try {
      const [statsRes, pendingRes] = await Promise.all([
        adminAPI.getDashboardStats(),
        adminAPI.getPendingCompanies({ limit: 5 })
      ]);

      if (statsRes.data.success) setStats(statsRes.data.data);
      if (pendingRes.data.success) setPendingCompanies(pendingRes.data.data);
    } catch (error) {
      addToast('Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
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
      {/* Admin Dashboard Section */}
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            Admin
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight">
            Admin <span className="text-gradient">Dashboard</span>
          </h2>
          <p className="text-sm sm:text-base mt-2" style={{ color: 'var(--color-textSecondary)' }}>
            Platform overview and key metrics at a glance
          </p>
        </div>
      </section>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Users"
          value={stats?.totalUsers}
          icon={UsersIcon}
          color="accent"
        />
        <StatCard
          label="Total Companies"
          value={stats?.totalCompanies}
          icon={CompanyIcon}
          color="success"
        />
        <StatCard
          label="Pending Verifications"
          value={stats?.pendingVerifications}
          icon={PendingIcon}
          color="warning"
          onClick={() => navigate('/admin/verifications')}
        />
        <StatCard
          label="Total Advertisements"
          value={stats?.totalAdvertisements || 0}
          icon={AdsIcon}
          color="accent"
        />
      </div>

      {/* Sprint 3 & 4 Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard
          label="Live Matches"
          value={stats?.liveMatches || 0}
          icon={MatchIcon}
          color="danger"
          onClick={() => navigate('/admin/dashboard')}
        />
        <StatCard
          label="Total Matches"
          value={stats?.totalMatches || 0}
          icon={MatchIcon}
          color="accent"
        />
        <StatCard
          label="Discussions"
          value={stats?.totalDiscussions || 0}
          icon={DiscussionIcon}
          color="warning"
        />
        <StatCard
          label="Item Reviews"
          value={stats?.totalItemReviews || 0}
          icon={ReviewIcon}
          color="success"
        />
        <StatCard
          label="Badges Awarded"
          value={stats?.totalBadgesAwarded || 0}
          icon={BadgeIcon}
          color="accent"
        />
        <StatCard
          label="Pending Reports"
          value={stats?.pendingReports || 0}
          icon={PendingIcon}
          color="danger"
          onClick={() => navigate('/admin/moderation')}
        />
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="flex items-center justify-between">
          <div>
            <p className="text-sm text-textSecondary">Verified Companies</p>
            <p className="text-2xl font-bold text-text-textPrimary mt-1">{stats?.verifiedCompanies || 0}</p>
          </div>
          <Badge status="verified">Verified</Badge>
        </Card>
        <Card className="flex items-center justify-between">
          <div>
            <p className="text-sm text-textSecondary">Pending Companies</p>
            <p className="text-2xl font-bold text-text-textPrimary mt-1">{stats?.pendingVerifications || 0}</p>
          </div>
          <Badge status="pending">Pending</Badge>
        </Card>
        <Card
          className="flex items-center justify-between cursor-pointer hover:bg-hover transition-colors"
          onClick={() => navigate('/admin/rejected')}
        >
          <div>
            <p className="text-sm text-textSecondary">Rejected Companies</p>
            <p className="text-2xl font-bold text-text-textPrimary mt-1">{stats?.rejectedCompanies || 0}</p>
          </div>
          <Badge status="rejected">Rejected</Badge>
        </Card>
      </div>

      {/* Recent Pending Verifications */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-textPrimary">Recent Pending Verifications</h3>
          {pendingCompanies.length > 0 && (
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin/verifications')}>
              View All
            </Button>
          )}
        </div>

        {pendingCompanies.length === 0 ? (
          <p className="text-sm text-text-textSecondary py-4 text-center">No pending verifications</p>
        ) : (
          <div className="divide-y divide-border">
            {pendingCompanies.map((company) => (
              <div
                key={company._id}
                className="flex items-center justify-between py-3 hover:bg-hover px-2 -mx-2 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    <span className="text-accent-text font-bold text-sm">
                      {company.companyName?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-textPrimary">{company.companyName}</p>
                    <p className="text-xs text-textSecondary">{company.industry} • {company.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge status="pending">Pending</Badge>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => navigate('/admin/verifications')}
                  >
                    Review
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
