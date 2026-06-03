import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Map, Save, Trash2, ChevronDown, ChevronUp, BookOpen, Target } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api';
import PageWrapper from '../components/PageWrapper';
import SkeletonCard from '../components/SkeletonCard';

interface Milestone {
  month: number;
  title: string;
  skills: string[];
  tasks: string[];
  resources: string[];
}

interface RoadmapData {
  career: string;
  duration: string;
  milestones: Milestone[];
}

interface SavedRoadmap {
  id: string;
  career: string;
  content: RoadmapData;
  createdAt: string;
}

export default function Roadmaps() {
  const [career, setCareer] = useState('');
  const [loading, setLoading] = useState(false);
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
  const [saved, setSaved] = useState<SavedRoadmap[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    api.get('/roadmaps').then((r) => setSaved(r.data.roadmaps)).catch(() => {});
  }, []);

  const generate = async () => {
    if (!career.trim()) { toast.error('Enter a career title'); return; }
    setLoading(true);
    try {
      const res = await api.post('/ai/roadmap', { career });
      setRoadmap(res.data.roadmap);
    } catch {
      toast.error('Failed to generate roadmap');
    } finally {
      setLoading(false);
    }
  };

  const save = async () => {
    if (!roadmap) return;
    try {
      const res = await api.post('/roadmaps', { career, content: roadmap });
      setSaved((p) => [res.data.roadmap, ...p].map((r) => ({
        ...r,
        content: typeof r.content === 'string' ? JSON.parse(r.content) : r.content,
      })));
      toast.success('Roadmap saved!');
    } catch {
      toast.error('Failed to save');
    }
  };

  const del = async (id: string) => {
    try {
      await api.delete(`/roadmaps/${id}`);
      setSaved((p) => p.filter((r) => r.id !== id));
      toast.success('Deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <PageWrapper className="px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-2">
            <span className="gradient-text">Learning Roadmaps</span>
          </h1>
          <p className="text-gray-400">Generate a personalized learning roadmap for any career</p>
        </div>

        {/* Generator */}
        <div className="glass-card p-6 mb-8">
          <div className="flex gap-3">
            <input
              value={career}
              onChange={(e) => setCareer(e.target.value)}
              placeholder="Enter career title (e.g. Full-Stack Developer)"
              className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-brand-purple transition"
              onKeyDown={(e) => e.key === 'Enter' && generate()}
            />
            <button onClick={generate} disabled={loading} className="btn-primary flex items-center gap-2 disabled:opacity-50">
              {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Map className="w-4 h-4" /> Generate</>}
            </button>
          </div>
        </div>

        {loading && <SkeletonCard count={3} />}

        {/* Generated Roadmap */}
        {roadmap && !loading && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">{roadmap.career} — {roadmap.duration}</h2>
              <button onClick={save} className="btn-outline !py-2 !px-4 text-sm flex items-center gap-2">
                <Save className="w-4 h-4" /> Save
              </button>
            </div>

            <div className="relative pl-8 space-y-6">
              <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-gradient-to-b from-brand-purple to-brand-violet" />
              {roadmap.milestones.map((m, i) => (
                <motion.div
                  key={m.month}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="relative"
                >
                  <div className="absolute -left-5 top-4 w-4 h-4 rounded-full bg-gradient-brand border-2 border-brand-dark" />
                  <div className="glass-card p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="px-3 py-1 rounded-lg bg-brand-purple/20 text-brand-violet text-xs font-bold">
                        Month {m.month}
                      </span>
                      <h3 className="font-semibold">{m.title}</h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="flex items-center gap-1 text-gray-500 mb-2">
                          <Target className="w-3 h-3" /> Skills
                        </div>
                        <ul className="space-y-1">
                          {m.skills.map((s) => <li key={s} className="text-gray-300">• {s}</li>)}
                        </ul>
                      </div>
                      <div>
                        <div className="flex items-center gap-1 text-gray-500 mb-2">
                          <BookOpen className="w-3 h-3" /> Tasks
                        </div>
                        <ul className="space-y-1">
                          {m.tasks.map((t) => <li key={t} className="text-gray-300">• {t}</li>)}
                        </ul>
                      </div>
                      <div>
                        <div className="flex items-center gap-1 text-gray-500 mb-2">
                          <BookOpen className="w-3 h-3" /> Resources
                        </div>
                        <ul className="space-y-1">
                          {m.resources.map((r) => <li key={r} className="text-gray-300">• {r}</li>)}
                        </ul>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Saved */}
        {saved.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold mb-4">Saved Roadmaps</h2>
            <div className="space-y-3">
              {saved.map((r) => (
                <div key={r.id} className="glass-card">
                  <button
                    onClick={() => setExpanded(expanded === r.id ? null : r.id)}
                    className="w-full p-4 flex items-center justify-between text-left"
                  >
                    <div>
                      <h3 className="font-semibold">{r.career}</h3>
                      <p className="text-xs text-gray-500">{new Date(r.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); del(r.id); }}
                        className="p-2 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      {expanded === r.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>
                  {expanded === r.id && r.content?.milestones && (
                    <div className="px-4 pb-4 space-y-3">
                      {r.content.milestones.map((m) => (
                        <div key={m.month} className="p-3 rounded-xl bg-white/5 text-sm">
                          <span className="font-semibold text-brand-violet">Month {m.month}:</span> {m.title}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
