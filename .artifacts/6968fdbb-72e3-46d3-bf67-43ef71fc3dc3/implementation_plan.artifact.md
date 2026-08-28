# Debugging Plan - AI Interview Coach Registration

The user is facing a "Registration failed" error on the deployed application. I have identified a critical JSON serialization error in the backend and will also improve the connection robustness.

## User Review Required

> [!IMPORTANT]
> I am fixing a backend crash (500 error) caused by trying to return a database object directly in the registration response. This will require a redeploy on Render.

## Proposed Changes

### Backend (Fixing the 500 Error)

#### [MODIFY] [auth.py](file:///C:/Users/sanka/OneDrive/Documents/Ai%20interview%20coach/backend/app/api/routes/auth.py)
- Update the `/register` endpoint to return a JSON-compatible dictionary. I will use the `User` schema to serialize the user object.
- Add logging to catch and print database errors.

#### [MODIFY] [main.py](file:///C:/Users/sanka/OneDrive/Documents/Ai%20interview%20coach/backend/app/main.py)
- Update the `/health` endpoint to verify the database connection.

### Frontend (Improving Error Visibility)

#### [MODIFY] [authService.ts](file:///C:/Users/sanka/OneDrive/Documents/Ai%20interview%20coach/frontend/src/services/authService.ts)
- Improve error parsing to correctly display "Internal Server Error" or "Database Error" if the backend fails.
- Ensure the `API_URL` is perfectly formatted.

## Verification Plan

### Manual Verification
1. Push changes to GitHub.
2. Verify Backend: Visit `https://ai-interview-coach-jzjh.onrender.com/health`. It should return `{"status": "ok", "database": "connected"}`.
3. Verify Frontend: Attempt registration on the Vercel link.
4. If it fails, check the browser console (F12) for the new detailed logs.
