export default function DepartmentsLoading() {
  return (
    <div className="animate-pulse">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="h-7 w-44 bg-slate-700/50 rounded-lg mb-2" />
          <div className="h-4 w-64 bg-slate-700/30 rounded" />
        </div>
        <div className="h-10 w-40 bg-slate-700/40 rounded-lg" />
      </div>
      <div className="h-10 w-80 bg-slate-800/50 rounded-lg mb-6 border border-slate-700/30" />
      <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 overflow-hidden">
        <div className="p-4 bg-slate-700/20 flex gap-4">
          <div className="h-4 w-32 bg-slate-700/40 rounded" />
          <div className="h-4 w-48 bg-slate-700/40 rounded" />
          <div className="h-4 w-20 bg-slate-700/40 rounded ml-auto" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="p-4 border-t border-slate-700/30 flex gap-4 items-center">
            <div className="h-4 w-36 bg-slate-700/30 rounded" />
            <div className="h-4 w-52 bg-slate-700/30 rounded" />
            <div className="flex gap-2 ml-auto">
              <div className="h-8 w-8 bg-slate-700/20 rounded" />
              <div className="h-8 w-8 bg-slate-700/20 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
