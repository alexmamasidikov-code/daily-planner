'use client';
import { useState, useEffect, useRef, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Dumbbell, Moon, Heart, Check, Circle, Timer, Play, Pause,
  Youtube, ChevronDown, ChevronUp, Flame, Footprints, BarChart3,
  Activity, Sunrise, Target
} from 'lucide-react'
import { Glass, CircularProgress } from '../components'
import {
  fadeUp, today, WEEKLY_SCHEDULE, WORKOUT_DAYS,
  STRETCHING_SUGGESTIONS, WORKOUT_VIDEOS, MUSCLE_TAGS
} from '../constants'
import { workoutsApi } from '../api'

function WorkoutPage() {
  const [completedExercises, setCompletedExercises] = useState(() => {
    try { return JSON.parse(localStorage.getItem(`workout-done-${today()}`)) || {} } catch { return {} }
  })
  const [weekCompletion, setWeekCompletion] = useState(() => {
    try { return JSON.parse(localStorage.getItem('workout-week-completion')) || {} } catch { return {} }
  })
  const [expandedExercise, setExpandedExercise] = useState(null)
  const [restTimer, setRestTimer] = useState(0)
  const [restTarget, setRestTarget] = useState(0)
  const [timerActive, setTimerActive] = useState(false)
  const [workouts, setWorkouts] = useState([])
  const timerRef = useRef(null)

  useEffect(() => {
    workoutsApi.list().then(setWorkouts).catch(() => {})
  }, [])

  // Timer logic
  useEffect(() => {
    if (timerActive && restTimer > 0) {
      timerRef.current = setTimeout(() => setRestTimer(t => t - 1), 1000)
    } else if (timerActive && restTimer === 0) {
      setTimerActive(false)
    }
    return () => clearTimeout(timerRef.current)
  }, [timerActive, restTimer])

  const startTimer = (seconds) => {
    setRestTarget(seconds)
    setRestTimer(seconds)
    setTimerActive(true)
  }
  const pauseTimer = () => setTimerActive(false)
  const resetTimer = () => { setTimerActive(false); setRestTimer(restTarget) }

  const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][new Date().getDay()]
  const todaySchedule = WEEKLY_SCHEDULE[dayOfWeek] || null
  const isWorkoutDay = !!todaySchedule

  // Toggle exercise done
  const toggleExercise = (exName) => {
    setCompletedExercises(prev => {
      const next = { ...prev, [exName]: !prev[exName] }
      localStorage.setItem(`workout-done-${today()}`, JSON.stringify(next))
      return next
    })
  }

  // Mark today as completed in weekly overview
  useEffect(() => {
    if (!isWorkoutDay || !todaySchedule) return
    const exercises = todaySchedule.exercises
    const doneCount = exercises.filter(ex => completedExercises[ex.name]).length
    if (doneCount === exercises.length && exercises.length > 0) {
      setWeekCompletion(prev => {
        const next = { ...prev, [dayOfWeek]: true }
        localStorage.setItem('workout-week-completion', JSON.stringify(next))
        // Also persist to API
        workoutsApi.create({
          date: today(),
          type: todaySchedule.type,
          exercises: JSON.stringify(todaySchedule.exercises),
          duration_min: 45,
          intensity: 'medium',
        }).catch(() => {})
        return next
      })
    }
  }, [completedExercises, isWorkoutDay, todaySchedule, dayOfWeek])

  // Progress for today
  const todayExercises = todaySchedule?.exercises || []
  const doneCount = todayExercises.filter(ex => completedExercises[ex.name]).length
  const totalCount = todayExercises.length
  const progressPct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  return (
    <motion.div {...fadeUp} className="space-y-6">
      <h1 className="text-2xl font-bold text-white flex items-center gap-2">
        <Dumbbell size={22} className="text-[#34D399] shrink-0" strokeWidth={2} /> Тренировки
      </h1>

      {/* Weekly Overview Dots (Cloudy: light bg) */}
      <Glass className="px-5 py-5">
        <div className="flex items-center justify-between">
          <span className="text-[13px] text-[#9CA3AF] font-medium">Неделя</span>
          <div className="flex items-center gap-3">
            {WORKOUT_DAYS.map(d => {
              const sched = WEEKLY_SCHEDULE[d]
              const done = weekCompletion[d]
              const isCurrent = d === dayOfWeek
              return (
                <div key={d} className="flex flex-col items-center gap-1.5">
                  <span className={`text-xs font-semibold ${isCurrent ? 'text-white' : 'text-[#9CA3AF]'}`}>{sched.short}</span>
                  <motion.div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{
                      background: done ? `${sched.color}30` : isCurrent ? '#E8EFFF' : '#F3F4F6',
                      border: isCurrent ? `2px solid ${sched.color}` : '2px solid transparent',
                    }}
                    animate={done ? { scale: [1, 1.15, 1] } : {}}
                    transition={{ duration: 0.3 }}
                  >
                    {done ? (
                      <Check size={14} style={{ color: sched.color }} strokeWidth={2} />
                    ) : (
                      <Circle size={10} className={isCurrent ? 'text-[#9CA3AF]' : 'text-[#9CA3AF]'} strokeWidth={1.8} />
                    )}
                  </motion.div>
                </div>
              )
            })}
          </div>
        </div>
      </Glass>

      {/* Rest Day (Cloudy: pastel lavender card) */}
      {!isWorkoutDay ? (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
          <Glass className="p-6 text-center rounded-[20px]" style={{ background: 'linear-gradient(135deg, #1F0E2D, #150820)' }}>
            <motion.div
              className="w-20 h-20 rounded-3xl bg-white/10 flex items-center justify-center mx-auto mb-4"
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            >
              <Moon size={36} className="text-[#A855F7]" strokeWidth={1.5} />
            </motion.div>
            <h3 className="text-lg font-semibold text-white mb-1">День отдыха</h3>
            <p className="text-[13px] text-[#9CA3AF] max-w-xs mx-auto">
              Восстановление — ключ к прогрессу. Попробуй лёгкую растяжку.
            </p>
          </Glass>

          <Glass className="p-5">
            <h3 className="text-[15px] font-semibold text-white mb-3 flex items-center gap-2">
              <Heart size={16} className="text-pink-500 shrink-0" strokeWidth={1.8} /> Рекомендации на сегодня
            </h3>
            <div className="space-y-2">
              {STRETCHING_SUGGESTIONS.map((s, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-center gap-3 p-3.5 rounded-xl bg-[#252525] hover:bg-[#2A2A2A] transition-colors"
                >
                  <div className="w-9 h-9 rounded-xl bg-pink-500/10 flex items-center justify-center shrink-0">
                    <s.icon size={16} className="text-pink-500" strokeWidth={1.8} />
                  </div>
                  <div className="flex-1">
                    <div className="text-[14px] font-medium text-white">{s.name}</div>
                    <div className="text-[11px] text-[#9CA3AF]">{s.duration}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </Glass>
        </motion.div>
      ) : (
        <>
          {/* Today's Workout Header (Cloudy: white card, pastel exercise tiles) */}
          <Glass className="p-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-0.5"
              style={{ background: `linear-gradient(90deg, ${todaySchedule.color} ${progressPct}%, #E8EFFF ${progressPct}%)` }} />
            <div className="flex items-center gap-4">
              <CircularProgress value={progressPct} size={64} strokeWidth={5} color={todaySchedule.color}>
                <span className="text-[13px] font-bold">{progressPct}%</span>
              </CircularProgress>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <todaySchedule.icon size={16} style={{ color: todaySchedule.color }} strokeWidth={1.8} />
                  <span className="text-[15px] font-semibold">{todaySchedule.label}</span>
                </div>
                <div className="text-[13px] text-[#9CA3AF]">
                  <span className="font-semibold text-white">{doneCount}</span> из <span className="font-semibold text-white">{totalCount}</span> упражнений
                </div>
              </div>
            </div>
          </Glass>

          {/* Rest Timer */}
          <AnimatePresence>
            {restTarget > 0 && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                <Glass className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[13px] text-[#9CA3AF] font-medium flex items-center gap-1.5">
                      <Timer size={14} className="text-amber-500 shrink-0" strokeWidth={1.8} /> Отдых между подходами
                    </span>
                    <span className={`text-2xl font-mono font-bold tracking-wider ${restTimer === 0 ? 'text-[#34D399]' : 'text-white'}`}>
                      {formatTime(restTimer)}
                    </span>
                  </div>
                  <div className="w-full h-[5px] rounded-full bg-[#7B61FF]/10 overflow-hidden mb-3">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: restTimer === 0 ? '#22c55e' : '#f59e0b', boxShadow: `0 0 8px ${restTimer === 0 ? '#22c55e' : '#f59e0b'}40` }}
                      initial={{ width: '100%' }}
                      animate={{ width: restTarget > 0 ? `${((restTarget - restTimer) / restTarget) * 100}%` : '0%' }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    {timerActive ? (
                      <button onClick={pauseTimer}
                        className="flex-1 py-2.5 rounded-xl bg-amber-500/10 text-amber-400 text-[13px] font-semibold flex items-center justify-center gap-1.5 hover:bg-amber-500/20 transition-colors">
                        <Pause size={14} strokeWidth={1.8} /> Пауза
                      </button>
                    ) : (
                      <button onClick={() => setTimerActive(true)}
                        className="flex-1 py-2.5 rounded-xl bg-green-500/10 text-green-400 text-[13px] font-semibold flex items-center justify-center gap-1.5 hover:bg-green-500/20 transition-colors">
                        <Play size={14} strokeWidth={1.8} /> {restTimer === 0 ? 'Готово!' : 'Старт'}
                      </button>
                    )}
                    <button onClick={resetTimer}
                      className="px-4 py-2.5 rounded-xl bg-[#7B61FF]/10 text-[#9CA3AF] text-[13px] font-semibold hover:bg-[#7B61FF]/20 transition-colors">
                      Сброс
                    </button>
                  </div>
                  {restTimer === 0 && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center text-[12px] text-[#34D399] mt-2 font-medium"
                    >
                      Время отдыха вышло — следующий подход!
                    </motion.p>
                  )}
                </Glass>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Exercise List */}
          <div className="space-y-2">
            {todayExercises.map((ex, idx) => {
              const done = !!completedExercises[ex.name]
              const isExpanded = expandedExercise === idx
              const muscles = MUSCLE_TAGS[ex.name] || []
              const videoUrl = WORKOUT_VIDEOS[ex.name]

              return (
                <motion.div key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Glass className={`overflow-hidden transition-all duration-200 min-h-[56px] ${done ? 'opacity-70' : ''} ${isExpanded ? 'ring-1 ring-[#E5E7EB]' : ''}`}>
                    {/* Exercise row */}
                    <div className="p-4 md:p-5 flex items-center gap-3">
                      <button onClick={() => toggleExercise(ex.name)} className="shrink-0">
                        <motion.div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${done ? 'bg-green-500/10' : 'bg-[#7B61FF]/10'}`}
                          whileTap={{ scale: 0.85 }}
                        >
                          {done ? (
                            <Check size={14} className="text-[#34D399]" strokeWidth={2} />
                          ) : (
                            <span className="text-[12px] font-mono font-bold text-[#9CA3AF]">{idx + 1}</span>
                          )}
                        </motion.div>
                      </button>

                      <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setExpandedExercise(isExpanded ? null : idx)}>
                        <div className={`text-[14px] font-semibold text-white ${done ? 'line-through text-[#9CA3AF]' : ''}`}>{ex.name}</div>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="text-[11px] text-[#9CA3AF] font-mono">{ex.sets}x{ex.reps}</span>
                          <span className="text-[11px] text-[#9CA3AF]">·</span>
                          <span className="text-[11px] text-[#9CA3AF] flex items-center gap-0.5">
                            <Timer size={10} strokeWidth={1.8} /> {ex.rest}с
                          </span>
                          {muscles.slice(0, 2).map((tag, ti) => (
                            <span key={ti} className="text-xs px-1.5 py-0.5 rounded-lg bg-green-500/10 text-[#34D399]">{tag}</span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {videoUrl && (
                          <motion.a href={videoUrl} target="_blank" rel="noopener noreferrer"
                            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                            className="w-9 h-9 rounded-[14px] bg-red-500/10 flex items-center justify-center hover:bg-red-500/20 transition-colors">
                            <Youtube size={15} className="text-red-400 shrink-0" strokeWidth={1.8} />
                          </motion.a>
                        )}
                        <button onClick={() => setExpandedExercise(isExpanded ? null : idx)}
                          className="w-9 h-9 rounded-xl bg-[#7B61FF]/10 flex items-center justify-center hover:bg-[#7B61FF]/20 transition-colors">
                          {isExpanded ? <ChevronUp size={14} className="text-[#9CA3AF] shrink-0" strokeWidth={1.8} /> : <ChevronDown size={14} className="text-[#9CA3AF] shrink-0" strokeWidth={1.8} />}
                        </button>
                      </div>
                    </div>

                    {/* Expanded detail */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 pt-0 space-y-3 border-t border-[rgba(255,255,255,0.08)]">
                            {/* Muscles */}
                            <div className="flex items-center gap-2 mt-3 flex-wrap">
                              <span className="text-[11px] text-[#9CA3AF] font-medium">Мышцы:</span>
                              {muscles.map((tag, ti) => (
                                <span key={ti} className="text-[11px] px-2 py-0.5 rounded-lg" style={{ background: `${todaySchedule.color}15`, color: todaySchedule.color }}>{tag}</span>
                              ))}
                            </div>

                            {/* Sets x Reps detail */}
                            <div className="grid grid-cols-3 gap-2">
                              <div className="p-2.5 rounded-xl bg-[#252525] text-center">
                                <div className="text-[11px] text-[#9CA3AF] mb-0.5">Подходы</div>
                                <div className="text-[15px] font-bold text-white">{ex.sets}</div>
                              </div>
                              <div className="p-2.5 rounded-xl bg-[#252525] text-center">
                                <div className="text-[11px] text-[#9CA3AF] mb-0.5">Повторения</div>
                                <div className="text-[15px] font-bold text-white">{ex.reps}</div>
                              </div>
                              <div className="p-2.5 rounded-xl bg-[#252525] text-center">
                                <div className="text-[11px] text-[#9CA3AF] mb-0.5">Отдых</div>
                                <div className="text-[15px] font-bold text-white">{ex.rest}с</div>
                              </div>
                            </div>

                            {/* Timer & Video buttons */}
                            <div className="flex items-center gap-2">
                              <motion.button
                                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                                onClick={() => startTimer(ex.rest)}
                                className="flex-1 py-2.5 rounded-[14px] bg-amber-500/10 text-amber-400 text-[13px] font-semibold flex items-center justify-center gap-1.5 hover:bg-amber-500/20 transition-colors"
                              >
                                <Timer size={14} strokeWidth={1.8} /> Таймер {ex.rest}с
                              </motion.button>
                              {videoUrl && (
                                <motion.a href={videoUrl} target="_blank" rel="noopener noreferrer"
                                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                                  className="flex-1 py-2.5 rounded-[14px] bg-red-500/10 text-red-400 text-[13px] font-semibold flex items-center justify-center gap-1.5 hover:bg-red-500/20 transition-colors">
                                  <Youtube size={14} strokeWidth={1.8} /> Смотреть
                                </motion.a>
                              )}
                            </div>

                            {/* Toggle done */}
                            <motion.button
                              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }}
                              onClick={() => toggleExercise(ex.name)}
                              className={`w-full py-2.5 rounded-[14px] text-[13px] font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                                done
                                  ? 'bg-green-500/10 text-[#34D399] hover:bg-green-500/20'
                                  : 'bg-[#7B61FF]/10 text-white hover:bg-[#7B61FF]/20'
                              }`}
                            >
                              {done ? <><Check size={14} strokeWidth={2} /> Выполнено</> : <><Circle size={14} strokeWidth={1.8} /> Отметить выполненным</>}
                            </motion.button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Glass>
                </motion.div>
              )
            })}
          </div>

          {/* All exercises done celebration */}
          <AnimatePresence>
            {doneCount === totalCount && totalCount > 0 && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                <Glass className="p-6 text-center rounded-[20px]" style={{ background: 'linear-gradient(135deg, #0E2D1F, #081F15)' }}>
                  <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 2 }}
                    className="text-4xl mb-2">&#x1F3C6;</motion.div>
                  <h3 className="text-[15px] font-semibold text-[#34D399] mb-0.5">Тренировка завершена!</h3>
                  <p className="text-[12px] text-[#9CA3AF]">Все {totalCount} упражнений выполнены. Отличная работа!</p>
                </Glass>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {/* Recent Workouts History (Cloudy: white card, light rows) */}
      {workouts.length > 0 && (
        <Glass className="p-5">
          <h3 className="text-[15px] font-semibold text-white mb-3 flex items-center gap-2">
            <BarChart3 size={14} className="text-[#7B61FF] shrink-0" strokeWidth={1.8} /> История
          </h3>
          <div className="space-y-2">
            {workouts.slice(0, 5).map(w => (
              <div key={w.id} className="flex items-center gap-3 text-sm p-3.5 rounded-xl bg-[#252525]">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${w.completed ? 'bg-green-500/10' : 'bg-[#7B61FF]/10'}`}>
                  <Dumbbell size={14} className={w.completed ? 'text-[#34D399]' : 'text-[#9CA3AF]'} strokeWidth={1.8} />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[13px] font-medium text-white">{w.type}</span>
                  <span className="text-[11px] text-[#9CA3AF] ml-2">{w.duration_min}мин</span>
                </div>
                <span className="text-[11px] text-[#9CA3AF]">{w.date}</span>
                {w.completed ? <Check size={12} className="text-[#34D399]" strokeWidth={2} /> : null}
              </div>
            ))}
          </div>
        </Glass>
      )}
    </motion.div>
  )
}

export default memo(WorkoutPage)
