import { useState, useCallback, useEffect, useRef, lazy, Suspense } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { PageLoader } from './components'
import { Sidebar, MobileNav, MobileDrawer } from './components/Layout'
import { ROUTE_ORDER, pathToPage, pageToPath } from './config/routes'

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
      <Sidebar page={page} onNav={handleNav} />
      <MobileNav page={page} onNav={handleNav} onOpenMenu={() => setDrawerOpen(true)} />
      <MobileDrawer open={drawerOpen} page={page} onNav={handleNav} onClose={() => setDrawerOpen(false)} />

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
