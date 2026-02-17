"""App configuration."""
import os

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
OPENROUTER_BASE_URL = os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1")
PLANNER_MODEL = os.getenv("PLANNER_MODEL", "anthropic/claude-sonnet-4.5")
DB_PATH = os.path.join(os.path.dirname(__file__), "..", "planner.db")
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5174,http://127.0.0.1:5174").split(",")
