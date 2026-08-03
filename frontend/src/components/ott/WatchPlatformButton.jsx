const PLATFORM_MAP = {
  'Netflix':       { bg: 'bg-red-600', initial: 'N', url: 'https://www.netflix.com' },
  'Amazon Prime':  { bg: 'bg-blue-500', initial: 'P', url: 'https://www.primevideo.com' },
  'Prime Video':   { bg: 'bg-blue-500', initial: 'P', url: 'https://www.primevideo.com' },
  'Disney+':       { bg: 'bg-indigo-700', initial: 'D', url: 'https://www.disneyplus.com' },
  'Apple TV+':     { bg: 'bg-gray-800', initial: 'A', url: 'https://tv.apple.com' },
  'HBO Max':       { bg: 'bg-indigo-600', initial: 'H', url: 'https://www.hbomax.com' },
  'Hulu':          { bg: 'bg-green-600', initial: 'H', url: 'https://www.hulu.com' },
  'Crunchyroll':   { bg: 'bg-orange-500', initial: 'C', url: 'https://www.crunchyroll.com' },
  'Sony LIV':      { bg: 'bg-blue-600', initial: 'S', url: 'https://www.sonyliv.com' },
  'Zee5':          { bg: 'bg-purple-600', initial: 'Z', url: 'https://www.zee5.com' },
  'Viki':          { bg: 'bg-red-500', initial: 'V', url: 'https://www.viki.com' },
};

export default function WatchPlatformButton({ name }) {
  const info = PLATFORM_MAP[name] || {};
  const url = info.url || (() => {
    const slug = name?.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '') || '';
    return `https://www.${slug}.com`;
  })();
  const bg = info.bg || 'bg-accent';
  const initial = info.initial || name?.[0] || 'W';

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-hover border border-border hover:border-accent/30 transition-all group hover:bg-[var(--hover-bg-strong)] w-full"
      aria-label={`Watch on ${name}`}
    >
      <div className={`w-6 h-6 rounded ${bg} flex items-center justify-center shrink-0`}>
        <span className="text-white text-[10px] font-bold">{initial}</span>
      </div>
      <span className="text-xs text-textSecondary group-hover:text-text-textPrimary transition-colors truncate">
        Watch on {name}
      </span>
      <svg className="w-3 h-3 text-text-textSecondary/50 group-hover:text-accent-text transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
      </svg>
    </a>
  );
}
