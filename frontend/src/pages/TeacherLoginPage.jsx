import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api, setTeacherToken } from "../api.js";

export default function TeacherLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/dashboard";

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const { token } = await api.teacherLogin(password);
      setTeacherToken(token);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || "Could not sign in.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: "40px auto" }}>
      <div className="card">
        <h2 style={{ marginTop: 0 }}>Teacher sign-in</h2>
        <p className="subtle">
          Use the prototype password <span className="kbd">mentor123</span> to access the
          mentoring dashboard.
        </p>
        {error ? <div className="alert alert-error">{error}</div> : null}
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <label htmlFor="pw">Password</label>
            <input
              id="pw"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              autoFocus
              required
            />
          </div>
          <button className="btn btn-primary" type="submit" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
