export default function StatCard({ label, value, icon: Icon, color = 'accent', trend, onClick }) {
  const colorClasses = {
    accent: 'bg-accent/10 text-accent-text group-hover:bg-accent/15',
    success: 'bg-success/10 text-success group-hover:bg-success/15',
    warning: 'bg-warning/10 text-warning group-hover:bg-warning/15',
    danger: 'bg-danger/10 text-danger group-hover:bg-danger/15'
  };

  const trendColors = {
    accent: 'text-accent-text',
    success: 'text-success',
    warning: 'text-warning',
    danger: 'text-danger'
  };

  return (
    <div
      className={`card-hover group ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm text-textSecondary group-hover:text-textSecondary/80 transition-colors">{label}</p>
          <p className="text-3xl font-bold text-textPrimary">{value ?? 0}</p>
          {trend !== undefined && (
            <p className={`text-xs font-medium flex items-center gap-1 ${trend >= 0 ? 'text-success' : 'text-danger'}`}>
              {trend >= 0 ? (
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              ) : (
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              )}
              {trend >= 0 ? '+' : ''}{trend}% from last month
            </p>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-2xl transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg ${colorClasses[color] || colorClasses.accent}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </div>
  );
}
