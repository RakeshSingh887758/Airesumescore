# Resume Analysis — History Page

The History page lists every resume analysis the logged-in user has run from the Dashboard, newest first. The user can open the full report for any analysis or delete it.

**Stack:** React (Vite), Tailwind CSS

## Files

```
src/
├── api/authApi.js       # authRequest + resume API functions
└── pages/History.jsx
```

`History.module.css` is no longer used, since all styling is Tailwind. You can delete it.

## Setup

The page uses the same `.env` value as the rest of the app:

```
VITE_API_URL=http://localhost:5000/api/auth
```

The resume functions remove the trailing `/auth`, so they call `http://localhost:5000/api/resume`.

The page imports the API like this. Adjust the number of `../` if your page is at a different folder depth:

```js
import { deleteResume, getResumeById, getResumeHistory } from '../../../api/authApi';
```

## What the page does

**List**
- Loads the user's analyses, 12 per page, newest first.
- Shows the total count under the heading, for example "14 analyses so far".
- Previous / Next pagination when there is more than one page.

**Each card shows**
- Match percentage in a coloured circle, with the verdict (Excellent, Good, Average or Poor)
- Job title, guessed from the job description (for example "Full Stack Developer")
- Resume file name
- Summary, cut to 3 lines
- Up to 3 missing skills, plus a "+N more" chip if there are more
- Date in `25-10-2026` format
- **View** and **Delete** buttons

| Score | Colour |
|---|---|
| 85 and above | Green |
| 70 to 84 | Indigo |
| 50 to 69 | Amber |
| Below 50 | Red |

**View (details modal)**
- Fetches the full report and shows the score, verdict and summary, the score breakdown bars, matched and missing skills, suggestions, and the original job description (collapsed by default).
- Close it with ✕, the Escape key, or by clicking outside. On mobile it opens as a bottom sheet.

**Delete**
- Asks for confirmation, then removes the analysis and reloads the list.
- If the last card on a page is deleted, the page moves back one.

**Other states**
- Loading skeleton cards while data loads
- An empty state ("No analyses yet") when the user has none
- An error message with a **Retry** button. A 401 shows "Your session has expired. Please log in again."

## API used

| Function | Calls | Used for |
|---|---|---|
| `getResumeHistory(page, limit, token?)` | `GET /api/resume?page=&limit=` | The card list |
| `getResumeById(id, token?)` | `GET /api/resume/:id` | The details modal |
| `deleteResume(id, token?)` | `DELETE /api/resume/:id` | The Delete button |

The list response caps `matchedSkills` and `missingSkills` at 6 items each. The full lists come from `getResumeById`.

## Token

If you pass `token` as the last argument, it is used. Otherwise the functions look for it in `localStorage` and then `sessionStorage`, under `token`, `accessToken`, `authToken`, `jwt` or `access_token`, or inside a JSON object saved as `auth`, `user`, `userInfo`, `authData`, `session` or `userData`. If no token is found, the request is not sent and "You are not logged in" is shown.

If your token lives only in React Context, pass it in:

```js
const { token } = useAuth();
await getResumeHistory(page, 12, token);
```

or save it at login with `localStorage.setItem("token", data.token)` and remove it at logout.

## Troubleshooting

| Problem | Fix |
|---|---|
| `Authentication token required` | The token is not being found. Check DevTools → Application → Local Storage for the key your app uses, or pass the token as the last argument. |
| Blank page / "Failed to resolve import" | The `'../../../api/authApi'` import path does not match your folder structure. |
| List is always empty | Analyses are saved per user. Run an analysis on the Dashboard with the same logged-in account. |
| `404` on `/api/auth/resume` | The resume routes are registered under `/api`, not `/api/auth`. Check `app.use("/api", ...)` in `server.js`. |