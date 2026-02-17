/** Route config — path segment ↔ page id */
export const PATH_TO_PAGE = {
  '': 'dashboard',
  plan: 'plan',
  rituals: 'rituals',
  workout: 'workout',
  nutrition: 'nutrition',
  supplements: 'supplements',
  deepwork: 'deepwork',
  tm: 'tm',
  goals: 'goals',
  stats: 'stats',
}

export const PAGE_TO_PATH = {
  dashboard: '',
  plan: 'plan',
  rituals: 'rituals',
  workout: 'workout',
  nutrition: 'nutrition',
  supplements: 'supplements',
  deepwork: 'deepwork',
  tm: 'tm',
  goals: 'goals',
  stats: 'stats',
}

export const ROUTE_ORDER = Object.keys(PAGE_TO_PATH)

export function pathToPage(pathSegment) {
  return PATH_TO_PAGE[pathSegment] ?? 'dashboard'
}

export function pageToPath(pageId) {
  const seg = PAGE_TO_PATH[pageId]
  return seg === '' ? '/' : `/${seg}`
}
