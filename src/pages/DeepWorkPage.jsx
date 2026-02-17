'use client';
import { useState, useEffect, useCallback, useRef, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, Target, Check, Play, Square, ChevronDown } from 'lucide-react'
import { Glass, CircularProgress } from '../components'
import { fadeUp, today, DAILY_TASKS } from '../constants'
import { deepworkApi } from '../api'

function DeepWorkPage() {
  const [sessions, setSessions] = useState([])
  const [dwStats, setDwStats] = useState(null)
  const [activeSession, setActiveSession] = useState(null)
  const [timer, setTimer] = useState(0)
  const [expandedTask, setExpandedTask] = useState(null)
  const [showFocusPrompt, setShowFocusPrompt] = useState(false)
  const [completedTasks, setCompletedTasks] = useState(() => {
    try { return JSON.parse(localStorage.getItem(`dw-done-${today()}`) || '[]') } catch { return [] }
  })
  const timerRef = useRef(null)

  const dayOfWeek = new Date().getDay()
  const todayTasks = DAILY_TASKS[dayOfWeek] || DAILY_TASKS[1]

  const load = useCallback(async () => {
    try {
      const [s, st] = await Promise.all([deepworkApi.list(today()), deepworkApi.stats()])
      setSessions(s)
      setDwStats(st)
      const active = s.find(sess => sess.started_at && !sess.ended_at)
      if (active) {
        setActiveSession(active)
        const start = new Date(active.started_at).getTime()
        setTimer(Math.floor((Date.now() - start) / 1000))
      }
    } catch {}
  }, [])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    if (activeSession) {
      timerRef.current = setInterval(() => setTimer(t => t + 1), 1000)
      return () => clearInterval(timerRef.current)
    }
    return () => clearInterval(timerRef.current)
  }, [activeSession])

  const startTask = async (task) => {
    const res = await deepworkApi.create({ task: task.title, category: task.category, planned_duration: task.duration, date: today() })
    await deepworkApi.start(res.id)
    load()
  }

  const endSession = async (focusScore = 8) => {
    if (!activeSession) return
    await deepworkApi.end(activeSession.id, { focus_score: focusScore })
    clearInterval(timerRef.current)
    const done = [...completedTasks, activeSession.task]
    setCompletedTasks(done)
    localStorage.setItem(`dw-done-${today()}`, JSON.stringify(done))
    setActiveSession(null)
    setTimer(0)
    setShowFocusPrompt(false)
    load()
  }

  const handleEndClick = () => {
    setShowFocusPrompt(true)
  }

  const formatTimer = (s) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }

  const planned = activeSession ? activeSession.planned_duration * 60 : 90 * 60
  const timerPct = Math.min(timer / planned * 100, 100)
  const completedCount = todayTasks.filter(t => completedTasks.includes(t.title)).length

  return (
    <motion.div {...fadeUp} className="space-y-6">
      <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2"><Brain size={22} className="text-[#A855F7] shrink-0" strokeWidth={2} /> Глубокая работа</h1>
      <p className="text-sm text-[#9CA3AF] mb-6">3 задачи на сегодня · {completedCount}/3 выполнено</p>

      {/* Active Timer (Cloudy: purple timer ring, focus score grid light) */}
      {activeSession && (
        <Glass className="p-6 md:p-8 mb-6 flex flex-col items-center">
          <CircularProgress value={timerPct} size={180} strokeWidth={10} color={timerPct >= 100 ? '#22c55e' : '#A855F7'}>
            <div className="text-center">
              <div className="text-4xl font-mono font-bold text-white">{formatTimer(timer)}</div>
              <div className="text-[11px] text-[#9CA3AF] mt-1 max-w-[120px] truncate">{activeSession.task}</div>
            </div>
          </CircularProgress>
          {showFocusPrompt ? (
            <div className="mt-5 w-full max-w-xs">
              <div className="text-xs text-[#9CA3AF] mb-2 text-center">Оцените уровень фокуса (1–10)</div>
              <div className="flex flex-wrap justify-center gap-2">
                {[1,2,3,4,5,6,7,8,9,10].map(n => (
                  <motion.button key={n} onClick={() => endSession(n)} whileTap={{ scale: 0.9 }}
                    className="w-9 h-9 rounded-lg bg-[#7B61FF]/10 hover:bg-[#A855F7]/20 text-white text-sm font-medium transition-colors">
                    {n}
                  </motion.button>
                ))}
              </div>
            </div>
          ) : (
            <motion.button onClick={handleEndClick} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              className="glass-btn mt-5 flex items-center gap-2 bg-red-500/10 border-red-500/20 text-red-400">
              <Square size={16} strokeWidth={1.8} /> Завершить
            </motion.button>
          )}
        </Glass>
      )}

      {/* Stats Row (Cloudy: white cards, dark text) */}
      {dwStats && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Glass className="p-5 md:p-6 text-center">
            <div className="text-[11px] text-[#9CA3AF] uppercase tracking-wider">Сегодня</div>
            <div className="text-2xl font-bold text-white mt-1">{Math.round(dwStats.today_minutes / 60 * 10) / 10}ч</div>
          </Glass>
          <Glass className="p-5 md:p-6 text-center">
            <div className="text-[11px] text-[#9CA3AF] uppercase tracking-wider">Неделя</div>
            <div className="text-2xl font-bold text-white mt-1">{Math.round(dwStats.week_minutes / 60 * 10) / 10}ч</div>
          </Glass>
          <Glass className="p-5 md:p-6 text-center">
            <div className="text-[11px] text-[#9CA3AF] uppercase tracking-wider">Фокус</div>
            <div className="text-2xl font-bold text-white mt-1">{dwStats.avg_focus_score}/10</div>
          </Glass>
        </div>
      )}

      {/* 3 Tasks of the Day */}
      <div className="space-y-4">
        {todayTasks.map((task, idx) => {
          const isDone = completedTasks.includes(task.title)
          const isExpanded = expandedTask === idx
          const isActive = activeSession?.task === task.title

          return (
            <Glass key={idx} className={`p-5 transition-all min-h-[64px] active:scale-[0.99] ${isDone ? 'opacity-70' : ''} ${isActive ? 'ring-1 ring-[#A855F7]/40' : ''}`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${isDone ? 'bg-green-500/10' : 'bg-[#7B61FF]/10'}`}>
                  {isDone ? <Check size={18} className="text-[#34D399]" strokeWidth={2} /> : <Target size={18} className="text-[#A855F7]" strokeWidth={1.8} />}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`font-semibold text-sm text-white ${isDone ? 'line-through text-[#9CA3AF]' : ''}`}>{task.title}</h3>
                  <p className="text-[11px] text-[#9CA3AF]">{task.duration} мин · {task.steps.length} шагов</p>
                </div>
                <div className="flex items-center gap-2">
                  {!isDone && !isActive && !activeSession && (
                    <motion.button onClick={() => startTask(task)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                      className="p-2 rounded-[14px] bg-[#A855F7]/10 text-[#A855F7] hover:bg-[#A855F7]/20 transition-colors">
                      <Play size={16} strokeWidth={1.8} />
                    </motion.button>
                  )}
                  <motion.button onClick={() => setExpandedTask(isExpanded ? null : idx)} whileTap={{ scale: 0.9 }}
                    className="p-2 rounded-[14px] bg-[#7B61FF]/10 text-[#9CA3AF] hover:text-white transition-colors">
                    <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                      <ChevronDown size={16} strokeWidth={1.8} />
                    </motion.div>
                  </motion.button>
                </div>
              </div>

              {/* Step-by-step instructions */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="mt-4 pt-3 border-t border-[rgba(255,255,255,0.08)] space-y-2">
                      {task.steps.map((step, si) => (
                        <div key={si} className="flex items-start gap-3 text-sm">
                          <div className="w-6 h-6 rounded-lg bg-[#7B61FF]/10 flex items-center justify-center text-[11px] text-[#9CA3AF] font-bold shrink-0 mt-0.5">
                            {si + 1}
                          </div>
                          <span className="text-white">{step}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Glass>
          )
        })}
      </div>
    </motion.div>
  )
}

export default memo(DeepWorkPage)
