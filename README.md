# Career Tracker Server 💼

A modular, relation-based Node.js backend using **Express** and **Prisma ORM** for tracking job applications and developer skills.

## Architecture

This project is built using a modular folder structure:

```text
career-tracker-server/
│
├── prisma/
│   ├── schema.prisma   # Database schema (User, Career, Skill)
│   └── seed.js         # Seeding script
│
├── src/
│   ├── config/
│   │   ├── env.js      # Environment variables configuration
│   │   └── prisma.js   # Prisma Client singleton
│   │
│   ├── middlewares/
│   │   ├── auth.middleware.js     # JWT authorization gate
│   │   ├── error.middleware.js    # Global centralized error handler
│   │   └── validate.middleware.js # Request payload validation helper
│   │
│   ├── utils/
│   │   ├── ApiError.js     # Custom Operational Error helper
│   │   ├── ApiResponse.js  # Uniform Response payload structure
│   │   └── constants.js    # Job statuses & skill levels
│   │
│   ├── modules/
│   │   ├── auth/           # Login, registration, token issuance
│   │   ├── user/           # User profiles management
│   │   ├── career/         # Career applications CRUD (User scoped)
│   │   └── skill/          # Skill tracker CRUD (User scoped)
│   │
│   ├── routes/
│   │   └── index.js        # Main API routing hub
│   │
│   └── app.js              # Express app setup and middleware routing
│
├── .env                    # Keys and connection strings
├── server.js               # Entry point
└── package.json            # Node.js configurations
```

## Setup & Run

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Sync Database Schema**:
   ```bash
   npx prisma db push
   ```

3. **Seed the database**:
   ```bash
   node prisma/seed.js
   ```

4. **Run Server (Development)**:
   ```bash
   npm run dev
   ```

## API Endpoints

### 🔑 Authentication (`/api/auth`)
- `POST /register`: Create a new account.
- `POST /login`: Log in and get a JWT token.
- `GET /me`: Get current logged-in user profile (requires Auth header).

### 👤 User (`/api/users`)
- `GET /profile`: Get full profile info (requires Auth header).
- `PUT /profile`: Update user name or email (requires Auth header).

### 💼 Career / Job Applications (`/api/careers`)
- `GET /`: Get all applications for the authenticated user (requires Auth).
- `POST /`: Add a new job application (requires Auth).
- `GET /:id`: Get specific application details (requires Auth).
- `PUT /:id`: Update application status, salary, or associated skill IDs (requires Auth).
- `DELETE /:id`: Delete an application (requires Auth).

### 🛠️ Skills (`/api/skills`)
- `GET /`: List all skills of the authenticated user (requires Auth).
- `POST /`: Create a new skill (requires Auth).
- `GET /:id`: Get specific skill details (requires Auth).
- `PUT /:id`: Update skill name or proficiency (requires Auth).
- `DELETE /:id`: Delete a skill (requires Auth).
