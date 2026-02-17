import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { NAV_GROUPS } from '../../constants'

export function Sidebar({ page, onNav }) {
  return (
    <aside
      className="hidden md:flex flex-col w-56 bg-[#1B1B1B] border-r border-[rgba(255,255,255,0.08)] p-4 sticky top-0 h-screen shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
      role="navigation"
      aria-label="Основная навигация"
    >
      <div className="flex items-center gap-2.5 mb-8 px-2">
        <Sparkles size={22} className="text-[#7B61FF] shrink-0" strokeWidth={2} />
        <span className="font-bold text-lg text-white">Planner</span>
      </div>
      <nav className="flex-1 space-y-4">
        {NAV_GROUPS.map((group) => (
          <div key={group.title}>
            <div className="px-3 mb-1.5 text-[11px] text-[#6B7280] font-semibold uppercase tracking-wider">
              {group.title}
            </div>
            <div className="space-y-1">
              {group.items.map((n) => (
                <motion.button
                  key={n.id}
                  onClick={() => onNav(n.id)}
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.97 }}
                  aria-current={page === n.id ? 'page' : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-full text-sm transition-all duration-200 ${
                    page === n.id ? 'bg-[#7B61FF] text-white' : 'text-[#9CA3AF] hover:bg-[#252525] hover:text-white'
                  }`}
                >
                  <n.icon size={18} strokeWidth={page === n.id ? 2.2 : 1.8} className="shrink-0" />
                  {n.label}
                </motion.button>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  )
}
