import { NavLink, Route, Routes, useNavigate } from "react-router-dom";

import HomePage from "./pages/HomePage.jsx";
import SurveyPage from "./pages/SurveyPage.jsx";
import TeacherLoginPage from "./pages/TeacherLoginPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import StudentSnapshotPage from "./pages/StudentSnapshotPage.jsx";
import RequireTeacher from "./components/RequireTeacher.jsx";
import { isTeacher, setTeacherToken } from "./api.js";

export default function App() {
  const navigate = useNavigate();

  function handleLogout() {
    setTeacherToken(null);
    navigate("/");
  }

  return (
    <div className="app-shell">
      <header className="top-bar">
        <div className="brand">
          <span className="brand-mark">M</span>
          <div>
            MentorMap
            <span className="brand-sub">Classroom mentoring analytics</span>
          </div>
        </div>
        <nav>
          <NavLink to="/" end>
            Home
          </NavLink>
          <NavLink to="/survey">Student Survey</NavLink>
          {isTeacher() ? (
            <>
              <NavLink to="/dashboard">Dashboard</NavLink>
              <button type="button" onClick={handleLogout}>
                Sign out
              </button>
            </>
          ) : (
            <NavLink to="/teacher-login">Teacher Login</NavLink>
          )}
        </nav>
      </header>

      <main className="page">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/survey" element={<SurveyPage />} />
          <Route path="/teacher-login" element={<TeacherLoginPage />} />
          <Route
            path="/dashboard"
            element={
              <RequireTeacher>
                <DashboardPage />
              </RequireTeacher>
            }
          />
          <Route
            path="/students/:id"
            element={
              <RequireTeacher>
                <StudentSnapshotPage />
              </RequireTeacher>
            }
          />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </main>
    </div>
  );
}
