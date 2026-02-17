import { useState, useEffect, useCallback, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart3, Check, TrendingUp, Star, SmilePlus, MessageSquare,
  Mic, Trophy, Lightbulb, Sparkles, Loader2, Target, Heart,
  Sun, Brain, Calendar, Activity, Download, Share2
} from 'lucide-react'
import { Glass, CircularProgress } from '../components'
import { fadeUp, today } from '../constants'
import { statsApi, deepworkApi, reflectionsApi } from '../api'

function StatsPage() {
  const [stats, setStats] = useState(null)
  const [dwStats, setDwStats] = useState(null)
  const [dayRating, setDayRating] = useState(0)
  const [reflectionText, setReflectionText] = useState('')
  const [selectedMood, setSelectedMood] = useState(null)
  const [wins, setWins] = useState(['', '', ''])
  const [lesson, setLesson] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiInsight, setAiInsight] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    statsApi.get().then(setStats).catch(() => {})
    deepworkApi.stats().then(setDwStats).catch(() => {})
    reflectionsApi.get(today()).then(data => {
      if (data) {
        setDayRating(data.rating || 0)
        setReflectionText(data.reflection || '')
        setSelectedMood(data.mood || null)
        setWins(data.wins_list || ['', '', ''])
        setLesson(data.lesson || '')
      }
    }).catch(() => {})
  }, [])

  // Auto-save reflection data
  const saveReflection = useCallback(async (overrides = {}) => {
    setSaving(true)
    setSaved(false)
    try {
      await reflectionsApi.save({
        date: today(),
        rating: overrides.rating ?? dayRating,
        reflection: overrides.reflection ?? reflectionText,
        mood: overrides.mood ?? selectedMood,
        wins_list: overrides.wins_list ?? wins,
        lesson: overrides.lesson ?? lesson,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {}
    setSaving(false)
  }, [dayRating, reflectionText, selectedMood, wins, lesson])

  // Rating emojis
  const ratingEmojis = [
    { emoji: '😔', label: 'Плохо' },
    { emoji: '😐', label: 'Так себе' },
    { emoji: '🙂', label: 'Нормально' },
    { emoji: '😊', label: 'Хорошо' },
    { emoji: '🤩', label: 'Отлично' },
  ]

  // Mood options
  const moods = [
    { id: 'energetic', label: 'Энергичный', emoji: '⚡', color: '#f59e0b' },
    { id: 'calm', label: 'Спокойный', emoji: '🧘', color: '#22c55e' },
    { id: 'productive', label: 'Продуктивный', emoji: '🚀', color: '#6366f1' },
    { id: 'tired', label: 'Усталый', emoji: '😴', color: '#94a3b8' },
    { id: 'stressed', label: 'Стресс', emoji: '😤', color: '#ef4444' },
    { id: 'inspired', label: 'Вдохновлён', emoji: '✨', color: '#ec4899' },
  ]

  // Mock weekly data for charts
  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
  const weeklyRates = stats?.weekly_rates || [72, 85, 65, 90, 78, 45, 0]
  const moodDist = stats?.mood_distribution || [
    { mood: 'Энергичный', count: 3, color: '#f59e0b' },
    { mood: 'Продуктивный', count: 4, color: '#6366f1' },
    { mood: 'Спокойный', count: 2, color: '#22c55e' },
    { mood: 'Усталый', count: 1, color: '#94a3b8' },
    { mood: 'Стресс', count: 1, color: '#ef4444' },
    { mood: 'Вдохновлён', count: 2, color: '#ec4899' },
  ]
  const moodTotal = moodDist.reduce((s, m) => s + m.count, 0) || 1

  // Monthly heatmap: generate 35 cells (5 weeks)
  const heatmapData = (() => {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth()
    const firstDay = new Date(year, month, 1)
    const startOffset = (firstDay.getDay() + 6) % 7 // Monday-based
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const cells = []
    for (let i = 0; i < 42; i++) {
      const dayNum = i - startOffset + 1
      if (dayNum >= 1 && dayNum <= daysInMonth) {
        // Mock completion data (or use real stats)
        const hist = stats?.daily_completions || {}
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`
        const pct = hist[dateStr] ?? (dayNum <= now.getDate() ? Math.floor(Math.random() * 100) : -1)
        cells.push({ day: dayNum, pct, today: dayNum === now.getDate() })
      } else {
        cells.push({ day: 0, pct: -1, today: false })
      }
    }
    return cells
  })()

  const heatColor = (pct) => {
    if (pct < 0) return 'transparent'
    if (pct === 0) return '#252525'
    if (pct < 30) return '#065F46'
    if (pct < 60) return '#059669'
    if (pct < 80) return '#10B981'
    return '#34D399'
  }

  const streak = stats?.current_streak || 0

  // AI analysis mock
  const runAiAnalysis = async () => {
    setAiLoading(true)
    setAiInsight(null)
    await new Promise(r => setTimeout(r, 2500))
    setAiInsight(
      '📊 Анализ недели:\n\n' +
      '✅ Продуктивность выше среднего на 12% — отличная динамика!\n' +
      '🎯 Лучший день: Четверг (90% выполнения). Паттерн: утренний deep work + чёткий план.\n' +
      '⚠️ Зона роста: Суббота — низкая активность. Рекомендация: 2-3 лёгких задачи для поддержания стрика.\n' +
      '💡 Совет: Ваше настроение коррелирует с % выполнения задач. Начинайте день с 1 быстрой победы.'
    )
    setAiLoading(false)
  }

  if (!stats) return (
    <motion.div {...fadeUp} className="flex items-center justify-center min-h-[60vh]">
      <Glass className="p-8 text-center">
        <Loader2 size={32} className="animate-spin text-[#7B61FF] mx-auto mb-3" />
        <p className="text-[#9CA3AF] text-sm">Загрузка статистики...</p>
      </Glass>
    </motion.div>
  )

  return (
    <motion.div {...fadeUp} className="space-y-6 pb-10">
      <h1 className="text-2xl font-bold text-white flex items-center gap-2">
        <BarChart3 size={22} className="text-[#7B61FF] shrink-0" strokeWidth={2} /> Статистика и рефлексия
      </h1>

      {/* ── Streak + KPI Row (Cloudy: white cards) ───────────────── */}
      <div className="grid grid-cols-3 gap-4">
        <Glass className="p-5 col-span-1 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-orange-500 to-red-500" />
          <div className="text-center">
            <motion.div
              animate={{ y: [0, -3, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
              className="text-3xl mb-1"
            >🔥</motion.div>
            <div className="text-2xl font-bold text-white">{streak}</div>
            <div className="text-[11px] text-[#9CA3AF] mt-0.5">дней подряд</div>
          </div>
        </Glass>
        <Glass className="p-5 col-span-1 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-green-500 to-emerald-500" />
          <div className="text-center">
            <Check size={22} className="text-[#34D399] mx-auto mb-1 shrink-0" strokeWidth={1.8} />
            <div className="text-2xl font-bold text-white">{stats.completed_tasks}</div>
            <div className="text-[11px] text-[#9CA3AF] mt-0.5">задач</div>
          </div>
        </Glass>
        <Glass className="p-5 col-span-1 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-[#7B61FF] to-[#A855F7]" />
          <div className="text-center">
            <TrendingUp size={22} className="text-[#7B61FF] mx-auto mb-1 shrink-0" strokeWidth={1.8} />
            <div className="text-2xl font-bold text-white">{stats.completion_rate}%</div>
            <div className="text-[11px] text-[#9CA3AF] mt-0.5">выполнено</div>
          </div>
        </Glass>
      </div>

      {/* ── Day Rating ────────────────────────────────────────── */}
      <Glass className="p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[13px] font-semibold flex items-center gap-1.5">
            <Star size={14} className="text-yellow-400 shrink-0" strokeWidth={1.8} /> Оценка дня
          </span>
          <AnimatePresence>
            {saved && (
              <motion.span initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                className="text-[11px] text-[#34D399] flex items-center gap-1">
                <Check size={12} strokeWidth={2} /> Сохранено
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        <div className="flex items-center justify-center gap-3">
          {ratingEmojis.map((r, i) => {
            const active = dayRating === i + 1
            return (
              <motion.button key={i} whileTap={{ scale: 0.85 }}
                onClick={() => { setDayRating(i + 1); saveReflection({ rating: i + 1 }) }}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                  active ? 'bg-amber-500/10 ring-1 ring-amber-400 scale-110' : 'hover:bg-[#252525]'
                }`}>
                <span className={`text-2xl transition-all ${active ? 'scale-125' : 'grayscale opacity-50'}`}>{r.emoji}</span>
                <span className={`text-xs ${active ? 'text-[#FBBF24]' : 'text-[#9CA3AF]'}`}>{r.label}</span>
              </motion.button>
            )
          })}
        </div>
      </Glass>

      {/* ── Mood Selector ─────────────────────────────────────── */}
      <Glass className="p-6">
        <span className="text-[13px] font-semibold flex items-center gap-1.5 mb-3">
          <SmilePlus size={14} className="text-pink-400 shrink-0" strokeWidth={1.8} /> Настроение
        </span>
        <div className="grid grid-cols-3 gap-2">
          {moods.map(m => {
            const active = selectedMood === m.id
            return (
              <motion.button key={m.id} whileTap={{ scale: 0.93 }}
                onClick={() => { setSelectedMood(m.id); saveReflection({ mood: m.id }) }}
                className={`flex items-center gap-2 p-3 rounded-xl text-left transition-all ${
                  active ? 'ring-2 ring-offset-2' : 'bg-[#252525] hover:bg-[#2A2A2A]'
                }`}
                style={active ? { borderColor: m.color, ringColor: m.color } : {}}>
                <span className="text-lg">{m.emoji}</span>
                <span className={`text-[12px] font-medium ${active ? 'text-white' : 'text-[#9CA3AF]'}`}>{m.label}</span>
              </motion.button>
            )
          })}
        </div>
      </Glass>

      {/* ── Reflection Input (Voice-to-Text placeholder) ──────── */}
      <Glass className="p-6">
        <span className="text-[13px] font-semibold flex items-center gap-1.5 mb-3">
          <MessageSquare size={14} className="text-blue-400 shrink-0" strokeWidth={1.8} /> Рефлексия дня
        </span>
        <div className="relative">
          <textarea
            value={reflectionText}
            onChange={e => setReflectionText(e.target.value)}
            onBlur={() => saveReflection()}
            placeholder="Как прошёл день? Что получилось? Что можно улучшить?"
            className="w-full glass-input rounded-xl p-4 pr-12 text-[13px] text-white placeholder-[#9CA3AF] resize-none focus:outline-none focus:ring-2 focus:ring-[#7B61FF]/30 transition-all"
            rows={3}
          />
          <button className="absolute right-3 top-3 p-2 rounded-lg bg-[#7B61FF]/10 hover:bg-[#7B61FF]/20 transition-colors group"
            title="Голосовой ввод (скоро)">
            <Mic size={16} className="text-[#9CA3AF] group-hover:text-[#7B61FF] transition-colors shrink-0" strokeWidth={1.8} />
          </button>
        </div>
      </Glass>

      {/* ── Wins of the Day ───────────────────────────────────── */}
      <Glass className="p-6">
        <span className="text-[13px] font-semibold flex items-center gap-1.5 mb-3">
          <Trophy size={14} className="text-yellow-400 shrink-0" strokeWidth={1.8} /> Победы дня
        </span>
        <div className="space-y-2">
          {wins.map((w, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-lg">🏆</span>
              <input
                value={w}
                onChange={e => {
                  const next = [...wins]
                  next[i] = e.target.value
                  setWins(next)
                }}
                onBlur={() => saveReflection()}
                placeholder={`Победа #${i + 1}`}
                className="flex-1 glass-input rounded-lg px-3 py-2.5 text-[13px] text-white placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-amber-400/30 transition-all"
              />
            </div>
          ))}
        </div>
      </Glass>

      {/* ── Lesson Learned ────────────────────────────────────── */}
      <Glass className="p-6">
        <span className="text-[13px] font-semibold flex items-center gap-1.5 mb-3">
          <Lightbulb size={14} className="text-amber-400 shrink-0" strokeWidth={1.8} /> Главный урок
        </span>
        <input
          value={lesson}
          onChange={e => setLesson(e.target.value)}
          onBlur={() => saveReflection()}
          placeholder="Чему я научился сегодня?"
          className="w-full glass-input rounded-xl px-4 py-3 text-[13px] text-white placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-amber-400/30 transition-all"
        />
      </Glass>

      {/* ── Weekly Completion Rate Chart ──────────────────────── */}
      <Glass className="p-6">
        <span className="text-[13px] font-semibold flex items-center gap-1.5 mb-4">
          <TrendingUp size={14} className="text-indigo-400 shrink-0" strokeWidth={1.8} /> Выполнение за неделю
        </span>
        <div className="flex items-end gap-2 h-32">
          {weeklyRates.map((rate, i) => {
            const isToday = i === new Date().getDay() - 1 || (new Date().getDay() === 0 && i === 6)
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-gray-500 font-medium">{rate > 0 ? `${rate}%` : ''}</span>
                <motion.div
                  className="w-full rounded-lg relative overflow-hidden"
                  style={{
                    background: isToday ? 'linear-gradient(to top, #7B61FF, #A855F7)' : 'rgba(123,97,255,0.3)',
                    minHeight: 4,
                  }}
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(rate, 4)}%` }}
                  transition={{ duration: 0.6, delay: i * 0.08, ease: 'easeOut' }}
                />
                <span className={`text-xs font-medium ${isToday ? 'text-[#7B61FF]' : 'text-[#9CA3AF]'}`}>{weekDays[i]}</span>
              </div>
            )
          })}
        </div>
      </Glass>

      {/* ── Mood Distribution Donut ───────────────────────────── */}
      <Glass className="p-6">
        <span className="text-[13px] font-semibold flex items-center gap-1.5 mb-4">
          <Activity size={14} className="text-pink-400 shrink-0" strokeWidth={1.8} /> Распределение настроения
        </span>
        <div className="flex items-center gap-6">
          {/* SVG Donut */}
          <div className="relative flex-shrink-0">
            <svg width={100} height={100} viewBox="0 0 100 100">
              {(() => {
                let offset = 0
                const r = 38
                const circ = 2 * Math.PI * r
                return moodDist.filter(m => m.count > 0).map((m, i) => {
                  const pct = m.count / moodTotal
                  const dash = circ * pct
                  const gap = circ - dash
                  const el = (
                    <circle key={i} cx={50} cy={50} r={r} fill="none"
                      stroke={m.color} strokeWidth={12} strokeLinecap="round"
                      strokeDasharray={`${dash - 2} ${gap + 2}`}
                      strokeDashoffset={-offset}
                      transform="rotate(-90 50 50)"
                      style={{ transition: 'stroke-dasharray 0.8s ease' }} />
                  )
                  offset += dash
                  return el
                })
              })()}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[11px] text-[#9CA3AF] font-medium">{moodTotal} дней</span>
            </div>
          </div>
          {/* Legend */}
          <div className="flex-1 space-y-1.5">
            {moodDist.filter(m => m.count > 0).map((m, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: m.color }} />
                <span className="text-[11px] text-[#9CA3AF] flex-1">{m.mood}</span>
                <span className="text-[11px] font-semibold text-white">{m.count}</span>
              </div>
            ))}
          </div>
        </div>
      </Glass>

      {/* ── Monthly Heatmap Calendar ─────────────────────────── */}
      <Glass className="p-6">
        <span className="text-[13px] font-semibold flex items-center gap-1.5 mb-3">
          <Calendar size={14} className="text-green-400 shrink-0" strokeWidth={1.8} /> {new Date().toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
        </span>
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {['Пн','Вт','Ср','Чт','Пт','Сб','Вс'].map(d => (
            <div key={d} className="text-[11px] text-[#9CA3AF] text-center font-medium">{d}</div>
          ))}
        </div>
        {/* Cells */}
        <div className="grid grid-cols-7 gap-1">
          {heatmapData.map((cell, i) => (
            <motion.div key={i}
              className={`aspect-square rounded-md flex items-center justify-center text-xs font-medium transition-colors ${
                cell.today ? 'ring-2 ring-[#7B61FF]' : ''
              }`}
              style={{ background: cell.day ? heatColor(cell.pct) : 'transparent' }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.008, duration: 0.2 }}
              title={cell.day ? `${cell.pct >= 0 ? cell.pct + '%' : '—'}` : ''}>
              <span className={cell.day ? (cell.pct >= 60 ? 'text-white' : 'text-[#9CA3AF]') : 'text-transparent'}>
                {cell.day || ''}
              </span>
            </motion.div>
          ))}
        </div>
        {/* Legend */}
        <div className="flex items-center justify-end gap-1 mt-2">
          <span className="text-[11px] text-[#9CA3AF] mr-1">Меньше</span>
          {[0, 30, 60, 80, 100].map(v => (
            <div key={v} className="w-3 h-3 rounded-sm" style={{ background: heatColor(v) }} />
          ))}
          <span className="text-[11px] text-[#9CA3AF] ml-1">Больше</span>
        </div>
      </Glass>

      {/* ── Additional KPIs ───────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4">
        <Glass className="p-4">
          <div className="flex items-center gap-2 mb-1.5">
            <Target size={16} className="text-pink-500 shrink-0" strokeWidth={1.8} />
            <span className="text-[12px] text-[#9CA3AF]">Цели</span>
          </div>
          <p className="text-xl font-bold text-white">{stats.active_goals}</p>
          <p className="text-xs text-[#9CA3AF] mt-0.5">активных</p>
        </Glass>
        <Glass className="p-4">
          <div className="flex items-center gap-2 mb-1.5">
            <Heart size={16} className="text-red-500 shrink-0" strokeWidth={1.8} />
            <span className="text-[12px] text-[#9CA3AF]">Привычки</span>
          </div>
          <p className="text-xl font-bold text-white">{stats.active_habits}</p>
          <p className="text-xs text-[#9CA3AF] mt-0.5">отслеживается</p>
        </Glass>
        <Glass className="p-4">
          <div className="flex items-center gap-2 mb-1.5">
            <Sun size={16} className="text-amber-500 shrink-0" strokeWidth={1.8} />
            <span className="text-[12px] text-[#9CA3AF]">Настроение</span>
          </div>
          <p className="text-xl font-bold text-white">{stats.avg_mood ? `${stats.avg_mood}/10` : '—'}</p>
          <p className="text-xs text-[#9CA3AF] mt-0.5">среднее</p>
        </Glass>
        <Glass className="p-4">
          <div className="flex items-center gap-2 mb-1.5">
            <Brain size={16} className="text-[#A855F7] shrink-0" strokeWidth={1.8} />
            <span className="text-[12px] text-[#9CA3AF]">Глубокая работа</span>
          </div>
          <p className="text-xl font-bold text-white">{dwStats ? `${Math.round(dwStats.week_minutes / 60 * 10) / 10}ч` : '—'}</p>
          <p className="text-xs text-[#9CA3AF] mt-0.5">за неделю</p>
        </Glass>
      </div>

      {/* ── AI Analysis ───────────────────────────────────────── */}
      <Glass className="p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[13px] font-semibold flex items-center gap-1.5">
            <Sparkles size={14} className="text-indigo-400 shrink-0" strokeWidth={1.8} /> AI Анализ
          </span>
        </div>
        {aiInsight ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-[#252525] rounded-xl p-4 text-[13px] text-white leading-relaxed whitespace-pre-line">
            {aiInsight}
          </motion.div>
        ) : (
          <motion.button onClick={runAiAnalysis} disabled={aiLoading}
            whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }}
            className="w-full glass-btn glass-btn-primary text-sm px-5 py-3 flex items-center justify-center gap-2 disabled:opacity-50 transition-all">
            {aiLoading ? (
              <><Loader2 size={16} className="animate-spin shrink-0" strokeWidth={1.8} /> Анализирую неделю...</>
            ) : (
              <><Sparkles size={16} strokeWidth={1.8} /> Проанализировать неделю</>
            )}
          </motion.button>
        )}
      </Glass>

      {/* ── Export / Share ─────────────────────────────────────── */}
      <div className="flex gap-3">
        <motion.button whileTap={{ scale: 0.97 }}
          className="flex-1 glass-btn text-sm px-4 py-3 flex items-center justify-center gap-2 opacity-50 cursor-not-allowed"
          title="Скоро">
          <Download size={16} strokeWidth={1.8} /> Экспорт
        </motion.button>
        <motion.button whileTap={{ scale: 0.97 }}
          className="flex-1 glass-btn text-sm px-4 py-3 flex items-center justify-center gap-2 opacity-50 cursor-not-allowed"
          title="Скоро">
          <Share2 size={16} strokeWidth={1.8} /> Поделиться
        </motion.button>
      </div>
    </motion.div>
  )
}

export default memo(StatsPage)
