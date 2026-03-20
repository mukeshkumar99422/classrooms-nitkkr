export default function MyScheduleLoading() {
  return (
    <div className="animate-pulse">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="h-7 w-40 bg-slate-700/50 rounded-lg mb-2" />
          <div className="h-4 w-72 bg-slate-700/30 rounded" />
        </div>
        <div className="h-10 w-36 bg-slate-700/40 rounded-lg" />
      </div>
      <div className="space-y-8">
        {Array.from({ length: 2 }).map((_, r) => (
          <div key={r}>
            <div className="flex items-center gap-3 mb-3">
              <div className="h-7 w-7 bg-slate-700/40 rounded-lg" />
              <div className="h-5 w-28 bg-slate-700/50 rounded" />
              <div className="h-4 w-16 bg-slate-700/30 rounded" />
            </div>
            <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-1">
              <div className="grid grid-cols-9 gap-0">
                <div className="p-2.5 bg-slate-700/30">
                  <div className="h-4 w-8 bg-slate-600/40 rounded" />
                </div>
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="p-2.5 bg-slate-700/30">
                    <div className="h-4 w-6 bg-slate-600/40 rounded mx-auto" />
                  </div>
                ))}
                {Array.from({ length: 6 }).map((_, row) => (
                  <>
                    <div key={`d-${row}`} className="p-2.5">
                      <div className="h-4 w-8 bg-slate-700/40 rounded" />
                    </div>
                    {Array.from({ length: 8 }).map((_, col) => (
                      <div key={`${row}-${col}`} className="p-2.5">
                        <div className={`h-4 w-12 mx-auto rounded ${Math.random() > 0.6 ? 'bg-amber-500/10' : 'bg-transparent'}`} />
                      </div>
                    ))}
                  </>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
