# Intelex — Legal-Tech AI Assistant

Intelex is a full-stack web application that helps legal professionals transcribe hearings, extract key legal terms, and generate case documents faster.

---

## Repository Structure

```text
Intelex/
├── frontend/          # React + Vite frontend
├── backend/            # Express backend (auth, speech-to-text, keyword extraction)
├── docs/               # Project documentation
├── README.md
└── CONTRIBUTING.md
```

---

## Documentation

Project documentation is available in the `docs/` directory.

- Software Requirements Specification (`Software_Requirements_Specification.md`)
- Backend Architecture (`Backend_Architecture.md`)
- API Contracts (`API_Contracts.md`)
- Frontend Design (`Frontend_Design.md`)
- UI Guidelines (`ui_guidelines.md`)
- Task Allocation (`Task_Allocation.md`)

---

## Getting Started

### Backend

```bash
cd backend
npm install
cp .env.example .env   # fill in GROQ_API_KEY, JWT_SECRET, and DATABASE_URL
npm run migrate         # creates the database tables (Postgres, hosted on Supabase)
npm run seed            # creates a test user for local login
npm run dev
```

Runs on `http://localhost:5000` by default.

`DATABASE_URL` is a Postgres connection string (we use a free [Supabase](https://supabase.com) project) — ask a teammate for the shared connection string, or set up your own Supabase project and run `npm run migrate` to create the schema from scratch.

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Runs on `http://localhost:5173` by default. Open this URL directly — `127.0.0.1:5173` will fail CORS since the backend only allows the `localhost` origin.

**Test login:** `test@intelex.dev` / `password123`

---

## Tech Stack

### Frontend

- React
- Vite
- React Router
- Tailwind CSS
- React Icons
- Axios

### Backend

- Express
- PostgreSQL (hosted on Supabase) via the `postgres` client
- JWT (`jsonwebtoken`) + `bcryptjs` for authentication
- Multer for audio and PDF file uploads
- Groq Whisper API for speech-to-text transcription
- Selenium (`selenium-webdriver`) for court case scraping scripts (`backend/src/scripts/`)

### Current Features

- User registration and login with protected routes (JWT-based auth)
- PostgreSQL database (hosted on Supabase) for persistent storage
- Case Book — full CRUD for managing legal cases (title, client, court, case number, status, description, date)
- PDF document upload/view/delete attached to individual cases
- Speech-to-text transcription (dual-recorder: live chunked transcript during recording, replaced with a clean full transcript on stop; editable before keyword extraction)
- Legal keyword extraction from transcripts
- Dashboard with live case count and quick actions (Start Recording, Generate Document, New Case)
- User settings — update profile and change password

---

## Contributing

Please read `CONTRIBUTING.md` before making any changes.

Development is carried out using feature branches and Pull Requests.