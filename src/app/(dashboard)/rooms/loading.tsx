export default function RoomsBrowseLoading() {
  return (
    <div className="animate-pulse">
      <div className="mb-8">
        <div className="h-7 w-40 bg-slate-700/50 rounded-lg mb-2" />
        <div className="h-4 w-64 bg-slate-700/30 rounded" />
      </div>
      <div className="h-10 w-96 bg-slate-800/50 rounded-lg mb-8 border border-slate-700/30" />
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-6 w-10 bg-slate-700/40 rounded" />
          <div className="h-4 w-20 bg-slate-700/30 rounded" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="bg-slate-800/50 border border-slate-700/30 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-slate-700/40 rounded-lg" />
                <div className="h-5 w-12 bg-slate-700/50 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
