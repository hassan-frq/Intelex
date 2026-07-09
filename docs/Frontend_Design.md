# Frontend Design Document

## Project

Intelex
---

# Frontend Architecture

The frontend follows a **type-based architecture**, where files are organized according to their purpose.

```
src/
├── assets/
├── components/
├── context/
├── hooks/
├── layouts/
├── pages/
├── routes/
├── services/
├── styles/
└── utils/
```

---

# Application Flow

```
Login
   ↓
Dashboard
   ↓
Case Book
   ↓
Open/Create Case
   ↓
Speech-to-Text
   ↓
Keyword Extraction
   ↓
Previous Cases
   ↓
Document Generator
   ↓
Preview
   ↓
Export PDF
```

---

# Pages

| Page | Route | Purpose |
|------|-------|---------|
| Login | `/login` | User Authentication |
| Dashboard | `/dashboard` | Main landing page |
| Case Book | `/cases` | View and manage all cases |
| Speech To Text | `/case/:id/speech` | Upload/record audio and generate transcript |
| Previous Cases | `/case/:id/previous-cases` | Search similar legal cases |
| Document Generator | `/case/:id/generate` | Generate legal documents |
| Preview | `/case/:id/preview` | Review, edit and export generated document |
| Settings | `/settings` | User preferences |

---

# Reusable Components

- Navbar
- Sidebar
- Button
- Input
- Card
- Table
- Modal
- Loader
- Audio Player

---

# Layouts

## Auth Layout

Used for:

- Login

---

## Main Layout

Used for:

- Dashboard
- Case Book
- Speech To Text
- Previous Cases
- Document Generator
- Preview
- Settings

Contains:

- Navbar
- Sidebar
- Main Content

---

# API Communication

All backend communication will be handled through the `services` directory using Axios.

---

# Design Principles

- Reusable Components
- Modular Structure
- Responsive UI
- Clean Navigation
- Maintainable Code