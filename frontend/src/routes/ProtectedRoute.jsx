import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function ProtectedRoute({ children, allowedRoles = [], requireVerified = false }) {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-accent/30 border-t-accent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-textSecondary">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check role-based access
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    // Redirect to appropriate dashboard based on role
    if (user?.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user?.role === 'company') return <Navigate to="/company/dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  // For company routes that require verified status
  if (requireVerified && user?.role === 'company') {
    const status = user?.verificationStatus;
    if (status === 'pending') {
      return <Navigate to="/company/verification-pending" replace />;
    }
    if (status === 'rejected') {
      return <Navigate to="/company/verification-rejected" replace />;
    }
    // Allow access for verified companies
    if (status !== 'verified') {
      return <Navigate to="/company/verification-pending" replace />;
    }
  }

  return children;
}
