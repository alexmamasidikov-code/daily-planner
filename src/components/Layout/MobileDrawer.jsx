import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { NAV } from '../../constants'

export function MobileDrawer({ open, page, onNav, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="md:hidden fixed inset-0 z-50 flex flex-col justify-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/60" onClick={onClose} aria-hidden="true" />
          <motion.div
            className="relative w-full max-h-[70vh] rounded-t-3xl p-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] overflow-y-auto"
            role="dialog"
            aria-label="Навигационное меню"
            style={{ background: '#0A0B1E' }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28 }}
          >
            <div className="flex justify-center mb-4">
              <div className="w-12 h-1 rounded-full bg-white/30" />
            </div>
            <motion.button
              onClick={onClose}
              whileTap={{ scale: 0.9 }}
              aria-label="Закрыть"
              className="absolute top-5 right-5 p-2 rounded-full text-white/80 hover:bg-white/10 transition-colors"
            >
              <X size={24} />
            </motion.button>
            <div className="space-y-1.5 px-1">
              {NAV.map((n, i) => (
                <motion.button
                  key={n.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => onNav(n.id)}
                  aria-current={page === n.id ? 'page' : undefined}
                  className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-[17px] font-medium transition-colors ${
                    page === n.id ? 'bg-[#7B61FF]/30 text-[#C4B5FD]' : 'text-gray-300 active:bg-white/5'
                  }`}
                >
                  <n.icon size={24} strokeWidth={1.8} />
                  {n.label}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
