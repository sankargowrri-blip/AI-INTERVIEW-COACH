from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.api.routes import auth, users, resume, interviews, progress, companies, practice
from app.core.config import settings
from app.database.session import engine, SessionLocal
from app.models.base import Base

# Create all tables on startup (safe for SQLite dev; use Alembic for production)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    docs_url="/docs",
    redoc_url="/redoc",
)

# Build allowed origins list — supports comma-separated values in FRONTEND_URL
_raw_origin = settings.FRONTEND_URL or "*"
if _raw_origin == "*":
    _origins = ["*"]
else:
    _origins = [o.strip() for o in _raw_origin.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": f"Welcome to {settings.PROJECT_NAME} API"}


@app.get("/health")
def health_check():
    health = {"status": "ok", "database": "disconnected"}
    db = SessionLocal()
    try:
        db.execute(text("SELECT 1"))
        health["database"] = "connected"
    except Exception as e:
        health["database"] = f"error: {str(e)}"
    finally:
        db.close()
    return health


app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(resume.router, prefix="/api/resumes", tags=["resumes"])
app.include_router(interviews.router, prefix="/api/interviews", tags=["interviews"])
app.include_router(progress.router, prefix="/api/progress", tags=["progress"])
app.include_router(companies.router, prefix="/api/companies", tags=["companies"])
app.include_router(practice.router, prefix="/api/practice", tags=["practice"])
