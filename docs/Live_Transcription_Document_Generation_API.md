# Live Transcription & Document Generation API Design

This document designs the system architecture, API endpoints, and LLM orchestration flow for transcribing live audio recordings and compiling them into court-compliant Supreme Court of Pakistan documents.

---

## 1. High-Level Architectural Flow

```
[User Mic] ──► [Audio Blob] ──► [POST /api/document/generate-from-speech]
                                                  │
                                                  ▼
                                      [Whisper Speech-to-Text]
                                                  │ (Raw Transcription Text)
                                                  ▼
                                        [Gemini / LLM Call]
                                                  │ (Structured Legal JSON)
                                                  ▼
                                      [Template Compiler (Node)]
                                                  │ (Reads Local HTML Template)
                                                  ▼
[Editable Sheet Preview] ◄── [HTML Content] ◄─────┘
         │
         ▼
[Download PDF] ──► [GET /api/document/export-pdf/:id] ──► [Puppeteer] ──► [PDF Binary]
```

---

## 2. API Endpoints

### Endpoint 1: Upload Speech & Generate Draft
* **Endpoint**: `POST /api/document/generate-from-speech`
* **Content-Type**: `multipart/form-data`
* **Request Payload**:
  * `audio`: File (binary audio blob captured from browser microphone, `.webm` or `.wav`)
  * `caseId`: `101`
  * `documentTypeId`: `petition` (Assume Supreme Court of Pakistan is hardcoded/defaulted)
  * `petitioner`: "Mian Muhammad Nawaz"
  * `respondent`: "Federation of Pakistan"
  * `caseNumber`: "W.P. No. 4392 / 2026"
  * `advocate`: "Barrister Ali Zafar"
  * `draftDate`: "2026-07-26"

* **Response Payload (`200 OK`)**:
  ```json
  {
    "documentId": 892,
    "transcript": "My license was suspended without notice by the authorities on 15th July, we requested them multiple times to review it but they refused, this violates my rights...",
    "htmlContent": "<!DOCTYPE html><html>...Supreme Court formatted HTML with LLM draft injected...</html>"
  }
  ```

### Endpoint 2: Export Final Document
* **Endpoint**: `GET /api/document/export-pdf/:id`
* **Response**: Binary PDF Stream (`Content-Type: application/pdf`)

---

## 3. Step-by-Step Backend Implementation Design

### Step A: Transcribing Audio with Whisper AI
On receiving the audio file, the backend routes the file to the transcription service.
```javascript
// Pseudocode service implementation
const fs = require('fs');
const { OpenAI } = require('openai');

const openai = new OpenAI();

async function transcribeAudio(audioFilePath) {
  const response = await openai.audio.transcriptions.create({
    file: fs.createReadStream(audioFilePath),
    model: "whisper-1",
    language: "en"
  });
  return response.text; // Returns raw transcribed text
}
```

### Step B: Orchestrating the LLM Call
We issue an LLM prompt structured to extract facts, grounds, and prayers from the raw transcription, enforcing JSON outputs using **Structured Outputs** (JSON schemas).

#### 1. JSON Schema Definition:
We define the structure the LLM must return:
```json
{
  "type": "object",
  "properties": {
    "facts": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Sequential statement of facts extracted from user transcript, written in formal legal english."
    },
    "grounds": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Constitutional and legal grounds supporting the petition based on the transcript arguments."
    },
    "prayer": {
      "type": "string",
      "description": "Specific prayer requesting relief or directions to the respondents."
    }
  },
  "required": ["facts", "grounds", "prayer"]
}
```

#### 2. System Instructions & Prompt:
```text
System Prompt:
You are an elite legal drafts writer for the Supreme Court of Pakistan. 
Your task is to analyze a raw case transcription and convert it into structured legal content (Facts, Grounds, and Prayer). 
You must write in formal, archaic legal English suitable for the Supreme Court. Expand shorthand thoughts into formal statements.

User Transcript Input:
"My license was suspended without notice by the authorities on 15th July, we requested them multiple times to review it but they refused, this violates my rights..."

Instructions:
1. Extract the facts (e.g. 'That the petitioner's license was arbitrarily suspended without notice on 15th July 2026').
2. Generate formal grounds (e.g. 'That the suspension was in violation of principles of natural justice and audi alteram partem').
3. Formulate the prayer (e.g. 'To set aside the arbitrary suspension of license and restore operational rights...').
```

#### 3. Request Call Parameters:
```javascript
const response = await openai.chat.completions.create({
  model: "gpt-4o-mini", // or gemini-1.5-pro
  messages: [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: `Transcript: "${transcribedText}"` }
  ],
  response_format: { type: "json_object" } // Enforce structured output
});

const legalData = JSON.parse(response.choices[0].message.content);
```

### Step C: local Template Compilation
The backend reads the Supreme Court template file matching `documentTypeId`, resolves placeholders with the metadata and the LLM structured JSON, and returns it to the client.

```javascript
const fs = require('fs/promises');
const Handlebars = require('handlebars');

async function compileDraft(metadata, legalData) {
  // 1. Read local file template
  const templatePath = `./src/templates/supreme_court/${metadata.documentTypeId}.html`;
  const rawHtml = await fs.readFile(templatePath, 'utf-8');
  
  // 2. Format list arrays to HTML lists
  const formattedFacts = legalData.facts.map(f => `<li>${f}</li>`).join('\n');
  
  // 3. Compile template
  const template = Handlebars.compile(rawHtml);
  const finalHtml = template({
    petitioner: metadata.petitioner,
    respondent: metadata.respondent,
    caseNumber: metadata.caseNumber,
    subject: metadata.subject,
    advocate: metadata.advocate,
    draftDate: metadata.draftDate,
    // Inject the structured blocks
    facts: formattedFacts,
    prayer: legalData.prayer
  });

  return finalHtml;
}
```

### Step D: Frontend Rendering & Preview
The frontend receives `htmlContent` in the API response and renders it inside the editable container:
```javascript
// Render template inline in the canvas
<div 
  contentEditable={true} 
  dangerouslySetInnerHTML={{ __html: apiResponse.htmlContent }}
  onBlur={(e) => updateEditedHtml(e.currentTarget.innerHTML)}
/>
```

### Step E: Compilation for PDF Download
When the user clicks "Download PDF", the frontend sends the final (potentially edited) HTML to the backend:
`POST /api/document/compile-pdf` with body `{ htmlContent: ... }`

The server compiles the HTML to a clean A4 PDF stream via **Puppeteer**:
```javascript
const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.setContent(htmlContent);
const pdfBuffer = await page.pdf({
  format: 'A4',
  margin: { top: '1.2in', bottom: '1.2in', left: '1.5in', right: '1in' }
});
await browser.close();

res.setHeader('Content-Type', 'application/pdf');
res.setHeader('Content-Disposition', 'attachment; filename="supreme_court_draft.pdf"');
res.send(pdfBuffer);
```
