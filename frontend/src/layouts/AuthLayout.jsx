import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Logo from '../components/Logo';

export default function AuthLayout({ children }) {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-accent/30 border-t-accent animate-spin" />
          <p className="text-sm text-text-textSecondary animate-pulse">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    if (user?.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user?.role === 'company') return <Navigate to="/company/dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden px-4 py-10">
      {/* Ambient background glow — neutral cinematic light */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden="true"
      >
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full blur-[120px]"
          style={{
            background: 'radial-gradient(circle, var(--color-border-light) 0%, transparent 70%)',
          }}
        />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] rounded-full blur-[100px]"
          style={{
            background: 'radial-gradient(circle, var(--color-border) 0%, transparent 70%)',
          }}
        />
      </div>

      <div className="w-full max-w-[420px] mx-auto">
        {/* Logo — centered above card */}
        <div className="flex justify-center mb-10">
          <div className="scale-125">
            <Logo size="lg" linkTo="/" showTagline={false} />
          </div>
        </div>

        {/* Auth Card */}
        <div
          className="relative rounded-2xl p-8"
          style={{
            backgroundColor: 'var(--color-card)',
            border: '1px solid var(--color-border-light)',
            boxShadow: 'var(--shadow-elevated)',
          }}
        >
          {/* Subtle top accent line */}
          <div
            className="absolute top-0 left-8 right-8 h-px"
            style={{
              background: `linear-gradient(90deg, transparent, var(--color-border-light), transparent)`,
            }}
          />

          {children}
        </div>

        {/* Footer */}
        <p className="text-center mt-8 text-xs text-text-tertiary/60">
          &copy; {new Date().getFullYear()} NexPlay. All rights reserved.
        </p>
      </div>
    </div>
  );
}
