export default function DashboardLoading() {
  return (
    <div className="animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="h-7 w-48 bg-slate-700/50 rounded-lg mb-2" />
          <div className="h-4 w-72 bg-slate-700/30 rounded" />
        </div>
        <div className="h-10 w-36 bg-slate-700/40 rounded-lg" />
      </div>

      {/* Search skeleton */}
      <div className="h-10 w-80 bg-slate-800/50 rounded-lg mb-6 border border-slate-700/30" />

      {/* Content grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="bg-slate-800/50 border border-slate-700/30 rounded-xl p-5 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 bg-slate-700/40 rounded-lg" />
              <div className="flex gap-1">
                <div className="h-8 w-8 bg-slate-700/30 rounded" />
                <div className="h-8 w-8 bg-slate-700/30 rounded" />
              </div>
            </div>
            <div className="h-5 w-20 bg-slate-700/50 rounded" />
            <div className="h-4 w-32 bg-slate-700/30 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}
