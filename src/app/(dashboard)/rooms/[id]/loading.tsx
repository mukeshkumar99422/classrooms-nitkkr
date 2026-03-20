export default function RoomDetailLoading() {
  return (
    <div className="animate-pulse">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="h-5 w-5 bg-slate-700/40 rounded" />
          <div>
            <div className="h-7 w-40 bg-slate-700/50 rounded-lg mb-1" />
            <div className="h-4 w-28 bg-slate-700/30 rounded" />
          </div>
        </div>
        <div className="h-10 w-36 bg-slate-700/40 rounded-lg" />
      </div>
      <div className="rounded-xl border border-slate-700/50 overflow-hidden bg-slate-800/30">
        <div className="grid grid-cols-9 gap-0">
          {/* Header */}
          <div className="p-3 bg-slate-700/30">
            <div className="h-4 w-12 bg-slate-600/40 rounded" />
          </div>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="p-3 bg-slate-700/30">
              <div className="h-4 w-16 bg-slate-600/40 rounded mx-auto" />
            </div>
          ))}
          {/* Rows */}
          {Array.from({ length: 6 }).map((_, row) => (
            <>
              <div key={`day-${row}`} className="p-3 bg-slate-800/50 border-t border-slate-700/30">
                <div className="h-4 w-16 bg-slate-700/40 rounded" />
              </div>
              {Array.from({ length: 8 }).map((_, col) => (
                <div key={`${row}-${col}`} className="p-3 border-t border-slate-700/20">
                  <div className={`h-4 w-16 mx-auto rounded ${Math.random() > 0.5 ? 'bg-slate-700/30' : 'bg-transparent'}`} />
                </div>
              ))}
            </>
          ))}
        </div>
      </div>
    </div>
  )
}
