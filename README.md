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
cp .env.example .env   # fill in GROQ_API_KEY and JWT_SECRET
npm run seed            # creates a test user for local login
npm run dev
```

Runs on `http://localhost:5000` by default.

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
- JWT (`jsonwebtoken`) + `bcryptjs` for authentication
- Multer for audio file uploads
- Groq Whisper API for speech-to-text transcription

### Current Features

- User login with protected routes (JWT-based auth)
- Speech-to-text transcription (chunked recording via Groq Whisper)
- Legal keyword extraction from transcripts

---

## Contributing

Please read `CONTRIBUTING.md` before making any changes.

Development is carried out using feature branches and Pull Requests.