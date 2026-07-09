# Backend Architecture

## Project

Intelex

---

# Overview

The backend is responsible for processing user requests, managing case data, interacting with AI services, and exposing REST APIs for the frontend.

The backend acts as the bridge between the frontend, AI models, and the database.

---

# High-Level Architecture

```
Frontend (React)
        │
        ▼
REST API
        │
        ▼
Backend
        │
 ┌──────┼────────────┬─────────────┐
 │      │            │             │
Authentication   Whisper AI   Document Service
 │               │             │
 └───────────────┼─────────────┘
                 │
            Database
```

---

# Backend Responsibilities

- User Authentication
- Case Management
- Audio Processing
- Speech-to-Text Conversion
- Keyword Extraction
- Previous Case Retrieval
- Document Generation
- PDF Generation

---

# Core Modules

## Authentication Module

Handles:

- Login
- Logout
- User validation

---

## Case Management Module

Handles:

- Create Case
- Update Case
- Delete Case
- Retrieve Case

---

## Speech Processing Module

Handles:

- Audio Upload
- Whisper Integration
- Transcript Generation

---

## Keyword Extraction Module

Handles:

- Process transcript
- Extract legal keywords

---

## Previous Case Module

Handles:

- Search previous cases
- Return relevant results

---

## Document Generation Module

Handles:

- Generate legal documents
- Return editable content

---

# Database

Stores:

- Users
- Cases
- Transcripts
- Generated Documents
- Search History

---

# Communication

The frontend communicates with the backend using REST APIs over HTTP.

Data is exchanged in JSON format.