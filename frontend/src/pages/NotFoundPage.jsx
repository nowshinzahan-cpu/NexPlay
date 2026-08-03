import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/Button';

export default function NotFoundPage() {
  const { isAuthenticated, user } = useAuth();

  const getDashboardLink = () => {
    if (!isAuthenticated) return '/';
    if (user?.role === 'admin') return '/admin/dashboard';
    if (user?.role === 'company') return '/company/dashboard';
    return '/user/dashboard';
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="text-8xl font-extrabold text-accent-text mb-4">404</div>
        <h1 className="text-2xl font-bold text-text-textPrimary mb-2">Page Not Found</h1>
        <p className="text-text-textSecondary mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to={getDashboardLink()}>
          <Button variant="primary" size="lg">
            {isAuthenticated ? 'Go to Dashboard' : 'Go to Home'}
          </Button>
        </Link>
      </div>
    </div>
  );
}
