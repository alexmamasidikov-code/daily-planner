import { useState, useEffect, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Utensils, Check, Flame, Clock, Sun, Moon, Zap, Coffee,
  Sunrise, Droplets, Sparkles, Loader2
} from 'lucide-react'
import { Glass, CircularProgress } from '../components'
import { fadeUp, today, MEAL_PLAN, MEAL_TOTALS, PROTEIN_TARGET } from '../constants'
import { nutritionApi } from '../api'

function NutritionPage() {
  const [eaten, setEaten] = useState(() => {
    try { return JSON.parse(localStorage.getItem(`meals-eaten-${today()}`)) || [] } catch { return [] }
  })
  const [waterGlasses, setWaterGlasses] = useState(() => {
    try { return JSON.parse(localStorage.getItem(`water-${today()}`)) || 0 } catch { return 0 }
  })
  const [expandedMeal, setExpandedMeal] = useState(null)
  const [mealPlan, setMealPlan] = useState(MEAL_PLAN)
  const [hasPlan, setHasPlan] = useState(true)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    nutritionApi.list(today()).then(data => {
      if (data && data.length > 0) { setHasPlan(true) }
    }).catch(() => {})
  }, [])

  const toggle = (mealId) => {
    setEaten(prev => {
      const next = prev.includes(mealId) ? prev.filter(id => id !== mealId) : [...prev, mealId]
      localStorage.setItem(`meals-eaten-${today()}`, JSON.stringify(next))
      return next
    })
    nutritionApi.create({ date: today(), meal_id: mealId, action: 'toggle' }).catch(() => {})
  }

  const fillWater = (idx) => {
    const next = waterGlasses === idx + 1 ? idx : idx + 1
    setWaterGlasses(next)
    localStorage.setItem(`water-${today()}`, JSON.stringify(next))
  }

  const generatePlan = async () => {
    setGenerating(true)
    try {
      await nutritionApi.create({ date: today(), type: 'generate_plan' })
      setHasPlan(true)
    } catch { /* fallback to static plan */ }
    setGenerating(false)
  }

  const eatenCal = mealPlan.reduce((sum, m) => sum + (eaten.includes(m.id) ? m.cal : 0), 0)
  const eatenProtein = mealPlan.reduce((sum, m) => sum + (eaten.includes(m.id) ? m.protein : 0), 0)
  const eatenCarbs = mealPlan.reduce((sum, m) => sum + (eaten.includes(m.id) ? m.carbs : 0), 0)
  const eatenFat = mealPlan.reduce((sum, m) => sum + (eaten.includes(m.id) ? m.fat : 0), 0)
  const remainingCal = MEAL_TOTALS.cal - eatenCal

  const macros = [
    { label: 'Белок', value: eatenProtein, max: PROTEIN_TARGET, color: '#ef4444', icon: '\uD83E\uDD69' },
    { label: 'Углеводы', value: eatenCarbs, max: MEAL_TOTALS.carbs, color: '#f59e0b', icon: '\uD83C\uDF3E' },
    { label: 'Жиры', value: eatenFat, max: MEAL_TOTALS.fat, color: '#22c55e', icon: '\uD83E\uDD51' },
  ]

  const mealIconColors = { breakfast: '#f59e0b', snack: '#22c55e', lunch: '#eab308', dinner: '#818cf8' }
  const mealTypeLabels = { breakfast: 'Завтрак', snack: 'Перекус', lunch: 'Обед', dinner: 'Ужин' }

  // Current time indicator for timeline
  const now = new Date()
  const currentMinutes = now.getHours() * 60 + now.getMinutes()
  const timelineStart = 7 * 60 // 07:00
  const timelineEnd = 20 * 60 // 20:00
  const timelineProgress = Math.max(0, Math.min(100, ((currentMinutes - timelineStart) / (timelineEnd - timelineStart)) * 100))

  const calPct = MEAL_TOTALS.cal > 0 ? Math.min(Math.round(eatenCal / MEAL_TOTALS.cal * 100), 100) : 0

  // No plan state
  if (!hasPlan) {
    return (
      <motion.div {...fadeUp} className="space-y-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Utensils size={22} className="text-[#34D399]" /> Питание</h1>
        <Glass className="p-8 text-center">
          <div className="w-20 h-20 rounded-3xl bg-green-500/10 flex items-center justify-center mx-auto mb-4">
            <Utensils size={36} className="text-[#34D399]" strokeWidth={1.5} />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Нет плана на сегодня</h3>
          <p className="text-[13px] text-[#9CA3AF] mb-6 max-w-xs mx-auto">Сгенерируйте персональный план питания на ~1950 ккал с оптимальным балансом БЖУ</p>
          <motion.button onClick={generatePlan} disabled={generating}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            className="glass-btn glass-btn-primary text-sm px-6 py-3 flex items-center gap-2 mx-auto disabled:opacity-50">
            {generating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            {generating ? 'Генерация...' : 'Сгенерировать план питания'}
          </motion.button>
        </Glass>
      </motion.div>
    )
  }

  return (
    <motion.div {...fadeUp} className="space-y-6">
      <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Utensils size={22} className="text-[#34D399]" /> Питание</h1>

      {/* Daily Totals Hero (Cloudy: white card, green/amber/red macro bars) */}
      <Glass className="p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-0.5" style={{ background: `linear-gradient(90deg, #22c55e ${calPct}%, #E8EFFF ${calPct}%)` }} />

        <div className="flex items-center gap-4 mb-4">
          <CircularProgress value={calPct} size={72} strokeWidth={5} color="#22c55e">
            <div className="text-center">
              <div className="text-[13px] font-bold text-white">{calPct}%</div>
            </div>
          </CircularProgress>
          <div className="flex-1">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight text-white">{eatenCal}</span>
              <span className="text-[13px] text-[#9CA3AF]">/ {MEAL_TOTALS.cal} ккал</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <Flame size={14} className="text-orange-500" />
              <span className="text-[13px] text-[#9CA3AF]">Осталось <span className="font-semibold text-white">{remainingCal}</span> ккал</span>
            </div>
          </div>
        </div>

        {/* Macro progress bars on light tracks */}
        <div className="space-y-2.5">
          {macros.map((m, i) => {
            const pct = m.max > 0 ? Math.min(Math.round(m.value / m.max * 100), 100) : 0
            return (
              <div key={i}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[12px] text-[#9CA3AF]">{m.icon} {m.label}</span>
                  <span className="text-[12px] font-semibold text-white">{m.value}<span className="text-[#9CA3AF] font-normal">/{m.max}г</span></span>
                </div>
                <div className="h-2 rounded-full bg-[#7B61FF]/10 overflow-hidden">
                  <motion.div className="h-full rounded-full" style={{ background: m.color }}
                    initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: 'easeOut' }} />
                </div>
              </div>
            )
          })}
        </div>
      </Glass>

      {/* Meal Timing Timeline */}
      <Glass className="px-5 py-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[13px] font-semibold text-white flex items-center gap-1.5"><Clock size={14} className="text-[#7B61FF]" /> Расписание приёмов</span>
          <span className="text-[11px] text-[#9CA3AF]">{now.getHours()}:{String(now.getMinutes()).padStart(2, '0')}</span>
        </div>
        <div className="relative">
          <div className="h-2 rounded-full bg-[#7B61FF]/10 relative overflow-hidden">
            <motion.div className="h-full rounded-full bg-gradient-to-r from-[#7B61FF] to-[#A855F7]"
              initial={{ width: 0 }} animate={{ width: `${timelineProgress}%` }} transition={{ duration: 1 }} />
          </div>
          {/* Meal dots */}
          <div className="relative h-8 mt-1">
            {mealPlan.map((meal) => {
              const [h, m] = meal.time.split(':').map(Number)
              const mealMin = h * 60 + m
              const pos = ((mealMin - timelineStart) / (timelineEnd - timelineStart)) * 100
              const done = eaten.includes(meal.id)
              const isPast = currentMinutes > mealMin
              return (
                <div key={meal.id} className="absolute flex flex-col items-center" style={{ left: `${Math.max(2, Math.min(98, pos))}%`, transform: 'translateX(-50%)' }}>
                  <div className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-300 ${
                    done ? 'bg-green-500 border-green-400' :
                    isPast ? 'bg-orange-500/60 border-orange-400/60' :
                    'bg-[#7B61FF]/10 border-[#D1D5DB]'
                  }`} />
                  <span className="text-[11px] text-[#9CA3AF] mt-0.5 whitespace-nowrap">{meal.time}</span>
                </div>
              )
            })}
            {/* Current time indicator */}
            {timelineProgress > 0 && timelineProgress < 100 && (
              <motion.div className="absolute top-0" style={{ left: `${timelineProgress}%`, transform: 'translateX(-50%)' }}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                <div className="w-0.5 h-4 bg-[#7B61FF] rounded-full mx-auto" />
              </motion.div>
            )}
          </div>
        </div>
      </Glass>

      {/* Meal Cards */}
      <div className="space-y-3">
        {mealPlan.map((meal, idx) => {
          const done = eaten.includes(meal.id)
          const MealIcon = meal.icon
          const iconColor = mealIconColors[meal.type] || '#6366f1'
          const isExpanded = expandedMeal === meal.id
          const [mH, mM] = meal.time.split(':').map(Number)
          const isCurrent = currentMinutes >= mH * 60 + mM && currentMinutes <= mH * 60 + mM + 90
          return (
            <motion.div key={meal.id} layout initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}>
              <Glass className={`relative overflow-hidden transition-all duration-300 ${isCurrent && !done ? 'ring-1 ring-[#7B61FF]/50' : ''}`}
                style={{ opacity: done ? 0.8 : 1 }}>
                {done && <motion.div className="absolute top-0 left-0 w-full h-0.5"
                  initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} style={{ background: 'linear-gradient(90deg, #22c55e, #22c55e99)', transformOrigin: 'left' }} />}
                {isCurrent && !done && <div className="absolute top-3 right-3"><span className="flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#7B61FF] opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-[#7B61FF]" /></span></div>}

                <div className="p-5">
                  <div className="flex items-center gap-4">
                    <div className="shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300"
                      style={{ background: done ? '#D1FAE5' : `${iconColor}20` }}>
                      {done ? <Check size={22} className="text-[#34D399]" strokeWidth={2.5} /> : <MealIcon size={22} style={{ color: iconColor }} strokeWidth={1.8} />}
                    </div>
                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setExpandedMeal(isExpanded ? null : meal.id)}>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-[#9CA3AF]">{mealTypeLabels[meal.type] || meal.type}</span>
                        <span className="text-[11px] font-semibold text-[#7B61FF] bg-[#7B61FF]/10 px-2 py-0.5 rounded-lg">{meal.time}</span>
                      </div>
                      <p className="text-[15px] font-semibold text-white mt-0.5">{meal.name}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-[12px] text-white font-semibold">{meal.cal} ккал</span>
                        <span className="text-[11px] text-red-600">Б:{meal.protein}</span>
                        <span className="text-[11px] text-[#FBBF24]">У:{meal.carbs}</span>
                        <span className="text-[11px] text-[#34D399]">Ж:{meal.fat}</span>
                      </div>
                    </div>
                    <motion.button onClick={() => toggle(meal.id)} whileTap={{ scale: 0.9 }}
                      className={`shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                        done ? 'bg-green-500/10 text-[#34D399]' : 'bg-[#7B61FF]/10 text-[#9CA3AF] hover:bg-[#7B61FF]/20'
                      }`}>
                      {done ? <span className="text-lg">&#x2705;</span> : <span className="text-[13px] font-semibold">Съел</span>}
                    </motion.button>
                  </div>

                  {/* Expandable ingredients */}
                  <AnimatePresence>
                    {isExpanded && meal.ingredients && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }} className="overflow-hidden">
                        <div className="mt-4 pt-3 border-t border-[rgba(255,255,255,0.08)]">
                          <span className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wider">Ингредиенты</span>
                          <div className="mt-2 grid grid-cols-1 gap-1">
                            {meal.ingredients.map((ing, i) => (
                              <div key={i} className="flex items-center gap-2 text-[13px] text-white">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500/50 shrink-0" />
                                {ing}
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Glass>
            </motion.div>
          )
        })}
      </div>

      {/* Water Intake Tracker */}
      <Glass className="p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[13px] font-semibold text-white flex items-center gap-1.5"><Droplets size={16} className="text-[#7B61FF]" strokeWidth={2} /> Вода</span>
          <span className="text-[12px] text-[#9CA3AF]">{waterGlasses}/8 стаканов</span>
        </div>
        <div className="flex items-center justify-between gap-1.5">
          {Array.from({ length: 8 }).map((_, i) => {
            const filled = i < waterGlasses
            return (
              <motion.button key={i} onClick={() => fillWater(i)} whileTap={{ scale: 0.85 }}
                className={`flex-1 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                  filled
                    ? 'bg-[#DBEAFE] border border-[#7B61FF]/40'
                    : 'bg-[#252525] border border-[rgba(255,255,255,0.08)] hover:bg-[#2A2A2A]'
                }`}>
                <Droplets size={16} className={filled ? 'text-[#7B61FF]' : 'text-[#9CA3AF]'} strokeWidth={filled ? 2 : 1.5} />
              </motion.button>
            )
          })}
        </div>
        <div className="mt-3 h-1.5 rounded-full bg-[#7B61FF]/10 overflow-hidden">
          <motion.div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
            initial={{ width: 0 }} animate={{ width: `${(waterGlasses / 8) * 100}%` }} transition={{ duration: 0.5 }} />
        </div>
        <div className="text-center text-[11px] text-[#9CA3AF] mt-2">
          {waterGlasses >= 8 ? '\uD83D\uDCA7 Норма выполнена!' : `Ещё ${8 - waterGlasses} ${8 - waterGlasses === 1 ? 'стакан' : (8 - waterGlasses < 5 ? 'стакана' : 'стаканов')}`}
        </div>
      </Glass>

      {/* Eaten Summary */}
      <div className="text-center text-[12px] text-[#9CA3AF] pt-1 pb-2">
        <span className="font-semibold text-white">{eaten.length}</span> из <span className="font-semibold text-white">{mealPlan.length}</span> приёмов
        {eaten.length === mealPlan.length && <span className="ml-2 text-[#34D399]">&#x2728; Все приёмы завершены!</span>}
      </div>
    </motion.div>
  )
}

export default memo(NutritionPage)
