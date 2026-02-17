"""Daily Planner API."""
import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.database import init_db
from app.config import CORS_ORIGINS
from app.api.plans import router as plans_router
from app.api.goals import router as goals_router
from app.api.rituals import router as rituals_router
from app.api.workouts import router as workouts_router
from app.api.nutrition import router as nutrition_router
from app.api.supplements import router as supplements_router
from app.api.deepwork import router as deepwork_router
from app.api.tm_progress import router as tm_progress_router
from app.api.detox import router as detox_router
from app.api.reflections import router as reflections_router

logger = logging.getLogger(__name__)

app = FastAPI(title="Daily Planner", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["Content-Type", "Authorization"],
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.exception("Unhandled error: %s", exc)
    return JSONResponse(status_code=500, content={"detail": "Внутренняя ошибка сервера"})


app.include_router(plans_router, prefix="/api")
app.include_router(goals_router, prefix="/api")
app.include_router(rituals_router, prefix="/api")
app.include_router(workouts_router, prefix="/api")
app.include_router(nutrition_router, prefix="/api")
app.include_router(supplements_router, prefix="/api")
app.include_router(deepwork_router, prefix="/api")
app.include_router(tm_progress_router, prefix="/api")
app.include_router(detox_router, prefix="/api")
app.include_router(reflections_router, prefix="/api")


@app.on_event("startup")
def startup():
    init_db()


@app.get("/health")
def health():
    return {"status": "ok", "app": "daily-planner", "version": "2.0.0"}
