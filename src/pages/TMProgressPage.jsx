'use client';
import { useState, useEffect, memo } from 'react'
import { motion } from 'framer-motion'
import { Award } from 'lucide-react'
import { Glass, CircularProgress, CardSkeleton } from '../components'
import { fadeUp } from '../constants'
import { tmApi } from '../api'

function TMProgressPage() {
  const [tm, setTm] = useState(null)

  useEffect(() => { tmApi.get().then(setTm).catch(() => {}) }, [])

  if (!tm) return (
    <motion.div {...fadeUp} className="space-y-4">
      <div className="h-8 w-48 shimmer rounded-lg bg-[#252525]" />
      <CardSkeleton lines={4} />
      <CardSkeleton lines={6} />
    </motion.div>
  )

  const levels = tm.levels || {}
  const levelColors = ['#6b7280', '#818cf8', '#a78bfa', '#c084fc', '#e879f9', '#f472b6', '#fb923c', '#facc15', '#4ade80', '#22d3ee']

  return (
    <motion.div {...fadeUp} className="space-y-6">
      <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2"><Award size={22} className="text-[#7B61FF] shrink-0" strokeWidth={2} /> Прогресс уровня TM</h1>

      {/* Current Level (Cloudy: white card, blue/purple gradient progress) */}
      <Glass className="p-6 md:p-8 text-center">
        <CircularProgress value={tm.level_progress || 0} size={160} strokeWidth={10} color={levelColors[tm.current_level] || '#7B61FF'}>
          <div>
            <div className="text-3xl font-bold text-white">{tm.current_level}</div>
            <div className="text-xs text-[#9CA3AF]">{tm.level_name}</div>
          </div>
        </CircularProgress>
        <div className="mt-4 text-sm text-[#9CA3AF]">XP: {tm.xp_current} / {tm.xp_needed}</div>
        <div className="w-full h-[6px] rounded-full bg-[#7B61FF]/10 mt-2 overflow-hidden max-w-xs mx-auto">
          <motion.div className="h-full rounded-full" initial={{ width: 0 }} animate={{ width: `${tm.level_progress}%` }} transition={{ duration: 0.8 }}
            style={{ background: 'linear-gradient(90deg, #7B61FF, #A855F7)' }} />
        </div>
      </Glass>

      {/* All Levels */}
      <Glass className="p-6">
        <h3 className="text-[15px] font-semibold text-white mb-3">Все уровни</h3>
        <div className="space-y-2">
          {Object.entries(levels).map(([lvl, info]) => {
            const l = parseInt(lvl)
            const active = l === tm.current_level
            const unlocked = l <= tm.current_level
            return (
              <div key={l} className={`flex items-center gap-3 p-4 rounded-xl min-h-[52px] ${active ? 'bg-[#7B61FF]/10 border border-[#7B61FF]/40' : unlocked ? 'bg-[#252525]' : 'opacity-50'}`}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm"
                  style={{ background: `${levelColors[l]}25`, color: levelColors[l] }}>{l}</div>
                <div className="flex-1">
                  <span className="text-sm font-medium text-white">{info.name}</span>
                  {active && <span className="ml-2 text-xs text-[#7B61FF]">← Текущий</span>}
                </div>
                <span className="text-xs text-[#9CA3AF]">{info.xp} XP</span>
              </div>
            )
          })}
        </div>
      </Glass>
    </motion.div>
  )
}

export default memo(TMProgressPage)
