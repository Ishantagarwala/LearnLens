import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navLinks = [
  { to: '/careers', label: 'Career Discovery' },
  { to: '/roadmaps', label: 'Roadmaps' },
  { to: '/courses', label: 'Courses' },
  { to: '/ai-tutor', label: 'AI Tutor' },
  { to: '/pdf-assistant', label: 'PDF Assistant' },
  { to: '/resume-analyzer', label: 'Resume Analyzer' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-brand-dark/60 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold">
              Career<span className="gradient-text">Pilot</span> AI
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-2 text-sm rounded-xl transition-all duration-200 ${
                  location.pathname === link.to
                    ? 'text-white bg-white/10'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-3">
            {user ? (
              <>
                <Link to="/dashboard" className="btn-outline !py-2 !px-4 text-sm">
                  Dashboard
                </Link>
                <button onClick={logout} className="text-sm text-gray-400 hover:text-white transition">
                  Logout
                </button>
                <div className="w-8 h-8 rounded-full bg-gradient-brand flex items-center justify-center text-sm font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm text-gray-300 hover:text-white transition px-4 py-2">
                  Log in
                </Link>
                <Link to="/signup" className="btn-primary !py-2 !px-5 text-sm">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          <button className="lg:hidden p-2" onClick={() => setOpen(!open)}>
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-brand-dark/95 backdrop-blur-xl border-b border-white/5"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className="block px-4 py-3 text-sm rounded-xl text-gray-300 hover:text-white hover:bg-white/5 transition"
                >
                  {link.label}
                </Link>
              ))}
              <hr className="border-white/10 my-2" />
              {user ? (
                <>
                  <Link to="/dashboard" onClick={() => setOpen(false)} className="block px-4 py-3 text-sm text-gray-300 hover:text-white">
                    Dashboard
                  </Link>
                  <button onClick={() => { logout(); setOpen(false); }} className="block w-full text-left px-4 py-3 text-sm text-gray-400">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setOpen(false)} className="block px-4 py-3 text-sm text-gray-300">Log in</Link>
                  <Link to="/signup" onClick={() => setOpen(false)} className="block px-4 py-3 text-sm font-semibold gradient-text">Sign Up</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
