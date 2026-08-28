# AI Interview Coach Backend

FastAPI backend for the AI Interview Coach application.

## Prerequisites

- Python 3.9+
- PostgreSQL
- OpenAI API Key (or Google Gemini API Key)

## Setup

1. **Create a Virtual Environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install Dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure Environment Variables:**
   - Copy `.env.example` to `.env`.
   - Update the values in `.env` with your local configuration (database URL, API keys, etc.).

4. **Setup Database:**
   - Create a PostgreSQL database named `ai_interview_coach`.
   - Run migrations to create the schema:
     ```bash
     alembic upgrade head
     ```

## Running the Server

Start the FastAPI application using uvicorn:

```bash
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`.
Documentation can be found at `http://localhost:8000/docs`.

## Database Migrations

This project uses Alembic for database migrations.

- **Create a new migration:**
  ```bash
  alembic revision --autogenerate -m "description of changes"
  ```

- **Apply migrations:**
  ```bash
  alembic upgrade head
  ```

## Running Tests

Run the test suite using pytest:

```bash
pytest
```
