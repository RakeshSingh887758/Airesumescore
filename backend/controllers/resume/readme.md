# Resume Analysis — Backend

This API lets a logged-in user upload a resume (PDF) along with a job description. The server reads the PDF, compares it with the job description, and returns a match percentage with a detailed report. Every analysis is saved with the user's id, taken from the JWT, so the frontend never sends the user.

The analysis runs entirely on the server. It needs no paid AI API or API key.

**Stack:** Node.js, Express 5, MongoDB (Mongoose), Multer, pdf-parse v2

## How a request is handled

1. The frontend sends the PDF and job description as `multipart/form-data` to `POST /api/resume`, with the JWT in the `Authorization` header.
2. The `protect` middleware checks the token and sets `req.user`.
3. Multer keeps the PDF in memory (it is not written to disk) and `pdf-parse` extracts its text.
4. `resumeAnalyzer` compares the resume text with the job description and builds the report.
5. The report is saved in MongoDB with the user's id and returned in the response.

## Folder structure

```
backend/
├── controllers/resume/resume.controller.js   # add, list, get one, delete
├── middleware/upload.middleware.js           # Multer: PDF only, max 5 MB
├── models/resume.js                          # Resume analysis schema
├── routes/resume.routes.js                   # /resume routes
└── utils/
    ├── extractPdfText.js                     # PDF buffer -> text (pdf-parse v2)
    └── resumeAnalyzer.js                     # Scoring and report logic
```

The routes use your existing `protect` middleware (the one used by `getMe` and `logout`). It must set `req.user`.

## Setup

All packages are already in `package.json`:

```bash
npm install
npm run dev
```

Register the routes in `server.js`:

```js
app.use("/api", require("./routes/resume.routes"));
```

The resume feature uses the same `.env` values as authentication, mainly `JWT_SECRET` and your MongoDB connection string.

## API

All routes need the header `Authorization: Bearer <token>`.

| Method | Route | Description |
|---|---|---|
| POST | `/api/resume` | Upload a resume and analyze it |
| GET | `/api/resume?page=1&limit=10` | The logged-in user's history (newest first) |
| GET | `/api/resume/:id` | Full report for one analysis |
| DELETE | `/api/resume/:id` | Delete one analysis |

Users can only see and delete their own analyses. Another user's id returns 404.

### POST `/api/resume`

Body type: `multipart/form-data`

| Field | Type | Rules |
|---|---|---|
| `resume` | File | PDF only, max 5 MB, must contain readable text |
| `job_desc` | Text | 50 to 15,000 characters |

Example response (`201`):

```json
{
  "message": "Resume analyzed successfully",
  "user": { "id": "...", "name": "Vivek", "email": "v@example.com" },
  "analysis": {
    "id": "...",
    "fileName": "resume.pdf",
    "jobTitle": "Full Stack Developer",
    "matchPercentage": 85,
    "verdict": "Excellent",
    "breakdown": { "skills": 72, "keywords": 90, "experience": 100, "sections": 100, "formatting": 90 },
    "matchedSkills": ["JavaScript", "React", "Node.js", "MongoDB"],
    "missingSkills": ["Next.js", "GraphQL", "CI/CD"],
    "extraSkills": ["Tailwind CSS", "Mongoose"],
    "matchedKeywords": ["authentication", "dashboards", "scalable"],
    "missingKeywords": ["pipelines"],
    "experience": { "required": 2, "found": 3 },
    "sections": { "found": ["Summary", "Experience", "Education", "Skills", "Projects", "Certifications"], "missing": [] },
    "contact": { "email": true, "phone": true, "linkedin": true, "github": true },
    "stats": { "wordCount": 420, "actionVerbs": 10, "quantifiedAchievements": 4 },
    "strengths": ["Experience (3 yrs) meets the 2+ years requirement."],
    "suggestions": ["Add these skills from the job description if you have them: Next.js, GraphQL, CI/CD."],
    "summary": "Your resume is an excellent match (85%) for this job. ...",
    "createdAt": "2026-10-25T08:38:02.036Z"
  }
}
```

### GET `/api/resume`

Query parameters: `page` (default 1) and `limit` (default 10, max 50).

```json
{
  "total": 14,
  "page": 1,
  "pages": 2,
  "resumes": [
    {
      "id": "...",
      "fileName": "resume.pdf",
      "jobTitle": "Full Stack Developer",
      "matchPercentage": 85,
      "verdict": "Excellent",
      "summary": "...",
      "matchedSkills": ["React", "Node.js"],
      "missingSkills": ["GraphQL"],
      "missingSkillsCount": 3,
      "createdAt": "..."
    }
  ]
}
```

`matchedSkills` and `missingSkills` in the list are capped at 6 items. Use `GET /api/resume/:id` for the full report.

### Errors

Every error returns `{ "message": "..." }`.

| Status | When |
|---|---|
| 400 | No file, file is not a PDF, file over 5 MB, missing or too short/long `job_desc`, invalid id |
| 401 | Token missing, invalid, expired or logged out |
| 404 | Analysis not found (or belongs to another user) |
| 422 | PDF is corrupted or password-protected, or has almost no text (scanned/image resume) |
| 500 | Server error |

## How the score is calculated

| Part | Weight | What it checks |
|---|---|---|
| Skills | 40% | Skills named in the job description that also appear in the resume. About 90 skills are recognized, including aliases (for example `node`, `nodejs` and `node.js` all count as Node.js). |
| Keywords | 25% | The 20 most frequent important words in the job description (excluding skills and common words). Word forms count, so "collaborated" matches "collaborate". |
| Experience | 15% | Years required by the job (for example "3+ years") against years found in the resume. It uses a statement like "3 years of experience" first, otherwise it adds up date ranges such as "Jan 2022 – Present". |
| Sections | 10% | Summary, Experience, Education, Skills, Projects, Certifications |
| Formatting | 10% | Email, phone and LinkedIn present, sensible length, action verbs, numbers that show impact |

If the job description names no recognized skills, the skills part uses the keyword score instead.

| Verdict | Match % |
|---|---|
| Excellent | 85 and above |
| Good | 70 to 84 |
| Average | 50 to 69 |
| Poor | below 50 |

To support more skills, add them to the `SKILLS` object in `utils/resumeAnalyzer.js` as `"Name": ["alias1", "alias2"]`.

## Limitations

- Scanned or image-only PDFs cannot be read. The API returns 422 with a clear message.
- Matching is based on words, not meaning. A skill described in different words may not be detected.
- The job title is guessed from the job description (the words before "Developer", "Engineer", "Analyst" and similar). If none is found, the first line of the job description is used.
- The resume text is stored in the database but is never sent back in any response.

## Troubleshooting

| Problem | Fix |
|---|---|
| `Authentication token required` | The request has no `Authorization: Bearer <token>` header. |
| `404` on `/api/auth/resume` | The resume routes are registered under `/api`, not `/api/auth`. Check `app.use("/api", ...)` in `server.js`. |
| `Upload error: Unexpected field` | The file must be sent in a form field named `resume`. |
| `Very little text found in the PDF` | The resume is a scanned image. Export it again as a text-based PDF. |