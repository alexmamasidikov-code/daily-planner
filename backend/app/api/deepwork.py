"""Deep Work sessions tracking."""
from datetime import date, datetime
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.database import get_db

router = APIRouter(prefix="/deepwork", tags=["deepwork"])


class SessionCreate(BaseModel):
    date: str | None = None
    task: str
    category: str = ""
    planned_duration: int = 90
    notes: str = ""


class EndSession(BaseModel):
    focus_score: int = 7
    notes: str = ""


@router.get("")
def list_sessions(date_filter: str | None = None, limit: int = 30):
    with get_db() as db:
        if date_filter:
            rows = db.execute("SELECT * FROM deepwork_sessions WHERE date = ? ORDER BY created_at DESC", (date_filter,)).fetchall()
        else:
            rows = db.execute("SELECT * FROM deepwork_sessions ORDER BY date DESC, created_at DESC LIMIT ?", (limit,)).fetchall()
    return [dict(r) for r in rows]


@router.post("")
def create_session(req: SessionCreate):
    d = req.date or date.today().isoformat()
    with get_db() as db:
        cur = db.execute(
            "INSERT INTO deepwork_sessions (date, task, category, planned_duration, notes) VALUES (?,?,?,?,?)",
            (d, req.task, req.category, req.planned_duration, req.notes),
        )
    return {"id": cur.lastrowid}


@router.post("/{session_id}/start")
def start_session(session_id: int):
    now = datetime.now().isoformat()
    with get_db() as db:
        db.execute("UPDATE deepwork_sessions SET started_at = ? WHERE id = ?", (now, session_id))
    return {"ok": True, "started_at": now}


@router.post("/{session_id}/end")
def end_session(session_id: int, req: EndSession):
    now = datetime.now().isoformat()
    with get_db() as db:
        session = db.execute("SELECT * FROM deepwork_sessions WHERE id = ?", (session_id,)).fetchone()
        if not session:
            raise HTTPException(404, "Session not found")
        actual = 0
        if session["started_at"]:
            start = datetime.fromisoformat(session["started_at"])
            actual = int((datetime.now() - start).total_seconds() / 60)
        db.execute(
            "UPDATE deepwork_sessions SET ended_at = ?, actual_duration = ?, focus_score = ?, notes = ? WHERE id = ?",
            (now, actual, req.focus_score, req.notes or session["notes"], session_id),
        )
    return {"ok": True, "actual_duration": actual}


@router.get("/stats")
def get_stats():
    today = date.today().isoformat()
    with get_db() as db:
        # Today
        today_min = db.execute(
            "SELECT COALESCE(SUM(actual_duration), 0) FROM deepwork_sessions WHERE date = ?", (today,)
        ).fetchone()[0]
        # This week (last 7 days)
        week_min = db.execute(
            "SELECT COALESCE(SUM(actual_duration), 0) FROM deepwork_sessions WHERE date >= date(?, '-7 days')", (today,)
        ).fetchone()[0]
        # Total sessions
        total = db.execute("SELECT COUNT(*) FROM deepwork_sessions WHERE actual_duration > 0").fetchone()[0]
        avg_focus = db.execute(
            "SELECT AVG(focus_score) FROM deepwork_sessions WHERE focus_score > 0"
        ).fetchone()[0]
    return {
        "today_minutes": today_min,
        "week_minutes": week_min,
        "total_sessions": total,
        "avg_focus_score": round(avg_focus, 1) if avg_focus else 0,
    }
