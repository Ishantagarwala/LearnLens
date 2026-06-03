export default function SkeletonCard({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass-card p-6 animate-pulse">
          <div className="h-4 bg-white/10 rounded w-3/4 mb-4" />
          <div className="h-3 bg-white/5 rounded w-full mb-2" />
          <div className="h-3 bg-white/5 rounded w-5/6 mb-2" />
          <div className="h-3 bg-white/5 rounded w-2/3" />
          <div className="flex gap-2 mt-4">
            <div className="h-6 bg-white/5 rounded-full w-16" />
            <div className="h-6 bg-white/5 rounded-full w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}
