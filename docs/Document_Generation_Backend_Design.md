# Document Generation Backend Design

This document details the backend architectural design, database schemas, API endpoints, and function signatures required to support the document generator.

---

## 1. Database Schema Design

We need tables to store custom/standard courts, layout templates for different legal document classifications, and metadata logging of generated documents.

### `courts` Table
Stores court configurations. While standard courts are seeded, this schema supports custom user or system-wide courts.
```sql
CREATE TABLE courts (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    short_name VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    prefix VARCHAR(255) NOT NULL,
    is_custom BOOLEAN DEFAULT FALSE,
    user_id INT NULL, -- NULL for system-wide, numeric ID for user-created courts
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### `document_templates` Table
Stores layout configurations and structural boilerplate for documents (Petitions, Sou Moto responses, Writs).
```sql
CREATE TABLE document_templates (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    default_title VARCHAR(255) NOT NULL,
    boilerplate_html TEXT NOT NULL, -- Core HTML layout template with placeholders
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### `generated_documents` Table
Tracks documents compiled by users, linking them to specific cases, holding the draft text, and referring to the compiled static assets.
```sql
CREATE TABLE generated_documents (
    id SERIAL PRIMARY KEY,
    case_id INT NOT NULL,
    court_id VARCHAR(50) NOT NULL,
    document_type_id VARCHAR(50) NOT NULL,
    petitioner VARCHAR(255) NOT NULL,
    respondent VARCHAR(255) NOT NULL,
    case_number VARCHAR(100),
    subject TEXT,
    advocate VARCHAR(255),
    draft_date DATE,
    html_content TEXT NOT NULL, -- Holds the editable draft text in HTML/Rich-text format
    pdf_file_path VARCHAR(512), -- Path to compiled static PDF on storage server (e.g. S3)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (court_id) REFERENCES courts(id),
    FOREIGN KEY (document_type_id) REFERENCES document_templates(id)
);
```

---

## 2. API Endpoints

### Fetch Courts List
* Retrieves list of all available courts.
* **Endpoint**: `GET /api/courts`
* **Response**:
  ```json
  [
    {
      "id": "supreme_court",
      "name": "Supreme Court of Pakistan",
      "shortName": "Supreme Court",
      "city": "Islamabad",
      "prefix": "IN THE SUPREME COURT OF PAKISTAN"
    }
  ]
  ```

### Generate Document Boilerplate
* Creates initial draft content based on metadata.
* **Endpoint**: `POST /api/document/generate-draft`
* **Request Payload**:
  ```json
  {
    "caseId": 101,
    "courtId": "supreme_court",
    "documentTypeId": "petition",
    "petitioner": "Mian Muhammad Nawaz",
    "respondent": "Federation of Pakistan",
    "caseNumber": "W.P. No. 4392 / 2026",
    "subject": "Arbitrary suspension of license and violation of due process",
    "advocate": "Barrister Ali Zafar",
    "draftDate": "2026-07-26"
  }
  ```
* **Response**:
  ```json
  {
    "documentId": 482,
    "htmlContent": "<div>...initial pre-filled template text...</div>"
  }
  ```

### Save Document Draft (Update)
* Saves inline changes made on the frontend editable canvas.
* **Endpoint**: `PUT /api/document/draft/:id`
* **Request Payload**:
  ```json
  {
    "htmlContent": "<div>...edited rich-text content...</div>"
  }
  ```
* **Response**:
  ```json
  {
    "success": true,
    "message": "Draft updated successfully",
    "updatedAt": "2026-07-26T07:55:00Z"
  }
  ```

### Compile & Export PDF
* Compiles HTML content to binary PDF and streams download.
* **Endpoint**: `GET /api/document/export-pdf/:id`
* **Response**: Binary PDF content stream (`application/pdf`)

---

## 3. Backend Function Signatures (Service Layer)

### `get_available_courts`
* **Description**: Returns standard courts combined with custom courts authorized for the current user.
* **Signature**:
  ```typescript
  function getAvailableCourts(userId: number): Promise<CourtEntity[]>
  ```
* **Logic**:
  1. Query database: `SELECT * FROM courts WHERE is_custom = FALSE OR user_id = :userId`
  2. Return court entities array.

### `generate_initial_draft`
* **Description**: Formulates the initial structured HTML draft by injecting case metadata into the standard boilerplate layouts.
* **Signature**:
  ```typescript
  function generateInitialDraft(
      caseId: number, 
      courtId: string, 
      docTypeId: string, 
      metadata: DocumentMetadata
  ): Promise<GeneratedDocumentEntity>
  ```
* **Logic**:
  1. Retrieve boilerplate from `document_templates` for `docTypeId`.
  2. Retrieve court prefix details for `courtId`.
  3. Replace placeholders in boilerplate (`{COURT_PREFIX}`, `{PETITIONER}`, `{RESPONDENT}`, etc.) with clean values from `metadata`.
  4. Write record to `generated_documents` with computed `html_content`.
  5. Return record.

### `update_document_draft`
* **Description**: Overwrites database stored draft text with the edits submitted from the user's editable web workspace canvas.
* **Signature**:
  ```typescript
  function updateDocumentDraft(docId: number, newHtmlContent: string): Promise<boolean>
  ```
* **Logic**:
  1. Verify record exists and user has authorization.
  2. Update column `html_content` of `generated_documents` where `id = docId`.
  3. Clear cached PDF file path to force re-compilation on export request.
  4. Return `true` if update count > 0.

### `compile_html_to_pdf`
* **Description**: Invokes PDF engine to transform the finalized rich-text HTML document into a standardized PDF stream.
* **Signature**:
  ```typescript
  function compileHtmlToPdf(docId: number): Promise<Buffer>
  ```
* **Logic**:
  1. Query `generated_documents` to get the edited `html_content`.
  2. Format template styles, injecting stylesheet standard margins (times-new-roman, double-red margins).
  3. Launch headless chrome instance (via Puppeteer/Playwright) or initialize PDFKit.
  4. Convert formatted document layout to binary PDF buffer.
  5. Save PDF buffer to file system or object store (e.g. S3) and store reference in `pdf_file_path`.
  6. Return PDF binary buffer.

---

## 4. Local File-System Templates (Codebase-Backed)

To avoid database read latency and keep legal template layouts version-controlled, standard court formats are stored locally in the backend project codebase.

### Directory Structure
```text
backend/src/templates/
└── supreme_court/
    ├── petition.html   # Supreme Court Writ Petition template (Article 184(3))
    ├── suomoto.html     # Supreme Court Sou Moto Response reference template
    └── writ.html        # Supreme Court Writ of Certiorari/Mandamus template
```

### Loading Logic Implementation Flow
1. Receive request containing `courtId` and `documentTypeId`.
2. Construct file path: `./src/templates/${courtId}/${documentTypeId}.html`.
3. Check if template file exists locally.
4. Read file content using local filesystem module (e.g. Node `fs.promises.readFile`).
5. Run the raw HTML string through template parser engines (e.g. Handlebars) to dynamically replace bracket variables (`{{petitioner}}`, `{{respondent}}`, `{{subject}}`, `{{caseNumber}}`, `{{draftDate}}`, `{{advocate}}`).
