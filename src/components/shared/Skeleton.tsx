export function SkeletonCard() {
  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 animate-pulse">
      <div className="h-3 bg-gray-700 rounded w-24 mb-3" />
      <div className="h-6 bg-gray-700 rounded w-16 mb-2" />
      <div className="h-2 bg-gray-700 rounded w-20" />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 animate-pulse">
      <div className="h-4 bg-gray-700 rounded w-32 mb-4" />
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <div className="h-3 bg-gray-700 rounded flex-1" />
            <div className="h-3 bg-gray-700 rounded w-20" />
            <div className="h-3 bg-gray-700 rounded w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonPanel() {
  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 animate-pulse">
      <div className="h-4 bg-gray-700 rounded w-40 mb-4" />
      <div className="space-y-3">
        <div className="h-3 bg-gray-700 rounded w-full" />
        <div className="h-3 bg-gray-700 rounded w-3/4" />
        <div className="h-3 bg-gray-700 rounded w-1/2" />
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
