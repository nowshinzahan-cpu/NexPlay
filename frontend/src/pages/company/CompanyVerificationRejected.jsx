import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/Button';
import ThemeToggle from '../../components/ThemeToggle';

export default function CompanyVerificationRejected() {
  const { user, logout } = useAuth();

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
            background: 'radial-gradient(circle, rgba(var(--color-danger), 0.06) 0%, transparent 70%)'
          }}
        />

        <div className="relative animate-fade-in-up">
          {/* Card (matches AdBanner CardWrapper style) */}
          <div
            className="relative rounded-2xl overflow-hidden transition-all duration-300 border border-border hover:border-danger/20"
            style={{
              backgroundColor: 'var(--color-card)',
              boxShadow: 'var(--shadow-card)'
            }}
          >
            {/* Decorative top bar */}
            <div className="h-1.5 bg-gradient-to-r from-danger/60 via-danger/30 to-danger/60" />

            <div className="p-6 sm:p-8 text-center">
              {/* Status icon */}
              <div
                className="w-16 h-16 mx-auto mb-5 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor: 'rgba(var(--color-danger), 0.08)',
                  border: '1px solid rgba(var(--color-danger), 0.15)'
                }}
              >
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'rgba(var(--color-danger), 0.7)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>

              {/* Status badge (matches sponsored badge style) */}
              <span
                className="inline-flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border mb-4"
                style={{
                  backgroundColor: 'rgba(var(--color-danger), 0.08)',
                  borderColor: 'rgba(var(--color-danger), 0.15)',
                  color: 'rgba(var(--color-danger), 0.7)'
                }}
              >
                <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                Rejected
              </span>

              {/* Heading */}
              <h1 className="text-2xl sm:text-3xl font-bold leading-tight mb-3" style={{ color: 'var(--color-text-primary)' }}>
                Verification{' '}
                <span style={{ color: 'rgba(var(--color-danger), 0.85)' }}>Rejected</span>
              </h1>

              {/* Message card (matches ad card content area) */}
              <div
                className="rounded-xl p-5 mb-4 text-left"
                style={{
                  backgroundColor: 'rgba(var(--color-danger), 0.04)',
                  border: '1px solid rgba(var(--color-danger), 0.12)'
                }}
              >
                <p className="text-sm font-medium leading-relaxed" style={{ color: 'rgba(var(--color-danger), 0.8)' }}>
                  Your company verification request has been rejected by the Admin.
                  Please update your information and submit another verification request.
                </p>
              </div>

              {/* Rejection reason */}
              {user?.rejectionReason && (
                <div
                  className="rounded-xl p-4 mb-6 text-left"
                  style={{
                    backgroundColor: 'var(--hover-bg)',
                    border: '1px solid var(--color-border)'
                  }}
                >
                  <p className="text-xs mb-1" style={{ color: 'var(--color-text-secondary)' }}>Reason for rejection:</p>
                  <p className="text-sm" style={{ color: 'var(--color-text-primary)' }}>{user.rejectionReason}</p>
                </div>
              )}

              <p className="text-sm leading-relaxed mb-8" style={{ color: 'var(--color-text-secondary)' }}>
                After updating your company information, please contact support to request re-verification.
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
