const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api/auth";

/* =========================================================
   AUTH  (login, register, logout, getMe ...)
   ========================================================= */
export const authRequest = async (
  endpoint,
  { method = "GET", body, token } = {}
) => {
  const headers = {};

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(
      data.message || "Something went wrong"
    );
    error.status = response.status;
    throw error;
  }

  return data;
};

/* =========================================================
   RESUME ANALYSIS
   Resume routes /api pe hain (/api/auth pe nahi), isliye
   API_URL ke end se "/auth" hata dete hain:
   http://localhost:5000/api/auth  ->  http://localhost:5000/api
   ========================================================= */
const BASE_URL = API_URL.replace(/\/+$/, "").replace(/\/auth$/, "");

// Token dhoondhta hai — localStorage aur sessionStorage dono me,
// common key names ke saath, aur JSON objects ({ token, user }) ke andar bhi.
const TOKEN_KEYS = ["token", "accessToken", "authToken", "jwt", "access_token"];
const OBJECT_KEYS = ["auth", "user", "userInfo", "authData", "session", "userData"];

const readToken = (storage) => {
  for (const key of TOKEN_KEYS) {
    const value = storage.getItem(key);
    if (value) return value.replace(/^"|"$/g, ""); // JSON.stringify kiya ho to quotes hata do
  }
  for (const key of OBJECT_KEYS) {
    try {
      const obj = JSON.parse(storage.getItem(key));
      const token = obj?.token || obj?.accessToken || obj?.user?.token;
      if (token) return token;
    } catch {
      /* not JSON */
    }
  }
  return null;
};

const getToken = () => {
  try {
    return readToken(localStorage) || readToken(sessionStorage);
  } catch {
    return null;
  }
};

// Resume upload FormData (file) hai, isliye authRequest (JSON) use nahi hota.
// Content-Type khud set NAHI karna — browser FormData ke liye khud lagata hai.
// `token` pass karoge to wahi use hoga (jaise authRequest me), warna storage se.
const resumeRequest = async (path, { token: explicitToken, ...options } = {}) => {
  const token = explicitToken || getToken();

  if (!token) {
    const error = new Error("You are not logged in. Please log in again.");
    error.status = 401;
    throw error;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(
      data.message || "Something went wrong. Please try again."
    );
    error.status = response.status;
    throw error;
  }

  return data;
};

// POST /resume  — FormData: resume (PDF) + job_desc
// (Last `token` parameter optional hai — Context se token ho to pass kar do)
export const analyzeResume = (file, jobDesc, token) => {
  const fd = new FormData();
  fd.append("resume", file);
  fd.append("job_desc", jobDesc);
  return resumeRequest("/resume", { method: "POST", body: fd, token });
};

// GET /resume?page=&limit=  — logged-in user ki history
export const getResumeHistory = (page = 1, limit = 12, token) =>
  resumeRequest(`/resume?page=${page}&limit=${limit}`, { token });

// GET /resume/:id  — ek analysis ki full detail
export const getResumeById = (id, token) =>
  resumeRequest(`/resume/${id}`, { token });

// DELETE /resume/:id
export const deleteResume = (id, token) =>
  resumeRequest(`/resume/${id}`, { method: "DELETE", token });