import Button from '../Button';

export default function NoResultState({ query = '', onClear }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-4 border border-accent/20">
        <svg className="w-8 h-8 text-accent-text" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-text-textPrimary mb-2">No results found</h3>
      <p className="text-sm text-text-textSecondary mb-6 max-w-md">
        {query
          ? <>We couldn't find any matches for "<span className="text-accent-text">{query}</span>". Try adjusting your search or filters.</>
          : 'No content matches your current filters. Try broadening your search criteria.'}
      </p>
      {onClear && (
        <Button variant="primary" size="sm" onClick={onClear}>
          Clear Filters
        </Button>
      )}
    </div>
  );
}
