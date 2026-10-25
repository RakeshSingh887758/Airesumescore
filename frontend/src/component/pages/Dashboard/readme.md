# Resume Analysis — Dashboard Page

The Dashboard is where a logged-in user uploads their resume (PDF), pastes a job description, and gets a match score with a detailed report. Every analysis is saved on the server and later appears on the History page.

**Stack:** React (Vite), Tailwind CSS

## Files

```
src/
├── api/authApi.js              # authRequest + resume API functions
├── assets/icons/towericon.jsx  # TowerIcon (existing)
└── pages/Dashboard.jsx
```

## Setup

Add the backend URL to the frontend `.env`:

```
VITE_API_URL=http://localhost:5000/api/auth
```

`authRequest` uses this URL as it is. The resume functions remove the trailing `/auth`, so they call `http://localhost:5000/api/resume`.

The page imports the API like this. Adjust the number of `../` if your page is at a different folder depth:

```js
import { analyzeResume } from '../../../api/authApi';
```

## What the page does

**Upload form**
- PDF upload that checks the file type and the 5 MB limit before anything is sent. The selected file's name and size are shown.
- Job description box with a character counter. At least 50 characters are required.
- **Analyze** button with a loading spinner. The form is disabled while the analysis runs.
- Errors are shown in a red box. A 401 response shows "Your session has expired. Please log in again."

**Result card** (right column)
- Before any analysis: an empty state asking the user to upload a resume.
- While analyzing: a spinner.
- After analysis: the match percentage and verdict (Excellent, Good, Average or Poor), coloured by score, with the summary as feedback.

| Score | Colour |
|---|---|
| 85 and above | Green |
| 70 to 84 | Indigo |
| 50 to 69 | Amber |
| Below 50 | Red |

**Detailed Analysis** (appears under the form after a result)
- Score breakdown bars: Skills Match, Keywords, Experience, Resume Sections, Formatting & Contact
- Matched, missing and additional skills
- Required vs. found experience, action verb count and quantified achievements
- Strengths and suggestions to improve

**New Analysis** clears the form and the result.

**Profile card:** shows the user's name from `localStorage.user`, or "User" if it is not found.

## API used

```js
analyzeResume(file, jobDesc, token?)   // POST /api/resume
```

It sends `multipart/form-data` with two fields:

| Field | Value |
|---|---|
| `resume` | The PDF file |
| `job_desc` | The job description text |

The response's `analysis` object is stored in state and drives the Result card and the Detailed Analysis section.

This function uses plain `fetch` with `FormData`, because `authRequest` always sends JSON and cannot upload a file.

## Token

If you pass `token` as the last argument, it is used. Otherwise the function looks for it in `localStorage` and then `sessionStorage`, under `token`, `accessToken`, `authToken`, `jwt` or `access_token`, or inside a JSON object saved as `auth`, `user`, `userInfo`, `authData`, `session` or `userData`. If no token is found, the request is not sent and "You are not logged in" is shown.

If your token lives only in React Context, pass it in:

```js
const { token } = useAuth();
await analyzeResume(file, jobDesc, token);
```

or save it at login with `localStorage.setItem("token", data.token)` and remove it at logout.

## Troubleshooting

| Problem | Fix |
|---|---|
| `Authentication token required` | The token is not being found. Check DevTools → Application → Local Storage for the key your app uses, or pass the token as the last argument. |
| `does not provide an export named 'authRequest'` | `authApi.js` was overwritten. It must contain `authRequest` and the resume functions together. |
| Blank page / "Failed to resolve import" | The `'../../../api/authApi'` import path does not match your folder structure. |
| `Very little text found in the PDF` | The resume is a scanned image. Export it again as a text-based PDF. |