import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <h1>Mentor smarter, not harder.</h1>
        <p>
          MentorMap turns a single 5-minute student survey into a clear picture of who
          needs help, where they need it, and how to start the conversation. Built for
          BCA classrooms.
        </p>
        <div className="hero-actions">
          <Link to="/survey" className="btn btn-accent">
            Take the student survey
          </Link>
          <Link to="/teacher-login" className="btn btn-ghost" style={{ background: "rgba(255,255,255,0.1)", color: "white", borderColor: "rgba(255,255,255,0.2)" }}>
            I'm a teacher
          </Link>
        </div>
        <div className="pillrow">
          <span>Study Habits</span>
          <span>Self-Efficacy</span>
          <span>Attention &amp; Thinking</span>
          <span>Stress &amp; Well-being</span>
          <span>Diagnostic Skill</span>
        </div>
      </section>

      <div className="grid cols-3" style={{ marginTop: 24 }}>
        <div className="card">
          <h3>1. Listen</h3>
          <p className="subtle">
            Students answer 18 quick Likert items and 4 concept MCQs. Tone is friendly,
            never punitive — and they can finish on a phone.
          </p>
        </div>
        <div className="card">
          <h3>2. Score</h3>
          <p className="subtle">
            Five indices (SHI, SEI, ATI, SWI, DS) are computed automatically, with
            reverse-scoring for negatively worded items. Each student is placed into a
            Low / Medium / High mentoring tier.
          </p>
        </div>
        <div className="card">
          <h3>3. Mentor</h3>
          <p className="subtle">
            Teachers get a dashboard with class averages, color-coded risk levels, and
            per-student snapshots with actionable mentoring notes.
          </p>
        </div>
      </div>

      <div className="card" style={{ marginTop: 24 }}>
        <h3 style={{ marginTop: 0 }}>Prototype access</h3>
        <p className="subtle" style={{ marginBottom: 8 }}>
          Teacher login password: <span className="kbd">mentor123</span> (default for the
          prototype). The class is pre-seeded with 10 dummy students, so the dashboard is
          populated on first load.
        </p>
      </div>
    </>
  );
}
