# Deployment Guide (No Credit Card Required)

Render requires a credit card to use "Blueprints". To avoid this, we will deploy the Database and Backend **manually**.

---

## Step 1: Create a Free Database (Neon.tech)
Neon is a great free PostgreSQL provider that does **not** require a credit card.

1.  Go to [Neon.tech](https://neon.tech) and sign up.
2.  Create a new project named `ai-interview-coach`.
3.  In the Dashboard, you will see a **Connection String**. It looks like this:
    `postgresql://alex:AbC123dEf@ep-cool-darkness-123456.us-east-2.aws.neon.tech/neondb?sslmode=require`
4.  **Copy this string.** This is your `DATABASE_URL`.

---

## Step 2: Deploy the Backend (Render Manual)
We will create a standard Web Service instead of a Blueprint.

1.  Go to [dashboard.render.com](https://dashboard.render.com).
2.  Click **New +** and select **Web Service**.
3.  Connect your GitHub repository: `sankargowrri-blip/AI-INTERVIEW-COACH`.
4.  **Configure the Service**:
    - **Name**: `ai-interview-coach-backend`
    - **Environment**: `Python 3`
    - **Root Directory**: `backend` (Important!)
    - **Build Command**: `pip install -r requirements.txt`
    - **Start Command**: `alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5.  **Environment Variables**:
    - Click **Advanced** and then **Add Environment Variable**:
        - `DATABASE_URL`: (Paste the link from Neon.tech in Step 1)
        - `JWT_SECRET_KEY`: (Type a random long string)
        - `AI_API_KEY`: (Your Gemini/OpenAI key)
        - `AI_PROVIDER`: `gemini` (or `openai`)
6.  **Select Plan**: Scroll down and select the **Free** plan.
7.  Click **Create Web Service**.

---

## Step 3: Deploy the Frontend (Vercel)
1.  Go to [vercel.com/new](https://vercel.com/new).
2.  Import your repository.
3.  **Root Directory**: Edit and select the `frontend` folder.
4.  **Environment Variables**:
    - `VITE_API_URL`: (Paste your Render Backend URL once it's live).
5.  Click **Deploy**.

---

### **Summary**
By using **Neon.tech** for the database and **Manual Web Service** on Render, you bypass the credit card requirement entirely.

Let me know once you have the Neon database link or if you hit any errors during the manual Render setup!
