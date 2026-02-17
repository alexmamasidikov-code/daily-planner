"""AI-powered daily plan generation via OpenRouter."""
import json
import re
import httpx
from app.config import OPENROUTER_API_KEY, OPENROUTER_BASE_URL, PLANNER_MODEL


PLAN_SYSTEM_PROMPT = """Ты — элитный лайф-коуч и стратег личного развития. Создаёшь конкретные, выполнимые ежедневные планы.

Правила:
- Каждая задача КОНКРЕТНА (не "почитать", а "прочитать 20 страниц книги X")
- Задачи привязаны к временным слотам
- Баланс: здоровье, бизнес, обучение, нетворкинг, отдых
- Учитывай уровень энергии (1-10): низкий = легче задачи утром, сложные после обеда
- Прогрессия: каждый день чуть сложнее предыдущего
- Фокус на 3 главных задачах дня (Big 3)

Категории:
- 🏋️ health — физическое здоровье, спорт, питание, сон
- 💼 business — работа, проекты, встречи, стратегия
- 📚 learning — чтение, курсы, новые навыки
- 🤝 networking — связи, нетворкинг, коммуникации
- 🧘 mindset — медитация, рефлексия, ментальное здоровье
- 🎯 personal — личные проекты, хобби, творчество

Ответ СТРОГО в JSON формате."""

PLAN_USER_TEMPLATE = """Создай план на {date} ({weekday}).

Фокус дня: {focus}
Уровень энергии: {energy}/10
Активные цели: {goals}
Текущие привычки: {habits}
Вчерашние результаты: {yesterday_summary}

Ответь в JSON:
{{
  "big_three": ["задача 1", "задача 2", "задача 3"],
  "tasks": [
    {{
      "category": "health|business|learning|networking|mindset|personal",
      "title": "Конкретная задача",
      "description": "Детальное описание как выполнить",
      "time_slot": "07:00-07:30",
      "duration_min": 30,
      "priority": 1-3
    }}
  ],
  "daily_tip": "Совет дня для максимальной продуктивности",
  "evening_routine": "Рекомендация на вечер"
}}

Сгенерируй 8-12 задач, распределённых по всему дню (с 7:00 до 22:00).
Приоритет: 1=критично, 2=важно, 3=полезно."""


WEEKDAYS_RU = {
    0: "Понедельник", 1: "Вторник", 2: "Среда", 3: "Четверг",
    4: "Пятница", 5: "Суббота", 6: "Воскресенье"
}


async def generate_daily_plan(
    date: str,
    weekday: int,
    focus: str = "",
    energy_level: int = 7,
    goals: list[dict] | None = None,
    habits: list[dict] | None = None,
    yesterday_summary: str = "",
) -> dict:
    """Generate AI-powered daily plan."""
    goals_text = ", ".join(g["title"] for g in (goals or [])) or "Не заданы"
    habits_text = ", ".join(h["title"] for h in (habits or [])) or "Не заданы"

    user_msg = PLAN_USER_TEMPLATE.format(
        date=date,
        weekday=WEEKDAYS_RU.get(weekday, ""),
        focus=focus or "Общее развитие",
        energy=energy_level,
        goals=goals_text,
        habits=habits_text,
        yesterday_summary=yesterday_summary or "Нет данных",
    )

    async with httpx.AsyncClient(timeout=60.0) as client:
        resp = await client.post(
            f"{OPENROUTER_BASE_URL}/chat/completions",
            headers={
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": PLANNER_MODEL,
                "messages": [
                    {"role": "system", "content": PLAN_SYSTEM_PROMPT},
                    {"role": "user", "content": user_msg},
                ],
                "temperature": 0.7,
                "max_tokens": 3000,
            },
        )
        resp.raise_for_status()
        content = resp.json()["choices"][0]["message"]["content"]

    return _parse_json(content)


def _parse_json(text: str) -> dict:
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass
    match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(1))
        except json.JSONDecodeError:
            pass
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(0))
        except json.JSONDecodeError:
            pass
    return {"error": "Failed to parse AI response"}
