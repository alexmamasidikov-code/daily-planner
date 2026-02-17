# Daily Planner

**План на каждый день** — дашборд для планирования дня, трекинга ритуалов, тренировок, питания и глубокой работы.

Дизайн: тёмная тема Frentix, Geist font. Сборка взята с [localhost:3000/planner](http://localhost:3000/planner).

## Структура

```
planner/
├── src/           # Frontend (Vite + React)
├── backend/       # API (FastAPI)
├── index.html
├── vite.config.js
└── package.json
```

## Запуск

### 1. Backend (порт 8081)

```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8081
```

### 2. Frontend (порт 5176)

```bash
npm install
npm run dev      # разработка
npm run build && npm run preview   # продакшен
```

### 3. Всё сразу

```bash
# Backend в фоне
cd backend && python -m uvicorn app.main:app --host 0.0.0.0 --port 8081 &

# Frontend
npm install && npm run dev
```

Открыть: http://localhost:5176/

## API

Frontend проксирует `/api` на `localhost:8081`. Для продакшена настройте proxy или `VITE_API_URL`.
