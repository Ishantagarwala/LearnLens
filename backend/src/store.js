// Data store managing live student submissions, scoring triggers, and demographic statistics

import { scoreSurvey, buildMentoringNotes } from "./survey.js";

let nextId = 1;
const students = new Map();

export function listStudents() {
  return Array.from(students.values()).sort((a, b) => a.name.localeCompare(b.name));
}

export function getStudent(id) {
  return students.get(String(id)) || null;
}

export function addSubmission({ name, roll, email, likert, diagnostic, metadata }) {
  const id = String(nextId++);
  
  // Scoring
  const scores = scoreSurvey({ likert, diagnostic });
  
  // Metadata extraction
  const meta = {
    stream: metadata?.stream || "Science",
    prior_coding: metadata?.prior_coding || "No",
    device_availability: metadata?.device_availability || "Laptop + Phone",
    study_hours: Number(metadata?.study_hours) || 2,
    sleep_hours: Number(metadata?.sleep_hours) || 7,
    confusing_part: metadata?.confusing_part || "",
    support_type: metadata?.support_type || "Peer study group"
  };

  const notes = buildMentoringNotes(scores, meta);
  const record = {
    id,
    name: name?.trim() || `Student ${id}`,
    roll: roll?.trim() || `BCA-${id.padStart(3, "0")}`,
    email: email?.trim() || "",
    submitted_at: new Date().toISOString(),
    responses: { likert, diagnostic },
    metadata: meta,
    scores,
    notes
  };
  
  students.set(id, record);
  return record;
}

export function clearStore() {
  students.clear();
  nextId = 1;
}

export function classSummary() {
  const all = listStudents();
  const tiers = { Low: 0, Medium: 0, High: 0 };
  const indexTotals = { SHI: 0, SEI: 0, ATI: 0, SWI: 0, DS: 0 };
  
  // Demographics aggregation
  const streams = {};
  const priorCoding = { Yes: 0, No: 0 };
  const devices = {};
  const supportDemands = {};
  let studyHoursSum = 0;
  let sleepHoursSum = 0;

  for (const s of all) {
    tiers[s.scores.tier] += 1;
    indexTotals.SHI += s.scores.SHI;
    indexTotals.SEI += s.scores.SEI;
    indexTotals.ATI += s.scores.ATI;
    indexTotals.SWI += s.scores.SWI;
    indexTotals.DS += s.scores.DS;

    const m = s.metadata || {};
    streams[m.stream] = (streams[m.stream] || 0) + 1;
    priorCoding[m.prior_coding === "Yes" ? "Yes" : "No"] += 1;
    devices[m.device_availability] = (devices[m.device_availability] || 0) + 1;
    supportDemands[m.support_type] = (supportDemands[m.support_type] || 0) + 1;
    studyHoursSum += m.study_hours || 0;
    sleepHoursSum += m.sleep_hours || 0;
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
      DS: Number((indexTotals.DS / n).toFixed(2)),
      DS_pct: Math.round(((indexTotals.DS / n) / 4) * 100),
      study_hours: Number((studyHoursSum / n).toFixed(1)),
      sleep_hours: Number((sleepHoursSum / n).toFixed(1))
    },
    aggregates: {
      streams,
      priorCoding,
      devices,
      supportDemands
    }
  };
}
