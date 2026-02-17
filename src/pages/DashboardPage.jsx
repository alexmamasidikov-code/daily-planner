'use client';
import { useState, useEffect, memo, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar, Sparkles, Target, Flame, Check, Circle,
  Brain, Zap, BarChart3, Sun, Award, Clock, ChevronRight, Shield,
  Utensils, Dumbbell
} from 'lucide-react'
import { Glass, CircularProgress, MiniBarChart } from '../components'
import { fadeUp, CATEGORIES, today, formatDisplay, dayName, QUOTES } from '../constants'
import { plansApi, goalsApi, statsApi, ritualsApi, deepworkApi, nutritionApi, tmApi } from '../api'
function DashboardPage({ onNav }) {
  const navigate = onNav || (() => {})
  const [data, setData] = useState({ stats: null, rituals: null, tm: null, dw: null, nutrition: null, plan: null, goals: null })
  const [mounted, setMounted] = useState(false)
  const [quoteIdx, setQuoteIdx] = useState(0)

  useEffect(() => {
    setMounted(true)
    setQuoteIdx(Math.floor(Math.random() * 12))
  }, [])

  useEffect(() => {
    let cancelled = false
    const todayStr = today()
    Promise.all([
      statsApi.get().catch(() => null),
      ritualsApi.todayProgress().catch(() => ({ total: 0, completed: 0 })),
      tmApi.get().catch(() => ({ current_level: 0, level_name: 'Sleep', xp_current: 0, level_progress: 0, xp_needed: 100 })),
      deepworkApi.stats().catch(() => ({ today_minutes: 0, week_minutes: 0, avg_focus_score: 0 })),
      nutritionApi.dailySummary().catch(() => ({ total_calories: 0, total_protein: 0, targets: { calories: 2000, protein: 170 } })),
      plansApi.get(todayStr)
        .catch(() => null)
        .then(async (plan) => {
          if (plan) return plan
          const list = await plansApi.list().catch(() => [])
          return list?.length ? list[0] : null
        }),
      goalsApi.list().catch(() => []),
    ]).then(([stats, rituals, tm, dw, nutrition, plan, goals]) => {
      if (!cancelled) setData({ stats, rituals, tm, dw, nutrition, plan, goals })
    })
    return () => { cancelled = true }
  }, [])

  const { stats, rituals, tm, dw, nutrition, plan, goals } = data

  // Scores
  const ritualPct = rituals?.total > 0 ? Math.round(rituals.completed / rituals.total * 100) : 0
  const dwHours = Math.round((dw?.today_minutes || 0) / 60 * 10) / 10
  const dwTarget = 4.5
  const dwPct = Math.min(Math.round(dwHours / dwTarget * 100), 100)
  const calPct = Math.min(Math.round((nutrition?.total_calories || 0) / (nutrition?.targets?.calories || 2000) * 100), 100)
  const protPct = Math.min(Math.round((nutrition?.total_protein || 0) / (nutrition?.targets?.protein || 170) * 100), 100)
  const overallScore = Math.round(ritualPct * 0.3 + dwPct * 0.35 + calPct * 0.2 + (stats?.completion_rate || 0) * 0.15)

  // Weekly data for bar chart — use stats.weekly_scores if available, otherwise stable placeholders
  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
  const todayIdx = mounted ? (new Date().getDay() + 6) % 7 : 0
  const weekData = useMemo(() => {
    const scores = stats?.weekly_scores || stats?.weekly_rates
    return weekDays.map((d, i) => ({
      label: d,
      value: scores && scores[i] !== undefined ? scores[i] : (i === todayIdx ? overallScore : 0),
      active: i === todayIdx,
    }))
  }, [stats?.weekly_scores, stats?.weekly_rates, todayIdx, overallScore])

  // Big Three goals — top 3 priority tasks from plan
  const planTasks = plan?.tasks || []
  const bigThree = planTasks.filter(t => t.priority >= 1).sort((a, b) => (b.priority || 0) - (a.priority || 0)).slice(0, 3)

  // Upcoming next 3 items with time (client-only to avoid hydration)
  const now = new Date()
  const currentMinutes = mounted ? now.getHours() * 60 + now.getMinutes() : 0
  const upcoming = mounted ? planTasks
    .filter(t => {
      if (!t.time_slot || t.is_completed) return false
      const [h, m] = t.time_slot.split(/[-:]/).map(Number)
      return h * 60 + (m || 0) >= currentMinutes
    })
    .sort((a, b) => a.time_slot.localeCompare(b.time_slot))
    .slice(0, 3) : []

  // Tasks done today count
  const tasksDoneToday = planTasks.filter(t => t.is_completed).length

  // Energy level from dw focus score
  const energyLevel = dw?.avg_focus_score ? Math.min(Math.round(dw.avg_focus_score / 20), 5) : 3

  // Motivational quotes (client-only to avoid hydration)
  const todayQuote = QUOTES[quoteIdx]

  // Greeting and date — compute only on client to avoid hydration mismatch
  const hour = mounted ? now.getHours() : 12
  const greeting = hour < 12 ? 'Доброе утро' : hour < 18 ? 'Добрый день' : 'Добрый вечер'
  const displayDate = mounted ? formatDisplay(new Date()) : ''
  const displayDay = mounted ? dayName(new Date()) : ''

  return (
    <motion.div {...fadeUp} className="space-y-6">
      {/* ── Hero Header ─── */}
      <div className="relative overflow-hidden rounded-[20px] p-6 md:p-7 glass-card" style={{
        background: 'linear-gradient(135deg, #1B1B1B 0%, #252525 100%)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
      }}>
        <div className="relative flex items-center justify-between">
          <div>
            <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
              className="text-[11px] text-[#9CA3AF] uppercase tracking-[0.2em] font-medium mb-2">Панель управления</motion.p>
            <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              className="text-2xl font-bold text-white flex items-center gap-2" suppressHydrationWarning>
              {greeting}, <span className="text-gradient">Александр</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
              className="text-sm text-[#9CA3AF] mt-2" suppressHydrationWarning>{displayDate}{displayDay && ` · ${displayDay}`}</motion.p>
          </div>
          <div className="flex items-center gap-2">
            {stats?.current_streak > 0 && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.3 }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-2xl text-sm font-bold"
                style={{ background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.2)', color: '#FBBF24' }}>
                <Flame size={18} /> {stats.current_streak}
                <span className="text-[11px] font-medium opacity-70 ml-0.5">дн</span>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* ── Main Score Ring + Progress Bars ─────────────────────────── */}
      <Glass className="p-6 md:p-7">
        <div className="flex flex-col sm:flex-row items-center gap-6 md:gap-7">
          <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', delay: 0.2 }}
            className="flex-shrink-0">
            <CircularProgress value={overallScore} size={110} strokeWidth={10}
              color={overallScore >= 80 ? '#22c55e' : overallScore >= 50 ? '#f59e0b' : '#7B61FF'}>
              <div className="text-center">
                <div className="text-4xl font-extrabold tracking-tight text-white">{overallScore}</div>
                <div className="text-[11px] text-[#9CA3AF] uppercase tracking-[0.15em] font-semibold mt-0.5">Оценка дня</div>
              </div>
            </CircularProgress>
          </motion.div>
          <div className="flex-1 w-full min-w-0 space-y-4">
            {[
              { label: 'Ритуалы', value: ritualPct, color: '#f59e0b', detail: `${rituals?.completed || 0}/${rituals?.total || 0}`, icon: Sun },
              { label: 'Глубокая работа', value: dwPct, color: '#8b5cf6', detail: `${dwHours}/${dwTarget}ч`, icon: Brain },
              { label: 'Питание', value: calPct, color: '#22c55e', detail: `${nutrition?.total_calories || 0} ккал`, icon: Utensils },
              { label: 'Белок', value: protPct, color: '#06b6d4', detail: `${nutrition?.total_protein || 0}/${nutrition?.targets?.protein || 170}г`, icon: Shield },
            ].map((item, i) => (
              <div key={i}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-[#9CA3AF] flex items-center gap-1.5">
                    <item.icon size={12} style={{ color: item.color }} strokeWidth={2} className="flex-shrink-0" />{item.label}
                  </span>
                  <span className="text-xs font-medium" style={{ color: item.color }}>{item.value}% · {item.detail}</span>
                </div>
                <div className="w-full h-[6px] rounded-full bg-[#7B61FF]/10 overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${item.value}%` }} transition={{ duration: 0.8, delay: 0.3 + i * 0.1 }}
                    className="h-full rounded-full" style={{ background: `linear-gradient(90deg, ${item.color}, ${item.color}cc)`, boxShadow: `0 0 10px ${item.color}30` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Glass>

      {/* ── Quick Stats Row ───────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Flame, label: 'Серия', value: `${stats?.current_streak || 0}`, sub: 'дней', gradient: 'linear-gradient(135deg, #2D1F0E, #1F1508)', color: '#ea580c' },
          { icon: Check, label: 'Задачи', value: `${tasksDoneToday}`, sub: `из ${planTasks.length}`, gradient: 'linear-gradient(135deg, #0E2D1F, #081F15)', color: '#16a34a' },
          { icon: Sun, label: 'Ритуалы', value: `${rituals?.completed || 0}`, sub: `из ${rituals?.total || 0}`, gradient: 'linear-gradient(135deg, #2D2A0E, #1F1B08)', color: '#d97706' },
          { icon: Zap, label: 'Энергия', value: `${energyLevel}`, sub: 'из 5', gradient: 'linear-gradient(135deg, #1F0E2D, #150820)', color: '#7c3aed' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.08 }}
            whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}
            className="glass-card p-5 text-center cursor-default rounded-[20px] min-h-[96px] flex flex-col items-center justify-center" style={{ background: s.gradient }}>
            <div className="flex justify-center mb-1"><s.icon size={20} style={{ color: s.color }} strokeWidth={2} /></div>
            <div className="text-xl font-bold text-white">{s.value}</div>
            <div className="text-[11px] text-[#9CA3AF] font-medium uppercase tracking-wider">{s.sub}</div>
          </motion.div>
        ))}
      </div>

      {/* ── Big Three Goals ─ */}
      <Glass className="p-6 md:p-7">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-[0.15em] flex items-center gap-1.5">
            <Target size={14} className="text-[#7B61FF]" /> Три главные цели
          </h3>
          <button onClick={() => navigate('plan')} className="text-[11px] text-[#7B61FF] hover:text-[#9B85FF] transition-colors">
            План дня →
          </button>
        </div>
        <div className="space-y-3">
          {bigThree.length > 0 ? bigThree.map((task, i) => {
            const isDone = task.is_completed
            const priorityColors = ['', '#ef4444', '#f97316', '#22c55e']
            const pColor = priorityColors[Math.min(task.priority || 0, 3)] || '#7B61FF'
            const catInfo = CATEGORIES[task.category] || { icon: Circle, color: '#7B61FF' }
            return (
              <motion.div key={task.id || i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 * i }}
                className={`flex items-center gap-3 p-4 rounded-2xl transition-all min-h-[60px] ${isDone ? 'bg-green-500/10' : 'bg-[#252525]'}`}
                style={{ borderLeft: `3px solid ${isDone ? '#22c55e' : pColor}` }}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isDone ? 'bg-green-500/20' : 'bg-[#7B61FF]/10'}`}>
                  {isDone ? <Check size={16} className="text-[#34D399]" strokeWidth={2.5} /> : <span className="text-sm font-bold" style={{ color: pColor }}>{i + 1}</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate text-white ${isDone ? 'line-through text-[#9CA3AF]' : ''}`}>{task.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {task.time_slot && <span className="text-xs text-[#9CA3AF] flex items-center gap-1"><Clock size={12} strokeWidth={2} />{task.time_slot}</span>}
                    {task.category && <span className="text-xs px-1.5 py-0.5 rounded-md" style={{ background: `${catInfo.color}20`, color: catInfo.color }}>{catInfo.label || task.category}</span>}
                  </div>
                </div>
              </motion.div>
            )
          }          ) : (
            <div className="text-center py-8 text-[#9CA3AF] text-sm">
              <div className="flex justify-center mb-2"><Target size={28} className="text-[#6B7280]" strokeWidth={1.8} /></div>
              <p>Сгенерируйте план дня</p>
              <button onClick={() => navigate('plan')} className="text-[#7B61FF] text-xs mt-1">Перейти →</button>
            </div>
          )}
        </div>
      </Glass>

      {/* ── Upcoming Schedule ── */}
      {upcoming.length > 0 && (
        <Glass className="p-6">
          <h3 className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-[0.15em] mb-4 flex items-center gap-1.5">
            <Clock size={14} className="text-[#06b6d4]" /> Ближайшие задачи
          </h3>
          <div className="space-y-3">
            {upcoming.map((task, i) => {
              const catInfo = CATEGORIES[task.category] || { icon: Circle, color: '#7B61FF' }
              const CatIcon = catInfo.icon
              return (
                <motion.div key={task.id || i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i }}
                  className="flex items-center gap-3 p-4 rounded-2xl bg-[#252525] hover:bg-[#2A2A2A] transition-colors min-h-[56px]">
                  <div className="w-12 text-center shrink-0">
                    <div className="text-sm font-bold text-white">{task.time_slot?.split('-')[0]}</div>
                    {task.duration_min > 0 && <div className="text-[11px] text-[#9CA3AF]">{task.duration_min}м</div>}
                  </div>
                  <div className="w-px h-8 bg-[#252525] shrink-0" />
                  <CatIcon size={14} style={{ color: catInfo.color }} className="shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate text-white">{task.title}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </Glass>
      )}

      {/* ── Weekly Progress Chart ─────────── */}
      <Glass className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-[0.15em] flex items-center gap-1.5">
            <BarChart3 size={14} className="text-[#7B61FF]" /> Прогресс недели
          </h3>
          <span className="text-xs text-[#9CA3AF] font-medium">Оценка по дням</span>
        </div>
        <MiniBarChart data={weekData} height={64} color="#7B61FF" />
      </Glass>

      {/* ── Quick Nav Cards ────────── */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { id: 'plan', label: 'План дня', desc: 'Расписание и задачи', icon: Calendar, gradient: 'linear-gradient(135deg, #0E1A2D, #081525)', color: '#1d4ed8' },
          { id: 'rituals', label: 'Ритуалы', desc: 'Утро и вечер', icon: Sun, gradient: 'linear-gradient(135deg, #2D2A0E, #251B08)', color: '#d97706' },
          { id: 'deepwork', label: 'Глубокая работа', desc: `${dwHours}/${dwTarget}ч сегодня`, icon: Brain, gradient: 'linear-gradient(135deg, #1F0E2D, #150820)', color: '#7c3aed' },
          { id: 'workout', label: 'Тренировка', desc: 'Программа и прогресс', icon: Dumbbell, gradient: 'linear-gradient(135deg, #2D1F0E, #251508)', color: '#ea580c' },
        ].map((card, i) => (
          <motion.button key={card.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.07 }}
            whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.97 }}
            onClick={() => navigate(card.id)}
            className="glass-card p-5 text-left group rounded-[20px] min-h-[112px] active:scale-[0.98]"
            style={{ background: card.gradient }}>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/10 shrink-0">
                <card.icon size={20} style={{ color: card.color }} strokeWidth={2} />
              </div>
              <ChevronRight size={16} className="text-[#9CA3AF] ml-auto group-hover:text-white transition-colors shrink-0" strokeWidth={2} />
            </div>
            <div className="text-[15px] font-semibold text-white">{card.label}</div>
            <div className="text-xs text-[#9CA3AF] mt-1 leading-snug">{card.desc}</div>
          </motion.button>
        ))}
      </div>

      {/* ── TM Progress Mini-Card ─── */}
      <Glass className="p-6 md:p-7 cursor-pointer min-h-[72px] active:scale-[0.99]" onClick={() => navigate('tm')}
        whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg, #1F0E2D, #150820)' }}>
            <Award size={26} className="text-[#7B61FF]" strokeWidth={1.8} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-[#9CA3AF] uppercase tracking-[0.15em] font-semibold">Прогресс TM</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#7B61FF]/10 text-[#7B61FF] font-bold">Ур. {tm?.current_level || 0}</span>
            </div>
            <div className="text-sm font-semibold text-white mb-1.5">{tm?.level_name === 'Sleep' ? 'Сон' : (tm?.level_name || 'Сон')}</div>
            <div className="w-full h-[5px] rounded-full bg-[#7B61FF]/10 overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${tm?.level_progress || 0}%` }} transition={{ duration: 1, delay: 0.5 }}
                className="h-full rounded-full" style={{ background: 'linear-gradient(90deg, #7B61FF, #A855F7)' }} />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[11px] text-[#9CA3AF]">{tm?.xp_current || 0} XP</span>
              <span className="text-[11px] text-[#9CA3AF]">{tm?.xp_needed || 100} XP</span>
            </div>
          </div>
          <ChevronRight size={18} className="text-[#9CA3AF] shrink-0" strokeWidth={2} />
        </div>
      </Glass>

      {/* ── Motivational Quote ── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
        className="relative overflow-hidden rounded-[20px] p-6 glass-card"
        style={{ background: 'linear-gradient(135deg, #1B1B1B, #252525)' }}>
        <div className="relative">
          <div className="mb-3"><Sparkles size={16} className="text-[#7B61FF]" strokeWidth={2} /></div>
          <p className="text-sm text-white leading-relaxed italic">{"«"}{todayQuote.text}{"»"}</p>
          <p className="text-xs text-[#9CA3AF] mt-3 font-medium">{"—"} {todayQuote.author}</p>
        </div>
      </motion.div>

      {/* ── Reflection Link ─────────── */}
      <motion.button onClick={() => navigate('stats')} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
        whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
        className="w-full glass-card p-6 flex items-center gap-4 text-left group min-h-[72px] active:scale-[0.99]">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 bg-[#7B61FF]/10">
          <Sparkles size={24} className="text-[#7B61FF]" strokeWidth={2} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[15px] font-semibold text-white">Рефлексия дня</div>
          <div className="text-xs text-[#9CA3AF] mt-1 leading-snug">Оцените день, запишите победы и получите AI-анализ</div>
        </div>
        <ChevronRight size={20} className="text-[#9CA3AF] group-hover:text-[#7B61FF] transition-colors shrink-0" strokeWidth={2} />
      </motion.button>
    </motion.div>
  )
}

export default memo(DashboardPage)
