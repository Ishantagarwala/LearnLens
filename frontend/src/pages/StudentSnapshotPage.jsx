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
      <div className="card">
        <p>Loading snapshot…</p>
      </div>
    );
  }

  const { scores, notes } = student;

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
            sublabel="DS — concept MCQs (0–4)"
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
