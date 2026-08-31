# Implementation Plan - Fix Backend Bugs & Improve Deployment Config

The goal is to fix identified bugs in the backend authentication and AI service configuration, and provide the user with the necessary links for deployment.

## User Review Required

> [!IMPORTANT]
> I will be updating the backend's `tokenUrl` and API key handling. These changes are necessary for the API documentation and AI features to work correctly in production.

## Proposed Changes

### Backend Core

#### [MODIFY] [config.py](file:///C:/Users/sanka/OneDrive/Documents/Ai%20interview%20coach/backend/app/core/config.py)
- Add `AI_API_KEY` to the `Settings` class to handle the generic environment variable used in `render.yaml`.

#### [MODIFY] [deps.py](file:///C:/Users/sanka/OneDrive/Documents/Ai%20interview%20coach/backend/app/api/deps.py)
- Fix the `tokenUrl` in `OAuth2PasswordBearer` to use a relative path `/api/auth/login` instead of an invalid path based on the project name.

### Backend Services

#### [MODIFY] [ai_service.py](file:///C:/Users/sanka/OneDrive/Documents/Ai%20interview%20coach/backend/app/services/ai_service.py)
- Update the initialization logic to use `AI_API_KEY` as a fallback for both OpenAI and Gemini providers.

### Backend Main

#### [MODIFY] [main.py](file:///C:/Users/sanka/OneDrive/Documents/Ai%20interview%20coach/backend/app/main.py)
- Improve the health check endpoint to be more robust.
- Update CORS to be more flexible for production.

## Verification Plan

### Automated Tests
- I will verify the changes by reviewing the code logic.
- The user can verify by running the backend locally and checking the `/docs` endpoint.

### Manual Verification
1. Start the backend: `cd backend && uvicorn app.main:app --reload`.
2. Visit `http://localhost:8000/docs` and verify the "Authorize" button points to the correct URL.
3. Test the `/health` endpoint.
