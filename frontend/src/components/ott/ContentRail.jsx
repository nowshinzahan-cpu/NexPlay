import { useState } from 'react';
import ResultCard from './ResultCard';
import LoadingSkeleton from './LoadingSkeleton';
import EmptyState from './EmptyState';
import ErrorState from './ErrorState';

export default function ContentRail({
  title,
  subtitle,
  icon,
  items = [],
  loading = false,
  error = null,
  onRetry,
  onViewDetails,
  emptyType,
  emptyMessage,
  show = true,
  /**
   * Layout mode:
   * - 'auto' (default): horizontal scroll when closed, grid when expanded
   * - 'grid': always render as a responsive grid (no horizontal scroll)
   * - 'scroll': always render as a horizontal scroll row
   */
  layout = 'auto',
}) {
  const [showAll, setShowAll] = useState(false);

  if (!show) return null;

  const isGrid = layout === 'grid' || (layout === 'auto' && showAll);
  const showToggle = layout !== 'grid' && items.length > 6;

  return (
    <section className="animate-fade-in-up">
      <div className="flex items-end justify-between gap-3 mb-4 sm:mb-6">
        <div className="flex items-baseline gap-2.5 min-w-0">
          <h2 className="text-xl sm:text-2xl font-semibold text-text-textPrimary tracking-tight leading-tight truncate">{title}</h2>
          {icon && <span className="text-accent-text text-base shrink-0">{icon}</span>}
        </div>
        {subtitle && (
          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-text-textSecondary font-medium px-3 py-1 rounded-full border whitespace-nowrap shrink-0" style={{ backgroundColor: 'var(--hover-bg)', borderColor: 'var(--color-border)' }}>
            {subtitle}
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" /></svg>
          </span>
        )}
      </div>

      {error ? (
        <ErrorState message={error} onRetry={onRetry} />
      ) : loading ? (
        <LoadingSkeleton count={6} />
      ) : items.length === 0 ? (
        <EmptyState type={emptyType || 'default'} message={emptyMessage} compact />
      ) : isGrid ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
          {items.map((item, idx) => (
            <div
              key={item.id}
              className="animate-fade-in-up h-full"
              style={{ animationDelay: `${idx * 0.03}s` }}
            >
              <ResultCard item={item} onViewDetails={onViewDetails} />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 pr-8 sm:pr-12 scrollbar-none">
          {items.map((item, idx) => (
            <div
              key={item.id}
              className="min-w-[140px] w-[44vw] sm:w-[180px] md:w-[200px] shrink-0 animate-fade-in-up"
              style={{ animationDelay: `${idx * 0.05}s` }}
            >
              <div className="h-full">
                <ResultCard item={item} onViewDetails={onViewDetails} />
              </div>
            </div>
          ))}
        </div>
      )}

      {showToggle && (
        <div className="flex justify-center mt-6 sm:mt-8">
          <button
            onClick={() => setShowAll(!showAll)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all border hover:border-accent/30 hover:bg-accent/[0.03] active:scale-[0.97]"
            style={{
              backgroundColor: showAll ? 'rgba(var(--color-accent), 0.06)' : 'var(--color-card)',
              borderColor: showAll ? 'rgba(var(--color-accent), 0.25)' : 'var(--color-border)',
              color: 'rgb(var(--color-accent-text))'
            }}
          >
            {showAll ? (
              <><span>Show Less</span><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /></svg></>
            ) : (
              <><span>View All</span><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" /></svg></>
            )}
          </button>
        </div>
      )}
    </section>
  );
}
