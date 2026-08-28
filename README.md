# AI Interview Coach

**Practice. Improve. Get Hired.**

AI Interview Coach is a comprehensive platform designed to help job seekers across various industries (Engineering, Finance, Marketing, HR, etc.) prepare for interviews using AI-driven simulations, resume analysis, and real-time voice interaction.

## Project Structure

- `frontend/`: React + TypeScript + Vite + Tailwind CSS
- `backend/`: FastAPI + SQLAlchemy + PostgreSQL + Alembic
- `render.yaml`: Deployment configuration for Render.com

## Technology Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Lucide Icons, Axios, Framer Motion.
- **Backend**: Python, FastAPI, Uvicorn, Pydantic.
- **Database**: PostgreSQL with SQLAlchemy ORM and Alembic migrations.
- **AI**: Gemini/OpenAI integration for question generation and evaluation.
- **Voice**: Speech-to-text processing for conversational interviews.

## Deployment Guide

### 1. Database (Neon PostgreSQL)
1. Create a free account at [Neon.tech](https://neon.tech).
2. Create a new project and database named `ai_interview_coach`.
3. Copy the **Connection String** (DATABASE_URL).

### 2. Backend (Render)
1. Create a new **Blueprint** on [Render](https://render.com).
2. Connect your GitHub repository.
3. Render will use `render.yaml` to set up the Web Service and Database (or you can use the Neon URL).
4. Set the following environment variables in Render:
   - `DATABASE_URL`: Your Neon connection string.
   - `AI_API_KEY`: Your Gemini or OpenAI API key.
   - `JWT_SECRET_KEY`: A secure random string.
   - `FRONTEND_URL`: Your Vercel deployment URL.

### 3. Frontend (Vercel)
1. Push your code to GitHub.
2. Import the project into [Vercel](https://vercel.com).
3. Set the **Root Directory** to `frontend`.
4. Add the **Environment Variable**:
   - `VITE_API_URL`: Your Render backend URL (e.g., `https://ai-interview-coach-backend.onrender.com`).
5. Deploy!

## Local Development

### Backend Setup
1. `cd backend`
2. `python -m venv venv`
3. `source venv/bin/activate` (Windows: `venv\Scripts\activate`)
4. `pip install -r requirements.txt`
5. Create `.env` from `.env.example` and fill in details.
6. `alembic upgrade head`
7. `uvicorn app.main:app --reload`

### Frontend Setup
1. `cd frontend`
2. `npm install`
3. Create `.env` with `VITE_API_URL=http://localhost:8000`
4. `npm run dev`

## Features

- **Resume Analysis**: Upload PDF/DOCX resumes for parsing and ATS-style scoring.
- **Adaptive Interviews**: Select experience level (Fresher/Experienced) and difficulty (Easy/Medium/Hard).
- **Voice-Based Interaction**: Practice speaking naturally; AI generates follow-up questions based on your answers.
- **Comprehensive Evaluation**: Get detailed feedback on technical accuracy, communication, and performance.
- **Progress Tracking**: Visualize your improvement over time with historical data.

## Security

- Secure password hashing with Bcrypt.
- JWT-based authentication for protected routes.
- CORS configuration for restricted domain access.
- Environment-based configuration for all secrets.

## License

MIT License
