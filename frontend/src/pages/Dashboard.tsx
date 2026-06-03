import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Map, BookOpen, MessageSquare, FileSearch, Sparkles,
  Brain, FolderOpen, ChevronRight, Trophy,
} from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import PageWrapper from '../components/PageWrapper';

interface Stats {
  roadmapCount: number;
  bookmarkCount: number;
  chatCount: number;
  resumeScore: number | null;
}

const shortcuts = [
  { to: '/careers', icon: Sparkles, label: 'Career Discovery', color: 'from-purple-600 to-violet-600' },
  { to: '/roadmaps', icon: Map, label: 'Roadmaps', color: 'from-blue-600 to-cyan-600' },
  { to: '/courses', icon: BookOpen, label: 'Courses', color: 'from-emerald-600 to-teal-600' },
  { to: '/ai-tutor', icon: Brain, label: 'AI Tutor', color: 'from-orange-600 to-amber-600' },
  { to: '/pdf-assistant', icon: FolderOpen, label: 'PDF Assistant', color: 'from-pink-600 to-rose-600' },
  { to: '/resume-analyzer', icon: FileSearch, label: 'Resume Analyzer', color: 'from-indigo-600 to-blue-600' },
  { to: '/projects', icon: Trophy, label: 'Project Ideas', color: 'from-yellow-600 to-orange-600' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    api.get('/dashboard').then((r) => setStats(r.data.stats)).catch(() => {});
  }, []);

  const statCards = [
    { label: 'Saved Roadmaps', value: stats?.roadmapCount ?? 0, icon: Map, color: 'text-blue-400' },
    { label: 'Courses Bookmarked', value: stats?.bookmarkCount ?? 0, icon: BookOpen, color: 'text-emerald-400' },
    { label: 'AI Chats', value: stats?.chatCount ?? 0, icon: MessageSquare, color: 'text-orange-400' },
    { label: 'Resume Score', value: stats?.resumeScore != null ? `${stats.resumeScore}/100` : '—', icon: FileSearch, color: 'text-violet-400' },
  ];

  return (
    <PageWrapper className="px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex items-center gap-4 mb-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-brand flex items-center justify-center text-2xl font-bold">
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold">Welcome back, {user?.name?.split(' ')[0]}!</h1>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {statCards.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-5"
            >
              <s.icon className={`w-5 h-5 ${s.color} mb-3`} />
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Quick Access */}
        <h2 className="text-lg font-bold mb-4">Quick Access</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {shortcuts.map((s, i) => (
            <motion.div
              key={s.to}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.05 }}
            >
              <Link
                to={s.to}
                className="glass-card p-5 flex flex-col items-center text-center group hover:border-brand-purple/30 transition-all"
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-3 group-hover:scale-110 transition`}>
                  <s.icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-medium">{s.label}</span>
                <ChevronRight className="w-4 h-4 text-gray-600 mt-2 group-hover:text-brand-violet transition" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </PageWrapper>
  );
}
