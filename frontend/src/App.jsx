import { Routes, Route, Navigate } from 'react-router-dom';
import RouteGuard from './components/RouteGuard';
import ProtectedRoute from './routes/ProtectedRoute';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';
import PublicLayout from './layouts/PublicLayout';

// Landing Page
import LandingPage from './pages/LandingPage';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import OTPVerificationPage from './pages/auth/OTPVerificationPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

// User Pages
import UserDashboard from './pages/user/UserDashboard';
import UserProfile from './pages/user/UserProfile';
import UserWatchlist from './pages/user/UserWatchlist';
import UserReviews from './pages/user/UserReviews';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminCompanies from './pages/admin/AdminCompanies';
import AdminVerifications from './pages/admin/AdminVerifications';
import AdminCampaigns from './pages/admin/AdminCampaigns';
import AdminAdvertisements from './pages/admin/AdminAdvertisements';
import AdminActivityLog from './pages/admin/AdminActivityLog';
import AdminRejected from './pages/admin/AdminRejected';
import AdminPlatforms from './pages/admin/AdminPlatforms';

// Company Pages
import CompanyDashboard from './pages/company/CompanyDashboard';
import CompanyAdvertisements from './pages/company/CompanyAdvertisements';

// OTT Search Page
import SearchPage from './pages/SearchPage';

// Sports Page
import SportsPage from './pages/SportsPage';

// Company Pages
import CompanyCampaigns from './pages/company/CompanyCampaigns';
import CompanyNotifications from './pages/company/CompanyNotifications';
import CompanyProfile from './pages/company/CompanyProfile';
import CompanyUpcomingContent from './pages/company/CompanyUpcomingContent';
import CompanyVerificationPending from './pages/company/CompanyVerificationPending';
import CompanyVerificationRejected from './pages/company/CompanyVerificationRejected';

// Sprint 3 & 4 — New Pages
import MatchCenter from './pages/MatchCenter';
import MatchDetailPage from './pages/MatchDetailPage';
import DiscussionsPage from './pages/DiscussionsPage';
import DiscussionDetailPage from './pages/DiscussionDetailPage';
import LeaderboardPage from './pages/LeaderboardPage';
import NotificationPreferencesPage from './pages/NotificationPreferencesPage';

// Admin Sprint 3 & 4 Pages
import AdminBroadcasters from './pages/admin/AdminBroadcasters';
import AdminModeration from './pages/admin/AdminModeration';

// 404
import NotFoundPage from './pages/NotFoundPage';

function PageTransition({ children }) {
  return <div className="animate-pageIn">{children}</div>;
}

export default function App() {
  return (
    <>
      <RouteGuard />
      <Routes>
      {/* Public Routes */}
      <Route path="/" element={<PageTransition><PublicLayout headerVariant="transparent"><LandingPage /></PublicLayout></PageTransition>} />
      <Route path="/search" element={<PageTransition><PublicLayout><SearchPage /></PublicLayout></PageTransition>} />
      <Route path="/sports" element={<PageTransition><PublicLayout><SportsPage /></PublicLayout></PageTransition>} />

      {/* Sprint 3 & 4 — New Public Routes */}
      <Route path="/matches" element={<PageTransition><PublicLayout><MatchCenter /></PublicLayout></PageTransition>} />
      <Route path="/matches/:id" element={<PageTransition><PublicLayout><MatchDetailPage /></PublicLayout></PageTransition>} />
      <Route path="/discussions" element={<PageTransition><PublicLayout><DiscussionsPage /></PublicLayout></PageTransition>} />
      <Route path="/discussions/:id" element={<PageTransition><PublicLayout><DiscussionDetailPage /></PublicLayout></PageTransition>} />
      <Route path="/leaderboard" element={<PageTransition><PublicLayout><LeaderboardPage /></PublicLayout></PageTransition>} />

      {/* Auth Routes */}
      <Route
        path="/login"
        element={
          <PageTransition>
            <PublicLayout>
              <AuthLayout>
                <LoginPage />
              </AuthLayout>
            </PublicLayout>
          </PageTransition>
        }
      />
      <Route
        path="/register"
        element={
          <PageTransition>
            <PublicLayout>
              <AuthLayout>
                <RegisterPage />
              </AuthLayout>
            </PublicLayout>
          </PageTransition>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <PageTransition>
            <PublicLayout>
              <AuthLayout>
                <ForgotPasswordPage />
              </AuthLayout>
            </PublicLayout>
          </PageTransition>
        }
      />
      <Route
        path="/otp-verification"
        element={
          <PageTransition>
            <PublicLayout>
              <AuthLayout>
                <OTPVerificationPage />
              </AuthLayout>
            </PublicLayout>
          </PageTransition>
        }
      />
      <Route
        path="/reset-password"
        element={
          <PageTransition>
            <PublicLayout>
              <AuthLayout>
                <ResetPasswordPage />
              </AuthLayout>
            </PublicLayout>
          </PageTransition>
        }
      />

      {/* User Routes */}
      <Route
        path="/user"
        element={
          <ProtectedRoute allowedRoles={['user']}>
            <DashboardLayout type="user" />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/user/dashboard" replace />} />
        <Route path="dashboard" element={<UserDashboard />} />
        <Route path="profile" element={<UserProfile />} />
        <Route path="watchlist" element={<UserWatchlist />} />
        <Route path="reviews" element={<UserReviews />} />
        <Route path="notifications" element={<NotificationPreferencesPage />} />
      </Route>

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DashboardLayout type="admin" />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="companies" element={<AdminCompanies />} />
        <Route path="verifications" element={<AdminVerifications />} />
        <Route path="campaigns" element={<AdminCampaigns />} />
        <Route path="advertisements" element={<AdminAdvertisements />} />
        <Route path="rejected" element={<AdminRejected />} />
        <Route path="platforms" element={<AdminPlatforms />} />
        <Route path="broadcasters" element={<AdminBroadcasters />} />
        <Route path="moderation" element={<AdminModeration />} />
        <Route path="activity-log" element={<AdminActivityLog />} />
      </Route>

      {/* Company Verification Status Pages (no sidebar, no verification required) */}
      <Route
        path="/company/verification-pending"
        element={
          <ProtectedRoute allowedRoles={['company']}>
            <PageTransition><PublicLayout><CompanyVerificationPending /></PublicLayout></PageTransition>
          </ProtectedRoute>
        }
      />
      <Route
        path="/company/verification-rejected"
        element={
          <ProtectedRoute allowedRoles={['company']}>
            <PageTransition><PublicLayout><CompanyVerificationRejected /></PublicLayout></PageTransition>
          </ProtectedRoute>
        }
      />

      {/* Company Routes (require verified status for dashboard + features) */}
      <Route
        path="/company"
        element={
          <ProtectedRoute allowedRoles={['company']} requireVerified>
            <DashboardLayout type="company" />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/company/dashboard" replace />} />
        <Route path="dashboard" element={<CompanyDashboard />} />
        <Route path="advertisements" element={<CompanyAdvertisements />} />
        <Route path="campaigns" element={<CompanyCampaigns />} />
        <Route path="notifications" element={<CompanyNotifications />} />
        <Route path="profile" element={<CompanyProfile />} />
        <Route path="contents" element={<CompanyUpcomingContent />} />
        <Route path="upcoming" element={<CompanyUpcomingContent />} />
      </Route>

      {/* Admin Profile (accessed via DashboardLayout header link) */}
      <Route
        path="/admin/profile"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DashboardLayout type="admin" />
          </ProtectedRoute>
        }
      >
        <Route index element={<UserProfile />} />
      </Route>

      {/* 404 */}
      <Route path="/404" element={<PageTransition><PublicLayout><NotFoundPage /></PublicLayout></PageTransition>} />

      {/* Catch-all */}
      <Route path="*" element={<PageTransition><PublicLayout><NotFoundPage /></PublicLayout></PageTransition>} />
    </Routes>
    </>
  );
}
