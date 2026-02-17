import { memo } from 'react'

export const Skeleton = memo(function Skeleton({ className = '', ...props }) {
  return (
    <div className={`shimmer rounded-[14px] bg-[#252525] ${className}`} {...props} />
  )
})

export const CardSkeleton = memo(function CardSkeleton({ lines = 3 }) {
  return (
    <div className="glass-card p-5 space-y-3 animate-pulse">
      <Skeleton className="h-4 w-1/3 rounded-lg bg-[#252525]" />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={`h-3 rounded-lg bg-[#252525] ${i === lines - 1 ? 'w-2/3' : 'w-full'}`} />
      ))}
    </div>
  )
})
