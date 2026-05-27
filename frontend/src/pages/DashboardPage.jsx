import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import { api } from "../api.js";

const INDEX_META = [
  { key: "SHI", label: "Study Habits", color: "#1e3a8a" },
  { key: "SEI", label: "Self-Efficacy", color: "#0f766e" },
  { key: "ATI", label: "Attention/Thinking", color: "#7c3aed" },
  { key: "SWI", label: "Stress & Well-being", color: "#b45309" },
  { key: "DS_pct", label: "Diagnostic Skill", color: "#be123c" }
];

function Score({ value, threshold = 60 }) {
  const bad = value < threshold;
  return <span className={`score-cell ${bad ? "bad" : "ok"}`}>{value}</span>;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [clusters, setClusters] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    Promise.all([api.students(), api.clusters()])
      .then(([studentsRes, clustersRes]) => {
        if (cancelled) return;
        setData(studentsRes);
        setClusters(clustersRes);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Could not load dashboard.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <div className="card">
        <div className="alert alert-error">{error}</div>
      </div>
    );
  }
  if (!data) {
    return (
      <div className="card">
        <p>Loading dashboard…</p>
      </div>
    );
  }

  const { students, summary } = data;

  const chartData = INDEX_META.map((meta) => ({
    name: meta.label,
    value: summary.averages[meta.key],
    color: meta.color
  }));

  return (
    <>
      <div className="page-header">
        <h1>Mentoring Dashboard</h1>
        <p>Class snapshot across all five mentoring indices.</p>
      </div>

      <div className="grid cols-4">
        <SummaryCard label="Total students" value={summary.total} hint="Submissions on file" />
        <SummaryCard
          label="High priority"
          value={summary.tiers.High}
          hint="Risk count 4–5"
          accent="#dc2626"
        />
        <SummaryCard
          label="Medium priority"
          value={summary.tiers.Medium}
          hint="Risk count 2–3"
          accent="#ca8a04"
        />
        <SummaryCard
          label="Low priority"
          value={summary.tiers.Low}
          hint="Risk count 0–1"
          accent="#16a34a"
        />
      </div>

      <div className="card" style={{ marginTop: 18 }}>
        <h3 style={{ marginTop: 0 }}>Class average across indices</h3>
        <p className="subtle" style={{ marginTop: -4 }}>
          All four Likert indices and the diagnostic score (scaled to 0–100) on a single
          axis, so dips are easy to spot.
        </p>
        <div style={{ width: "100%", height: 260 }}>
          <ResponsiveContainer>
            <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fill: "#334155", fontSize: 12 }} />
              <YAxis domain={[0, 100]} tick={{ fill: "#334155", fontSize: 12 }} />
              <Tooltip
                cursor={{ fill: "rgba(30, 58, 138, 0.05)" }}
                contentStyle={{ borderRadius: 10, border: "1px solid #e2e8f0" }}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card" style={{ marginTop: 18 }}>
        <h3 style={{ marginTop: 0 }}>Student roster</h3>
        <p className="subtle" style={{ marginTop: -4 }}>
          Click a row to open the student's mentoring snapshot.
        </p>
        <div style={{ overflowX: "auto" }}>
          <table className="student-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Roll</th>
                <th>SHI</th>
                <th>SEI</th>
                <th>ATI</th>
                <th>SWI</th>
                <th>DS</th>
                <th>Risk</th>
                <th>Tier</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id} onClick={() => navigate(`/students/${s.id}`)}>
                  <td>
                    <strong style={{ color: "var(--navy-900)" }}>{s.name}</strong>
                  </td>
                  <td className="subtle">{s.roll}</td>
                  <td className="num"><Score value={s.scores.SHI} /></td>
                  <td className="num"><Score value={s.scores.SEI} /></td>
                  <td className="num"><Score value={s.scores.ATI} /></td>
                  <td className="num"><Score value={s.scores.SWI} /></td>
                  <td className="num"><Score value={s.scores.DS} threshold={2} /></td>
                  <td className="num">{s.scores.risk_count}/5</td>
                  <td>
                    <span className={`tier-badge tier-${s.scores.tier}`}>
                      {s.scores.tier}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <MLInsightsCard clusters={clusters} students={students} />
    </>
  );
}

function SummaryCard({ label, value, hint, accent }) {
  return (
    <div className="summary-card" style={accent ? { borderTop: `4px solid ${accent}` } : null}>
      <div className="label">{label}</div>
      <div className="value">{value}</div>
      <div className="hint">{hint}</div>
    </div>
  );
}

function MLInsightsCard({ clusters, students }) {
  if (!clusters) return null;
  const byId = new Map(students.map((s) => [s.id, s]));
  const palette = ["", "alt-1", "alt-2"];

  return (
    <div className="card" style={{ marginTop: 18 }}>
      <h3 style={{ marginTop: 0 }}>
        ML Insights <span className="coming-soon">Coming soon</span>
      </h3>
      <p className="subtle" style={{ marginTop: -4 }}>
        Prototype clustering — eventually this will be a trained model that flags
        cohorts every week. Today, students are bucketed by their dominant risk signal.
      </p>
      <div className="grid cols-3">
        {clusters.clusters.map((c, idx) => (
          <div key={c.label} className={`cluster ${palette[idx] || ""}`}>
            <div className="cluster-label">{c.label}</div>
            <div className="cluster-size">{c.size}</div>
            <div className="cluster-hint">
              {c.size === 0
                ? "No students in this cluster."
                : c.student_ids
                    .slice(0, 4)
                    .map((id) => byId.get(id)?.name)
                    .filter(Boolean)
                    .join(", ") + (c.size > 4 ? ` +${c.size - 4} more` : "")}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
