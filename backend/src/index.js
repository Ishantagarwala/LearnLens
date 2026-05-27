import express from "express";
import cors from "cors";

import { sections, diagnostic } from "./survey.js";
import {
  addSubmission,
  classSummary,
  getStudent,
  listStudents
} from "./store.js";
import { seedClass } from "./seed.js";

const app = express();
app.use(cors());
app.use(express.json({ limit: "256kb" }));

// Very small auth — teachers log in with a fixed password.
// This is a prototype; do not ship as-is. Token is a static string for simplicity.
const TEACHER_PASSWORD = process.env.TEACHER_PASSWORD || "mentor123";
const TEACHER_TOKEN = "mentormap-teacher-token";

function requireTeacher(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.replace(/^Bearer\s+/i, "").trim();
  if (token !== TEACHER_TOKEN) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "mentormap-backend" });
});

// Public — students fetch the form schema and submit.
app.get("/api/survey/schema", (_req, res) => {
  // Strip the `answer` field from diagnostic questions before sending to the client.
  const publicDiagnostic = {
    ...diagnostic,
    items: diagnostic.items.map(({ answer: _a, ...rest }) => rest)
  };
  res.json({ sections, diagnostic: publicDiagnostic });
});

app.post("/api/survey/submit", (req, res) => {
  const { name, roll, email, likert, diagnostic: dsResponses } = req.body || {};
  if (!name || !likert || !dsResponses) {
    return res.status(400).json({ error: "Missing name, likert, or diagnostic responses." });
  }
  const record = addSubmission({ name, roll, email, likert, diagnostic: dsResponses });
  // Send back the snapshot so the student sees their result immediately.
  res.status(201).json({
    id: record.id,
    name: record.name,
    scores: record.scores,
    notes: record.notes
  });
});

// Teacher login — returns a static bearer token on success.
app.post("/api/auth/teacher-login", (req, res) => {
  const { password } = req.body || {};
  if (password === TEACHER_PASSWORD) {
    return res.json({ token: TEACHER_TOKEN });
  }
  return res.status(401).json({ error: "Invalid password." });
});

// Protected — teacher dashboard endpoints.
app.get("/api/students", requireTeacher, (_req, res) => {
  res.json({ students: listStudents(), summary: classSummary() });
});

app.get("/api/students/:id", requireTeacher, (req, res) => {
  const student = getStudent(req.params.id);
  if (!student) return res.status(404).json({ error: "Student not found." });
  res.json(student);
});

// Static, hand-rolled clusters for the "ML Insights (Coming Soon)" panel.
// Membership is derived deterministically from current scores so the demo looks live.
app.get("/api/ml/clusters", requireTeacher, (_req, res) => {
  const students = listStudents();
  const clusters = {
    "Low Confidence": [],
    "High Stress": [],
    "Skill Gap": []
  };
  for (const s of students) {
    // Assign to the most relevant cluster; a student can appear in more than one.
    if (s.scores.SEI < 60) clusters["Low Confidence"].push(s.id);
    if (s.scores.SWI < 60) clusters["High Stress"].push(s.id);
    if (s.scores.DS < 2) clusters["Skill Gap"].push(s.id);
  }
  res.json({
    note: "Static prototype clustering — real ML pipeline is planned.",
    clusters: Object.entries(clusters).map(([label, ids]) => ({
      label,
      size: ids.length,
      student_ids: ids
    }))
  });
});

const PORT = Number(process.env.PORT) || 4000;
seedClass();
app.listen(PORT, () => {
  console.log(`MentorMap backend listening on http://localhost:${PORT}`);
});
