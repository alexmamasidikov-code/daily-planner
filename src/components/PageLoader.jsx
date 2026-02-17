export function PageLoader() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 w-48 rounded-lg bg-[#252525]" />
      <div className="glass-card p-5 space-y-3">
        <div className="h-4 w-1/3 rounded-lg bg-[#252525]" />
        <div className="h-3 w-full rounded-lg bg-[#252525]" />
        <div className="h-3 w-2/3 rounded-lg bg-[#252525]" />
      </div>
      <div className="glass-card p-5 space-y-3">
        <div className="h-4 w-1/4 rounded-lg bg-[#252525]" />
        <div className="h-3 w-full rounded-lg bg-[#252525]" />
        <div className="h-3 w-full rounded-lg bg-[#252525]" />
        <div className="h-3 w-1/2 rounded-lg bg-[#252525]" />
      </div>
    </div>
  )
}
