import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { api } from "../api.js";
import IndexBar from "../components/IndexBar.jsx";

export default function StudentSnapshotPage() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setStudent(null);
    setError("");
    api
      .student(id)
      .then((data) => {
        if (!cancelled) setStudent(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Could not load student.");
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (error) {
    return (
      <div className="card">
        <div className="alert alert-error">{error}</div>
        <Link to="/dashboard" className="btn btn-ghost">
          Back to dashboard
        </Link>
      </div>
    );
  }
  if (!student) {
    return (
      <div className="card text-center">
        <p>Loading student mentoring profile…</p>
      </div>
    );
  }

  const { scores, notes, metadata } = student;
  const m = metadata || {};

  return (
    <>
      <div style={{ marginBottom: 12 }}>
        <Link to="/dashboard" className="subtle">
          ← Back to dashboard
        </Link>
      </div>

      <div className="card">
        <div className="snapshot-header">
          <div>
            <h1>{student.name}</h1>
            <div className="roll">
              {student.roll}
              {student.email ? ` · ${student.email}` : ""}
            </div>
            <div className="subtle" style={{ marginTop: 4 }}>
              Submitted {new Date(student.submitted_at).toLocaleString()}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <span className={`tier-badge tier-${scores.tier}`}>{scores.tier} priority</span>
            <div className="subtle" style={{ marginTop: 6 }}>
              Risk count {scores.risk_count} / 5
            </div>
          </div>
        </div>

        {/* Demographics & Hardware Profile */}
        <div className="hardware-checklist-row" style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
          <div className="checklist-item">
            <span>Stream: <strong>{m.stream || "Science"}</strong></span>
          </div>
          <div className="checklist-item">
            <span>Prior Coding: <strong>{m.prior_coding || "No"}</strong></span>
          </div>
          <div className="checklist-item">
            <span>Device Availability: <strong>{m.device_availability || "Laptop + Phone"}</strong></span>
          </div>
          <div className="checklist-item">
            <span>Study Hours: <strong>{m.study_hours || 0}h/day</strong></span>
          </div>
          <div className="checklist-item">
            <span>Sleep Hours: <strong>{m.sleep_hours || 0}h/night</strong></span>
          </div>
        </div>

        {/* Confusing Concepts & Request Support */}
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--slate-200)" }}>
          <div>
            <strong>Confusing Programming Concepts:</strong>
            <p style={{ margin: "4px 0 0 0", color: "var(--slate-700)", fontStyle: m.confusing_part ? "normal" : "italic" }}>
              {m.confusing_part || "No specific bottleneck mentioned."}
            </p>
          </div>
          <div style={{ marginTop: 10 }}>
            <strong>Preferred Mentoring Support:</strong>{" "}
            <span className="coming-soon" style={{ marginLeft: 0, textTransform: "none", background: "var(--navy-100)" }}>
              {m.support_type || "Peer study group"}
            </span>
          </div>
        </div>
      </div>

      <div className="split" style={{ marginTop: 18 }}>
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Index scores</h3>
          <IndexBar
            label="Study Habits"
            sublabel="SHI — planning, routine, review"
            value={scores.SHI}
          />
          <IndexBar
            label="Self-Efficacy"
            sublabel="SEI — confidence and persistence"
            value={scores.SEI}
          />
          <IndexBar
            label="Attention & Thinking"
            sublabel="ATI — focus and critical reasoning"
            value={scores.ATI}
          />
          <IndexBar
            label="Stress & Well-being"
            sublabel="SWI — higher is healthier"
            value={scores.SWI}
          />
          <IndexBar
            label="Diagnostic Skill"
            sublabel="DS — concept MCQs & Code (0–4)"
            value={(scores.DS / 4) * 100}
            raw={scores.DS}
          />
        </div>

        <div className="card">
          <h3 style={{ marginTop: 0 }}>Mentoring notes</h3>
          {notes.map((n) => (
            <div key={n.key} className={`note sev-${n.severity}`}>
              <div className="note-title">{n.title}</div>
              <div className="note-body">{n.body}</div>
            </div>
          ))}
          <div className="subtle" style={{ marginTop: 12 }}>
            Notes are auto-generated from the student's index profile. Use them as a
            starting point — your judgement still leads the conversation.
          </div>
        </div>
      </div>
    </>
  );
}
