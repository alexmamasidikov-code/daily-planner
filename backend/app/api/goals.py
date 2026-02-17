"""Goals and habits CRUD."""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.database import get_db

router = APIRouter(tags=["goals"])


# ── Goals ────────────────────────────────────────────────────────────────────

class GoalCreate(BaseModel):
    category: str
    title: str
    description: str = ""
    target_date: str | None = None


class GoalUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    progress: int | None = None
    is_active: bool | None = None


@router.get("/goals")
def list_goals(active_only: bool = True):
    with get_db() as db:
        if active_only:
            rows = db.execute("SELECT * FROM goals WHERE is_active = 1 ORDER BY created_at DESC").fetchall()
        else:
            rows = db.execute("SELECT * FROM goals ORDER BY is_active DESC, created_at DESC").fetchall()
    return [dict(r) for r in rows]


@router.post("/goals")
def create_goal(req: GoalCreate):
    with get_db() as db:
        cur = db.execute(
            "INSERT INTO goals (category, title, description, target_date) VALUES (?, ?, ?, ?)",
            (req.category, req.title, req.description, req.target_date),
        )
    return {"id": cur.lastrowid}


@router.patch("/goals/{goal_id}")
def update_goal(goal_id: int, req: GoalUpdate):
    updates = []
    values = []
    for field in ["title", "description", "progress", "is_active"]:
        val = getattr(req, field)
        if val is not None:
            col = field
            if field == "is_active":
                val = 1 if val else 0
            updates.append(f"{col} = ?")
            values.append(val)
    if not updates:
        return {"ok": True}
    values.append(goal_id)
    with get_db() as db:
        db.execute(f"UPDATE goals SET {', '.join(updates)} WHERE id = ?", values)
    return {"ok": True}


@router.delete("/goals/{goal_id}")
def delete_goal(goal_id: int):
    with get_db() as db:
        db.execute("DELETE FROM goals WHERE id = ?", (goal_id,))
    return {"ok": True}


# ── Habits ───────────────────────────────────────────────────────────────────

class HabitCreate(BaseModel):
    title: str
    category: str
    frequency: str = "daily"


class HabitLogCreate(BaseModel):
    completed: bool = True


@router.get("/habits")
def list_habits(active_only: bool = True):
    with get_db() as db:
        if active_only:
            rows = db.execute("SELECT * FROM habits WHERE is_active = 1 ORDER BY created_at").fetchall()
        else:
            rows = db.execute("SELECT * FROM habits ORDER BY is_active DESC, created_at").fetchall()
    return [dict(r) for r in rows]


@router.post("/habits")
def create_habit(req: HabitCreate):
    with get_db() as db:
        cur = db.execute(
            "INSERT INTO habits (title, category, frequency) VALUES (?, ?, ?)",
            (req.title, req.category, req.frequency),
        )
    return {"id": cur.lastrowid}


@router.post("/habits/{habit_id}/log/{log_date}")
def log_habit(habit_id: int, log_date: str, req: HabitLogCreate):
    with get_db() as db:
        db.execute(
            "INSERT OR REPLACE INTO habit_logs (habit_id, date, completed) VALUES (?, ?, ?)",
            (habit_id, log_date, 1 if req.completed else 0),
        )
        # Update streak
        if req.completed:
            db.execute("UPDATE habits SET streak = streak + 1 WHERE id = ?", (habit_id,))
            db.execute("UPDATE habits SET best_streak = MAX(best_streak, streak) WHERE id = ?", (habit_id,))
        else:
            db.execute("UPDATE habits SET streak = 0 WHERE id = ?", (habit_id,))
    return {"ok": True}


@router.delete("/habits/{habit_id}")
def delete_habit(habit_id: int):
    with get_db() as db:
        db.execute("DELETE FROM habits WHERE id = ?", (habit_id,))
    return {"ok": True}


# ── Reflections ──────────────────────────────────────────────────────────────

class ReflectionCreate(BaseModel):
    date: str
    wins: str = ""
    lessons: str = ""
    mood: int = 5
    productivity_score: int = 5
    notes: str = ""


@router.get("/reflections/{ref_date}")
def get_reflection(ref_date: str):
    with get_db() as db:
        row = db.execute("SELECT * FROM reflections WHERE date = ?", (ref_date,)).fetchone()
    if not row:
        raise HTTPException(404, "Reflection not found")
    return dict(row)


@router.post("/reflections")
def create_reflection(req: ReflectionCreate):
    with get_db() as db:
        db.execute(
            "INSERT OR REPLACE INTO reflections (date, wins, lessons, mood, productivity_score, notes) "
            "VALUES (?, ?, ?, ?, ?, ?)",
            (req.date, req.wins, req.lessons, req.mood, req.productivity_score, req.notes),
        )
    return {"ok": True}


# ── Stats ────────────────────────────────────────────────────────────────────

@router.get("/stats")
def get_stats():
    with get_db() as db:
        total_tasks = db.execute("SELECT COUNT(*) FROM tasks").fetchone()[0]
        completed_tasks = db.execute("SELECT COUNT(*) FROM tasks WHERE is_completed = 1").fetchone()[0]
        total_plans = db.execute("SELECT COUNT(*) FROM plans").fetchone()[0]
        active_goals = db.execute("SELECT COUNT(*) FROM goals WHERE is_active = 1").fetchone()[0]
        active_habits = db.execute("SELECT COUNT(*) FROM habits WHERE is_active = 1").fetchone()[0]
        avg_mood = db.execute("SELECT AVG(mood) FROM reflections").fetchone()[0]
        avg_productivity = db.execute("SELECT AVG(productivity_score) FROM reflections").fetchone()[0]
        # Streak: consecutive days with plans
        streak = 0
        from datetime import date, timedelta
        d = date.today()
        while True:
            plan = db.execute("SELECT id FROM plans WHERE date = ?", (d.isoformat(),)).fetchone()
            if not plan:
                break
            tasks = db.execute("SELECT COUNT(*) FROM tasks WHERE plan_id = ? AND is_completed = 1", (plan["id"],)).fetchone()[0]
            if tasks == 0:
                break
            streak += 1
            d -= timedelta(days=1)

    return {
        "total_tasks": total_tasks,
        "completed_tasks": completed_tasks,
        "completion_rate": round(completed_tasks / total_tasks * 100) if total_tasks else 0,
        "total_plans": total_plans,
        "active_goals": active_goals,
        "active_habits": active_habits,
        "avg_mood": round(avg_mood, 1) if avg_mood else None,
        "avg_productivity": round(avg_productivity, 1) if avg_productivity else None,
        "current_streak": streak,
    }
