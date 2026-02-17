import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 8000,
  headers: { 'Content-Type': 'application/json' },
})

export const plansApi = {
  list: () => api.get('/plans').then(r => r.data),
  get: (date) => api.get(`/plans/${date}`).then(r => r.data),
  generate: (data) => api.post('/plans/generate', data).then(r => r.data),
  updateTask: (id, data) => api.patch(`/plans/tasks/${id}`, data).then(r => r.data),
  addTask: (date, data) => api.post(`/plans/${date}/tasks`, data).then(r => r.data),
  deleteTask: (id) => api.delete(`/plans/tasks/${id}`).then(r => r.data),
}

export const goalsApi = {
  list: () => api.get('/goals').then(r => r.data),
  create: (data) => api.post('/goals', data).then(r => r.data),
  update: (id, data) => api.patch(`/goals/${id}`, data).then(r => r.data),
  delete: (id) => api.delete(`/goals/${id}`).then(r => r.data),
}

export const habitsApi = {
  list: () => api.get('/habits').then(r => r.data),
  create: (data) => api.post('/habits', data).then(r => r.data),
  log: (id, date, data) => api.post(`/habits/${id}/log/${date}`, data).then(r => r.data),
  delete: (id) => api.delete(`/habits/${id}`).then(r => r.data),
}

export const statsApi = {
  get: () => api.get('/stats').then(r => r.data),
}

export const reflectionsApi = {
  get: (date) => api.get(`/reflections/${date}`).then(r => r.data),
  save: (data) => api.post('/reflections', data).then(r => r.data),
}

export const ritualsApi = {
  list: (type) => api.get('/rituals', { params: type ? { type } : {} }).then(r => r.data),
  create: (data) => api.post('/rituals', data).then(r => r.data),
  update: (id, data) => api.put(`/rituals/${id}`, data).then(r => r.data),
  delete: (id) => api.delete(`/rituals/${id}`).then(r => r.data),
  complete: (id, date) => api.post(`/rituals/${id}/complete`, { date }).then(r => r.data),
  uncomplete: (id, date) => api.delete(`/rituals/${id}/complete`, { params: { date_str: date } }).then(r => r.data),
  todayProgress: () => api.get('/rituals/today-progress').then(r => r.data),
}

export const workoutsApi = {
  list: (date) => api.get('/workouts', { params: date ? { date_filter: date } : {} }).then(r => r.data),
  program: () => api.get('/workouts/program').then(r => r.data),
  create: (data) => api.post('/workouts', data).then(r => r.data),
  update: (id, data) => api.put(`/workouts/${id}`, data).then(r => r.data),
  complete: (id) => api.post(`/workouts/${id}/complete`).then(r => r.data),
}

export const nutritionApi = {
  list: (date) => api.get('/nutrition', { params: date ? { date_filter: date } : {} }).then(r => r.data),
  create: (data) => api.post('/nutrition', data).then(r => r.data),
  delete: (id) => api.delete(`/nutrition/${id}`).then(r => r.data),
  dailySummary: (date) => api.get('/nutrition/daily-summary', { params: date ? { date_filter: date } : {} }).then(r => r.data),
}

export const supplementsApi = {
  list: () => api.get('/supplements').then(r => r.data),
  create: (data) => api.post('/supplements', data).then(r => r.data),
  update: (id, data) => api.put(`/supplements/${id}`, data).then(r => r.data),
  delete: (id) => api.delete(`/supplements/${id}`).then(r => r.data),
  log: (id, data) => api.post(`/supplements/${id}/log`, data).then(r => r.data),
  todayStatus: () => api.get('/supplements/today-status').then(r => r.data),
}

export const deepworkApi = {
  list: (date) => api.get('/deepwork', { params: date ? { date_filter: date } : {} }).then(r => r.data),
  create: (data) => api.post('/deepwork', data).then(r => r.data),
  start: (id) => api.post(`/deepwork/${id}/start`).then(r => r.data),
  end: (id, data) => api.post(`/deepwork/${id}/end`, data).then(r => r.data),
  stats: () => api.get('/deepwork/stats').then(r => r.data),
}

export const tmApi = {
  get: () => api.get('/tm-progress').then(r => r.data),
  addXp: (data) => api.post('/tm-progress/add-xp', data).then(r => r.data),
}

export const detoxApi = {
  list: () => api.get('/detox').then(r => r.data),
  create: (data) => api.post('/detox', data).then(r => r.data),
  update: (id, data) => api.put(`/detox/${id}`, data).then(r => r.data),
}
