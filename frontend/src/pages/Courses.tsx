import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, BookOpen, Clock, ExternalLink, Bookmark } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api';
import PageWrapper from '../components/PageWrapper';
import SkeletonCard from '../components/SkeletonCard';

interface Course {
  title: string;
  platform: string;
  level: string;
  duration: string;
  isFree: boolean;
  description: string;
  link: string;
}

export default function Courses() {
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState('');
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<Course[] | null>(null);
  const [filter, setFilter] = useState<'all' | 'free' | 'paid'>('all');

  const search = async () => {
    if (!topic.trim()) { toast.error('Enter a topic'); return; }
    setLoading(true);
    try {
      const res = await api.post('/ai/courses', { topic, level: level || undefined });
      setCourses(res.data.courses);
    } catch {
      toast.error('Failed to find courses');
    } finally {
      setLoading(false);
    }
  };

  const bookmark = async (c: Course) => {
    try {
      await api.post('/bookmarks', { courseName: c.title, platform: c.platform, link: c.link });
      toast.success('Course bookmarked!');
    } catch {
      toast.error('Failed to bookmark');
    }
  };

  const filtered = courses?.filter((c) =>
    filter === 'all' ? true : filter === 'free' ? c.isFree : !c.isFree
  );

  const levelColor = (l: string) => {
    if (l.toLowerCase().includes('beginner')) return 'text-green-400 bg-green-400/10';
    if (l.toLowerCase().includes('intermediate')) return 'text-yellow-400 bg-yellow-400/10';
    return 'text-red-400 bg-red-400/10';
  };

  return (
    <PageWrapper className="px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-2">
            <span className="gradient-text">Course Recommendations</span>
          </h1>
          <p className="text-gray-400">Find the best courses for any skill or topic</p>
        </div>

        <div className="glass-card p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter a skill or topic (e.g. React, Machine Learning)"
              className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-brand-purple transition"
              onKeyDown={(e) => e.key === 'Enter' && search()}
            />
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-400 focus:outline-none focus:border-brand-purple"
            >
              <option value="">Any Level</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
            <button onClick={search} disabled={loading} className="btn-primary flex items-center gap-2 disabled:opacity-50">
              {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Search className="w-4 h-4" /> Search</>}
            </button>
          </div>
        </div>

        {loading && <SkeletonCard count={6} />}

        {courses && !loading && (
          <>
            <div className="flex gap-2 mb-6">
              {(['all', 'free', 'paid'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-xl text-sm transition ${
                    filter === f ? 'bg-brand-purple/20 text-brand-violet border border-brand-purple/30' : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered?.map((c, i) => (
                <motion.div
                  key={c.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-card p-6 group hover:border-brand-purple/30 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${levelColor(c.level)}`}>
                      {c.level}
                    </span>
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${c.isFree ? 'text-green-400 bg-green-400/10' : 'text-orange-400 bg-orange-400/10'}`}>
                      {c.isFree ? 'Free' : 'Paid'}
                    </span>
                  </div>

                  <h3 className="font-semibold mb-2 leading-tight">{c.title}</h3>
                  <p className="text-sm text-gray-400 mb-4">{c.description}</p>

                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
                    <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {c.platform}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {c.duration}</span>
                  </div>

                  <div className="flex gap-2">
                    <a href={c.link} target="_blank" rel="noopener noreferrer" className="flex-1 btn-primary !py-2 text-xs text-center flex items-center justify-center gap-1">
                      View Course <ExternalLink className="w-3 h-3" />
                    </a>
                    <button onClick={() => bookmark(c)} className="p-2 rounded-xl border border-white/10 hover:bg-brand-purple/10 hover:border-brand-purple/30 transition">
                      <Bookmark className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </PageWrapper>
  );
}
