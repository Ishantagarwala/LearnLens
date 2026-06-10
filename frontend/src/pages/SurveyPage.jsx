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
      <div className="prompt" style={{ whiteSpace: "pre-wrap" }}>{item.text}</div>
      <div className="options">
        {item.options.map((opt, idx) => (
          <label key={idx} className="mcq-option">
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
  
  // States
  const [profile, setProfile] = useState({ name: "", roll: "", email: "" });
  const [metadata, setMetadata] = useState({
    stream: "Science",
    prior_coding: "No",
    device_availability: "Laptop + Phone",
    study_hours: "",
    sleep_hours: "",
    confusing_part: "",
    support_type: "Peer study group"
  });
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

  // Steps:
  // 0 = Profile Info
  // 1 = Section A: Demographics & Hardware
  // 2 = Section B: Study Habits (SHI)
  // 3 = Section C: Self-Efficacy (SEI)
  // 4 = Section D: Attention (ATI)
  // 5 = Section E: Stress (SWI)
  // 6 = Section F: Programming Diagnostic (2 MCQs, 2 text fields)
  // 7 = Section G: Reflection & Support
  // 8 = Review & Submit
  const sectionKeys = ["SHI", "SEI", "ATI", "SWI"];
  const totalSteps = 9;

  const stepLabel = useMemo(() => {
    if (!schema) return "";
    if (step === 0) return "About you";
    if (step === 1) return "Section A: Demographics & Device Info";
    if (step >= 2 && step <= 5) return schema.sections[sectionKeys[step - 2]].title;
    if (step === 6) return schema.diagnostic.title;
    if (step === 7) return "Section G: Reflection & Support";
    return "Review & submit";
  }, [schema, step]);

  function setLikertValue(id, value) {
    setLikert((prev) => ({ ...prev, [id]: value }));
  }
  
  function setMcqValue(id, value) {
    setMcq((prev) => ({ ...prev, [id]: value }));
  }

  function setMetaValue(key, value) {
    setMetadata((prev) => ({ ...prev, [key]: value }));
  }

  function canAdvance() {
    if (!schema) return false;
    if (step === 0) return profile.name.trim().length >= 2 && profile.roll.trim().length >= 2;
    if (step === 1) {
      return (
        metadata.stream &&
        metadata.prior_coding &&
        metadata.device_availability &&
        metadata.study_hours.toString().trim().length > 0 &&
        metadata.sleep_hours.toString().trim().length > 0
      );
    }
    if (step >= 2 && step <= 5) {
      const items = schema.sections[sectionKeys[step - 2]].items;
      return items.every((it) => likert[it.id] >= 1 && likert[it.id] <= 5);
    }
    if (step === 6) {
      // mcqs ds1 and ds2, texts ds3 and ds4
      return (
        Number.isInteger(mcq.ds1) &&
        Number.isInteger(mcq.ds2) &&
        (mcq.ds3 || "").trim().length > 0 &&
        (mcq.ds4 || "").trim().length > 0
      );
    }
    if (step === 7) {
      return (mcq.confusing_part || "").trim().length > 0 || metadata.confusing_part.trim().length > 0;
    }
    return true;
  }

  async function handleSubmit() {
    setSubmitting(true);
    setSubmitError("");
    
    // Merge confused part to metadata
    const finalMetadata = {
      ...metadata,
      confusing_part: metadata.confusing_part || mcq.confusing_part || ""
    };

    try {
      const res = await api.submitSurvey({
        name: profile.name,
        roll: profile.roll,
        email: profile.email,
        likert,
        diagnostic: mcq,
        metadata: finalMetadata
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
      <div className="card text-center">
        <p>Loading survey questions...</p>
      </div>
    );
  }

  if (result) {
    return <SubmissionResult result={result} metadata={metadata} />;
  }

  return (
    <>
      <div className="page-header text-center">
        <h1>Programming Psychology & Skill Diagnostic</h1>
        <p>
          This reflective mid-semester diagnostic helps customize classroom support. Answer honestly—the psychometrics are about your learning patterns, not grades.
        </p>
      </div>

      <SectionProgress step={step} total={totalSteps} />

      <div className="card card-wizard">
        <h2>{stepLabel}</h2>

        {step === 0 && (
          <ProfileStep profile={profile} setProfile={setProfile} />
        )}

        {step === 1 && (
          <DemographicsStep
            formMetadata={schema.formMetadata}
            metadata={metadata}
            setMetaValue={setMetaValue}
          />
        )}

        {step >= 2 && step <= 5 && (
          <SectionStep
            section={schema.sections[sectionKeys[step - 2]]}
            likert={likert}
            setLikertValue={setLikertValue}
          />
        )}

        {step === 6 && (
          <DiagnosticStep
            diagnostic={schema.diagnostic}
            mcq={mcq}
            setMcqValue={setMcqValue}
          />
        )}

        {step === 7 && (
          <SupportStep
            formMetadata={schema.formMetadata}
            metadata={metadata}
            setMetaValue={setMetaValue}
          />
        )}

        {step === 8 && (
          <ReviewStep
            profile={profile}
            likert={likert}
            mcq={mcq}
            metadata={metadata}
            schema={schema}
          />
        )}

        {submitError ? (
          <div className="alert alert-error" style={{ marginTop: 16 }}>{submitError}</div>
        ) : null}

        <div className="wizard-actions">
          <button
            className="btn btn-ghost"
            type="button"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0 || submitting}
          >
            Back
          </button>
          
          {step < 8 ? (
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
              {submitting ? "Submitting…" : "Submit reflection"}
            </button>
          )}
        </div>
      </div>
    </>
  );
}

function SectionProgress({ step, total }) {
  const labels = [
    "About",
    "Demographics",
    "Study Habits",
    "Confidence",
    "Focus",
    "Well-being",
    "Diagnostic",
    "Support",
    "Review"
  ];
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
        Please enter your credentials. Name and Roll Number are required so we can map your feedback to your mentor profile.
      </p>
      <div className="form-row">
        <label htmlFor="name">Full Name</label>
        <input
          id="name"
          type="text"
          value={profile.name}
          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
          placeholder="e.g. Aarav Mehta"
          required
        />
      </div>
      <div className="form-row">
        <label htmlFor="roll">Roll Number (BCA Format)</label>
        <input
          id="roll"
          type="text"
          value={profile.roll}
          onChange={(e) => setProfile({ ...profile, roll: e.target.value })}
          placeholder="e.g. BCA-2026-12"
          required
        />
      </div>
      <div className="form-row">
        <label htmlFor="email">Email Address (Optional)</label>
        <input
          id="email"
          type="email"
          value={profile.email}
          onChange={(e) => setProfile({ ...profile, email: e.target.value })}
          placeholder="student@college.edu"
        />
      </div>
    </>
  );
}

function DemographicsStep({ formMetadata, metadata, setMetaValue }) {
  return (
    <>
      <p className="subtle" style={{ marginTop: 0 }}>
        Help us understand your background stream, hardware setup, and baseline habits.
      </p>
      <div className="form-row">
        <label>{formMetadata.stream.text}</label>
        <select
          value={metadata.stream}
          onChange={(e) => setMetaValue("stream", e.target.value)}
          className="form-select"
          style={{ padding: 10, borderRadius: 10, border: "1px solid var(--slate-300)" }}
        >
          {formMetadata.stream.options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>

      <div className="form-row" style={{ marginTop: 14 }}>
        <label>{formMetadata.priorCoding.text}</label>
        <div className="binary-toggle-container">
          {formMetadata.priorCoding.options.map((opt) => (
            <button
              key={opt}
              type="button"
              className={`btn btn-toggle ${metadata.prior_coding === opt ? "active-yes" : ""}`}
              onClick={() => setMetaValue("prior_coding", opt)}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      <div className="form-row" style={{ marginTop: 14 }}>
        <label>{formMetadata.deviceAvailability.text}</label>
        <div className="options-vertical" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {formMetadata.deviceAvailability.options.map((opt) => (
            <label key={opt} className="mcq-option" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="radio"
                name="device_availability"
                checked={metadata.device_availability === opt}
                onChange={() => setMetaValue("device_availability", opt)}
              />
              <span>{opt}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="grid cols-2" style={{ marginTop: 14 }}>
        <div className="form-row">
          <label htmlFor="study_hours">{formMetadata.studyHours.text}</label>
          <input
            id="study_hours"
            type="number"
            step="0.5"
            min="0"
            max="24"
            value={metadata.study_hours}
            onChange={(e) => setMetaValue("study_hours", e.target.value)}
            placeholder={formMetadata.studyHours.placeholder}
            required
          />
        </div>
        <div className="form-row">
          <label htmlFor="sleep_hours">{formMetadata.sleepHours.text}</label>
          <input
            id="sleep_hours"
            type="number"
            step="0.5"
            min="0"
            max="24"
            value={metadata.sleep_hours}
            onChange={(e) => setMetaValue("sleep_hours", e.target.value)}
            placeholder={formMetadata.sleepHours.placeholder}
            required
          />
        </div>
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
  const mcqs = diagnostic.items.filter((it) => it.type === "mcq");
  const texts = diagnostic.items.filter((it) => it.type === "text");

  return (
    <>
      <p className="subtle" style={{ marginTop: 0 }}>{diagnostic.subtitle}.</p>
      
      {/* MCQs */}
      {mcqs.map((item) => (
        <MCQItem
          key={item.id}
          item={item}
          value={mcq[item.id]}
          onChange={(v) => setMcqValue(item.id, v)}
        />
      ))}

      {/* Code Text Questions */}
      {texts.map((item) => (
        <div key={item.id} className="mcq" style={{ marginTop: 14 }}>
          <div className="prompt" style={{ whiteSpace: "pre-wrap" }}>{item.text}</div>
          <input
            type="text"
            className="form-row"
            style={{ padding: 10, borderRadius: 10, border: "1px solid var(--slate-300)", width: "100%", marginTop: 8 }}
            value={mcq[item.id] || ""}
            onChange={(e) => setMcqValue(item.id, e.target.value)}
            placeholder={item.placeholder}
            required
          />
        </div>
      ))}
    </>
  );
}

function SupportStep({ formMetadata, metadata, setMetaValue }) {
  return (
    <>
      <p className="subtle" style={{ marginTop: 0 }}>
        Tell us about your learning bottlenecks and select what support options you prefer.
      </p>
      <div className="form-row">
        <label htmlFor="confusing_part">{formMetadata.confusingPart.text}</label>
        <textarea
          id="confusing_part"
          rows={3}
          style={{ padding: 10, borderRadius: 10, border: "1px solid var(--slate-300)", width: "100%", fontFamily: "inherit" }}
          value={metadata.confusing_part}
          onChange={(e) => setMetaValue("confusing_part", e.target.value)}
          placeholder={formMetadata.confusingPart.placeholder}
          required
        />
      </div>
      
      <div className="form-row" style={{ marginTop: 14 }}>
        <label>{formMetadata.supportType.text}</label>
        <select
          value={metadata.support_type}
          onChange={(e) => setMetaValue("support_type", e.target.value)}
          className="form-select"
          style={{ padding: 10, borderRadius: 10, border: "1px solid var(--slate-300)" }}
        >
          {formMetadata.supportType.options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>
    </>
  );
}

function ReviewStep({ profile, likert, mcq, metadata, schema }) {
  const counts = {
    SHI: Object.keys(likert).filter((k) => k.startsWith("shi")).length,
    SEI: Object.keys(likert).filter((k) => k.startsWith("sei")).length,
    ATI: Object.keys(likert).filter((k) => k.startsWith("ati")).length,
    SWI: Object.keys(likert).filter((k) => k.startsWith("swi")).length,
    DS: Object.keys(mcq).filter((k) => k.startsWith("ds")).length
  };
  
  return (
    <>
      <p className="subtle" style={{ marginTop: 0 }}>
        All answers are complete. Submit to view your scored mentoring profile.
      </p>
      <div className="review-box">
        <ul className="review-list">
          <li><strong>Name:</strong> {profile.name || "—"}</li>
          <li><strong>Roll:</strong> {profile.roll || "—"}</li>
          <li><strong>10+2 Stream:</strong> {metadata.stream}</li>
          <li><strong>Coding Exposure:</strong> {metadata.prior_coding}</li>
          <li><strong>Device Access:</strong> {metadata.device_availability}</li>
          <li><strong>Study Habits items:</strong> {counts.SHI}/{schema.sections.SHI.items.length} answered</li>
          <li><strong>Confidence items:</strong> {counts.SEI}/{schema.sections.SEI.items.length} answered</li>
          <li><strong>Focus items:</strong> {counts.ATI}/{schema.sections.ATI.items.length} answered</li>
          <li><strong>Stress items:</strong> {counts.SWI}/{schema.sections.SWI.items.length} answered</li>
          <li><strong>Skill Checks:</strong> {counts.DS}/4 questions answered</li>
          <li><strong>Support Request:</strong> {metadata.support_type}</li>
        </ul>
      </div>
    </>
  );
}

function SubmissionResult({ result, metadata }) {
  const { scores, notes, name } = result;
  return (
    <>
      <div className="snapshot-toast">
        Excellent, {name}! Your survey responses are securely recorded. Here is your profile snapshot.
      </div>
      <div className="card">
        <div className="snapshot-header">
          <div>
            <h1>Your Mentoring Profile Snapshot</h1>
            <div className="roll">Priority Tier: <strong>{scores.tier}</strong> · Weak Indicators: <strong>{scores.risk_count} / 5</strong></div>
          </div>
          <span className={`tier-badge tier-${scores.tier}`}>{scores.tier} Tier</span>
        </div>
        
        <div style={{ marginTop: 24 }}>
          <IndexBar label="Study Habits (SHI)" sublabel="Organisational and planning routines" value={scores.SHI} />
          <IndexBar label="Self-Efficacy (SEI)" sublabel="Confidence & academic perseverance" value={scores.SEI} />
          <IndexBar label="Attention & Focus (ATI)" sublabel="Active concentration & comprehension checks" value={scores.ATI} />
          <IndexBar label="Stress & Well-being (SWI)" sublabel="Ability to manage study pressure" value={scores.SWI} />
          <IndexBar label="Diagnostic Skill (DS)" sublabel="Baseline coding concepts score (0-4)" value={(scores.DS / 4) * 100} raw={scores.DS} />
        </div>
      </div>
      
      <div className="card" style={{ marginTop: 20 }}>
        <h3 style={{ marginTop: 0 }}>Recommended Action Steps</h3>
        <div className="notes-container">
          {notes.map((n) => (
            <div key={n.key} className={`note sev-${n.severity}`}>
              <div className="note-title">{n.title}</div>
              <div className="note-body">{n.body}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
