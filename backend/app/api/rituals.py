"""Rituals CRUD + completion tracking."""
from datetime import date, datetime
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.database import get_db

router = APIRouter(prefix="/rituals", tags=["rituals"])


class RitualCreate(BaseModel):
    name: str
    type: str = "morning"
    description: str = ""
    time_slot: str = ""
    duration_min: int = 5
    category: str = ""
    icon: str = ""
    sort_order: int = 0


class RitualUpdate(BaseModel):
    name: str | None = None
    type: str | None = None
    description: str | None = None
    time_slot: str | None = None
    duration_min: int | None = None
    is_active: bool | None = None
    sort_order: int | None = None


class CompleteRequest(BaseModel):
    date: str | None = None


@router.get("")
def list_rituals(type: str | None = None, active_only: bool = True):
    with get_db() as db:
        q = "SELECT * FROM rituals WHERE 1=1"
        params = []
        if active_only:
            q += " AND is_active = 1"
        if type:
            q += " AND type = ?"
            params.append(type)
        q += " ORDER BY sort_order"
        rows = db.execute(q, params).fetchall()
    return [dict(r) for r in rows]


@router.post("")
def create_ritual(req: RitualCreate):
    with get_db() as db:
        cur = db.execute(
            "INSERT INTO rituals (name, type, description, time_slot, duration_min, category, icon, sort_order) VALUES (?,?,?,?,?,?,?,?)",
            (req.name, req.type, req.description, req.time_slot, req.duration_min, req.category, req.icon, req.sort_order),
        )
    return {"id": cur.lastrowid}


@router.put("/{ritual_id}")
def update_ritual(ritual_id: int, req: RitualUpdate):
    updates, values = [], []
    for field in ["name", "type", "description", "time_slot", "duration_min", "sort_order"]:
        val = getattr(req, field)
        if val is not None:
            updates.append(f"{field} = ?")
            values.append(val)
    if req.is_active is not None:
        updates.append("is_active = ?")
        values.append(1 if req.is_active else 0)
    if not updates:
        return {"ok": True}
    values.append(ritual_id)
    with get_db() as db:
        db.execute(f"UPDATE rituals SET {', '.join(updates)} WHERE id = ?", values)
    return {"ok": True}


@router.delete("/{ritual_id}")
def delete_ritual(ritual_id: int):
    with get_db() as db:
        db.execute("DELETE FROM rituals WHERE id = ?", (ritual_id,))
    return {"ok": True}


@router.post("/{ritual_id}/complete")
def complete_ritual(ritual_id: int, req: CompleteRequest):
    d = req.date or date.today().isoformat()
    with get_db() as db:
        db.execute(
            "INSERT OR REPLACE INTO ritual_completions (ritual_id, date) VALUES (?, ?)",
            (ritual_id, d),
        )
    return {"ok": True, "date": d}


@router.delete("/{ritual_id}/complete")
def uncomplete_ritual(ritual_id: int, date_str: str | None = None):
    d = date_str or date.today().isoformat()
    with get_db() as db:
        db.execute("DELETE FROM ritual_completions WHERE ritual_id = ? AND date = ?", (ritual_id, d))
    return {"ok": True}


@router.get("/today-progress")
def today_progress():
    today = date.today().isoformat()
    with get_db() as db:
        total = db.execute("SELECT COUNT(*) FROM rituals WHERE is_active = 1").fetchone()[0]
        completed = db.execute(
            "SELECT COUNT(*) FROM ritual_completions rc JOIN rituals r ON rc.ritual_id = r.id WHERE rc.date = ? AND r.is_active = 1",
            (today,),
        ).fetchone()[0]
        # Get completed ritual IDs for today
        completed_ids = [row[0] for row in db.execute(
            "SELECT ritual_id FROM ritual_completions WHERE date = ?", (today,)
        ).fetchall()]
    return {"total": total, "completed": completed, "completed_ids": completed_ids, "date": today}
