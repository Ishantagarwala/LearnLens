import { useEffect, useMemo, useState } from "react";
import { api } from "../api.js";
import IndexBar from "../components/IndexBar.jsx";

const LIKERT_LEGEND = ["Strongly disagree", "Strongly agree"];
const LIKERT_LABELS = {
  1: "Strongly disagree",
  2: "Disagree",
  3: "Neutral",
  4: "Agree",
  5: "Strongly agree"
};

function LikertItem({ item, value, onChange }) {
  return (
    <div className="likert">
      <div className="prompt">{item.text}</div>
      <div
        className="scale"
        role="radiogroup"
        aria-label={`Rate: ${item.text}`}
      >
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={LIKERT_LABELS[n]}
            className={value === n ? "selected" : ""}
            onClick={() => onChange(n)}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

function MCQItem({ item, value, onChange }) {
  return (
    <div className="mcq">
      <div className="prompt">{item.text}</div>
      <div className="options">
        {item.options.map((opt, idx) => (
          <label key={idx}>
            <input
              type="radio"
              name={item.id}
              checked={value === idx}
              onChange={() => onChange(idx)}
            />
            <span>{opt}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

export default function SurveyPage() {
  const [schema, setSchema] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState({ name: "", roll: "", email: "" });
  const [likert, setLikert] = useState({});
  const [mcq, setMcq] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    let cancelled = false;
    api
      .surveySchema()
      .then((data) => {
        if (!cancelled) setSchema(data);
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err.message || "Failed to load survey.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Steps: 0 = profile, 1..4 = SHI, SEI, ATI, SWI, 5 = Diagnostic, 6 = Review.
  const sectionKeys = ["SHI", "SEI", "ATI", "SWI"];
  const totalSteps = 7;

  const stepLabel = useMemo(() => {
    if (!schema) return "";
    if (step === 0) return "About you";
    if (step >= 1 && step <= 4) return schema.sections[sectionKeys[step - 1]].title;
    if (step === 5) return schema.diagnostic.title;
    return "Review & submit";
  }, [schema, step]);

  function setLikertValue(id, value) {
    setLikert((prev) => ({ ...prev, [id]: value }));
  }
  function setMcqValue(id, value) {
    setMcq((prev) => ({ ...prev, [id]: value }));
  }

  function canAdvance() {
    if (!schema) return false;
    if (step === 0) return profile.name.trim().length >= 2;
    if (step >= 1 && step <= 4) {
      const items = schema.sections[sectionKeys[step - 1]].items;
      return items.every((it) => likert[it.id] >= 1 && likert[it.id] <= 5);
    }
    if (step === 5) {
      return schema.diagnostic.items.every((it) => Number.isInteger(mcq[it.id]));
    }
    return true;
  }

  async function handleSubmit() {
    setSubmitting(true);
    setSubmitError("");
    try {
      const res = await api.submitSurvey({
        name: profile.name,
        roll: profile.roll,
        email: profile.email,
        likert,
        diagnostic: mcq
      });
      setResult(res);
    } catch (err) {
      setSubmitError(err.message || "Could not submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loadError) {
    return (
      <div className="card">
        <div className="alert alert-error">{loadError}</div>
      </div>
    );
  }
  if (!schema) {
    return (
      <div className="card">
        <p>Loading survey…</p>
      </div>
    );
  }

  if (result) {
    return <SubmissionResult result={result} />;
  }

  return (
    <>
      <div className="page-header">
        <h1>Student Survey</h1>
        <p>
          This survey takes about 5 minutes. There are no right or wrong answers for
          most questions — your honest response helps us mentor you better.
        </p>
      </div>

      <SectionProgress step={step} total={totalSteps} />

      <div className="card">
        <h2 style={{ marginTop: 0 }}>{stepLabel}</h2>

        {step === 0 && (
          <ProfileStep profile={profile} setProfile={setProfile} />
        )}

        {step >= 1 && step <= 4 && (
          <SectionStep
            section={schema.sections[sectionKeys[step - 1]]}
            likert={likert}
            setLikertValue={setLikertValue}
          />
        )}

        {step === 5 && (
          <DiagnosticStep
            diagnostic={schema.diagnostic}
            mcq={mcq}
            setMcqValue={setMcqValue}
          />
        )}

        {step === 6 && (
          <ReviewStep
            profile={profile}
            likert={likert}
            mcq={mcq}
            schema={schema}
          />
        )}

        {submitError ? <div className="alert alert-error" style={{ marginTop: 16 }}>{submitError}</div> : null}

        <div style={{ display: "flex", gap: 10, justifyContent: "space-between", marginTop: 20 }}>
          <button
            className="btn btn-ghost"
            type="button"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0 || submitting}
          >
            Back
          </button>
          {step < 6 ? (
            <button
              className="btn btn-primary"
              type="button"
              onClick={() => setStep((s) => s + 1)}
              disabled={!canAdvance()}
            >
              Continue
            </button>
          ) : (
            <button
              className="btn btn-accent"
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? "Submitting…" : "Submit survey"}
            </button>
          )}
        </div>
      </div>
    </>
  );
}

function SectionProgress({ step, total }) {
  const labels = ["About", "Study", "Confidence", "Focus", "Well-being", "Diagnostic", "Review"];
  return (
    <div className="section-progress">
      {labels.map((label, idx) => (
        <span
          key={label}
          className={`pill ${idx === step ? "active" : idx < step ? "done" : ""}`}
        >
          {idx + 1}. {label}
        </span>
      ))}
    </div>
  );
}

function ProfileStep({ profile, setProfile }) {
  return (
    <>
      <p className="subtle" style={{ marginTop: 0 }}>
        We use your name only so your mentor can find your snapshot. Email is optional.
      </p>
      <div className="form-row">
        <label htmlFor="name">Full name</label>
        <input
          id="name"
          type="text"
          value={profile.name}
          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
          placeholder="e.g. Riya Sharma"
          required
        />
      </div>
      <div className="form-row">
        <label htmlFor="roll">Roll number (optional)</label>
        <input
          id="roll"
          type="text"
          value={profile.roll}
          onChange={(e) => setProfile({ ...profile, roll: e.target.value })}
          placeholder="e.g. BCA-2026-23"
        />
      </div>
      <div className="form-row">
        <label htmlFor="email">Email (optional)</label>
        <input
          id="email"
          type="email"
          value={profile.email}
          onChange={(e) => setProfile({ ...profile, email: e.target.value })}
          placeholder="you@college.edu"
        />
      </div>
    </>
  );
}

function SectionStep({ section, likert, setLikertValue }) {
  return (
    <>
      <p className="subtle" style={{ marginTop: 0 }}>{section.subtitle}.</p>
      <div className="likert-legend">
        <span>1 — {LIKERT_LEGEND[0]}</span>
        <span>5 — {LIKERT_LEGEND[1]}</span>
      </div>
      {section.items.map((item) => (
        <LikertItem
          key={item.id}
          item={item}
          value={likert[item.id]}
          onChange={(v) => setLikertValue(item.id, v)}
        />
      ))}
    </>
  );
}

function DiagnosticStep({ diagnostic, mcq, setMcqValue }) {
  return (
    <>
      <p className="subtle" style={{ marginTop: 0 }}>{diagnostic.subtitle}.</p>
      {diagnostic.items.map((item) => (
        <MCQItem
          key={item.id}
          item={item}
          value={mcq[item.id]}
          onChange={(v) => setMcqValue(item.id, v)}
        />
      ))}
    </>
  );
}

function ReviewStep({ profile, likert, mcq, schema }) {
  const counts = {
    SHI: Object.keys(likert).filter((k) => k.startsWith("shi")).length,
    SEI: Object.keys(likert).filter((k) => k.startsWith("sei")).length,
    ATI: Object.keys(likert).filter((k) => k.startsWith("ati")).length,
    SWI: Object.keys(likert).filter((k) => k.startsWith("swi")).length,
    DS: Object.keys(mcq).length
  };
  return (
    <>
      <p className="subtle" style={{ marginTop: 0 }}>
        Looks good? Submit to see your mentoring snapshot. Your teacher will see this in
        their dashboard.
      </p>
      <ul style={{ paddingLeft: 18, color: "var(--slate-700)" }}>
        <li><strong>Name:</strong> {profile.name || "—"}</li>
        <li><strong>Roll:</strong> {profile.roll || "—"}</li>
        <li><strong>Study Habits:</strong> {counts.SHI}/{schema.sections.SHI.items.length} answered</li>
        <li><strong>Self-Efficacy:</strong> {counts.SEI}/{schema.sections.SEI.items.length} answered</li>
        <li><strong>Attention & Thinking:</strong> {counts.ATI}/{schema.sections.ATI.items.length} answered</li>
        <li><strong>Stress & Well-being:</strong> {counts.SWI}/{schema.sections.SWI.items.length} answered</li>
        <li><strong>Diagnostic:</strong> {counts.DS}/{schema.diagnostic.items.length} answered</li>
      </ul>
    </>
  );
}

function SubmissionResult({ result }) {
  const { scores, notes, name } = result;
  return (
    <>
      <div className="snapshot-toast">
        Thanks, {name}! Your responses have been recorded. Here's your snapshot.
      </div>
      <div className="card">
        <div className="snapshot-header">
          <div>
            <h1>Your mentoring snapshot</h1>
            <div className="roll">Tier · {scores.tier} · Risk count {scores.risk_count} / 5</div>
          </div>
          <span className={`tier-badge tier-${scores.tier}`}>{scores.tier} priority</span>
        </div>
        <IndexBar label="Study Habits" sublabel="SHI" value={scores.SHI} />
        <IndexBar label="Self-Efficacy" sublabel="SEI" value={scores.SEI} />
        <IndexBar label="Attention & Thinking" sublabel="ATI" value={scores.ATI} />
        <IndexBar label="Stress & Well-being" sublabel="SWI" value={scores.SWI} />
        <IndexBar label="Diagnostic Skill" sublabel="DS" value={(scores.DS / 4) * 100} raw={scores.DS} />
      </div>
      <div className="card">
        <h3 style={{ marginTop: 0 }}>What we suggest</h3>
        {notes.map((n) => (
          <div key={n.key} className={`note sev-${n.severity}`}>
            <div className="note-title">{n.title}</div>
            <div className="note-body">{n.body}</div>
          </div>
        ))}
      </div>
    </>
  );
}
