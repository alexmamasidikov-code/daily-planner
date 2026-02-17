import {
  Heart, Briefcase, BookOpen, Users, Brain, Target, Circle,
  Droplets, Snowflake, Eye, Footprints, Sparkles, Dumbbell, Calendar,
  Sunrise, Sun, Coffee, Moon, Zap, Home, Utensils, Pill, Award, BarChart3,
  Flame, Activity, Timer
} from 'lucide-react'

// ── Helpers ─────────────────────────────────────────────────────────────────
export function formatDate(d) { return d.toISOString().split('T')[0] }
export function dayName(d) { return d.toLocaleDateString('ru-RU', { weekday: 'long' }) }
export function formatDisplay(d) { return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' }) }
export const today = () => formatDate(new Date())

// ── Categories (Cloudy pastel palette) ────────────────────────────────────────
export const CATEGORIES = {
  health: { icon: Heart, label: 'Здоровье', color: '#22c55e' },
  business: { icon: Briefcase, label: 'Бизнес', color: '#7B61FF' },
  learning: { icon: BookOpen, label: 'Обучение', color: '#f59e0b' },
  networking: { icon: Users, label: 'Нетворкинг', color: '#ec4899' },
  mindset: { icon: Brain, label: 'Майндсет', color: '#A855F7' },
  personal: { icon: Target, label: 'Личное', color: '#06b6d4' },
  strategy: { icon: Target, label: 'Стратегия', color: '#f97316' },
}

// ── Framer Motion Presets ───────────────────────────────────────────────────
export const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3 },
}

// ── Premium Style Constants ─────────────────────────────────────────────────
export const STYLE = {
  cardRadius: '20px',
  innerRadius: '14px',
  progressHeight: '6px',
  iconSize: 20,
  iconStroke: 1.8,
  titleSize: '15px',
  valueSize: '28px',
  labelSize: '12px',
  cardPadding: 'p-5',
  cardGap: 'gap-4',
}

// ── Workout YouTube Videos ──────────────────────────────────────────────────
export const WORKOUT_VIDEOS = {
  'Отжимания': 'https://youtube.com/watch?v=IODxDxX7oi4',
  'Тяга гантелей в наклоне': 'https://youtube.com/watch?v=roCP6wCXPqo',
  'Жим гантелей сидя': 'https://youtube.com/watch?v=qEwKCR5JCog',
  'Сгибание рук с гантелями': 'https://youtube.com/watch?v=ykJmrZ5v0Oo',
  'Планка': 'https://youtube.com/watch?v=ASdvN_XEl_c',
  'Приседания': 'https://youtube.com/watch?v=aclHkVaku9U',
  'Выпады на месте': 'https://youtube.com/watch?v=QOVaHwm-Q6U',
  'Румынская тяга': 'https://youtube.com/watch?v=7j-2w4-P14I',
  'Подъём на носки': 'https://youtube.com/watch?v=gwLzBJYoWlI',
  'Ягодичный мостик': 'https://youtube.com/watch?v=OUgsJ8-Vi0E',
  'Бёрпи': 'https://youtube.com/watch?v=JZQA08SlJnM',
  'Скакалка': 'https://youtube.com/watch?v=FJmRQ5iTXKE',
  'Махи гирей': 'https://youtube.com/watch?v=YSxHifyI6s8',
  'Бой с тенью': 'https://youtube.com/watch?v=OLbqIGRPyC4',
  'Скалолаз': 'https://youtube.com/watch?v=nmwgirgXLYM',
}

// ── Muscle Group Tags ───────────────────────────────────────────────────────
export const MUSCLE_TAGS = {
  'Отжимания': ['Грудь', 'Трицепс'],
  'Тяга гантелей в наклоне': ['Спина', 'Бицепс'],
  'Жим гантелей сидя': ['Плечи', 'Трицепс'],
  'Сгибание рук с гантелями': ['Бицепс'],
  'Планка': ['Кор', 'Пресс'],
  'Приседания': ['Квадрицепс', 'Ягодицы'],
  'Выпады на месте': ['Квадрицепс', 'Ягодицы'],
  'Румынская тяга': ['Бицепс бедра', 'Спина'],
  'Подъём на носки': ['Икры'],
  'Ягодичный мостик': ['Ягодицы', 'Кор'],
  'Бёрпи': ['Всё тело'],
  'Скакалка': ['Кардио', 'Икры'],
  'Махи гирей': ['Всё тело', 'Кор'],
  'Бой с тенью': ['Кардио', 'Плечи'],
  'Скалолаз': ['Кор', 'Кардио'],
}

// ── Ritual Icons ────────────────────────────────────────────────────────────
const RITUAL_ICONS = {
  'Стакан воды': Droplets,
  'Медитация': Brain,
  'Зарядка': Dumbbell,
  'Холодный душ': Snowflake,
  'Дневник': BookOpen,
  'Чтение': BookOpen,
  'Планирование': Calendar,
  'Визуализация': Eye,
  'Благодарность': Heart,
  'Прогулка': Footprints,
  'Уход за кожей': Sparkles,
  'Уход за лицом': Sparkles,
  'Уход за волосами': Sparkles,
  default: Circle,
}

export function getRitualIcon(name) {
  for (const [key, Icon] of Object.entries(RITUAL_ICONS)) {
    if (key !== 'default' && name && name.toLowerCase().includes(key.toLowerCase())) return Icon
  }
  return RITUAL_ICONS.default
}

// ── Weekly Workout Schedule ─────────────────────────────────────────────────
export const WEEKLY_SCHEDULE = {
  monday: {
    label: 'Понедельник — Верх тела', short: 'Пн', type: 'upper',
    icon: Dumbbell, color: '#7B61FF',
    exercises: [
      { name: 'Отжимания', sets: 4, reps: '12-15', rest: 60 },
      { name: 'Тяга гантелей в наклоне', sets: 4, reps: '10-12', rest: 90 },
      { name: 'Жим гантелей сидя', sets: 3, reps: '10-12', rest: 90 },
      { name: 'Сгибание рук с гантелями', sets: 3, reps: '12-15', rest: 60 },
      { name: 'Планка', sets: 3, reps: '45 сек', rest: 45 },
    ],
  },
  wednesday: {
    label: 'Среда — Низ тела', short: 'Ср', type: 'lower',
    icon: Footprints, color: '#22c55e',
    exercises: [
      { name: 'Приседания', sets: 4, reps: '12-15', rest: 90 },
      { name: 'Выпады на месте', sets: 3, reps: '12 на ногу', rest: 90 },
      { name: 'Румынская тяга', sets: 4, reps: '10-12', rest: 90 },
      { name: 'Подъём на носки', sets: 3, reps: '15-20', rest: 45 },
      { name: 'Ягодичный мостик', sets: 3, reps: '15', rest: 60 },
    ],
  },
  friday: {
    label: 'Пятница — Кардио + Функционал', short: 'Пт', type: 'cardio',
    icon: Flame, color: '#f97316',
    exercises: [
      { name: 'Бёрпи', sets: 4, reps: '10', rest: 60 },
      { name: 'Скакалка', sets: 3, reps: '2 мин', rest: 45 },
      { name: 'Махи гирей', sets: 4, reps: '15', rest: 60 },
      { name: 'Бой с тенью', sets: 3, reps: '3 мин', rest: 60 },
      { name: 'Скалолаз', sets: 3, reps: '20', rest: 45 },
    ],
  },
}

export const WORKOUT_DAYS = ['monday', 'wednesday', 'friday']

export const STRETCHING_SUGGESTIONS = [
  { name: 'Растяжка бёдер и ягодиц', duration: '5 мин', icon: Footprints },
  { name: 'Растяжка спины и плеч', duration: '5 мин', icon: Activity },
  { name: 'Йога — Приветствие солнцу', duration: '10 мин', icon: Sunrise },
  { name: 'Дыхательная гимнастика', duration: '5 мин', icon: Heart },
  { name: 'Пенный ролик — всё тело', duration: '10 мин', icon: Target },
]

// ── Meal Plan ───────────────────────────────────────────────────────────────
export const MEAL_PLAN = [
  { id: 1, time: '07:40', timeEnd: '08:10', type: 'breakfast', name: 'Овсянка с бананом, орехами и протеином', cal: 480, protein: 35, carbs: 62, fat: 14, icon: Sunrise,
    ingredients: ['Овсяные хлопья 80г', 'Банан 1 шт', 'Грецкие орехи 15г', 'Протеин сывороточный 25г', 'Мёд 1 ч.л.'] },
  { id: 2, time: '10:30', timeEnd: '10:45', type: 'snack', name: 'Греческий йогурт с ягодами и семенами', cal: 220, protein: 22, carbs: 20, fat: 7, icon: Coffee,
    ingredients: ['Йогурт греческий 5% — 200г', 'Черника 50г', 'Семена чиа 10г'] },
  { id: 3, time: '13:00', timeEnd: '13:40', type: 'lunch', name: 'Куриная грудка с рисом и овощами', cal: 580, protein: 52, carbs: 60, fat: 12, icon: Sun,
    ingredients: ['Куриная грудка 200г', 'Рис бурый 100г', 'Брокколи 100г', 'Морковь 50г', 'Оливковое масло 1 ч.л.'] },
  { id: 4, time: '16:00', timeEnd: '16:15', type: 'snack', name: 'Творог с яблоком и корицей', cal: 210, protein: 28, carbs: 18, fat: 4, icon: Zap,
    ingredients: ['Творог 2% — 180г', 'Яблоко 1 шт', 'Корица'] },
  { id: 5, time: '19:00', timeEnd: '19:40', type: 'dinner', name: 'Лосось с киноа и салатом', cal: 460, protein: 38, carbs: 40, fat: 16, icon: Moon,
    ingredients: ['Лосось филе 180г', 'Киноа 80г', 'Авокадо 50г', 'Микс-салат 80г', 'Лимонный сок'] },
]
export const MEAL_TOTALS = { cal: 1950, protein: 175, carbs: 200, fat: 53 }
export const PROTEIN_TARGET = 163

// ── Nav Config (grouped) ─────────────────────────────────────────────────────
export const NAV_GROUPS = [
  { title: 'День', items: [
    { id: 'dashboard', label: 'Дашборд', icon: Home },
    { id: 'plan', label: 'План дня', icon: Calendar },
    { id: 'deepwork', label: 'Глубокая работа', icon: Brain },
  ]},
  { title: 'Здоровье', items: [
    { id: 'rituals', label: 'Ритуалы', icon: Sun },
    { id: 'workout', label: 'Тренировки', icon: Dumbbell },
    { id: 'nutrition', label: 'Питание', icon: Utensils },
    { id: 'supplements', label: 'БАДы', icon: Pill },
  ]},
  { title: 'Рост', items: [
    { id: 'tm', label: 'Уровень TM', icon: Award },
    { id: 'goals', label: 'Цели', icon: Target },
    { id: 'stats', label: 'Статистика', icon: BarChart3 },
  ]},
]

// Flat list for mobile drawer (backward compat)
export const NAV = NAV_GROUPS.flatMap(g => g.items)

// ── Deep Work Daily Tasks ───────────────────────────────────────────────────
export const DAILY_TASKS = {
  0: [
    { title: 'Планирование недели', category: 'strategy', duration: 60,
      steps: ['Просмотреть результаты прошлой недели — что выполнено, что нет', 'Определить 3 главных цели на неделю (бизнес, здоровье, личное)', 'Разбить цели на ежедневные задачи с конкретными deliverables', 'Назначить время для каждого Deep Work блока (минимум 3ч/день)', 'Записать план в Planner и синхронизировать с Google Calendar', 'Визуализировать идеальную неделю — записать как будет выглядеть пятница'] },
    { title: 'Стратегия CrossFi — еженедельный обзор', category: 'business', duration: 90,
      steps: ['Открыть дашборд: проверить TVL, MAU, DAU, transaction volume', 'Проанализировать конкурентов (RedotPay, Gnosis Pay, Holyheld) — новые фичи', 'Обновить investor pipeline — новые лиды, статусы переговоров', 'Подготовить weekly update для команды с метриками и приоритетами', 'Определить 3 блокера и назначить ответственных за каждый', 'Составить short-list решений для критического блокера №1'] },
    { title: 'Обучение и развитие', category: 'learning', duration: 45,
      steps: ['Прочитать 30 страниц бизнес-книги (без отвлечений, телефон в режиме DND)', 'Записать 3 ключевых инсайта в формате «инсайт → как применить»', 'Выбрать 1 инсайт и составить план применения к CrossFi/Wellex', 'Обновить заметки и reading log в Notion/Planner', 'Поделиться 1 инсайтом с командой в Telegram'] },
  ],
  1: [
    { title: 'CrossFi P1 — продвижение запуска', category: 'business', duration: 90,
      steps: ['Провести standup с dev командой (15 мин) — блокеры, прогресс, план', 'Открыть Jira/Notion — проверить статус всех P1 тасков', 'Выписать 3 блокера, которые замедляют запуск, и решить лично', 'Написать сообщение команде с приоритетами на эту неделю', 'Проверить timeline: дедлайн март 2026 — что осталось?', 'Обновить roadmap документ с актуальными датами'] },
    { title: 'LP Grow — investor outreach', category: 'business', duration: 90,
      steps: ['Обновить pitch deck: вставить свежие метрики и скриншоты', 'Написать 5 персонализированных писем инвесторам (не шаблон!)', 'Провести 1-2 investor call — подготовить talking points заранее', 'Обновить CRM: статусы, заметки, next actions по каждому контакту', 'Follow-up по всем контактам последних 2 недель', 'Проанализировать конверсию pipeline: сколько leads → meetings → termsheets'] },
    { title: 'Wellex — контроль разработки', category: 'business', duration: 60,
      steps: ['Review прогресса по мобильному приложению — sprint board', 'Тестировать последнюю сборку браслета — записать 5 багов/улучшений', 'Проверить UX флоу регистрации от начала до конца', 'Дать детальный фидбек команде дизайнеров в Figma', 'Обновить roadmap и проверить alignment с маркетинг-планом'] },
  ],
  2: [
    { title: 'Нетворкинг — стратегические контакты', category: 'networking', duration: 90,
      steps: ['Определить 3 ключевых контакта: кто может помочь с текущими целями', 'Подготовить персональное сообщение каждому (не copy-paste)', 'LinkedIn: написать 1 экспертный пост + 10 значимых комментариев', 'Провести 1-2 networking call — подготовить вопросы заранее', 'Записать результаты: что обсудили, какие next steps', 'Добавить новые контакты в CRM с тегами и заметками'] },
    { title: 'Маркетинг CrossFi — контент и KOLs', category: 'business', duration: 90,
      steps: ['Написать или утвердить 3 поста для Twitter/LinkedIn/Telegram', 'Связаться с 5 KOL — предложить коллаборацию с конкретным оффером', 'Проанализировать метрики контента прошлой недели: views, engagement, CTR', 'Обновить маркетинговый календарь на следующие 2 недели', 'Подготовить PR материалы: пресс-релиз, медиа-кит', 'Проверить community metrics: рост подписчиков, активность в чатах'] },
    { title: 'Wellex partnership program', category: 'business', duration: 60,
      steps: ['Просмотреть активность партнёрской сети — кто продаёт, кто нет', 'Подготовить обучающий контент для партнёров (видео или PDF)', 'Созвониться с top-3 партнёрами — узнать проблемы и потребности', 'Оптимизировать реферальные материалы по фидбеку', 'Обновить FAQ и Knowledge Base партнёрской программы'] },
  ],
  3: [
    { title: 'CrossFi продукт — UX и фичи', category: 'business', duration: 90,
      steps: ['Product review с командой (30 мин) — demo новых фич', 'Тестировать каждую новую фичу лично — записать UX проблемы', 'Приоритизировать backlog на следующий спринт по ICE scoring', 'Решить UX-проблемы по фидбеку users — top 3 pain points', 'Обновить product roadmap с реалистичными сроками', 'Проверить аналитику: воронка, retention, drop-off points'] },
    { title: 'Финансовая модель и метрики', category: 'business', duration: 90,
      steps: ['Обновить финмодель с актуальными данными за прошлую неделю', 'Проверить ключевые метрики: TVL, revenue, user growth, CAC, LTV', 'Сравнить план vs факт — выделить отклонения более 10%', 'Подготовить 1-2 слайда для investor deck с графиками', 'Определить 3 области для оптимизации unit-экономики', 'Пересчитать runway при текущем burn rate'] },
    { title: 'Регуляторика и compliance', category: 'business', duration: 60,
      steps: ['Status check: EMI лицензия — текущий этап, что нужно от нас', 'Проверить прогресс по smart contract audit — comments resolved?', 'Позвонить legal team — обсудить открытые вопросы', 'Обновить compliance checklist с актуальными статусами', 'Подготовить и отправить недостающие документы', 'Проверить KYC/AML процессы — всё ли работает корректно'] },
  ],
  4: [
    { title: 'Team leadership — all-hands и 1-on-1', category: 'business', duration: 90,
      steps: ['Провести weekly all-hands (30 мин) — wins, challenges, priorities', 'Провести 2-3 critical 1-on-1 с key people — фидбек и поддержка', 'Решить HR вопросы: найм (кого ищем), retention (кто в зоне риска)', 'Дать конструктивный фидбек по ключевым deliverables', 'Обновить org chart и распределение ответственности', 'Проверить team morale — есть ли скрытые проблемы'] },
    { title: 'Investor relations + fundraising', category: 'business', duration: 90,
      steps: ['Подготовить monthly investor update с метриками и highlights', 'Провести 2 investor meeting/call — заранее research по фонду', 'Обновить term sheet если есть новые предложения', 'Follow-up с warm leads — конкретный ask в каждом письме', 'Анализ конкурентных раундов — кто поднял, сколько, от кого', 'Обновить fundraising tracker: pipeline, stages, probability'] },
    { title: 'Стратегическое мышление', category: 'strategy', duration: 60,
      steps: ['30 мин глубокого размышления (без телефона, с блокнотом)', 'Записать 3 стратегические идеи для роста бизнеса', 'Оценить каждую идею: impact (1-10) vs effort (1-10)', 'Выбрать 1 идею для реализации на следующей неделе', 'Записать action plan: кто, что, когда, какой результат', 'Поделиться идеей с 1 доверенным советником для валидации'] },
  ],
  5: [
    { title: 'Weekly review — метрики и результаты', category: 'strategy', duration: 90,
      steps: ['Собрать все KPI за неделю в единый дашборд/документ', 'Сравнить с целями: что достигнуто, что нет и почему', 'Определить 3 главных wins и записать что к ним привело', 'Определить 3 области для улучшения с конкретными actions', 'Подготовить отчёт для себя и команды — отправить в конце дня', 'Обновить OKRs и квартальные цели по результатам недели'] },
    { title: 'CrossFi/Wellex — блокеры и решения', category: 'business', duration: 90,
      steps: ['Составить полный список всех текущих блокеров по обоим проектам', 'Приоритизировать по impact: что блокирует больше всего людей/процессов', 'Для каждого блокера: определить кто решает, когда, как', 'Назначить ответственных и проверить что они согласны', 'Поставить чёткие дедлайны — всё должно быть resolved к понедельнику', 'Запланировать check-in на понедельник утром по каждому блокеру'] },
    { title: 'Планирование следующей недели', category: 'strategy', duration: 45,
      steps: ['Записать 3 главные цели на следующую неделю (SMART формат)', 'Распределить задачи по дням с учётом энергии и встреч', 'Забронировать 3-4 часа Deep Work ежедневно в календаре', 'Запланировать все встречи заранее и отправить приглашения', 'Очистить inbox: ответить, делегировать или архивировать всё', 'Подготовить среду: зарядить устройства, обновить приложения'] },
  ],
  6: [
    { title: 'Личное развитие — книга или курс', category: 'learning', duration: 60,
      steps: ['Выбрать книгу или курс по интересу — что давно хотел изучить', 'Читать/смотреть 45 мин без перерывов (режим DND)', 'Записать 3 ключевых инсайта в блокнот', 'Подумать как 1 инсайт применить на практике на следующей неделе', 'Обновить reading list — что дальше?'] },
    { title: 'Нетворкинг — неформальные контакты', category: 'networking', duration: 45,
      steps: ['Связаться с 1-2 друзьями из бизнес-среды — давно не общались', 'Неформальный кофе или звонок — без agenda, просто разговор', 'Обменяться идеями и инсайтами за неделю', 'Записать интересные мысли и возможные коллаборации', 'Отправить follow-up с благодарностью и полезной ссылкой'] },
    { title: 'Рефлексия недели + TM Progress', category: 'mindset', duration: 30,
      steps: ['Просмотреть все итоги дней за неделю — общая картина', 'Оценить прогресс по TM уровню — что прокачал, что просело', 'Записать главный урок недели одним предложением', 'Поставить intention на следующую неделю — 1 фокус для роста', 'Медитация благодарности 5 мин — за что благодарен на этой неделе'] },
  ],
}

// ── Motivational Quotes ─────────────────────────────────────────────────────
export const QUOTES = [
  { text: 'Дисциплина — это мост между целями и достижениями.', author: 'Джим Рон' },
  { text: 'Каждое утро — это шанс стать лучшей версией себя.', author: 'Хэл Элрод' },
  { text: 'Будь жёстким к себе — и жизнь станет мягче.', author: 'Зиг Зиглар' },
  { text: 'Ты не поднимешься до уровня своих целей. Ты опустишься до уровня своих систем.', author: 'Джеймс Клир' },
  { text: 'Сила не в том, чтобы никогда не падать, а в том, чтобы каждый раз подниматься.', author: 'Конфуций' },
  { text: 'Начни с того, что необходимо; затем делай, что возможно; и вдруг ты уже делаешь невозможное.', author: 'Франциск Ассизский' },
  { text: 'Мы — то, что мы делаем постоянно. Совершенство — не действие, а привычка.', author: 'Аристотель' },
  { text: 'Через год ты пожалеешь, что не начал сегодня.', author: 'Карен Лэмб' },
  { text: 'Всё, что можно измерить, можно улучшить.', author: 'Питер Друкер' },
  { text: 'Мечтай масштабно. Начни с малого. Действуй прямо сейчас.', author: 'Робин Шарма' },
  { text: 'Успех — это сумма маленьких усилий, повторяемых день за днём.', author: 'Роберт Кольер' },
  { text: 'Боль дисциплины легче боли сожаления.', author: 'Джим Рон' },
]
