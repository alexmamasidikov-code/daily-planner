"""Digital Detox sessions."""
from datetime import date
from fastapi import APIRouter
from pydantic import BaseModel
from app.database import get_db

router = APIRouter(prefix="/detox", tags=["detox"])


class DetoxCreate(BaseModel):
    date: str | None = None
    start_time: str = "21:00"
    end_time: str = "07:00"
    duration_min: int = 600
    success: bool = False


class DetoxUpdate(BaseModel):
    end_time: str | None = None
    duration_min: int | None = None
    success: bool | None = None


@router.get("")
def list_sessions(limit: int = 30):
    with get_db() as db:
        rows = db.execute("SELECT * FROM detox_sessions ORDER BY date DESC LIMIT ?", (limit,)).fetchall()
    return [dict(r) for r in rows]


@router.post("")
def create_session(req: DetoxCreate):
    d = req.date or date.today().isoformat()
    with get_db() as db:
        cur = db.execute(
            "INSERT INTO detox_sessions (date, start_time, end_time, duration_min, success) VALUES (?,?,?,?,?)",
            (d, req.start_time, req.end_time, req.duration_min, 1 if req.success else 0),
        )
    return {"id": cur.lastrowid}


@router.put("/{session_id}")
def update_session(session_id: int, req: DetoxUpdate):
    updates, values = [], []
    if req.end_time is not None:
        updates.append("end_time = ?")
        values.append(req.end_time)
    if req.duration_min is not None:
        updates.append("duration_min = ?")
        values.append(req.duration_min)
    if req.success is not None:
        updates.append("success = ?")
        values.append(1 if req.success else 0)
    if not updates:
        return {"ok": True}
    values.append(session_id)
    with get_db() as db:
        db.execute(f"UPDATE detox_sessions SET {', '.join(updates)} WHERE id = ?", values)
    return {"ok": True}
