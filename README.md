# 💼 Career Flow Tracker & Planner

Career Flow Tracker is a premium, modular full-stack application designed to help developers track job applications, manage daily habits, organize tasks on a Kanban board, and leverage state-of-the-art AI tooling to accelerate career progression.

---

## 🚀 Key Features

### 1. 📊 Interactive Dashboard
- **Productivity & Streak Tracker:** Visual circular meters representing real-time productivity scores and streaks based on database-driven activity logs.
- **Weekly Analytics:** Track daily actions and performance indicators.
- **Unified Streak Calendar:** A calendar showing qualified visit streaks, highlighted with translucent indicator rings and fire (`🔥`) badges.

### 2. 📅 Career Planner
- **Task Board:** Lined notebook-style Kanban columns ("To Do", "In Progress", "Done") with custom vertical margins and drag-and-drop mechanics.
- **Habits Checklist:** Weekly trackers for personal habits, adapting layout and font scaling across mobile screens.
- **Interactive Calendar:** Redesigned daily event planner displaying custom colored grid cells (Sun-Sat pastel themes) and limiting items to **7 events maximum per day**.
- **Private Notes:** Notion-inspired document workspace with auto-expanding textareas and word-count indicators.

### 3. 🧠 AI Catalyst Features
- **ATS Resume Review:** Copy-paste text or upload a PDF to receive overall readability, grammar, action-verb usage scores, and actionable feedback.
- **Roadmap Generator:** Generate step-by-step skill pathways to pivot into specialized developer roles.
- **Skill Gap Analyzer:** Compares current skill inventories against target role listings to recommend learning platforms.
- **Interview prep & Cover Letter Generators:** Tailors questions and cover letters to job descriptions.
- **AI Career Coach:** A context-aware chatbot widget for answering career questions.

---

## 🛠️ Technology Stack

### Frontend
- **Framework:** React.js (Vite)
- **Routing:** React Router DOM
- **Icons:** React Icons (`Fi` Feather pack)
- **Styling:** Premium responsive Vanilla CSS (custom light/dark variables, glassmorphic dropdowns, and sharp professional edge layouts)

### Backend
- **Framework:** Node.js with Express.js
- **Database ORM:** Prisma ORM
- **Database Engine:** PostgreSQL (hosted on Supabase)
- **File Uploads:** Cloudinary (Resume PDF storage)
- **Emails:** Nodemailer (Gmail SMTP server)

---

## 🤖 AI Models & Pipelines

To ensure high availability and robust performance, the AI features operate on a multi-layer API integration:

1. **Primary Model:** **GPT-4o-Mini** (via **OpenRouter**)
   - Selected for high speed, reliable JSON formatting, and low latency.
   - API Endpoint: `https://openrouter.ai/api/v1`
2. **Fallback Model:** **Grok-2 / Grok-Beta** (via **xAI API**)
   - Activated automatically if OpenRouter limits are hit.
   - API Endpoint: `https://api.x.ai/v1`
3. **Template Engine:** **Hugging Face Jinja**
   - Parses complex prompt templates and formatting strings (`@huggingface/jinja`).

---

## 🎮 Gamification: Streaks & Points Matrix

To keep developers motivated, the platform records user activity logs and updates scores automatically.

### 1. Points Allocation Matrix
Every action on the platform awards the user a specific point value:

| Action Type | Points | Description |
| :--- | :---: | :--- |
| `LOGIN` | **1** | Awarded on daily user visit |
| `JOB_SEARCH` | **1** | Awarded when searching jobs on JSearch API |
| `JOB_APPLY` | **2** | Awarded when submitting or saving a job application |
| `BOOKMARK_JOB` | **1** | Awarded when bookmarking search results |
| `RESUME_UPLOAD` | **5** | Awarded when uploading a resume to Cloudinary |
| `PROFILE_UPDATE` | **3** | Awarded when updating professional profile info |
| `INTERVIEW_COMPLETE` | **10** | Awarded when completing a scheduled interview event |

### 2. Streak Calculations
- **Streak Qualification:** A calendar day qualifies for a streak point if the total cumulative daily activity score is **`>= 1`**.
- **Active Days Counter:** Increments each unique calendar day the user qualifies.
- **Current Streak:** Calculated by looking backward from today (or yesterday). If the consecutive date sequence is broken, the current streak resets to `0`.
- **Longest Streak:** Records the highest consecutive block of qualified active days.

---

## 🔑 Credentials & Environment Variables

The application relies on the following configurations in the backend `.env` file:

```ini
# PostgreSQL Connections (Supabase)
DATABASE_URL="postgresql://your_db_user:your_db_password@your_db_host:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://your_db_user:your_db_password@your_db_host:5432/postgres"

# Google Authentication
GOOGLE_CLIENT_ID="your_google_client_id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
GOOGLE_PROJECT_ID="your_google_project_id"

# AI Integrations
OPENROUTER_API_KEY="your_openrouter_api_key"
GROK_API_KEY="your_grok_api_key"

# RapidAPI (JSearch Job Listings)
RAPIDAPI_KEY="your_rapidapi_key"
RAPIDAPI_HOST="jsearch.p.rapidapi.com"

# Email SMTP
EMAIL_USER="your_email@gmail.com"
EMAIL_PASS="your_email_app_password"

# Cloudinary Storage
CLOUDINARY_CLOUD_NAME="your_cloudinary_cloud_name"
CLOUDINARY_API_KEY="your_cloudinary_api_key"
CLOUDINARY_API_SECRET="your_cloudinary_api_secret"
```
