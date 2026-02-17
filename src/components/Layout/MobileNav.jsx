import { motion } from 'framer-motion'
import { Home, Sun, Dumbbell, Utensils, BarChart3, Menu } from 'lucide-react'

const MOBILE_NAV = [
  { id: 'dashboard', label: 'Главная', icon: Home },
  { id: 'rituals', label: 'Ритуалы', icon: Sun },
  { id: 'workout', label: 'Тренировки', icon: Dumbbell },
  { id: 'nutrition', label: 'Питание', icon: Utensils },
  { id: 'stats', label: 'Итоги', icon: BarChart3 },
]

export function MobileNav({ page, onNav, onOpenMenu }) {
  return (
    <div
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-[rgba(255,255,255,0.08)] bg-[#1B1B1B]"
      role="navigation"
      aria-label="Мобильная навигация"
      style={{ boxShadow: '0 -2px 16px rgba(0,0,0,0.4)', paddingBottom: 'max(8px, env(safe-area-inset-bottom))' }}
    >
      <div className="flex justify-around items-center px-2 pt-3 pb-2">
        {MOBILE_NAV.map((n) => {
          const isActive = page === n.id
          return (
            <motion.button
              key={n.id}
              onClick={() => onNav(n.id)}
              whileTap={{ scale: 0.9 }}
              aria-current={isActive ? 'page' : undefined}
              aria-label={n.label}
              className={`relative flex flex-col items-center gap-1.5 px-4 py-3 min-h-[52px] rounded-2xl transition-all duration-200 ${
                isActive ? 'text-[#7B61FF]' : 'text-[#6B7280] active:text-white'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute -top-0.5 w-8 h-1 rounded-full bg-[#7B61FF]"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <motion.div animate={{ y: isActive ? -1 : 0 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
                <n.icon size={24} strokeWidth={isActive ? 2.2 : 1.5} />
              </motion.div>
              <span className={`text-xs font-medium transition-all duration-200 ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                {n.label}
              </span>
            </motion.button>
          )
        })}
        <motion.button
          onClick={onOpenMenu}
          whileTap={{ scale: 0.9 }}
          aria-label="Открыть меню"
          className="flex flex-col items-center gap-1.5 px-4 py-3 min-h-[52px] rounded-2xl text-[#6B7280] active:text-white"
        >
          <Menu size={24} strokeWidth={1.5} />
          <span className="text-xs font-medium opacity-60">Ещё</span>
        </motion.button>
      </div>
    </div>
  )
}
