'use client';
import { useState, useEffect, useCallback, useRef, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar, ChevronLeft, ChevronRight, Check, Circle, Trash2,
  Zap, Sparkles, Loader2, Clock
} from 'lucide-react'
import { Glass, CircularProgress, CardSkeleton } from '../components'
import { fadeUp, CATEGORIES, today, formatDate, dayName, formatDisplay } from '../constants'
import { plansApi } from '../api'

function PlanPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [plan, setPlan] = useState(null)
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [focus, setFocus] = useState('')
  const [energy, setEnergy] = useState(7)
  const dateStr = formatDate(currentDate)

  const loadingForRef = useRef('')
  const loadPlan = useCallback(async () => {
    setLoading(true)
    try {
      const data = await plansApi.get(dateStr)
      if (loadingForRef.current === dateStr) setPlan(data)
    } catch {
      if (loadingForRef.current === dateStr) setPlan(null)
    } finally {
      if (loadingForRef.current === dateStr) setLoading(false)
    }
  }, [dateStr])

  useEffect(() => {
    loadingForRef.current = dateStr
    loadPlan()
  }, [loadPlan])

  const generatePlan = async () => {
    setGenerating(true)
    try { await plansApi.generate({ date: dateStr, focus, energy_level: energy }); await loadPlan() }
    catch (e) { alert('Ошибка: ' + (e.response?.data?.detail || e.message)) }
    finally { setGenerating(false) }
  }

  const toggleTask = async (id, current) => { await plansApi.updateTask(id, { is_completed: !current }); await loadPlan() }
  const deleteTask = async (id) => { await plansApi.deleteTask(id); await loadPlan() }

  const prevDay = () => setCurrentDate(d => { const n = new Date(d); n.setDate(n.getDate() - 1); return n })
  const nextDay = () => setCurrentDate(d => { const n = new Date(d); n.setDate(n.getDate() + 1); return n })

  const isToday = dateStr === today()
  const tasks = Array.isArray(plan?.tasks) ? plan.tasks : []
  const done = tasks.filter(t => t.is_completed).length
  const progress = tasks.length ? Math.round(done / tasks.length * 100) : 0

  return (
    <motion.div {...fadeUp} className="space-y-6">
      <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2.5"><Calendar size={24} className="text-[#7B61FF]" strokeWidth={2} /> План дня</h1>

      {/* Date Nav (Cloudy: white card, dark text, blue accent) */}
      <Glass className="p-6">
        <div className="flex items-center justify-between">
          <motion.button onClick={prevDay} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9, x: -2 }}
            className="p-3 min-w-[44px] min-h-[44px] rounded-xl hover:bg-[#7B61FF]/10 transition-colors text-white flex items-center justify-center"><ChevronLeft size={22} strokeWidth={2} /></motion.button>
          <div className="text-center">
            <p className="text-lg font-semibold text-white">{formatDisplay(currentDate)}</p>
            <p className="text-sm text-[#9CA3AF] capitalize">{dayName(currentDate)}{isToday && <span className="ml-2 text-[#7B61FF]">• Сегодня</span>}</p>
          </div>
          <motion.button onClick={nextDay} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9, x: 2 }}
            className="p-3 min-w-[44px] min-h-[44px] rounded-xl hover:bg-[#7B61FF]/10 transition-colors text-white flex items-center justify-center"><ChevronRight size={22} strokeWidth={2} /></motion.button>
        </div>
      </Glass>

      {loading ? (
        <div className="space-y-3">
          <CardSkeleton lines={2} />
          <CardSkeleton lines={4} />
          <CardSkeleton lines={3} />
        </div>
      ) : !plan ? (
        <Glass className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><Zap size={18} className="text-amber-500" /> Сгенерировать план</h3>
          <div className="space-y-3 mb-4">
            <input className="glass-input" placeholder="Фокус дня..." value={focus} onChange={e => setFocus(e.target.value)} />
            <div>
              <label className="text-xs text-[#9CA3AF] mb-1 block">Энергия: {energy}/10</label>
              <input type="range" min="1" max="10" value={energy} onChange={e => setEnergy(+e.target.value)} className="w-full" />
            </div>
          </div>
          <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }}
            className="glass-btn glass-btn-primary w-full flex items-center justify-center gap-2 py-3" onClick={generatePlan} disabled={generating}>
            {generating ? <><Loader2 size={16} className="animate-spin" /> Генерирую...</> : <><Sparkles size={16} /> Сгенерировать</>}
          </motion.button>
        </Glass>
      ) : (
        <>
          <Glass className="p-6 mb-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[13px] text-[#9CA3AF] font-medium">Прогресс</span>
              <span className="text-[13px] font-bold text-white">{progress}% ({done}/{tasks.length})</span>
            </div>
            <div className="w-full h-[6px] rounded-full bg-[#7B61FF]/10 overflow-hidden">
              <motion.div className="h-full rounded-full" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.8 }}
                style={{ background: progress >= 80 ? '#22c55e' : '#7B61FF' }} />
            </div>
          </Glass>

          <div className="space-y-3 mb-5">
            {tasks.map(task => {
              const cat = CATEGORIES[task?.category] || CATEGORIES.personal
              const CatIcon = cat?.icon || Circle
              return (
                <Glass key={task.id} className={`p-5 flex items-start gap-3 transition-opacity duration-300 min-h-[60px] ${task.is_completed ? 'opacity-70' : ''}`}>
                  <motion.button onClick={() => toggleTask(task.id, task.is_completed)} whileTap={{ scale: 0.85 }}
                    className="mt-0.5 shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg -ml-2">
                    {task.is_completed
                      ? <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }}><Check size={18} className="text-[#34D399]" /></motion.div>
                      : <Circle size={18} className="text-[#9CA3AF] hover:text-[#7B61FF] transition-colors" />}
                  </motion.button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      {task.time_slot && <span className="text-[11px] font-mono text-[#9CA3AF]">{task.time_slot}</span>}
                      <span className="text-xs px-1.5 py-0.5 rounded-full flex items-center gap-1 w-fit" style={{ background: `${cat.color}20`, color: cat.color }}><CatIcon size={12} strokeWidth={1.8} /> {cat.label}</span>
                    </div>
                    <p className={`text-sm font-medium text-white ${task.is_completed ? 'line-through' : ''}`}>{task.title}</p>
                    {task.description && <p className="text-xs text-[#9CA3AF] mt-0.5">{task.description}</p>}
                  </div>
                  <motion.button onClick={() => deleteTask(task.id)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.85 }}
                    className="shrink-0 min-w-[44px] min-h-[44px] p-2 rounded-lg hover:bg-red-500/10 transition-colors flex items-center justify-center"><Trash2 size={14} className="text-[#9CA3AF] hover:text-red-500 transition-colors" /></motion.button>
                </Glass>
              )
            })}
          </div>
        </>
      )}
    </motion.div>
  )
}

export default memo(PlanPage)
