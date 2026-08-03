import ResultCard from './ResultCard';
import LoadingSkeleton from './LoadingSkeleton';
import NoResultState from './NoResultState';
import Pagination from './Pagination';

export default function ResultsGrid({
  items = [],
  loading = false,
  error = false,
  onRetry,
  onViewDetails,
  pagination,
  onPageChange,
  searchQuery = '',
  onClearFilters,
}) {
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-16 h-16 rounded-full bg-danger/10 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-text-textPrimary mb-2">Failed to load results</h3>
        <p className="text-sm text-text-textSecondary mb-4">Something went wrong. Please try again.</p>
        <button onClick={onRetry} className="px-6 py-3 bg-accent text-accent-contrast text-sm font-semibold rounded-lg hover:bg-accent/90 transition-all">
          Try Again
        </button>
      </div>
    );
  }

  if (loading) return <LoadingSkeleton count={8} />;

  if (items.length === 0) {
    return <NoResultState query={searchQuery} onClear={onClearFilters} />;
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
        {items.map((item, idx) => (
          <div key={item.id} className="animate-fadeInUp h-full" style={{ animationDelay: `${idx * 0.03}s` }}>
            <ResultCard item={item} onViewDetails={onViewDetails} />
          </div>
        ))}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="mt-8">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </>
  );
}
