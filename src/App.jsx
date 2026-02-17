import { useState, useCallback, useEffect, useRef, lazy, Suspense } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Home, Sun, Dumbbell, Utensils, BarChart3, Menu, X } from 'lucide-react'
import { NAV, NAV_GROUPS } from './constants'
import { PageLoader } from './components'
import { ROUTE_ORDER, pathToPage, pageToPath } from './config/routes'

const MOBILE_NAV = [
  { id: 'dashboard', label: 'Главная', icon: Home },
  { id: 'rituals', label: 'Ритуалы', icon: Sun },
  { id: 'workout', label: 'Тренировки', icon: Dumbbell },
  { id: 'nutrition', label: 'Питание', icon: Utensils },
  { id: 'stats', label: 'Итоги', icon: BarChart3 },
]

const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const PlanPage = lazy(() => import('./pages/PlanPage'))
const RitualsPage = lazy(() => import('./pages/RitualsPage'))
const WorkoutPage = lazy(() => import('./pages/WorkoutPage'))
const NutritionPage = lazy(() => import('./pages/NutritionPage'))
const SupplementsPage = lazy(() => import('./pages/SupplementsPage'))
const DeepWorkPage = lazy(() => import('./pages/DeepWorkPage'))
const TMProgressPage = lazy(() => import('./pages/TMProgressPage'))
const GoalsPage = lazy(() => import('./pages/GoalsPage'))
const StatsPage = lazy(() => import('./pages/StatsPage'))

// ── Page Renderer ───────────────────────────────────────────────────────────
const PAGE_MAP = {
  dashboard: (props) => <DashboardPage {...props} />,
  plan: () => <PlanPage />,
  rituals: () => <RitualsPage />,
  workout: () => <WorkoutPage />,
  nutrition: () => <NutritionPage />,
  supplements: () => <SupplementsPage />,
  deepwork: () => <DeepWorkPage />,
  tm: () => <TMProgressPage />,
  goals: () => <GoalsPage />,
  stats: () => <StatsPage />,
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN APP — Thin Router Shell
// ═══════════════════════════════════════════════════════════════════════════
export default function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const pathSegment = location.pathname.replace(/^\//, '').split('/')[0] || ''
  const page = pathToPage(pathSegment)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [direction, setDirection] = useState(0)
  const prevPageRef = useRef(page)
  useEffect(() => {
    const prevIdx = ROUTE_ORDER.indexOf(prevPageRef.current)
    const currIdx = ROUTE_ORDER.indexOf(page)
    if (prevIdx !== currIdx) setDirection(currIdx > prevIdx ? 1 : -1)
    prevPageRef.current = page
  }, [page])

  const handleNav = useCallback((id) => {
    navigate(pageToPath(id))
    setDrawerOpen(false)
  }, [navigate])

  const renderPage = PAGE_MAP[page]
  const slideVariants = {
    enter: (d) => ({ x: d > 0 ? 24 : d < 0 ? -24 : 0, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d) => ({ x: d > 0 ? -24 : d < 0 ? 24 : 0, opacity: 0 }),
  }

  return (
    <div className="planner-theme min-h-screen flex" style={{ background: '#0C0C0C' }}>
      {/* ── Sidebar — Desktop (Cloudy: white, pill active) ────────────────── */}
      <aside className="hidden md:flex flex-col w-56 bg-[#1B1B1B] border-r border-[rgba(255,255,255,0.08)] p-4 sticky top-0 h-screen shadow-[0_2px_8px_rgba(0,0,0,0.3)]" role="navigation" aria-label="Основная навигация">
        <div className="flex items-center gap-2.5 mb-8 px-2">
          <Sparkles size={22} className="text-[#7B61FF] shrink-0" strokeWidth={2} />
          <span className="font-bold text-lg text-white">Planner</span>
        </div>
        <nav className="flex-1 space-y-4">
          {NAV_GROUPS.map(group => (
            <div key={group.title}>
              <div className="px-3 mb-1.5 text-[11px] text-[#6B7280] font-semibold uppercase tracking-wider">{group.title}</div>
              <div className="space-y-1">
                {group.items.map(n => (
                  <motion.button key={n.id} onClick={() => handleNav(n.id)}
                    whileHover={{ x: 2 }} whileTap={{ scale: 0.97 }}
                    aria-current={page === n.id ? 'page' : undefined}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-full text-sm transition-all duration-200 ${
                      page === n.id
                        ? 'bg-[#7B61FF] text-white'
                        : 'text-[#9CA3AF] hover:bg-[#252525] hover:text-white'
                    }`}>
                    <n.icon size={18} strokeWidth={page === n.id ? 2.2 : 1.8} className="shrink-0" />
                    {n.label}
                  </motion.button>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {/* ── Mobile Bottom Nav (Cloudy: white, blue active) ────────────────── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-[rgba(255,255,255,0.08)] bg-[#1B1B1B]"
        role="navigation" aria-label="Мобильная навигация"
        style={{ boxShadow: '0 -2px 16px rgba(0,0,0,0.4)', paddingBottom: 'max(8px, env(safe-area-inset-bottom))' }}>
        <div className="flex justify-around items-center px-2 pt-3 pb-2">
          {MOBILE_NAV.map(n => {
            const isActive = page === n.id
            return (
              <motion.button key={n.id} onClick={() => handleNav(n.id)}
                whileTap={{ scale: 0.9 }}
                aria-current={isActive ? 'page' : undefined}
                aria-label={n.label}
                className={`relative flex flex-col items-center gap-1.5 px-4 py-3 min-h-[52px] rounded-2xl transition-all duration-200 ${
                  isActive ? 'text-[#7B61FF]' : 'text-[#6B7280] active:text-white'
                }`}>
                {isActive && (
                  <motion.div layoutId="bottomNavIndicator"
                    className="absolute -top-0.5 w-8 h-1 rounded-full bg-[#7B61FF]"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
                )}
                <motion.div animate={{ y: isActive ? -1 : 0 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
                  <n.icon size={24} strokeWidth={isActive ? 2.2 : 1.5} />
                </motion.div>
                <span className={`text-xs font-medium transition-all duration-200 ${isActive ? 'opacity-100' : 'opacity-60'}`}>{n.label}</span>
              </motion.button>
            )
          })}
          <motion.button onClick={() => setDrawerOpen(!drawerOpen)} whileTap={{ scale: 0.9 }}
            aria-label="Открыть меню"
            className="flex flex-col items-center gap-1.5 px-4 py-3 min-h-[52px] rounded-2xl text-[#6B7280] active:text-white">
            <Menu size={24} strokeWidth={1.5} />
            <span className="text-xs font-medium opacity-60">Ещё</span>
          </motion.button>
        </div>
      </div>

      {/* ── Mobile More Menu (Bottom Sheet — Cloudy: dark navy #0A0B1E) ────── */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/60" onClick={() => setDrawerOpen(false)} aria-hidden="true" />
            <motion.div className="relative w-full max-h-[70vh] rounded-t-3xl p-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] overflow-y-auto"
              role="dialog" aria-label="Навигационное меню"
              style={{ background: '#0A0B1E' }}
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 28 }}>
              <div className="flex justify-center mb-4">
                <div className="w-12 h-1 rounded-full bg-white/30" />
              </div>
              <motion.button onClick={() => setDrawerOpen(false)} whileTap={{ scale: 0.9 }}
                aria-label="Закрыть меню"
                className="absolute top-5 right-5 p-2 rounded-full text-white/80 hover:bg-white/10 transition-colors">
                <X size={24} />
              </motion.button>
              <div className="space-y-1.5 px-1">
                {NAV.map((n, i) => (
                  <motion.button key={n.id}
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleNav(n.id)}
                    aria-current={page === n.id ? 'page' : undefined}
                    className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-[17px] font-medium transition-colors ${
                      page === n.id ? 'bg-[#7B61FF]/30 text-[#C4B5FD]' : 'text-gray-300 active:bg-white/5'
                    }`}>
                    <n.icon size={24} strokeWidth={1.8} />{n.label}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main Content ─────────────────────────────────────────────── */}
      <main className="flex-1 px-5 py-6 md:px-6 md:py-8 pb-28 md:pb-8 max-w-4xl mx-auto w-full min-w-0" role="main">
        <Suspense fallback={<PageLoader />}>
          <AnimatePresence mode="wait" custom={direction}>
            {renderPage && (
              <motion.div
                key={page}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.2 }}
              >
                {renderPage({ onNav: handleNav })}
              </motion.div>
            )}
          </AnimatePresence>
        </Suspense>
      </main>
    </div>
  )
}
