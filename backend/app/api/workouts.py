"""Workouts CRUD + beginner program."""
import json
from datetime import date
from fastapi import APIRouter
from pydantic import BaseModel
from app.database import get_db

router = APIRouter(prefix="/workouts", tags=["workouts"])

BEGINNER_PROGRAM = {
    "name": "Программа для новичка (3x/нед)",
    "description": "Первый месяц — лёгкие веса, фокус на технику",
    "schedule": [
        {
            "day": "monday", "label": "Понедельник — Верх тела",
            "exercises": [
                {"name": "Отжимания", "sets": 3, "reps": "10-12", "rest": "60с", "notes": "Можно с колен"},
                {"name": "Тяга гантелей в наклоне", "sets": 3, "reps": "10-12", "rest": "60с", "notes": "Лёгкий вес"},
                {"name": "Жим гантелей сидя", "sets": 3, "reps": "10", "rest": "60с", "notes": ""},
                {"name": "Сгибание рук с гантелями", "sets": 2, "reps": "12", "rest": "45с", "notes": ""},
                {"name": "Планка", "sets": 3, "reps": "30с", "rest": "30с", "notes": ""},
            ],
        },
        {
            "day": "wednesday", "label": "Среда — Низ тела",
            "exercises": [
                {"name": "Приседания", "sets": 3, "reps": "12-15", "rest": "60с", "notes": "Без веса или с лёгкими гантелями"},
                {"name": "Выпады на месте", "sets": 3, "reps": "10 на ногу", "rest": "60с", "notes": ""},
                {"name": "Румынская тяга с гантелями", "sets": 3, "reps": "12", "rest": "60с", "notes": "Лёгкий вес, фокус на технику"},
                {"name": "Подъём на носки", "sets": 3, "reps": "15", "rest": "30с", "notes": ""},
                {"name": "Ягодичный мост", "sets": 3, "reps": "15", "rest": "45с", "notes": ""},
            ],
        },
        {
            "day": "friday", "label": "Пятница — Кардио + Функционал",
            "exercises": [
                {"name": "Прыжки на месте (Jumping Jacks)", "sets": 3, "reps": "30с", "rest": "30с", "notes": ""},
                {"name": "Бёрпи (облегчённые)", "sets": 3, "reps": "8", "rest": "60с", "notes": "Без прыжка если тяжело"},
                {"name": "Скалолаз (Mountain Climbers)", "sets": 3, "reps": "20с", "rest": "40с", "notes": ""},
                {"name": "Приседания с прыжком", "sets": 3, "reps": "10", "rest": "45с", "notes": ""},
                {"name": "Планка с касанием плеч", "sets": 3, "reps": "20с", "rest": "30с", "notes": ""},
            ],
        },
    ],
}


class WorkoutCreate(BaseModel):
    date: str
    type: str = "upper"
    exercises: str = "[]"
    duration_min: int = 60
    intensity: str = "medium"
    notes: str = ""


class WorkoutUpdate(BaseModel):
    exercises: str | None = None
    duration_min: int | None = None
    intensity: str | None = None
    notes: str | None = None
    completed: bool | None = None


@router.get("/program")
def get_program():
    return BEGINNER_PROGRAM


@router.get("")
def list_workouts(date_filter: str | None = None, limit: int = 30):
    with get_db() as db:
        if date_filter:
            rows = db.execute("SELECT * FROM workouts WHERE date = ? ORDER BY created_at DESC", (date_filter,)).fetchall()
        else:
            rows = db.execute("SELECT * FROM workouts ORDER BY date DESC LIMIT ?", (limit,)).fetchall()
    return [dict(r) for r in rows]


@router.post("")
def create_workout(req: WorkoutCreate):
    with get_db() as db:
        cur = db.execute(
            "INSERT INTO workouts (date, type, exercises, duration_min, intensity, notes) VALUES (?,?,?,?,?,?)",
            (req.date, req.type, req.exercises, req.duration_min, req.intensity, req.notes),
        )
    return {"id": cur.lastrowid}


@router.put("/{workout_id}")
def update_workout(workout_id: int, req: WorkoutUpdate):
    updates, values = [], []
    for field in ["exercises", "duration_min", "intensity", "notes"]:
        val = getattr(req, field)
        if val is not None:
            updates.append(f"{field} = ?")
            values.append(val)
    if req.completed is not None:
        updates.append("completed = ?")
        values.append(1 if req.completed else 0)
    if not updates:
        return {"ok": True}
    values.append(workout_id)
    with get_db() as db:
        db.execute(f"UPDATE workouts SET {', '.join(updates)} WHERE id = ?", values)
    return {"ok": True}


@router.post("/{workout_id}/complete")
def complete_workout(workout_id: int):
    with get_db() as db:
        db.execute("UPDATE workouts SET completed = 1 WHERE id = ?", (workout_id,))
    return {"ok": True}
