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

import { api, getTeacherToken } from "../api.js";

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
  const [customUrl, setCustomUrl] = useState("");
  const [appsScript, setAppsScript] = useState("");
  const [loadingScript, setLoadingScript] = useState(false);
  const [scriptCopied, setScriptCopied] = useState(false);

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

  const fetchAppsScript = async () => {
    setLoadingScript(true);
    try {
      const res = await api.appsScript(customUrl);
      setAppsScript(res.script);
    } catch (err) {
      console.error("Failed to load Apps Script", err);
    } finally {
      setLoadingScript(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(appsScript);
    setScriptCopied(true);
    setTimeout(() => setScriptCopied(false), 2000);
  };

  if (error) {
    return (
      <div className="card">
        <div className="alert alert-error">{error}</div>
      </div>
    );
  }
  if (!data) {
    return (
      <div className="card text-center">
        <p>Loading dashboard…</p>
      </div>
    );
  }

  const { students, summary } = data;
  
  const aggregates = summary.aggregates || {
    streams: {},
    priorCoding: {},
    devices: {},
    supportDemands: {}
  };

  const chartData = INDEX_META.map((meta) => ({
    name: meta.label,
    value: summary.averages[meta.key],
    color: meta.color
  }));

  const token = getTeacherToken();

  return (
    <>
      <div className="page-header dashboard-title-section">
        <div>
          <h1>LearnLens Dashboard</h1>
          <p>Class snapshot across psychometric surveys, diagnostic tasks, and support requirements.</p>
        </div>
        <div className="action-buttons-header">
          <a
            href={`/api/exporter/csv?authorization=Bearer ${token}`}
            download="learnlens_student_data.csv"
            className="btn btn-primary btn-sm"
          >
            📊 Export Roster to CSV
          </a>
        </div>
      </div>

      {/* Priority Summary Grid */}
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

      {/* Classroom Demographics Summary Panel */}
      <div className="card grid cols-3" style={{ marginTop: 18, gap: 16 }}>
        <div className="sub-summary-card">
          <h4>Study & Sleep Averages</h4>
          <div style={{ display: "flex", justifyContent: "space-around", marginTop: 12 }}>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, color: "var(--navy-900)" }}>{summary.averages.study_hours}h</div>
              <small className="subtle">Study/day</small>
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, color: "var(--navy-700)" }}>{summary.averages.sleep_hours}h</div>
              <small className="subtle">Sleep/night</small>
            </div>
          </div>
        </div>
        <div className="sub-summary-card">
          <h4>Coding Background</h4>
          <div style={{ display: "flex", justifyContent: "space-around", marginTop: 12 }}>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, color: "var(--green-500)" }}>{aggregates.priorCoding.Yes || 0}</div>
              <small className="subtle">Prior Exposure</small>
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, color: "var(--slate-500)" }}>{aggregates.priorCoding.No || 0}</div>
              <small className="subtle">No Prior Exp</small>
            </div>
          </div>
        </div>
        <div className="sub-summary-card">
          <h4>Device Breakdown</h4>
          <div style={{ textAlign: "left", fontSize: 12, marginTop: 4 }}>
            <div>Laptop + Phone: <strong>{aggregates.devices["Laptop + Phone"] || 0}</strong></div>
            <div>Phone only: <strong style={{ color: "#ef4444" }}>{aggregates.devices["Phone only"] || 0}</strong></div>
            <div>Lab only: <strong style={{ color: "var(--amber-500)" }}>{aggregates.devices["Lab only"] || 0}</strong></div>
          </div>
        </div>
      </div>

      {/* Next-week Mentoring Support Demands */}
      <div className="card" style={{ marginTop: 18 }}>
        <h3 style={{ marginTop: 0 }}>Mentoring Support Requested (Next Week)</h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 10 }}>
          {Object.entries(aggregates.supportDemands).map(([support, count]) => (
            <div key={support} style={{ padding: "8px 16px", borderRadius: 10, background: "var(--navy-50)", border: "1px solid var(--navy-100)", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 13, color: "var(--navy-900)" }}>{support}:</span>
              <strong style={{ fontSize: 16, color: "var(--navy-700)" }}>{count}</strong>
            </div>
          ))}
        </div>
      </div>

      {/* Average Indices Chart */}
      <div className="grid cols-1" style={{ marginTop: 18 }}>
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Class average across indices</h3>
          <p className="subtle" style={{ marginTop: -4 }}>
            All four Likert indices and the diagnostic score (scaled to 0–100) on a single axis.
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
      </div>

      {/* Student Roster */}
      <div className="card" style={{ marginTop: 18 }}>
        <h3 style={{ marginTop: 0 }}>Student Roster</h3>
        <p className="subtle" style={{ marginTop: -4 }}>
          Click a student row to inspect detailed indices, background streams, and coaching advice.
        </p>
        <div style={{ overflowX: "auto" }}>
          <table className="student-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Roll</th>
                <th>Stream</th>
                <th>Coding Exp</th>
                <th>SHI</th>
                <th>SEI</th>
                <th>ATI</th>
                <th>SWI</th>
                <th>DS</th>
                <th>Requested Support</th>
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
                  <td>{s.metadata?.stream || "Science"}</td>
                  <td className="center-cell">{s.metadata?.prior_coding === "Yes" ? "✅ Yes" : "No"}</td>
                  <td className="num"><Score value={s.scores.SHI} /></td>
                  <td className="num"><Score value={s.scores.SEI} /></td>
                  <td className="num"><Score value={s.scores.ATI} /></td>
                  <td className="num"><Score value={s.scores.SWI} /></td>
                  <td className="num"><Score value={s.scores.DS} threshold={2} /></td>
                  <td>{s.metadata?.support_type || "Peer study group"}</td>
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

      {/* Classroom Setup replication Tool */}
      <div className="card" style={{ marginTop: 18 }}>
        <h3 style={{ marginTop: 0 }}>Module 1-3 Setup: Replicate in Your Classroom</h3>
        <p className="subtle" style={{ marginTop: -4 }}>
          Deploy this exact diagnostic baseline survey in your own courses. Expose port 4000 (e.g. using ngrok) and enter your tunnel URL below to sync submissions with this dashboard.
        </p>
        
        <div className="form-row" style={{ maxWidth: 450, margin: "14px 0" }}>
          <label htmlFor="custom_url">Public Server Tunnel URL (optional)</label>
          <input
            id="custom_url"
            type="text"
            value={customUrl}
            onChange={(e) => {
              setCustomUrl(e.target.value);
              setAppsScript(""); // Reset script to force regenerate
            }}
            placeholder="e.g. https://yourtunnel.ngrok-free.app"
            style={{ padding: 10, borderRadius: 10, border: "1px solid var(--slate-300)" }}
          />
        </div>

        {!appsScript ? (
          <button className="btn btn-secondary btn-sm" onClick={fetchAppsScript} disabled={loadingScript}>
            {loadingScript ? "Generating Apps Script..." : "⚙️ Generate Google Apps Script Configuration"}
          </button>
        ) : (
          <div className="code-replication-block">
            <div className="code-header">
              <span>Google Apps Script (Google Sheets Editor)</span>
              <button className="btn btn-ghost btn-sm" onClick={copyToClipboard}>
                {scriptCopied ? "copied!" : "Copy Code"}
              </button>
            </div>
            <pre className="script-container"><code>{appsScript}</code></pre>
          </div>
        )}
      </div>

      {/* ML Phase Exporters */}
      <MLInsightsCard clusters={clusters} students={students} token={token} />
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

function MLInsightsCard({ clusters, students, token }) {
  if (!clusters) return null;
  const byId = new Map(students.map((s) => [s.id, s]));
  const palette = ["", "alt-1", "alt-2", "alt-3"];

  return (
    <div className="card" style={{ marginTop: 18 }}>
      <div className="ml-card-header">
        <div>
          <h3 style={{ marginTop: 0 }}>
            Module 5: Machine Learning Cohort Insights
          </h3>
          <p className="subtle" style={{ marginTop: -4 }}>
            Below are student clusters generated dynamically. Download the ML pipeline script to train Random Forest classifiers and customize K-Means models locally.
          </p>
        </div>
        <div style={{ alignSelf: "center" }}>
          <a
            href={`/api/exporter/python-ml?authorization=Bearer ${token}`}
            download="learnlens_ml_pipeline.py"
            className="btn btn-secondary btn-sm"
          >
            🐍 Download Python ML Pipeline Script
          </a>
        </div>
      </div>
      <div className="grid cols-4" style={{ marginTop: 14 }}>
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
