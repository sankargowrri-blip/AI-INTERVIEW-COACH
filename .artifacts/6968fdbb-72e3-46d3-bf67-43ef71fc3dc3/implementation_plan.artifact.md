# Implementation Plan - AI Interview Coach Backend + Database

This plan outlines the steps to implement the complete backend and database for the AI Interview Coach application, integrating it with the existing React frontend.

## User Review Required

> [!IMPORTANT]
> The implementation involves setting up a Python FastAPI backend and a PostgreSQL database. Please ensure you have Python 3.9+ and PostgreSQL installed locally for development.

> [!WARNING]
> I will be replacing the mock services in the frontend with real API calls. This will break the application until the backend is running.

## Proposed Changes

### Backend Setup

#### [NEW] [backend structure](file:///C:/Users/sanka/OneDrive/Documents/Ai%20interview%20coach/backend/)
Create the directory structure as specified in the prompt, including `app/`, `core/`, `database/`, `models/`, `schemas/`, `api/`, `services/`, `utils/`, `migrations/`, `tests/`, and `uploads/`.

#### [NEW] [requirements.txt](file:///C:/Users/sanka/OneDrive/Documents/Ai%20interview%20coach/backend/requirements.txt)
Define dependencies: `fastapi`, `uvicorn`, `sqlalchemy`, `alembic`, `psycopg2-binary`, `python-multipart`, `python-jose[cryptography]`, `passlib[bcrypt]`, `pydantic-settings`, `pymupdf`, `python-docx`, `openai`, `google-generativeai`, `httpx`, `pytest`.

#### [NEW] [.env.example](file:///C:/Users/sanka/OneDrive/Documents/Ai%20interview%20coach/backend/.env.example)
Provide template for environment variables.

### Database & Models

#### [NEW] [models](file:///C:/Users/sanka/OneDrive/Documents/Ai%20interview%20coach/backend/app/models/)
Implement SQLAlchemy models: `User`, `UserProfile`, `Resume`, `Interview`, `Question`, `Answer`, `Evaluation`, `Progress`, `Practice`.

#### [NEW] [migrations](file:///C:/Users/sanka/OneDrive/Documents/Ai%20interview%20coach/backend/migrations/)
Initialize Alembic and create initial migration script.

### Services Layer

#### [NEW] [services](file:///C:/Users/sanka/OneDrive/Documents/Ai%20interview%20coach/backend/app/services/)
- `auth_service.py`: Password hashing and JWT generation.
- `resume_parser.py`: PDF/DOCX text extraction using PyMuPDF and python-docx.
- `ai_service.py`: Wrapper for Gemini/OpenAI/Groq.
- `interview_service.py`: Logic for interview flow and state management.
- `speech_service.py`: Speech-to-text integration.

### API Routes

#### [NEW] [routes](file:///C:/Users/sanka/OneDrive/Documents/Ai%20interview%20coach/backend/app/api/routes/)
Implement RESTful endpoints for Auth, Users, Resumes, Interviews, Progress, and Practice.

### Frontend Integration

#### [MODIFY] [frontend services](file:///C:/Users/sanka/OneDrive/Documents/Ai%20interview%20coach/frontend/src/services/)
Update `authService.ts`, `resumeService.ts`, `interviewService.ts`, and `progressService.ts` to use `axios` for backend communication.

#### [NEW] [.env](file:///C:/Users/sanka/OneDrive/Documents/Ai%20interview%20coach/frontend/.env)
Add `VITE_API_URL=http://localhost:8000`.

## Verification Plan

### Automated Tests
- Run `pytest` in the `backend/` directory to verify API endpoints and services.
- Verify database migrations run successfully with `alembic upgrade head`.

### Manual Verification
- Register a new user and login.
- Upload a valid resume and verify parsing.
- Start an interview, provide voice answers (simulated if necessary), and check evaluation.
- View progress charts and interview history.
