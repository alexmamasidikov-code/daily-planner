"""Plan CRUD + AI generation endpoints."""
from datetime import date, datetime, timedelta
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from app.database import get_db
from app.services.ai_planner import generate_daily_plan

router = APIRouter(prefix="/plans", tags=["plans"])


class PlanCreate(BaseModel):
    date: str = Field(..., pattern=r"^\d{4}-\d{2}-\d{2}$")
    focus: str = Field("", max_length=500)
    energy_level: int = Field(7, ge=1, le=10)


class TaskUpdate(BaseModel):
    is_completed: bool


class TaskCreate(BaseModel):
    category: str = Field(..., max_length=50)
    title: str = Field(..., min_length=1, max_length=500)
    description: str = Field("", max_length=2000)
    time_slot: str = Field("", max_length=20)
    duration_min: int = Field(30, ge=1, le=480)
    priority: int = Field(2, ge=1, le=3)


@router.get("")
def list_plans(limit: int = 30):
    with get_db() as db:
        plans = db.execute(
            "SELECT * FROM plans ORDER BY date DESC LIMIT ?", (limit,)
        ).fetchall()
        result = []
        for p in plans:
            tasks = db.execute(
                "SELECT * FROM tasks WHERE plan_id = ? ORDER BY sort_order, time_slot",
                (p["id"],),
            ).fetchall()
            total = len(tasks)
            done = sum(1 for t in tasks if t["is_completed"])
            result.append({
                **dict(p),
                "tasks": [dict(t) for t in tasks],
                "progress": round(done / total * 100) if total else 0,
            })
        return result


@router.get("/{plan_date}")
def get_plan(plan_date: str):
    with get_db() as db:
        plan = db.execute("SELECT * FROM plans WHERE date = ?", (plan_date,)).fetchone()
        if not plan:
            raise HTTPException(404, "Plan not found")
        tasks = db.execute(
            "SELECT * FROM tasks WHERE plan_id = ? ORDER BY sort_order, time_slot",
            (plan["id"],),
        ).fetchall()
        total = len(tasks)
        done = sum(1 for t in tasks if t["is_completed"])
        return {
            **dict(plan),
            "tasks": [dict(t) for t in tasks],
            "progress": round(done / total * 100) if total else 0,
        }


@router.post("/generate")
async def generate_plan(req: PlanCreate):
    """Generate AI-powered daily plan."""
    plan_date = req.date
    weekday = datetime.strptime(plan_date, "%Y-%m-%d").weekday()

    # Get active goals and habits
    with get_db() as db:
        goals = [dict(g) for g in db.execute(
            "SELECT * FROM goals WHERE is_active = 1"
        ).fetchall()]
        habits = [dict(h) for h in db.execute(
            "SELECT * FROM habits WHERE is_active = 1"
        ).fetchall()]

        # Yesterday's summary
        yesterday = (datetime.strptime(plan_date, "%Y-%m-%d") - timedelta(days=1)).strftime("%Y-%m-%d")
        yesterday_plan = db.execute("SELECT * FROM plans WHERE date = ?", (yesterday,)).fetchone()
        yesterday_summary = ""
        if yesterday_plan:
            yt = db.execute("SELECT * FROM tasks WHERE plan_id = ?", (yesterday_plan["id"],)).fetchall()
            total = len(yt)
            done = sum(1 for t in yt if t["is_completed"])
            yesterday_summary = f"Выполнено {done}/{total} задач ({round(done/total*100) if total else 0}%)"
            reflection = db.execute("SELECT * FROM reflections WHERE date = ?", (yesterday,)).fetchone()
            if reflection:
                yesterday_summary += f". Настроение: {reflection['mood']}/10. Уроки: {reflection['lessons']}"

    # Generate plan via AI
    ai_result = await generate_daily_plan(
        date=plan_date,
        weekday=weekday,
        focus=req.focus,
        energy_level=req.energy_level,
        goals=goals,
        habits=habits,
        yesterday_summary=yesterday_summary,
    )

    if "error" in ai_result:
        raise HTTPException(500, ai_result["error"])

    # Save plan and tasks
    with get_db() as db:
        # Upsert plan
        existing = db.execute("SELECT id FROM plans WHERE date = ?", (plan_date,)).fetchone()
        if existing:
            plan_id = existing["id"]
            db.execute("UPDATE plans SET focus = ?, energy_level = ?, updated_at = datetime('now') WHERE id = ?",
                       (req.focus, req.energy_level, plan_id))
            db.execute("DELETE FROM tasks WHERE plan_id = ? AND is_ai_generated = 1", (plan_id,))
        else:
            cur = db.execute("INSERT INTO plans (date, focus, energy_level) VALUES (?, ?, ?)",
                             (plan_date, req.focus, req.energy_level))
            plan_id = cur.lastrowid

        # Insert AI tasks
        for i, task in enumerate(ai_result.get("tasks", [])):
            title = task.get("title")
            if not title:
                continue
            db.execute(
                "INSERT INTO tasks (plan_id, category, title, description, time_slot, duration_min, priority, is_ai_generated, sort_order) "
                "VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)",
                (plan_id, task.get("category", "personal"), title,
                 task.get("description", ""), task.get("time_slot", ""),
                 task.get("duration_min", 30), task.get("priority", 2), i),
            )

    return {
        "plan_id": plan_id,
        "date": plan_date,
        "big_three": ai_result.get("big_three", []),
        "daily_tip": ai_result.get("daily_tip", ""),
        "evening_routine": ai_result.get("evening_routine", ""),
        "tasks_count": len(ai_result.get("tasks", [])),
    }


@router.patch("/tasks/{task_id}")
def update_task(task_id: int, req: TaskUpdate):
    with get_db() as db:
        db.execute(
            "UPDATE tasks SET is_completed = ?, completed_at = ? WHERE id = ?",
            (1 if req.is_completed else 0,
             datetime.now().isoformat() if req.is_completed else None,
             task_id),
        )
    return {"ok": True}


@router.post("/{plan_date}/tasks")
def add_manual_task(plan_date: str, req: TaskCreate):
    with get_db() as db:
        plan = db.execute("SELECT id FROM plans WHERE date = ?", (plan_date,)).fetchone()
        if not plan:
            raise HTTPException(404, "Plan not found")
        max_order = db.execute("SELECT MAX(sort_order) FROM tasks WHERE plan_id = ?", (plan["id"],)).fetchone()[0] or 0
        cur = db.execute(
            "INSERT INTO tasks (plan_id, category, title, description, time_slot, duration_min, priority, is_ai_generated, sort_order) "
            "VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)",
            (plan["id"], req.category, req.title, req.description, req.time_slot, req.duration_min, req.priority, max_order + 1),
        )
    return {"id": cur.lastrowid}


@router.delete("/tasks/{task_id}")
def delete_task(task_id: int):
    with get_db() as db:
        db.execute("DELETE FROM tasks WHERE id = ?", (task_id,))
    return {"ok": True}
