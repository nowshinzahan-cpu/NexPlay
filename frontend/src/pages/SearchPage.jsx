import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchTrending, fetchPopular, fetchLatestUpdates, fetchUpcoming, fetchRecommended, fetchFilteredContent, fetchSuggestions } from '../services/contentService';
import SearchBar from '../components/ott/SearchBar';
import CategoryTabs from '../components/ott/CategoryTabs';
import ContentRail from '../components/ott/ContentRail';
import UpcomingCalendar from '../components/ott/UpcomingCalendar';
import ResultsGrid from '../components/ott/ResultsGrid';
import WhereToWatchSection from '../components/ott/WhereToWatchSection';
import FilterDrawer from '../components/ott/FilterDrawer';
import DetailsModal from '../components/ott/DetailsModal';
import LoadingSkeleton from '../components/ott/LoadingSkeleton';
import AdBanner from '../components/AdBanner';
import Button from '../components/Button';

const SECTIONS_LOADING_COUNT = 5;

const GENRES = ['Action','Adventure','Comedy','Drama','Thriller','Crime','Mystery','Horror','Fantasy','Romance','Sci-Fi','Family','Animation','Documentary','Historical','War','Supernatural'];
const LANGUAGES = ['English','Bangla','Hindi','Korean','Chinese','Japanese','Tamil','Telugu','Malayalam','Thai','Indonesian','Spanish','French'];
const YEARS = ['2026','2025','2024','2023','2022','2021','2020','Before 2020'];
const PLATFORMS = ['Netflix','Amazon Prime','Disney+','Apple TV+','HBO Max','Hulu','Crunchyroll','Sony LIV','Zee5','Viki'];
const getStatuses = (category) => {
  const map = {
    all: ['Released', 'Upcoming', 'Ongoing', 'Completed'],
    movie: ['Released', 'Upcoming'],
    tv: ['Ongoing', 'Completed', 'Upcoming'],
    web: ['Ongoing', 'Completed', 'Upcoming'],
    anime: ['Airing', 'Completed', 'Upcoming'],
    documentary: ['Released', 'Upcoming'],
  };
  return map[category] || map.all;
};

export default function SearchPage() {
  // ── Filter state ──────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [releaseYear, setReleaseYear] = useState(null);
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [sortBy, setSortBy] = useState('popular');

  // ── UI state ───────────────────────────────────────────────────
  const [trending, setTrending] = useState([]);
  const [popular, setPopular] = useState([]);
  const [latest, setLatest] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [recommended, setRecommended] = useState([]);

  const [sectionsLoading, setSectionsLoading] = useState(true);
  const [sectionsError, setSectionsError] = useState(null);
  const [filtered, setFiltered] = useState({ items: [], pagination: { page: 1, totalPages: 1, total: 0 } });
  const [filtering, setFiltering] = useState(false);
  const [filterError, setFilterError] = useState(null);

  const [selectedContent, setSelectedContent] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  const debounceRef = useRef(null);
  const searchBarRef = useRef(null);
  const currentPageRef = useRef(1);

  // ── Derived ─────────────────────────────────────────────────────
  const hasActiveFilters = selectedGenres.length > 0 || selectedLanguages.length > 0 ||
    releaseYear !== null || selectedStatuses.length > 0 || selectedPlatforms.length > 0;
  const hasSearchOrFilters = searchQuery.trim().length > 0 || hasActiveFilters || activeCategory !== 'all';
  const statusOptions = getStatuses(activeCategory);

  // ── Load section data on mount ────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setSectionsLoading(true);
      setSectionsError(null);
      try {
        const [trend, pop, lat, up, rec] = await Promise.all([
          fetchTrending(), fetchPopular(),
          fetchLatestUpdates(), fetchUpcoming(), fetchRecommended(),
        ]);
        if (cancelled) return;
        setTrending(trend);
        setPopular(pop);
        setLatest(lat);
        setUpcoming(up);
        setRecommended(rec);
      } catch (err) {
        if (!cancelled) setSectionsError('Failed to load content.');
      } finally {
        if (!cancelled) setSectionsLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  // ── Shared filter function ──────────────────────────────────────
  const applyFilters = useCallback(async (pageOverride) => {
    const page = pageOverride || currentPageRef.current;
    const result = await fetchFilteredContent({
      search: searchQuery,
      category: activeCategory === 'all' ? 'all' : activeCategory,
      genres: selectedGenres,
      languages: selectedLanguages,
      releaseYear,
      statuses: selectedStatuses,
      platforms: selectedPlatforms,
      sort: sortBy,
      page,
    });
    currentPageRef.current = result.pagination.page;
    return result;
  }, [searchQuery, activeCategory, selectedGenres, selectedLanguages, releaseYear, selectedStatuses, selectedPlatforms, sortBy]);

  // ── Run filter whenever filters or search change ─────────────
  useEffect(() => {
    if (!hasSearchOrFilters) return;
    currentPageRef.current = 1;
    setFiltering(true);
    setFilterError(null);
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const result = await applyFilters(1);
        if (!cancelled) setFiltered(result);
      } catch (err) {
        if (!cancelled) setFilterError('Filtering failed. Please try again.');
      } finally {
        if (!cancelled) setFiltering(false);
      }
    }, 120);
    return () => { cancelled = true; clearTimeout(timer); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasSearchOrFilters, searchQuery, activeCategory, selectedGenres, selectedLanguages, releaseYear, selectedStatuses, selectedPlatforms, sortBy]);

  // ── Suggestions ────────────────────────────────────────────────
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchBarRef.current && !searchBarRef.current.contains(e.target)) {
        setSuggestions([]);
      }
    }
    if (suggestions.length > 0) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [suggestions.length]);

  const handleSearchChange = useCallback((value) => {
    setSearchQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value.trim()) { setSuggestions([]); return; }
    debounceRef.current = setTimeout(async () => {
      try {
        const results = await fetchSuggestions(value);
        setSuggestions(results);
      } catch { setSuggestions([]); }
    }, 300);
  }, []);

  const handleSuggestionSelect = useCallback((s) => {
    setSearchQuery(s.title);
    setSuggestions([]);
  }, []);

  const handleSearchSubmit = useCallback((e) => {
    e?.preventDefault();
    setSuggestions([]);
  }, []);

  const handleCategoryChange = useCallback((cat) => {
    setActiveCategory(cat);
    setFiltered(prev => ({ ...prev, pagination: { ...prev.pagination, page: 1 } }));
  }, []);

  const resetFilters = useCallback(() => {
    setSelectedGenres([]);
    setSelectedLanguages([]);
    setReleaseYear(null);
    setSelectedStatuses([]);
    setSelectedPlatforms([]);
    setSortBy('popular');
    currentPageRef.current = 1;
    setActiveCategory('all');
    setFiltered(prev => ({ ...prev, pagination: { ...prev.pagination, page: 1 } }));
  }, []);

  const clearAll = useCallback(() => {
    setSearchQuery('');
    setSuggestions([]);
    setActiveCategory('all');
    resetFilters();
  }, [resetFilters]);

  const handlePageChange = useCallback(async (page) => {
    setFiltering(true);
    setFilterError(null);
    try {
      const result = await applyFilters(page);
      setFiltered(result);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      setFilterError('Failed to load page.');
    } finally {
      setFiltering(false);
    }
  }, [applyFilters]);

  const handleFilterRetry = useCallback(async () => {
    setFilterError(null);
    setFiltering(true);
    try {
      const result = await applyFilters(1);
      currentPageRef.current = 1;
      setFiltered(result);
    } catch {
      setFilterError('Filtering failed. Please try again.');
    } finally {
      setFiltering(false);
    }
  }, [applyFilters]);

  const handleViewDetails = useCallback((content) => {
    setSelectedContent(content);
    setDetailOpen(true);
  }, []);

  // ── Filter chips ──────────────────────────────────────────────
  const filterChips = [];
  selectedGenres.forEach(g => filterChips.push({ label: g, onRemove: () => setSelectedGenres(prev => prev.filter(x => x !== g)) }));
  selectedLanguages.forEach(l => filterChips.push({ label: l, onRemove: () => setSelectedLanguages(prev => prev.filter(x => x !== l)) }));
  if (releaseYear) filterChips.push({ label: releaseYear, onRemove: () => setReleaseYear(null) });
  selectedStatuses.forEach(s => filterChips.push({ label: s, onRemove: () => setSelectedStatuses(prev => prev.filter(x => x !== s)) }));
  selectedPlatforms.forEach(p => filterChips.push({ label: p, onRemove: () => setSelectedPlatforms(prev => prev.filter(x => x !== p)) }));

  return (
    <div className="min-h-screen bg-background">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="border-b border-border text-justify">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          <div className="mb-4 sm:mb-5">
            <div className="flex items-center gap-3">
              <div className="w-1 h-5 sm:h-6 bg-accent rounded-full shrink-0" />
              <div>
                <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold text-text-textPrimary tracking-tight">
                  Search <span className="text-gradient">Contents</span>
                </h1>
                <p className="text-text-textSecondary/60 text-xs sm:text-sm mt-0.5 text-justify">
                  Discover Movies, TV Series, Anime, and more
                </p>
              </div>
            </div>
          </div>

          <div ref={searchBarRef}>
            <SearchBar
              value={searchQuery}
              onChange={handleSearchChange}
              onSubmit={handleSearchSubmit}
              suggestions={suggestions}
              onSelectSuggestion={handleSuggestionSelect}
              loading={false}
            />
          </div>

          <div className="mt-5">
            <CategoryTabs active={activeCategory} onChange={handleCategoryChange} />
          </div>
        </div>
      </div>

      {/* ── Main ───────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 text-justify">
        {/* Filter Bar — only visible when a specific category is selected */}
        {activeCategory !== 'all' && (
          <div className="flex w-full items-center justify-between gap-2 sm:gap-4 mb-4">
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <FilterPopover label="Genre" options={GENRES} selected={selectedGenres} onChange={setSelectedGenres} multiSelect />
              <FilterPopover label="Language" options={LANGUAGES} selected={selectedLanguages} onChange={setSelectedLanguages} multiSelect />
              <FilterPopover label="Year" options={YEARS} selected={releaseYear} onChange={setReleaseYear} multiSelect={false} />
              <FilterPopover label="Status" options={statusOptions} selected={selectedStatuses} onChange={setSelectedStatuses} multiSelect />
              <FilterPopover label="Platform" options={PLATFORMS} selected={selectedPlatforms} onChange={setSelectedPlatforms} multiSelect />
            </div>

            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              <SortPopover value={sortBy} onChange={setSortBy} />
              <button
                onClick={() => setFilterDrawerOpen(true)}
                className={`relative flex items-center justify-center gap-1 sm:gap-2 min-h-[44px] px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all hover:border-border-light ${
                  filterChips.length > 0
                    ? 'bg-accent/10 text-accent-text border border-accent/30'
                    : 'bg-card text-text-textSecondary border border-border'
                }`}
                aria-label="Open filter drawer"
              >
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                <span className="hidden sm:inline">Filters</span>
                {filterChips.length > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-accent text-accent-contrast text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm shadow-accent/30">
                    {filterChips.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Active Filter Chips */}
        {filterChips.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-6">
            {filterChips.map((chip, i) => (
              <button
                key={`${chip.label}-${i}`}
                onClick={chip.onRemove}
                className="flex items-center gap-2 px-3 py-1.5 bg-accent/[0.06] text-accent-text text-xs rounded-lg border border-accent/20 hover:bg-accent/10 transition-colors"
              >
                {chip.label}
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            ))}
            <button onClick={resetFilters} className="text-xs text-text-textSecondary/50 hover:text-accent-text transition-colors ml-1">Clear all</button>
          </div>
        )}

        {/* ── Results OR Homepage sections ──────────────────────── */}
        {hasSearchOrFilters ? (
          <>
            <div className="flex w-full items-center justify-between mb-6">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-1 h-6 bg-accent rounded-full shrink-0" />
                <h2 className="text-lg sm:text-xl font-bold text-text-textPrimary truncate">
                  {searchQuery.trim()
                    ? <>Results for "<span className="text-accent-text">{searchQuery}</span>"</>
                    : 'Filtered Results'}
                </h2>
              </div>
              {filtered.pagination.total > 0 && (
                <span className="text-sm text-text-textSecondary/60 shrink-0">
                  {filtered.pagination.total} result{filtered.pagination.total !== 1 ? 's' : ''} found
                </span>
              )}
            </div>

            {filtering ? (
              <LoadingSkeleton count={8} />
            ) : filterError ? (
              <ResultsGrid error onRetry={handleFilterRetry} />
            ) : (
              <ResultsGrid
                items={filtered.items}
                loading={false}
                onViewDetails={handleViewDetails}
                pagination={filtered.pagination}
                onPageChange={handlePageChange}
                searchQuery={searchQuery}
                onClearFilters={clearAll}
              />
            )}
          </>
        ) : sectionsLoading ? (
          <div className="space-y-10">
            {Array.from({ length: SECTIONS_LOADING_COUNT }).map((_, i) => (
              <div key={i} className="animate-fade-in-up" style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="skeleton h-7 w-48 rounded-lg mb-4" />
                <LoadingSkeleton count={6} />
              </div>
            ))}
          </div>
        ) : sectionsError ? (
          <div className="py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-danger/10 flex items-center justify-center mx-auto mb-4 border border-danger/20">
              <svg className="w-7 h-7 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="text-text-textSecondary mb-4">{sectionsError}</p>
            <Button variant="primary" size="sm" onClick={() => window.location.reload()}>
              Reload Page
            </Button>
          </div>
        ) : (
          <div className="space-y-10 sm:space-y-14">
            <ContentRail title="Trending Now" subtitle="Weekly Trending"
              items={trending} onViewDetails={handleViewDetails} />
            <ContentRail title="Popular Today" subtitle="Editor's Picks"
              items={popular} onViewDetails={handleViewDetails} />
            <ContentRail title="Recommended For You"
              items={recommended} onViewDetails={handleViewDetails} />
            <ContentRail title="Latest Updates" subtitle="Recently Updated"
              accentColor="success" items={latest} onViewDetails={handleViewDetails} />
            <UpcomingCalendar items={upcoming} onViewDetails={handleViewDetails} />
            {/* Sponsored Advertisements (FR-16) — same polished style as LandingPage */}
            <section className="relative py-12 sm:py-16 overflow-hidden scroll-mt-16">
              {/* Background glow */}
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] sm:w-[800px] h-[400px] rounded-full blur-[120px] sm:blur-[140px] pointer-events-none"
                style={{
                  background: 'radial-gradient(circle, rgba(var(--color-accent), 0.06) 0%, transparent 70%)'
                }}
              />

              <div className="relative">
                {/* Section Header */}
                <div className="text-center mb-10 sm:mb-12">
                  <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full" style={{ background: 'rgba(var(--color-accent), 0.10)', border: '1px solid rgba(var(--color-accent), 0.15)' }}>
                    <span className="text-[10px] sm:text-[11px] text-accent-text font-semibold tracking-widest uppercase">Sponsored</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text-textPrimary mb-3 animate-fade-in-up tracking-tight">
                    Promoted{' '}
                    <span className="text-gradient">Content</span>
                  </h2>
                  <p className="text-text-textSecondary/50 text-sm sm:text-base max-w-xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                    Discover campaigns and promotions from our trusted partners.
                  </p>
                </div>

                <AdBanner placement="all" limit={2} />
              </div>
            </section>
            <WhereToWatchSection />
          </div>
        )}
      </div>

      {/* ── Filter Drawer ───────────────────────────────────────── */}
      <FilterDrawer
        isOpen={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        onApply={() => setFilterDrawerOpen(false)}
        onReset={() => { resetFilters(); setFilterDrawerOpen(false); }}
        selectedGenres={selectedGenres}
        onChangeGenres={setSelectedGenres}
        selectedLanguages={selectedLanguages}
        onChangeLanguages={setSelectedLanguages}
        releaseYear={releaseYear}
        onChangeReleaseYear={setReleaseYear}
        selectedStatuses={selectedStatuses}
        onChangeStatuses={setSelectedStatuses}
        selectedPlatforms={selectedPlatforms}
        onChangePlatforms={setSelectedPlatforms}
        sortBy={sortBy}
        onChangeSort={setSortBy}
        activeCategory={activeCategory}
      />

      <DetailsModal isOpen={detailOpen} onClose={() => setDetailOpen(false)} content={selectedContent} />
    </div>
  );
}

// ── Inline helpers ─────────────────────────────────────────────────

function FilterPopover({ label, options, selected, onChange, multiSelect = true }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    }
    if (isOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  const activeCount = multiSelect ? selected.length : (selected ? 1 : 0);

  const handleSelect = (item) => {
    if (multiSelect) {
      onChange(selected.includes(item) ? selected.filter(x => x !== item) : [...selected, item]);
    } else {
      onChange(selected === item ? null : item);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all min-h-[44px] ${
          activeCount > 0
            ? 'bg-accent/10 text-accent-text border border-accent/30 font-semibold ring-1 ring-accent/20'
            : 'bg-card text-text-textSecondary border border-border hover:border-border-light'
        }`}
        aria-label={`Filter by ${label.toLowerCase()}${activeCount > 0 ? ` (${activeCount} active)` : ''}`}
      >
        {activeCount > 0 && (
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
        {label}
        {activeCount > 0 && <span className="text-[10px] font-bold ml-0.5">({activeCount})</span>}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />
          <div
            className="absolute left-0 top-full mt-1 z-40 w-56 max-h-72 overflow-y-auto py-1 rounded-xl shadow-xl border backdrop-blur-xl"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border-light)',
              boxShadow: 'var(--shadow-elevated)'
            }}
          >
            {options.map(opt => (
              <button
                key={opt}
                onClick={() => handleSelect(opt)}
                className={`w-full text-left px-4 py-2.5 text-sm transition-all flex items-center gap-2 ${
                  (multiSelect ? selected.includes(opt) : selected === opt)
                    ? 'bg-accent/10 text-accent-text font-semibold'
                    : 'text-text-textSecondary hover:text-text-textPrimary hover:bg-hover'
                }`}
              >
                {(multiSelect ? selected.includes(opt) : selected === opt) && (
                  <svg className="w-3.5 h-3.5 shrink-0 text-accent-text" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
                <span className={(multiSelect ? selected.includes(opt) : selected === opt) ? '' : 'ml-[22px]'}>{opt}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function SortPopover({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef(null);

  const options = [
    { value: 'popular', label: 'Popular' }, { value: 'trending', label: 'Trending' },
    { value: 'latest', label: 'Latest' }, { value: 'releaseDate', label: 'Release Date' },
    { value: 'rating', label: 'Highest Rated' }, { value: 'az', label: 'A–Z' },
  ];

  const currentLabel = options.find(o => o.value === value)?.label || 'Popular';

  useEffect(() => {
    function handleClick(e) {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClick);
    }
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  return (
    <div className="relative" ref={popoverRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all min-h-[44px] ${
          value !== 'popular'
            ? 'bg-accent/10 text-accent-text border border-accent/30 font-semibold ring-1 ring-accent/20'
            : 'bg-card text-text-textSecondary border border-border hover:border-border-light'
        }`}
        aria-label="Sort by"
        aria-expanded={isOpen}
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h18M3 12h18m-6 8h6" />
        </svg>
        <span className="hidden sm:inline">{currentLabel}</span>
        <svg className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />
          <div
            className="absolute right-0 top-full mt-1 z-40 w-48 py-1 rounded-xl shadow-xl border backdrop-blur-xl"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border-light)',
              boxShadow: 'var(--shadow-elevated)'
            }}
          >
            {options.map(o => (
              <button
                key={o.value}
                onClick={() => { onChange(o.value); setIsOpen(false); }}
                className={`w-full text-left px-4 py-2.5 text-sm transition-all flex items-center gap-2 ${
                  value === o.value
                    ? 'bg-accent/10 text-accent-text font-semibold'
                    : 'text-text-textSecondary hover:text-text-textPrimary hover:bg-hover'
                }`}
              >
                {value === o.value && (
                  <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                <span className={value === o.value ? 'ml-0' : 'ml-[22px]'}>{o.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
