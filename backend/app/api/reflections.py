"""Day reflection + AI analysis endpoint."""
import json
import logging
import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from app.database import get_db
from app.config import OPENROUTER_API_KEY, OPENROUTER_BASE_URL, PLANNER_MODEL

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/reflections", tags=["reflections"])


class ReflectionIn(BaseModel):
    date: str = Field(..., pattern=r"^\d{4}-\d{2}-\d{2}$")
    wins: str = Field("", max_length=2000)
    lessons: str = Field("", max_length=2000)
    mood: str = Field("", max_length=50)
    rating: int = Field(0, ge=0, le=5)
    rituals_done: int = Field(0, ge=0)
    rituals_total: int = Field(0, ge=0)
    deepwork_hours: float = Field(0, ge=0)
    calories: int = Field(0, ge=0)
    overall_score: int = Field(0, ge=0, le=100)


@router.post("")
async def save_reflection(data: ReflectionIn):
    # Generate AI analysis
    ai_summary = ""
    ai_next_day = ""
    day_score = data.overall_score

    if OPENROUTER_API_KEY and (data.wins or data.lessons):
        try:
            prompt = f"""Проанализируй итоги дня пользователя и дай краткий, мотивирующий анализ.

ДАННЫЕ ДНЯ:
- Рейтинг: {data.rating}/5
- Ритуалы: {data.rituals_done}/{data.rituals_total}
- Deep Work: {data.deepwork_hours}ч
- Калории: {data.calories}
- Общий score: {data.overall_score}%
- Что получилось: {data.wins}
- Что улучшить: {data.lessons}
- Настроение: {data.mood}

ЗАДАЧИ:
1. Дай краткий итог дня (2-3 предложения). Будь конкретным, не общим.
2. Дай 3 конкретных наставления на завтра, основываясь на том что пошло хорошо и что нужно улучшить.
3. Оцени реальный score дня от 0 до 100.

Ответь СТРОГО в JSON:
{{"summary": "краткий итог дня", "next_day": ["наставление 1", "наставление 2", "наставление 3"], "score": 75}}"""

            async with httpx.AsyncClient(timeout=30) as client:
                resp = await client.post(
                    f"{OPENROUTER_BASE_URL}/chat/completions",
                    headers={"Authorization": f"Bearer {OPENROUTER_API_KEY}"},
                    json={
                        "model": PLANNER_MODEL,
                        "messages": [
                            {"role": "system", "content": "Ты — элитный лайф-коуч. Анализируешь день пользователя и даёшь конкретные рекомендации. Отвечай только JSON."},
                            {"role": "user", "content": prompt}
                        ],
                        "temperature": 0.7,
                        "max_tokens": 500
                    }
                )
                if resp.status_code == 200:
                    content = resp.json()["choices"][0]["message"]["content"]
                    content = content.strip()
                    if content.startswith("```"):
                        content = content.split("\n", 1)[1].rsplit("```", 1)[0]
                    parsed = json.loads(content)
                    ai_summary = parsed.get("summary", "")
                    next_day_list = parsed.get("next_day", [])
                    ai_next_day = "\n".join(f"• {item}" for item in next_day_list)
                    day_score = parsed.get("score", data.overall_score)
                else:
                    logger.warning("AI API returned status %d", resp.status_code)
        except (json.JSONDecodeError, KeyError, IndexError) as e:
            logger.warning("Failed to parse AI response: %s", e)
            ai_summary = "Анализ временно недоступен"
        except httpx.HTTPError as e:
            logger.warning("AI API request failed: %s", e)
            ai_summary = "Анализ временно недоступен"

    # Upsert
    with get_db() as db:
        db.execute(
            """INSERT INTO reflections (date, wins, lessons, mood, rating, ai_summary, ai_next_day, day_score)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(date) DO UPDATE SET wins=?, lessons=?, mood=?, rating=?, ai_summary=?, ai_next_day=?, day_score=?""",
            (data.date, data.wins, data.lessons, data.mood, data.rating, ai_summary, ai_next_day, day_score,
             data.wins, data.lessons, data.mood, data.rating, ai_summary, ai_next_day, day_score))

    return {"ok": True, "ai_summary": ai_summary, "ai_next_day": ai_next_day, "day_score": day_score}


@router.get("/{date_str}")
async def get_reflection(date_str: str):
    with get_db() as db:
        try:
            row = db.execute("SELECT * FROM reflections WHERE date = ?", (date_str,)).fetchone()
        except Exception as e:
            logger.exception("Error fetching reflection: %s", e)
            return None
    if not row:
        return None
    return dict(row)
