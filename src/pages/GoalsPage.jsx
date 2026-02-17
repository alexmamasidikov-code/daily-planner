'use client';
import { useState, useEffect, useCallback, memo } from 'react'
import { motion } from 'framer-motion'
import { Target, Flame, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { Glass } from '../components'
import { fadeUp, CATEGORIES } from '../constants'
import { goalsApi, habitsApi } from '../api'
import { useToast } from '../contexts/ToastContext'

function GoalsPage() {
  const toast = useToast()
  const [goals, setGoals] = useState([])
  const [habits, setHabits] = useState([])
  const [newGoal, setNewGoal] = useState('')
  const [newGoalCat, setNewGoalCat] = useState('business')
  const [newHabit, setNewHabit] = useState('')
  const [newHabitCat, setNewHabitCat] = useState('health')

  const load = useCallback(async () => {
    const [g, h] = await Promise.all([goalsApi.list(), habitsApi.list()])
    setGoals(g); setHabits(h)
  }, [])

  useEffect(() => { load() }, [load])

  const addGoal = async () => { if (!newGoal.trim()) return; try { await goalsApi.create({ category: newGoalCat, title: newGoal }); setNewGoal(''); load() } catch (_) { toast('Не удалось добавить цель') } }
  const addHabit = async () => { if (!newHabit.trim()) return; try { await habitsApi.create({ category: newHabitCat, title: newHabit }); setNewHabit(''); load() } catch (_) { toast('Не удалось добавить привычку') } }

  const updateGoalProgress = async (goalId, progress) => {
    const clamped = Math.max(0, Math.min(100, progress))
    try { await goalsApi.update(goalId, { progress: clamped }); load() } catch (_) { toast('Не удалось обновить прогресс') }
  }

  const deleteGoal = async (g) => {
    if (window.confirm(`Удалить цель «${g.title}»?`)) {
      try { await goalsApi.delete(g.id); load() } catch (_) { toast('Не удалось удалить цель') }
    }
  }

  const deleteHabit = async (h) => {
    if (window.confirm(`Удалить привычку «${h.title}»?`)) {
      try { await habitsApi.delete(h.id); load() } catch (_) { toast('Не удалось удалить привычку') }
    }
  }

  return (
    <motion.div {...fadeUp} className="space-y-6">
      <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2"><Target size={22} className="text-[#7B61FF] shrink-0" strokeWidth={2} /> Цели и привычки</h1>

      <Glass className="p-6">
        <h3 className="text-[15px] font-semibold text-white mb-3 flex items-center gap-2"><Target size={14} className="text-[#7B61FF] shrink-0" strokeWidth={1.8} /> Цели</h3>
        <div className="space-y-3 mb-4">
          {goals.map(g => {
            const cat = CATEGORIES[g.category] || CATEGORIES.personal
            const progress = g.progress ?? 0
            return (
              <motion.div key={g.id} className="flex items-center gap-3 p-3 rounded-[14px] bg-[#252525] hover:bg-[#2A2A2A] transition-colors min-h-[48px]"
                whileHover={{ x: 2 }}>
                <cat.icon size={14} style={{ color: cat.color }} strokeWidth={1.8} />
                <span className="text-sm flex-1 min-w-0 truncate text-white">{g.title}</span>
                <div className="flex items-center gap-1 shrink-0">
                  <motion.button onClick={() => updateGoalProgress(g.id, progress - 10)} whileTap={{ scale: 0.9 }}
                    className="p-1 rounded-lg hover:bg-[#7B61FF]/10 text-[#9CA3AF] hover:text-white">
                    <ChevronDown size={14} strokeWidth={1.8} />
                  </motion.button>
                  <div className="w-14 h-[6px] rounded-full bg-[#7B61FF]/10 overflow-hidden">
                    <motion.div className="h-full rounded-full" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }}
                      style={{ background: 'linear-gradient(90deg, #7B61FF, #A855F7)' }} />
                  </div>
                  <motion.button onClick={() => updateGoalProgress(g.id, progress + 10)} whileTap={{ scale: 0.9 }}
                    className="p-1 rounded-lg hover:bg-[#7B61FF]/10 text-[#9CA3AF] hover:text-white">
                    <ChevronUp size={14} strokeWidth={1.8} />
                  </motion.button>
                </div>
                <span className="text-xs text-[#9CA3AF] w-8">{progress}%</span>
                <motion.button onClick={() => deleteGoal(g)} whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.85 }}
                  className="p-1 rounded-lg hover:bg-red-500/10 transition-colors"><Trash2 size={12} className="text-[#9CA3AF] hover:text-red-500 transition-colors" strokeWidth={1.8} /></motion.button>
              </motion.div>
            )
          })}
        </div>
        <div className="flex gap-2">
          <select value={newGoalCat} onChange={e => setNewGoalCat(e.target.value)} className="glass-input w-28 text-xs">
            {Object.entries(CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <input className="glass-input flex-1 text-sm" placeholder="Новая цель..." value={newGoal} onChange={e => setNewGoal(e.target.value)} onKeyDown={e => e.key === 'Enter' && addGoal()} />
          <motion.button onClick={addGoal} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }}
            className="glass-btn px-3"><Plus size={16} strokeWidth={1.8} /></motion.button>
        </div>
      </Glass>

      <Glass className="p-6">
        <h3 className="text-[15px] font-semibold text-white mb-3 flex items-center gap-2"><Flame size={14} className="text-orange-500 shrink-0" strokeWidth={1.8} /> Привычки</h3>
        <div className="space-y-3 mb-4">
          {habits.map(h => (
            <motion.div key={h.id} className="flex items-center gap-3 p-3 rounded-[14px] bg-[#252525] hover:bg-[#2A2A2A] transition-colors min-h-[48px]"
              whileHover={{ x: 2 }}>
              {(() => { const hcat = CATEGORIES[h.category] || CATEGORIES.personal; return <hcat.icon size={14} style={{ color: hcat.color }} strokeWidth={1.8} /> })()}
              <span className="text-sm flex-1 text-white">{h.title}</span>
              <span className="text-xs text-orange-600 font-medium">🔥 {h.streak}</span>
              <motion.button onClick={() => deleteHabit(h)} whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.85 }}
                className="p-1 rounded-lg hover:bg-red-500/10 transition-colors"><Trash2 size={12} className="text-[#9CA3AF] hover:text-red-500 transition-colors" strokeWidth={1.8} /></motion.button>
            </motion.div>
          ))}
        </div>
        <div className="flex gap-2">
          <select value={newHabitCat} onChange={e => setNewHabitCat(e.target.value)} className="glass-input w-28 text-xs">
            {Object.entries(CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <input className="glass-input flex-1 text-sm" placeholder="Новая привычка..." value={newHabit} onChange={e => setNewHabit(e.target.value)} onKeyDown={e => e.key === 'Enter' && addHabit()} />
          <motion.button onClick={addHabit} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }}
            className="glass-btn px-3"><Plus size={16} strokeWidth={1.8} /></motion.button>
        </div>
      </Glass>
    </motion.div>
  )
}

export default memo(GoalsPage)
