from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import auth, users, resume, interviews, progress, companies, practice
from app.core.config import settings
from app.database.session import engine
from app.models.base import Base

# Create tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
)

# Set all CORS enabled origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(resume.router, prefix="/api/resumes", tags=["resumes"])
app.include_router(interviews.router, prefix="/api/interviews", tags=["interviews"])
app.include_router(progress.router, prefix="/api/progress", tags=["progress"])
app.include_router(companies.router, prefix="/api/companies", tags=["companies"])
app.include_router(practice.router, prefix="/api/practice", tags=["practice"])

@app.get("/health")
def health_check():
    return {"status": "ok"}
