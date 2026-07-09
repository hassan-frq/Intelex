# API Contracts

## Project

Intelex

---

# Overview

This document defines the communication contract between the frontend and backend. All requests and responses use JSON.

---

# Authentication

## Login

### Endpoint

POST /api/auth/login

### Request

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Response

```json
{
  "token": "jwt_token",
  "user": {
    "id": 1,
    "name": "John Doe"
  }
}
```

---

# Case Management

## Create Case

POST /api/cases

### Request

```json
{
  "title": "Property Dispute"
}
```

### Response

```json
{
  "caseId": 101,
  "message": "Case created successfully"
}
```

---

## Get All Cases

GET /api/cases

### Response

```json
[
  {
    "caseId": 101,
    "title": "Property Dispute"
  }
]
```

---

# Speech Processing

## Upload Audio

POST /api/speech/transcribe

### Request

Multipart/Form-Data

- audioFile

### Response

```json
{
  "transcript": "Generated transcript..."
}
```

---

# Keyword Extraction

POST /api/keywords/extract

### Request

```json
{
  "transcript": "..."
}
```

### Response

```json
{
  "keywords": [
    "Property",
    "Contract",
    "Ownership"
  ]
}
```

---

# Previous Cases

GET /api/cases/search?keyword=property

### Response

```json
[
  {
    "caseId": 45,
    "title": "ABC vs XYZ"
  }
]
```

---

# Document Generation

POST /api/document/generate

### Request

```json
{
  "caseId": 101,
  "court": "Lahore High Court",
  "documentType": "Petition"
}
```

### Response

```json
{
  "document": "Generated legal document..."
}
```

---

# Export PDF

GET /api/document/{caseId}/export

### Response

PDF File