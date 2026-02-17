import { useState, useEffect, useCallback, memo } from 'react'
import { motion } from 'framer-motion'
import { Sun, Coffee, Moon, Check } from 'lucide-react'
import { Glass, CircularProgress } from '../components'
import { fadeUp, today, getRitualIcon } from '../constants'
import { ritualsApi } from '../api'
import { useToast } from '../contexts/ToastContext'

function RitualsPage() {
  const toast = useToast()
  const [rituals, setRituals] = useState([])
  const [completedIds, setCompletedIds] = useState([])
  const [type, setType] = useState('morning')

  const load = useCallback(async () => {
    const [list, prog] = await Promise.all([ritualsApi.list(type), ritualsApi.todayProgress()])
    setRituals(list)
    setCompletedIds(prog.completed_ids || [])
  }, [type])

  useEffect(() => { load() }, [load])

  const toggle = async (id) => {
    try {
      if (completedIds.includes(id)) {
        await ritualsApi.uncomplete(id, today())
      } else {
        await ritualsApi.complete(id, today())
      }
      await load()
    } catch (_) {
      toast('Не удалось обновить ритуал')
    }
  }

  const completed = rituals.filter(r => completedIds.includes(r.id)).length
  const total = rituals.length
  const pct = total > 0 ? Math.round(completed / total * 100) : 0

  return (
    <motion.div {...fadeUp} className="space-y-6">
      <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2.5"><Sun size={24} className="text-amber-500" strokeWidth={2} /> Ритуалы</h1>

      {/* Type Toggle (Cloudy: pill, active = blue fill) */}
      <div className="flex gap-4 mb-2">
        {[['morning', 'Утро', Coffee], ['evening', 'Вечер', Moon]].map(([t, label, Icon]) => (
          <motion.button key={t} onClick={() => setType(t)}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            className={`relative flex items-center gap-2 px-5 py-3 min-h-[44px] rounded-full text-sm font-medium transition-all duration-200 ${
              type === t ? 'bg-[#7B61FF] text-white' : 'bg-[#252525] text-[#9CA3AF] border border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.14)]'
            }`}>
            <Icon size={16} strokeWidth={type === t ? 2.2 : 1.8} /> {label}
          </motion.button>
        ))}
      </div>

      {/* Progress (Cloudy: light track) */}
      <Glass className="p-6 flex items-center gap-4">
        <CircularProgress value={pct} size={72} strokeWidth={5} color="#f59e0b">
          <span className="text-sm font-bold text-white">{pct}%</span>
        </CircularProgress>
        <div>
          <div className="text-2xl font-bold text-white">{completed}/{total}</div>
          <div className="text-[13px] text-[#9CA3AF] font-medium">{type === 'morning' ? 'Утренних' : 'Вечерних'} ритуалов</div>
        </div>
      </Glass>

      {/* Ritual List (Cloudy: completed = green check on light green bg) */}
      <div className="space-y-4">
        {rituals.map(r => {
          const done = completedIds.includes(r.id)
          const RitualIcon = getRitualIcon(r.name)
          return (
            <Glass key={r.id} className={`p-5 flex items-center gap-4 cursor-pointer transition-opacity duration-300 min-h-[64px] active:scale-[0.99] ${done ? 'opacity-80' : ''}`}
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }}
              onClick={() => toggle(r.id)}>
              <div className={`w-11 h-11 rounded-[14px] flex items-center justify-center shrink-0 transition-colors duration-300 ${done ? 'bg-green-500/10' : 'bg-amber-500/10'}`}>
                {done ? <motion.div initial={{ scale: 0.5, rotate: -20 }} animate={{ scale: 1, rotate: 0 }}><Check size={20} className="text-[#34D399]" strokeWidth={2.5} /></motion.div> : <RitualIcon size={20} className="text-[#FBBF24]" strokeWidth={2} />}
              </div>
              <div className="flex-1">
                <div className="text-[15px] font-semibold text-white">{r.name}</div>
                <div className="text-[11px] text-[#9CA3AF]">{r.time_slot} · {r.duration_min}мин</div>
              </div>
              {done && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}><Check size={14} className="text-[#34D399]" /></motion.div>}
            </Glass>
          )
        })}
      </div>
    </motion.div>
  )
}

export default memo(RitualsPage)
