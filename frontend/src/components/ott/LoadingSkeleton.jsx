export default function LoadingSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-fade-in-up" style={{ animationDelay: `${i * 0.03}s` }}>
          <div className="skeleton rounded-2xl aspect-[2/3] mb-2.5" />
          <div className="skeleton h-4 w-3/4 rounded-lg mb-1.5" />
          <div className="skeleton h-3 w-1/2 rounded-lg" />
        </div>
      ))}
    </div>
  );
}
