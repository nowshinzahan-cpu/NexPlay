import { useEffect } from 'react';

const GENRES = ['Action','Adventure','Comedy','Drama','Thriller','Crime','Mystery','Horror','Fantasy','Romance','Sci-Fi','Family','Animation','Documentary','Historical','War','Supernatural'];
const LANGUAGES = ['English','Bangla','Hindi','Korean','Chinese','Japanese','Tamil','Telugu','Malayalam','Thai','Indonesian','Spanish','French'];
const YEARS = ['2026','2025','2024','2023','2022','2021','2020','Before 2020'];
const PLATFORMS = ['Netflix','Amazon Prime','Disney+','Apple TV+','HBO Max','Hulu','Crunchyroll','Sony LIV','Zee5','Viki'];
const SORT_OPTIONS = [
  { value: 'popular', label: 'Popular' }, { value: 'trending', label: 'Trending' },
  { value: 'latest', label: 'Latest Update' }, { value: 'releaseDate', label: 'Release Date' },
  { value: 'rating', label: 'Highest Rated' }, { value: 'az', label: 'A–Z' },
  { value: 'newest', label: 'Newest First' }, { value: 'oldest', label: 'Oldest First' },
];

function Chip({ label, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-xs rounded-xl transition-all ${
        selected
          ? 'text-accent-contrast font-semibold shadow-sm shadow-accent/25'
          : 'bg-surface/50 text-text-textSecondary border border-border hover:text-text-textPrimary hover:border-border-light'
      }`}
      style={selected ? { background: 'var(--gradient-accent)' } : undefined}
    >
      {label}
    </button>
  );
}

export default function FilterDrawer({
  isOpen, onClose, onApply, onReset,
  selectedGenres, onChangeGenres,
  selectedLanguages, onChangeLanguages,
  releaseYear, onChangeReleaseYear,
  selectedStatuses, onChangeStatuses,
  selectedPlatforms, onChangePlatforms,
  sortBy, onChangeSort,
  activeCategory,
}) {
  const statusMap = {
    all: ['Released', 'Upcoming', 'Ongoing', 'Completed'],
    movie: ['Released', 'Upcoming'],
    tv: ['Ongoing', 'Completed', 'Upcoming'],
    web: ['Ongoing', 'Completed', 'Upcoming'],
    anime: ['Airing', 'Completed', 'Upcoming'],
    documentary: ['Released', 'Upcoming'],
  };
  const statuses = statusMap[activeCategory] || statusMap.all;

  const toggle = (list, setter, item) => {
    setter(list.includes(item) ? list.filter(i => i !== item) : [...list, item]);
  };

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const activeCount = selectedGenres.length + selectedLanguages.length + selectedStatuses.length + selectedPlatforms.length;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div
        className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[400px] backdrop-blur-xl border-l shadow-2xl flex flex-col"
        style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border">
          <div>
            <h2 className="text-lg font-bold text-textPrimary">Filters</h2>
            <p className="text-xs text-textSecondary">{activeCount} filter{activeCount !== 1 ? 's' : ''} active</p>
          </div>
          <button onClick={onClose} className="p-2 text-text-textSecondary hover:text-textPrimary rounded-xl hover:bg-hover transition-all" aria-label="Close filters">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Sort */}
          <div>
            <h3 className="text-sm font-semibold text-text-textPrimary mb-3">Sort By</h3>
            <div className="flex flex-wrap gap-2">
              {SORT_OPTIONS.map(o => (
                <Chip key={o.value} label={o.label} selected={sortBy === o.value} onClick={() => onChangeSort(o.value)} />
              ))}
            </div>
          </div>

          {/* Genre */}
          <div>
            <h3 className="text-sm font-semibold text-text-textPrimary mb-3">Genre</h3>
            <div className="flex flex-wrap gap-2">
              {GENRES.map(g => <Chip key={g} label={g} selected={selectedGenres.includes(g)} onClick={() => toggle(selectedGenres, onChangeGenres, g)} />)}
            </div>
          </div>

          {/* Language */}
          <div>
            <h3 className="text-sm font-semibold text-text-textPrimary mb-3">Language</h3>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map(l => <Chip key={l} label={l} selected={selectedLanguages.includes(l)} onClick={() => toggle(selectedLanguages, onChangeLanguages, l)} />)}
            </div>
          </div>

          {/* Release Year */}
          <div>
            <h3 className="text-sm font-semibold text-text-textPrimary mb-3">Release Year</h3>
            <div className="flex flex-wrap gap-2">
              {YEARS.map(y => (
                <Chip key={y} label={y} selected={releaseYear === y} onClick={() => onChangeReleaseYear(releaseYear === y ? null : y)} />
              ))}
            </div>
          </div>

          {/* Status */}
          <div>
            <h3 className="text-sm font-semibold text-text-textPrimary mb-3">Status</h3>
            <div className="flex flex-wrap gap-2">
              {statuses.map(s => <Chip key={s} label={s} selected={selectedStatuses.includes(s)} onClick={() => toggle(selectedStatuses, onChangeStatuses, s)} />)}
            </div>
          </div>

          {/* Platform */}
          <div>
            <h3 className="text-sm font-semibold text-text-textPrimary mb-3">Streaming Platform</h3>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map(p => <Chip key={p} label={p} selected={selectedPlatforms.includes(p)} onClick={() => toggle(selectedPlatforms, onChangePlatforms, p)} />)}
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 border-t border-border flex gap-3">
          <button onClick={onReset} className="flex-1 min-h-[44px] py-3 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-danger/30 active:scale-[0.97]" style={{ background: 'linear-gradient(135deg, rgb(var(--color-danger)), rgba(var(--color-danger), 0.75))' }}>
            <span className="flex items-center justify-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Reset All
            </span>
          </button>
          <button
            onClick={onApply}
            className="flex-1 min-h-[44px] py-3 text-accent-contrast text-sm font-semibold rounded-xl transition-all shadow-lg shadow-accent/25 active:scale-[0.97]"
            style={{ background: 'var(--gradient-accent)' }}
          >
            Apply Filters
          </button>
        </div>
      </div>
    </>
  );
}
