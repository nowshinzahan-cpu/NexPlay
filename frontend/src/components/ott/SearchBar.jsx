import { useState, useRef, useEffect, useCallback } from 'react';

export default function SearchBar({ value, onChange, onSubmit, suggestions = [], onSelectSuggestion, loading = false }) {
  const [focusedIdx, setFocusedIdx] = useState(-1);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const showSuggestions = suggestions.length > 0 && value.trim().length > 0;

  useEffect(() => { setFocusedIdx(-1); }, [suggestions]);

  useEffect(() => {
    if (focusedIdx >= 0 && listRef.current) {
      const el = listRef.current.children[focusedIdx];
      if (el) el.scrollIntoView({ block: 'nearest' });
    }
  }, [focusedIdx]);

  const handleKeyDown = useCallback((e) => {
    if (!showSuggestions) {
      if (e.key === 'Enter') onSubmit?.(e);
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIdx((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIdx((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (focusedIdx >= 0 && focusedIdx < suggestions.length) {
          onSelectSuggestion?.(suggestions[focusedIdx]);
        } else {
          onSubmit?.(e);
        }
        break;
      case 'Escape':
        setFocusedIdx(-1);
        inputRef.current?.blur();
        break;
      default: break;
    }
  }, [showSuggestions, focusedIdx, suggestions, onChange, onSubmit, onSelectSuggestion]);

  const handleClear = () => {
    onChange('');
    setFocusedIdx(-1);
    inputRef.current?.focus();
  };

  return (
    <div className="relative">
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
          {loading ? (
            <svg className="w-5 h-5 text-accent-text animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-textSecondary group-focus-within:text-accent-text transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
        </div>

        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => { onChange(e.target.value); setFocusedIdx(-1); }}
          onKeyDown={handleKeyDown}
          onFocus={() => value.trim() && suggestions.length > 0 && setFocusedIdx(-1)}
          placeholder="Search Movies or TV Series..."
          className="w-full bg-card border border-border focus:border-accent/30 rounded-lg pl-12 pr-12 py-4 text-sm sm:text-base text-textPrimary placeholder-text-tertiary/50 
                     focus:outline-none focus:shadow-glow-accent-sm transition-all duration-200"
          autoComplete="off"
          aria-label="Search Movies or TV Series"
          aria-expanded={showSuggestions}
          aria-controls="search-suggestions"
          aria-autocomplete="list"
          role="combobox"
        />

        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-text-textSecondary hover:text-text-textPrimary transition-colors z-10"
            aria-label="Clear search"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* Focus glow effect */}
        <div className="absolute inset-0 rounded-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" 
             style={{ boxShadow: '0 0 30px rgba(var(--color-accent), 0.06)' }} />
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <div
          id="search-suggestions"
          ref={listRef}
          role="listbox"
          className="absolute top-full left-0 right-0 mt-2 backdrop-blur-xl border rounded-lg shadow-2xl z-50 overflow-hidden animate-fadeInScale"
          style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)', boxShadow: '0 24px 80px rgba(0,0,0,0.5)' }}
        >
          <div className="p-2">
            {suggestions.map((s, idx) => (
              <button
                key={s.id}
                role="option"
                aria-selected={idx === focusedIdx}
                onClick={() => onSelectSuggestion?.(s)}
                onMouseEnter={() => setFocusedIdx(idx)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left
                  ${idx === focusedIdx ? 'bg-accent/10 text-accent-text' : 'hover:bg-hover textPrimary'}`}
              >
                <svg className={`w-4 h-4 shrink-0 ${idx === focusedIdx ? 'text-accent-text' : 'textSecondary'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="text-sm flex-1 truncate">{s.title}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-accent-text shrink-0 px-2 py-0.5 rounded-md bg-accent/10">
                  {s.type === 'movie' ? 'Movie' : 'Series'}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
