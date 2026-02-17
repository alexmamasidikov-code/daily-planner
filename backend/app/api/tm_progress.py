"""TM Level Progress system."""
from datetime import datetime
from fastapi import APIRouter
from pydantic import BaseModel, Field
from app.database import get_db

router = APIRouter(prefix="/tm-progress", tags=["tm-progress"])

LEVELS = {
    0: {"name": "Sleep", "xp": 0},
    1: {"name": "Awakened", "xp": 100},
    2: {"name": "Seer", "xp": 300},
    3: {"name": "Builder", "xp": 600},
    4: {"name": "Sovereign", "xp": 1000},
    5: {"name": "Nexus Master", "xp": 1500},
    6: {"name": "World-Builder", "xp": 2500},
    7: {"name": "Planetary", "xp": 4000},
    8: {"name": "Legacy", "xp": 6000},
    9: {"name": "Architect", "xp": 10000},
}

XP_REWARDS = {
    "ritual_complete": 5,
    "workout_complete": 20,
    "deepwork_session": 15,
    "meditation": 10,
    "goal_complete": 50,
    "daily_plan_complete": 10,
}


class AddXP(BaseModel):
    amount: int = Field(..., ge=1, le=1000)
    source: str = "manual"


@router.get("")
def get_progress():
    with get_db() as db:
        row = db.execute("SELECT * FROM tm_progress WHERE id = 1").fetchone()
    if not row:
        return {"current_level": 0, "level_name": "Sleep", "xp_current": 0, "xp_needed": 100,
                "qualities_unlocked": "[]", "rituals_completed": 0, "days_streak": 0}
    data = dict(row)
    data["levels"] = LEVELS
    data["xp_rewards"] = XP_REWARDS
    # Calculate progress to next level
    current = data["current_level"]
    if current < 9:
        next_xp = LEVELS[current + 1]["xp"]
        curr_xp = LEVELS[current]["xp"]
        data["level_progress"] = round((data["xp_current"] - curr_xp) / (next_xp - curr_xp) * 100) if next_xp > curr_xp else 100
    else:
        data["level_progress"] = 100
    return data


@router.post("/add-xp")
def add_xp(req: AddXP):
    with get_db() as db:
        row = db.execute("SELECT * FROM tm_progress WHERE id = 1").fetchone()
        if not row:
            db.execute("INSERT INTO tm_progress (id) VALUES (1)")
            row = db.execute("SELECT * FROM tm_progress WHERE id = 1").fetchone()

        new_xp = row["xp_current"] + req.amount
        new_level = row["current_level"]
        new_name = row["level_name"]

        # Check for level up
        for lvl in range(new_level + 1, 10):
            if new_xp >= LEVELS[lvl]["xp"]:
                new_level = lvl
                new_name = LEVELS[lvl]["name"]
            else:
                break

        xp_needed = LEVELS[min(new_level + 1, 9)]["xp"] if new_level < 9 else LEVELS[9]["xp"]

        db.execute(
            "UPDATE tm_progress SET xp_current = ?, current_level = ?, level_name = ?, xp_needed = ?, updated_at = ? WHERE id = 1",
            (new_xp, new_level, new_name, xp_needed, datetime.now().isoformat()),
        )

    leveled_up = new_level > row["current_level"]
    return {"ok": True, "xp_current": new_xp, "level": new_level, "level_name": new_name, "leveled_up": leveled_up}
