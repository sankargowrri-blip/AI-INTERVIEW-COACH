# Render Deployment: Step-by-Step

Follow these steps to deploy your **FastAPI Backend** and **PostgreSQL Database** using the Blueprint configuration I created.

---

### **1. Access Render Blueprints**
1.  Log in to your [Render Dashboard](https://dashboard.render.com).
2.  Click the **"New +"** button at the top right.
3.  Select **"Blueprint"** from the dropdown menu.

### **2. Connect Your Repository**
1.  You will see a list of your GitHub repositories.
2.  Find and click **"Connect"** next to `sankargowrri-blip/AI-INTERVIEW-COACH`.

### **3. Configure the Blueprint**
1.  Render will automatically read the `render.yaml` file from your repo.
2.  **Service Group Name**: Enter a name like `ai-interview-coach`.
3.  Click **"Apply"**.

### **4. Monitor the Deployment**
1.  Render will now start creating two things:
    *   **Database**: A PostgreSQL instance (named `ai-interview-coach-db`).
    *   **Web Service**: Your FastAPI backend (named `ai-interview-coach-backend`).
2.  Wait for the status to turn green and say **"Live"**.

### **5. Get Your Backend URL**
1.  Once the **Web Service** is live, click on it.
2.  At the top of the page, you will see a link like `https://ai-interview-coach-backend.onrender.com`.
3.  **Copy this URL.** You will need it for the Vercel step.

### **6. Set Your AI Keys (Important!)**
1.  In the Render dashboard, click on your **`ai-interview-coach-backend`** service.
2.  Go to the **"Environment"** tab on the left.
3.  Click **"Add Environment Variable"**.
4.  Add your AI key:
    *   **Key**: `AI_API_KEY`
    *   **Value**: (Paste your Gemini or OpenAI API key here).
5.  Add the provider:
    *   **Key**: `AI_PROVIDER`
    *   **Value**: `gemini` (or `openai`).
6.  Click **"Save Changes"**. The service will restart automatically.

---

### **Next Move?**
Once you have the **Backend URL** from Step 5, go to **Vercel** and paste it into the `VITE_API_URL` environment variable for your frontend.
