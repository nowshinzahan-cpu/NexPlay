import WatchPlatformButton from './WatchPlatformButton';

const OFFICIAL_PLATFORMS = [
  'Netflix', 'Amazon Prime', 'Disney+', 'Apple TV+',
  'Crunchyroll', 'Sony LIV', 'Zee5', 'HBO Max', 'Hulu', 'Viki',
];

export default function WhereToWatchSection() {
  return (
    <section className="text-justify">
      <div className="flex items-center gap-3 mb-4 sm:mb-6">
        <div className="w-1 h-6 bg-accent rounded-full shrink-0" />
        <h2 className="text-lg sm:text-xl font-bold text-textPrimary">Where To Watch</h2>
        <span className="text-xs text-textSecondary hidden sm:inline">Official Streaming Platforms Only</span>
      </div>

      <div className="p-6 rounded-xl bg-card border border-border">
        <p className="text-sm text-text-textSecondary mb-6 text-center">
          Browse content available on these official streaming platforms:
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
          {OFFICIAL_PLATFORMS.map((name) => (
            <WatchPlatformButton key={name} name={name} />
          ))}
        </div>
      </div>
    </section>
  );
}
