// Thin fetch wrapper around the MentorMap backend.
// In dev, Vite proxies /api to the Express server; in prod they share an origin.

const TOKEN_KEY = "mentormap_teacher_token";

export function setTeacherToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}
export function getTeacherToken() {
  return localStorage.getItem(TOKEN_KEY) || "";
}
export function isTeacher() {
  return !!getTeacherToken();
}

async function request(path, { method = "GET", body, auth = false } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = getTeacherToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(`/api${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });
  const text = await res.text();
  const json = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const err = new Error(json?.error || `Request failed: ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return json;
}

export const api = {
  health: () => request("/health"),
  surveySchema: () => request("/survey/schema"),
  submitSurvey: (payload) => request("/survey/submit", { method: "POST", body: payload }),
  teacherLogin: (password) =>
    request("/auth/teacher-login", { method: "POST", body: { password } }),
  students: () => request("/students", { auth: true }),
  student: (id) => request(`/students/${id}`, { auth: true }),
  clusters: () => request("/ml/clusters", { auth: true })
};
