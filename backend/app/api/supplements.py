"""Supplements CRUD + daily logging."""
from datetime import date
from fastapi import APIRouter
from pydantic import BaseModel
from app.database import get_db

router = APIRouter(prefix="/supplements", tags=["supplements"])


class SupplementCreate(BaseModel):
    name: str
    dosage: str = ""
    time_of_day: str = ""
    with_food: bool = False
    notes: str = ""


class SupplementUpdate(BaseModel):
    name: str | None = None
    dosage: str | None = None
    time_of_day: str | None = None
    with_food: bool | None = None
    notes: str | None = None
    is_active: bool | None = None


class LogRequest(BaseModel):
    date: str | None = None
    taken: bool = True


@router.get("")
def list_supplements(active_only: bool = True):
    with get_db() as db:
        q = "SELECT * FROM supplements"
        if active_only:
            q += " WHERE is_active = 1"
        q += " ORDER BY time_of_day"
        rows = db.execute(q).fetchall()
    return [dict(r) for r in rows]


@router.post("")
def create_supplement(req: SupplementCreate):
    with get_db() as db:
        cur = db.execute(
            "INSERT INTO supplements (name, dosage, time_of_day, with_food, notes) VALUES (?,?,?,?,?)",
            (req.name, req.dosage, req.time_of_day, 1 if req.with_food else 0, req.notes),
        )
    return {"id": cur.lastrowid}


@router.put("/{supp_id}")
def update_supplement(supp_id: int, req: SupplementUpdate):
    updates, values = [], []
    for field in ["name", "dosage", "time_of_day", "notes"]:
        val = getattr(req, field)
        if val is not None:
            updates.append(f"{field} = ?")
            values.append(val)
    if req.with_food is not None:
        updates.append("with_food = ?")
        values.append(1 if req.with_food else 0)
    if req.is_active is not None:
        updates.append("is_active = ?")
        values.append(1 if req.is_active else 0)
    if not updates:
        return {"ok": True}
    values.append(supp_id)
    with get_db() as db:
        db.execute(f"UPDATE supplements SET {', '.join(updates)} WHERE id = ?", values)
    return {"ok": True}


@router.delete("/{supp_id}")
def delete_supplement(supp_id: int):
    with get_db() as db:
        db.execute("DELETE FROM supplements WHERE id = ?", (supp_id,))
    return {"ok": True}


@router.post("/{supp_id}/log")
def log_supplement(supp_id: int, req: LogRequest):
    d = req.date or date.today().isoformat()
    with get_db() as db:
        db.execute(
            "INSERT OR REPLACE INTO supplement_logs (supplement_id, date, taken) VALUES (?,?,?)",
            (supp_id, d, 1 if req.taken else 0),
        )
    return {"ok": True}


@router.get("/today-status")
def today_status():
    today = date.today().isoformat()
    with get_db() as db:
        supps = db.execute("SELECT * FROM supplements WHERE is_active = 1 ORDER BY time_of_day").fetchall()
        logs = {row["supplement_id"]: bool(row["taken"]) for row in
                db.execute("SELECT supplement_id, taken FROM supplement_logs WHERE date = ?", (today,)).fetchall()}
    result = []
    for s in supps:
        result.append({**dict(s), "taken_today": logs.get(s["id"], False)})
    return {"date": today, "supplements": result, "taken": sum(1 for v in logs.values() if v), "total": len(supps)}
