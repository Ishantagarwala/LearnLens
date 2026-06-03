import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-brand-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold">
                Career<span className="gradient-text">Pilot</span> AI
              </span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              Your AI-powered companion for career discovery, learning roadmaps, and professional growth.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Features</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link to="/careers" className="hover:text-white transition">Career Discovery</Link></li>
              <li><Link to="/roadmaps" className="hover:text-white transition">Learning Roadmaps</Link></li>
              <li><Link to="/courses" className="hover:text-white transition">Course Finder</Link></li>
              <li><Link to="/projects" className="hover:text-white transition">Project Ideas</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">AI Tools</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link to="/ai-tutor" className="hover:text-white transition">AI Tutor</Link></li>
              <li><Link to="/pdf-assistant" className="hover:text-white transition">PDF Assistant</Link></li>
              <li><Link to="/resume-analyzer" className="hover:text-white transition">Resume Analyzer</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Account</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link to="/dashboard" className="hover:text-white transition">Dashboard</Link></li>
              <li><Link to="/login" className="hover:text-white transition">Log In</Link></li>
              <li><Link to="/signup" className="hover:text-white transition">Sign Up</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/5 text-center text-sm text-gray-600">
          &copy; {new Date().getFullYear()} CareerPilot AI. Built with AI for the next generation of professionals.
        </div>
      </div>
    </footer>
  );
}
