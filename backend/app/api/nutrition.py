"""Nutrition/meals tracking."""
from datetime import date
from fastapi import APIRouter
from pydantic import BaseModel
from app.database import get_db

router = APIRouter(prefix="/nutrition", tags=["nutrition"])


class MealCreate(BaseModel):
    date: str
    meal_type: str = "lunch"
    description: str = ""
    calories: int = 0
    protein: float = 0
    carbs: float = 0
    fat: float = 0
    time: str = ""


@router.get("")
def list_meals(date_filter: str | None = None, limit: int = 50):
    with get_db() as db:
        if date_filter:
            rows = db.execute("SELECT * FROM meals WHERE date = ? ORDER BY time", (date_filter,)).fetchall()
        else:
            rows = db.execute("SELECT * FROM meals ORDER BY date DESC, time LIMIT ?", (limit,)).fetchall()
    return [dict(r) for r in rows]


@router.post("")
def create_meal(req: MealCreate):
    with get_db() as db:
        cur = db.execute(
            "INSERT INTO meals (date, meal_type, description, calories, protein, carbs, fat, time) VALUES (?,?,?,?,?,?,?,?)",
            (req.date, req.meal_type, req.description, req.calories, req.protein, req.carbs, req.fat, req.time),
        )
    return {"id": cur.lastrowid}


@router.delete("/{meal_id}")
def delete_meal(meal_id: int):
    with get_db() as db:
        db.execute("DELETE FROM meals WHERE id = ?", (meal_id,))
    return {"ok": True}


@router.get("/daily-summary")
def daily_summary(date_filter: str | None = None):
    d = date_filter or date.today().isoformat()
    with get_db() as db:
        row = db.execute(
            "SELECT COALESCE(SUM(calories),0) as total_calories, COALESCE(SUM(protein),0) as total_protein, "
            "COALESCE(SUM(carbs),0) as total_carbs, COALESCE(SUM(fat),0) as total_fat, COUNT(*) as meal_count "
            "FROM meals WHERE date = ?",
            (d,),
        ).fetchone()
    return {
        "date": d,
        "total_calories": row["total_calories"],
        "total_protein": round(row["total_protein"], 1),
        "total_carbs": round(row["total_carbs"], 1),
        "total_fat": round(row["total_fat"], 1),
        "meal_count": row["meal_count"],
        "targets": {"calories": 2000, "protein": 160, "carbs": 200, "fat": 70},
    }
