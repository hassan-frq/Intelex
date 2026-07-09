# Software Requirements Specification (SRS)

## Project Title

Intelex

---

# 1. Introduction

## 1.1 Purpose

Intelex is designed to assist legal professionals by automating parts of the legal workflow. The system converts spoken legal statements into text, extracts important information, retrieves relevant previous cases, and generates legal documents, reducing manual effort and improving efficiency.

## 1.2 Scope

The system provides an end-to-end workflow for managing legal cases. Users can create and manage cases, upload or record audio, generate transcripts using AI, search related legal cases, and generate editable legal documents for export.

---

# 2. Problem Statement

Preparing legal documents often involves manually transcribing audio recordings, searching through previous cases, identifying relevant legal information, and formatting official documents. These repetitive tasks consume significant time and increase the possibility of human error.

The proposed system aims to automate these processes using artificial intelligence while providing an organized digital workspace for legal case management.

---

# 3. Objectives

- Automate speech-to-text conversion.
- Extract relevant legal keywords.
- Search similar legal cases.
- Assist in generating legal documents.
- Improve document preparation efficiency.
- Provide centralized case management.

---

# 4. Functional Requirements

## Authentication

- User Login
- Secure Logout

## Case Management

- Create Case
- View Cases
- Update Case
- Delete Case

## Speech Processing

- Upload Audio
- Record Audio
- Generate Transcript using Whisper AI

## Keyword Extraction

- Extract important legal terms from transcripts.

## Previous Case Search

- Search similar legal cases.
- Display search results.

## Document Generation

- Select Court.
- Select Document Type.
- Generate legal document.
- Edit generated document.

## Export

- Download document as PDF.

---

# 5. Non-Functional Requirements

## Performance

- Fast response time.
- Efficient document generation.

## Security

- Secure user authentication.
- Protected user data.

## Usability

- Clean and responsive interface.
- Easy navigation.

## Reliability

- Stable operation during long sessions.
- Reliable AI processing.

## Maintainability

- Modular frontend and backend architecture.
- Well-documented codebase.

---

# 6. User Flow

```

Login
↓
Dashboard
↓
Case Book
↓
Open/Create Case
↓
Upload or Record Audio
↓
Speech-to-Text
↓
Keyword Extraction
↓
Previous Case Search
↓
Document Generation
↓
Preview & Edit
↓
Export PDF

```

---

# 7. Assumptions

- Users have internet access if cloud-based AI services are used.
- Users possess valid login credentials.
- Whisper AI and backend services are available.
- Legal case datasets are maintained by the system.

---

# 8. Constraints

- Accuracy of AI-generated content depends on input quality.
- Generated legal documents require user review before final submission.
- Audio quality may affect transcription accuracy.
