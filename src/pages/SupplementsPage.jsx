'use client';
import { useState, useEffect, useCallback, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Pill, Check, Plus } from 'lucide-react'
import { Glass, CircularProgress } from '../components'
import { fadeUp } from '../constants'
import { supplementsApi } from '../api'

function SupplementsPage() {
  const [status, setStatus] = useState(null)
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ name: '', dosage: '', time_of_day: '', with_food: false, notes: '' })

  const load = useCallback(async () => {
    setStatus(await supplementsApi.todayStatus().catch(() => ({ supplements: [], taken: 0, total: 0 })))
  }, [])

  useEffect(() => { load() }, [load])

  const toggle = async (id, taken) => {
    await supplementsApi.log(id, { taken: !taken })
    load()
  }

  const submit = async () => {
    await supplementsApi.create(form)
    setForm({ name: '', dosage: '', time_of_day: '', with_food: false, notes: '' })
    setAdding(false)
    load()
  }

  return (
    <motion.div {...fadeUp} className="space-y-6">
      <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2"><Pill size={22} className="text-[#7B61FF] shrink-0" strokeWidth={2} /> БАДы</h1>

      {status && (
        <Glass className="p-6 flex items-center gap-4">
          <CircularProgress value={status.total > 0 ? status.taken / status.total * 100 : 0} size={56} strokeWidth={4} color="#7B61FF">
            <span className="text-xs font-bold text-white">{status.taken}/{status.total}</span>
          </CircularProgress>
          <div className="text-[13px] text-[#9CA3AF] font-medium">Принято сегодня</div>
        </Glass>
      )}

      <motion.button onClick={() => setAdding(!adding)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
        className="glass-btn text-sm flex items-center gap-1.5 min-h-[48px] px-5"><Plus size={14} strokeWidth={1.8} /> Добавить БАД</motion.button>

      <AnimatePresence>
        {adding && (
          <Glass className="p-6 space-y-3">
            <input className="glass-input text-sm w-full" placeholder="Название" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            <div className="grid grid-cols-2 gap-2">
              <input className="glass-input text-sm" placeholder="Дозировка" value={form.dosage} onChange={e => setForm(f => ({ ...f, dosage: e.target.value }))} />
              <input className="glass-input text-sm" placeholder="Время (утро/вечер)" value={form.time_of_day} onChange={e => setForm(f => ({ ...f, time_of_day: e.target.value }))} />
            </div>
            <motion.button onClick={submit} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }}
              className="glass-btn glass-btn-primary w-full text-sm py-2.5">Добавить</motion.button>
          </Glass>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        {(status?.supplements || []).map(s => (
          <motion.div key={s.id} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }} onClick={() => toggle(s.id, s.taken_today)} className="cursor-pointer">
          <Glass className={`p-5 flex items-center gap-4 transition-opacity duration-300 min-h-[64px] ${s.taken_today ? 'opacity-80' : ''}`}>
            <div className={`w-10 h-10 rounded-[14px] flex items-center justify-center transition-colors duration-300 ${s.taken_today ? 'bg-green-500/10' : 'bg-[#7B61FF]/10'}`}>
              {s.taken_today ? <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }}><Check size={18} className="text-[#34D399]" /></motion.div> : <Pill size={18} className="text-[#7B61FF]" strokeWidth={1.8} />}
            </div>
            <div className="flex-1">
              <div className="text-[15px] font-semibold text-white">{s.name}</div>
              <div className="text-[11px] text-[#9CA3AF]">{s.dosage} · {s.time_of_day}{s.with_food ? ' · с едой' : ''}</div>
            </div>
          </Glass>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

export default memo(SupplementsPage)
