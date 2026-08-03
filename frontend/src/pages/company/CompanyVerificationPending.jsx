import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/Button';
import ThemeToggle from '../../components/ThemeToggle';

export default function CompanyVerificationPending() {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-lg">
        {/* Ambient glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] sm:w-[700px] h-[400px] rounded-full blur-[120px] sm:blur-[140px] pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(var(--color-warning), 0.06) 0%, transparent 70%)'
          }}
        />

        <div className="relative animate-fade-in-up">
          {/* Card (matches AdBanner CardWrapper style) */}
          <div
            className="relative rounded-2xl overflow-hidden transition-all duration-300 border border-border hover:border-warning/20"
            style={{
              backgroundColor: 'var(--color-card)',
              boxShadow: 'var(--shadow-card)'
            }}
          >
            {/* Decorative top bar */}
            <div className="h-1.5 bg-gradient-to-r from-warning/60 via-warning/30 to-warning/60" />

            <div className="p-6 sm:p-8 text-center">
              {/* Status icon */}
              <div
                className="w-16 h-16 mx-auto mb-5 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor: 'rgba(var(--color-warning), 0.08)',
                  border: '1px solid rgba(var(--color-warning), 0.15)'
                }}
              >
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'rgba(var(--color-warning), 0.7)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>

              {/* Status badge (matches sponsored badge style) */}
              <span
                className="inline-flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border mb-4"
                style={{
                  backgroundColor: 'rgba(var(--color-warning), 0.08)',
                  borderColor: 'rgba(var(--color-warning), 0.15)',
                  color: 'rgba(var(--color-warning), 0.7)'
                }}
              >
                <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Pending
              </span>

              {/* Heading */}
              <h1 className="text-2xl sm:text-3xl font-bold leading-tight mb-3" style={{ color: 'var(--color-text-primary)' }}>
                Verification{' '}
                <span style={{ color: 'rgba(var(--color-warning), 0.85)' }}>Pending</span>
              </h1>

              {/* Message card (matches ad card content area) */}
              <div
                className="rounded-xl p-5 mb-6 text-left"
                style={{
                  backgroundColor: 'rgba(var(--color-warning), 0.04)',
                  border: '1px solid rgba(var(--color-warning), 0.12)'
                }}
              >
                <p className="text-sm font-medium leading-relaxed" style={{ color: 'rgba(var(--color-warning), 0.8)' }}>
                  Your company verification request is currently pending Admin approval.
                </p>
              </div>

              <p className="text-sm leading-relaxed mb-8" style={{ color: 'var(--color-text-secondary)' }}>
                Once your account is verified, you will be able to access the Company Dashboard
                and all available features including advertisements and campaigns.
              </p>

              <Button variant="ghost" onClick={logout} className="w-full">
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
