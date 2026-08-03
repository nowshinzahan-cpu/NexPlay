import { useState, useMemo } from 'react';
import ResultCard from './ResultCard';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const CATEGORIES = [
  { value: 'all', label: 'All' },
  { value: 'movie', label: 'Movies' },
  { value: 'tv', label: 'TV Series' },
  { value: 'web', label: 'Web Series' },
  { value: 'anime', label: 'Anime' },
  { value: 'documentary', label: 'Documentaries' }
];

export default function UpcomingCalendar({ items = [], onViewDetails, loading = false }) {
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const groupedByMonth = useMemo(() => {
    const grouped = {};
    items.forEach(item => {
      const month = item.releaseMonth !== undefined ? item.releaseMonth : 
        (item.releaseYear ? new Date(item.releaseYear, 0).getMonth() : new Date().getMonth());
      const key = month;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(item);
    });
    return grouped;
  }, [items]);

  const filteredItems = useMemo(() => {
    let result = items;
    if (selectedMonth !== null) {
      result = result.filter(item => {
        const month = item.releaseMonth !== undefined ? item.releaseMonth :
          (item.releaseYear ? new Date(item.releaseYear, 0).getMonth() : new Date().getMonth());
        return month === selectedMonth;
      });
    }
    if (selectedCategory !== 'all') {
      result = result.filter(item => item.type === selectedCategory);
    }
    return result;
  }, [items, selectedMonth, selectedCategory]);

  const currentMonth = new Date().getMonth();
  const monthsWithContent = Object.keys(groupedByMonth).map(Number);

  return (
    <section className="text-justify">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 bg-warning rounded-full" />
          <h2 className="text-lg sm:text-xl font-bold text-textPrimary">Upcoming Release Calendar</h2>
          <span className="text-[10px] font-medium bg-warning/10 text-warning px-2 py-0.5 rounded-full border border-warning/20">
            CALENDAR
          </span>
        </div>
      </div>

      {/* Month Picker */}
      <div className="flex flex-wrap gap-2 mb-6 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setSelectedMonth(null)}
          className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all border whitespace-nowrap ${
            selectedMonth === null
              ? 'text-accent-contrast font-bold shadow-sm'
              : 'bg-card text-text-textSecondary border-border hover:text-text-textPrimary hover:border-border-light'
          }`}
          style={selectedMonth === null ? { background: 'var(--gradient-accent)', borderColor: 'var(--color-border-accent)' } : undefined}
        >
          All Months
        </button>
        {MONTHS.map((month, idx) => {
          const hasContent = monthsWithContent.includes(idx);
          return (
            <button
              key={month}
              onClick={() => setSelectedMonth(idx)}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all border whitespace-nowrap ${
                selectedMonth === idx
                  ? 'text-accent-contrast font-bold shadow-sm'
                  : idx === currentMonth
                  ? 'bg-accent/10 text-accent-text border-accent/20 hover:bg-accent/20'
                  : 'bg-card text-text-textSecondary border-border hover:text-text-textPrimary hover:border-border-light'
              } ${!hasContent ? 'opacity-50' : ''}`}
              style={selectedMonth === idx ? { background: 'var(--gradient-accent)', borderColor: 'var(--color-border-accent)' } : undefined}
            >
              {month}
              {idx === currentMonth && (
                <span className="ml-1 text-[9px] opacity-70">(Now)</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORIES.map(cat => (
          <button
            key={cat.value}
            onClick={() => setSelectedCategory(cat.value)}
            className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all border ${
              selectedCategory === cat.value
                ? 'text-accent-contrast font-bold shadow-sm'
                : 'text-textSecondary border-border hover:text-text-textPrimary hover:border-border-light'
            }`}
            style={selectedCategory === cat.value ? { background: 'var(--gradient-accent)', borderColor: 'var(--color-border-accent)' } : undefined}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Items Count */}
      <div className="mb-4">
        <span className="text-sm text-textSecondary">
          {filteredItems.length} {filteredItems.length === 1 ? 'release' : 'releases'}
          {selectedMonth !== null ? ` in ${MONTHS[selectedMonth]}` : ''}
          {selectedCategory !== 'all' ? ` · ${CATEGORIES.find(c => c.value === selectedCategory)?.label}` : ''}
        </span>
      </div>

      {/* Content Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton aspect-[2/3] rounded-xl" />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
          <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-3">
            <svg className="w-6 h-6 text-accent-text" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-sm text-textSecondary">
            {selectedMonth !== null || selectedCategory !== 'all'
              ? 'No upcoming releases match your filters'
              : 'No upcoming releases scheduled yet'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {filteredItems.map((item, idx) => (
            <div key={item.id} className="animate-fadeInUp h-full" style={{ animationDelay: `${idx * 0.03}s` }}>
              <ResultCard item={item} onViewDetails={onViewDetails} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
