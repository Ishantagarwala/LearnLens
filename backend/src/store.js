// Very small in-memory store. The prototype intentionally avoids a real DB.
import { scoreSurvey, buildMentoringNotes } from "./survey.js";

let nextId = 1;
const students = new Map();

export function listStudents() {
  return Array.from(students.values()).sort((a, b) => a.name.localeCompare(b.name));
}

export function getStudent(id) {
  return students.get(String(id)) || null;
}

export function addSubmission({ name, roll, email, likert, diagnostic }) {
  const id = String(nextId++);
  const scores = scoreSurvey({ likert, diagnostic });
  const notes = buildMentoringNotes(scores);
  const record = {
    id,
    name: name?.trim() || `Student ${id}`,
    roll: roll?.trim() || `BCA-${id.padStart(3, "0")}`,
    email: email?.trim() || "",
    submitted_at: new Date().toISOString(),
    responses: { likert, diagnostic },
    scores,
    notes
  };
  students.set(id, record);
  return record;
}

// Class-wide aggregates used by the dashboard.
export function classSummary() {
  const all = listStudents();
  const tiers = { Low: 0, Medium: 0, High: 0 };
  const indexTotals = { SHI: 0, SEI: 0, ATI: 0, SWI: 0, DS: 0 };
  for (const s of all) {
    tiers[s.scores.tier] += 1;
    indexTotals.SHI += s.scores.SHI;
    indexTotals.SEI += s.scores.SEI;
    indexTotals.ATI += s.scores.ATI;
    indexTotals.SWI += s.scores.SWI;
    indexTotals.DS += s.scores.DS;
  }
  const n = all.length || 1;
  return {
    total: all.length,
    tiers,
    averages: {
      SHI: Math.round(indexTotals.SHI / n),
      SEI: Math.round(indexTotals.SEI / n),
      ATI: Math.round(indexTotals.ATI / n),
      SWI: Math.round(indexTotals.SWI / n),
      // Diagnostic stays on a 0–4 scale; scale to 0–100 for visual comparison too.
      DS: Number((indexTotals.DS / n).toFixed(2)),
      DS_pct: Math.round(((indexTotals.DS / n) / 4) * 100)
    }
  };
}
