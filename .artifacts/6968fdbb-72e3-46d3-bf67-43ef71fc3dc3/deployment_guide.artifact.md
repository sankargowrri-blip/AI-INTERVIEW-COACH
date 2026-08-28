# Final Deployment Guide: AI Interview Coach

I have successfully built the code and pushed it to your GitHub: [sankargowrri-blip/AI-INTERVIEW-COACH](https://github.com/sankargowrri-blip/AI-INTERVIEW-COACH). Follow these steps to get your **Public Link**.

---

## Step 1: Deploy the Backend & Database (Render)
Render will host your FastAPI server and your PostgreSQL database.

1.  **Open Render**: Go to [dashboard.render.com](https://dashboard.render.com).
2.  **Create Blueprint**: Click the **New** button and select **Blueprint**.
3.  **Connect GitHub**: Select your `AI-INTERVIEW-COACH` repository.
4.  **Configure**: Render will automatically detect the `render.yaml` file.
    - Give your group a name (e.g., `ai-interview-coach`).
    - Click **Apply**.
5.  **Set AI Keys**:
    - Once the service is created, go to the **Web Service** (backend) settings.
    - In the **Environment** tab, add `AI_API_KEY` (your Gemini or OpenAI key).
6.  **Copy Backend URL**: Once the deployment is "Live", copy the URL (e.g., `https://ai-interview-coach-api.onrender.com`).

---

## Step 2: Deploy the Frontend (Vercel)
Vercel will host your React application.

1.  **Open Vercel**: Go to [vercel.com/new](https://vercel.com/new).
2.  **Import Repo**: Find and import your `AI-INTERVIEW-COACH` repository.
3.  **Configure Project**:
    - **Root Directory**: Click "Edit" and select the `frontend` folder.
    - **Framework Preset**: Should automatically detect Vite.
4.  **Environment Variables**:
    - Add a new variable:
        - **Name**: `VITE_API_URL`
        - **Value**: (Paste the **Backend URL** you copied from Render in Step 1).
5.  **Deploy**: Click the **Deploy** button.

---

## Step 3: Verify the Public Link
1.  Once Vercel finishes, it will give you a domain (e.g., `https://ai-interview-coach.vercel.app`).
2.  Open that link!
3.  Try registering a user and uploading a resume to verify the connection.

---

## Troubleshooting
> [!IMPORTANT]
> **Database Migrations**: My `render.yaml` is configured to run `alembic upgrade head` automatically. If the backend fails to start, check the Render logs to ensure the database connection is established.

> [!WARNING]
> **CORS Errors**: If the frontend cannot talk to the backend, ensure the `FRONTEND_URL` environment variable in Render matches your Vercel URL.

 render_diffs(file:///C:/Users/sanka/OneDrive/Documents/Ai%20interview%20coach/render.yaml)
 render_diffs(file:///C:/Users/sanka/OneDrive/Documents/Ai%20interview%20coach/frontend/vercel.json)
