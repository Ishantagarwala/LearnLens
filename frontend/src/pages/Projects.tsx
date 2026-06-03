import { useState } from 'react';
import { motion } from 'framer-motion';
import { Code2, Clock, ExternalLink, Rocket } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api';
import PageWrapper from '../components/PageWrapper';
import SkeletonCard from '../components/SkeletonCard';

interface Project {
  title: string;
  description: string;
  techStack: string[];
  difficulty: string;
  estimatedTime: string;
  githubSearchQuery: string;
}

const difficultyColor = (d: string) => {
  const lower = d.toLowerCase();
  if (lower.includes('beginner')) return 'text-green-400 bg-green-400/10 border-green-400/20';
  if (lower.includes('intermediate')) return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
  return 'text-red-400 bg-red-400/10 border-red-400/20';
};

export default function Projects() {
  const [career, setCareer] = useState('');
  const [skillLevel, setSkillLevel] = useState('Beginner');
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<Project[] | null>(null);

  const generate = async () => {
    if (!career.trim()) { toast.error('Enter a career or field'); return; }
    setLoading(true);
    try {
      const res = await api.post('/ai/projects', { career, skillLevel });
      setProjects(res.data.projects);
    } catch {
      toast.error('Failed to generate projects');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper className="px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-2">
            <span className="gradient-text">Project Ideas</span>
          </h1>
          <p className="text-gray-400">Get AI-generated project ideas to build your portfolio</p>
        </div>

        <div className="glass-card p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              value={career}
              onChange={(e) => setCareer(e.target.value)}
              placeholder="Target career (e.g. Full-Stack Developer)"
              className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-brand-purple transition"
              onKeyDown={(e) => e.key === 'Enter' && generate()}
            />
            <select
              value={skillLevel}
              onChange={(e) => setSkillLevel(e.target.value)}
              className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-400 focus:outline-none focus:border-brand-purple"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
            <button onClick={generate} disabled={loading} className="btn-primary flex items-center gap-2 disabled:opacity-50">
              {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Rocket className="w-4 h-4" /> Generate</>}
            </button>
          </div>
        </div>

        {loading && <SkeletonCard count={6} />}

        {projects && !loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card p-6 hover:border-brand-purple/30 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${difficultyColor(p.difficulty)}`}>
                    {p.difficulty}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" /> {p.estimatedTime}
                  </span>
                </div>

                <h3 className="font-semibold mb-2">{p.title}</h3>
                <p className="text-sm text-gray-400 mb-4 leading-relaxed">{p.description}</p>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {p.techStack.map((t) => (
                    <span key={t} className="px-2 py-1 text-xs rounded-lg bg-brand-purple/10 text-brand-violet border border-brand-purple/20">
                      {t}
                    </span>
                  ))}
                </div>

                <a
                  href={`https://github.com/search?q=${encodeURIComponent(p.githubSearchQuery)}&type=repositories`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-brand-violet transition"
                >
                  <Code2 className="w-3 h-3" /> Find on GitHub <ExternalLink className="w-3 h-3" />
                </a>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
