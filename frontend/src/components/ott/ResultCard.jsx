import { useState } from 'react';

export default function ResultCard({ item, onViewDetails }) {
  const [isHovered, setIsHovered] = useState(false);

  const hasEpisodes = ['tv', 'web', 'anime'].includes(item.type);
  const typeLabel = {
    movie: 'MOVIE', tv: 'TV SERIES', web: 'WEB SERIES',
    anime: 'ANIME', documentary: 'DOCUMENTARY'
  }[item.type] || 'MOVIE';

  return (
    <div
      className="group relative rounded-xl overflow-hidden transition-all duration-300 cursor-pointer h-full flex flex-col"
      style={{ zIndex: isHovered ? 10 : 1, backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onViewDetails?.(item)}
    >
      {/* Poster Container */}
      <div className="aspect-[2/3] relative overflow-hidden" style={{backgroundColor: 'var(--color-card)'}}>
        {item.poster ? (
          <img
            src={item.poster}
            alt={item.title}
            className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-12 h-12 text-accent-text/15" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Type Badge — monochrome glass */}
        <span className="absolute top-2 left-2 text-[10px] font-semibold tracking-wide px-2 py-0.5 rounded-md border backdrop-blur-md bg-black/45 border-white/20 text-white/90">
          {typeLabel}
        </span>

        {/* Rating */}
        {item.rating > 0 && (
          <div className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-sm">
            <svg className="w-3 h-3 text-warning" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-[11px] font-bold text-white">{item.rating}</span>
          </div>
        )}

        {/* Episode Count */}
        {hasEpisodes && item.episodeCount > 0 && (
          <span className="absolute bottom-2 left-2 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-card border border-border text-textPrimary">
            {item.episodeCount} EP
          </span>
        )}

        {/* Hover Overlay — Apple-style play */}
        <div className="absolute inset-0 flex flex-col justify-end p-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
          <button
            onClick={(e) => { e.stopPropagation(); onViewDetails?.(item); }}
            className="w-full py-2.5 text-xs font-semibold rounded-full transition-all active:scale-[0.97] shadow-lg flex items-center justify-center gap-1.5"
            style={{ background: 'var(--gradient-accent)', color: 'rgb(var(--color-accent-contrast))' }}
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
            VIEW DETAILS
          </button>
          {item.platform?.[0] && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                const slug = item.platform[0].toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
                window.open(`https://www.${slug}.com`, '_blank', 'noopener noreferrer');
              }}
              className="mt-2 w-full py-2 text-xs font-medium rounded-full transition-all active:scale-[0.97] backdrop-blur-md bg-white/15 text-white border border-white/25 hover:bg-white/25"
            >
              WATCH NOW
            </button>
          )}
        </div>
      </div>

      {/* Info Section */}
      <div className="p-3 flex-1 flex flex-col gap-1">
        <h3 className="text-sm font-medium text-text-textPrimary truncate group-hover:text-accent-text transition-colors" title={item.title}>
          {item.title}
        </h3>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {item.releaseYear && (
            <span className="text-[11px] text-text-textSecondary/60">{item.releaseYear}</span>
          )}
          {item.languages?.[0] && (
            <>
              <span className="textSecondary/20">·</span>
              <span className="text-[11px] text-text-textSecondary/60 truncate">{item.languages[0]}</span>
            </>
          )}
        </div>
        {item.genres?.length > 0 && (
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            {item.genres.slice(0, 2).map((g) => (
              <span key={g} className="text-[10px] text-text-textSecondary/50 px-1.5 py-0.5 rounded" style={{backgroundColor: 'var(--hover-bg)'}}>{g}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
