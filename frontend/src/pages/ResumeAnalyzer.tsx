import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, X, AlertTriangle, CheckCircle2, Target, Award } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api';
import PageWrapper from '../components/PageWrapper';

interface Report {
  overallScore: number;
  verdict: string;
  atsScore: number;
  atsExplanation: string;
  sectionScores: Record<string, number>;
  strengths: string[];
  weaknesses: string[];
  missingKeywords: string[];
  recommendations: string[];
}

const sectionLabels: Record<string, string> = {
  contactInfo: 'Contact Info',
  summary: 'Summary / Objective',
  workExperience: 'Work Experience',
  education: 'Education',
  skills: 'Skills',
  projects: 'Projects',
  certifications: 'Certifications',
  formatting: 'Formatting',
};

function CircularScore({ score, size = 140, stroke = 10 }: { score: number; size?: number; stroke?: number }) {
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (score / 100) * circumference;
  const color = score < 50 ? '#ef4444' : score < 70 ? '#f97316' : '#22c55e';

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="animate-score"
          style={{ '--score-offset': offset } as any}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold" style={{ color }}>{score}</span>
        <span className="text-xs text-gray-500">/ 100</span>
      </div>
    </div>
  );
}

function ProgressBar({ label, value }: { label: string; value: number }) {
  const color = value < 50 ? 'bg-red-500' : value < 70 ? 'bg-orange-500' : 'bg-green-500';
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-400">{label}</span>
        <span className="text-gray-300 font-medium">{value}%</span>
      </div>
      <div className="h-2 rounded-full bg-white/5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
    </div>
  );
}

export default function ResumeAnalyzer() {
  const [file, setFile] = useState<File | null>(null);
  const [jobDesc, setJobDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<Report | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const analyze = async () => {
    if (!file) { toast.error('Upload a resume first'); return; }
    setLoading(true);
    setReport(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      if (jobDesc.trim()) fd.append('jobDescription', jobDesc);
      const res = await api.post('/ai/resume-analyze', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const r = res.data.report;
      setReport(r);

      await api.post('/resume-scans', {
        fileName: file.name,
        overallScore: r.overallScore,
        reportJson: r,
      }).catch(() => {});

    } catch {
      toast.error('Failed to analyze resume');
    } finally {
      setLoading(false);
    }
  };

  const verdictColor = (v: string) => {
    switch (v) {
      case 'Excellent': return 'text-green-400 bg-green-400/10 border-green-400/30';
      case 'Good': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30';
      case 'Average': return 'text-orange-400 bg-orange-400/10 border-orange-400/30';
      default: return 'text-red-400 bg-red-400/10 border-red-400/30';
    }
  };

  return (
    <PageWrapper className="px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-2">
            <span className="gradient-text">Resume Analyzer</span>
          </h1>
          <p className="text-gray-400">Get a detailed AI-powered analysis of your resume</p>
        </div>

        {!report && (
          <div className="space-y-6">
            <div className="glass-card p-6">
              <div
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-white/10 rounded-2xl p-8 text-center cursor-pointer hover:border-brand-purple/30 transition"
              >
                <Upload className="w-8 h-8 mx-auto mb-3 text-gray-500" />
                {file ? (
                  <div className="flex items-center justify-center gap-2">
                    <FileText className="w-4 h-4 text-brand-violet" />
                    <span className="text-sm">{file.name}</span>
                    <button onClick={(e) => { e.stopPropagation(); setFile(null); }} className="text-gray-500 hover:text-red-400">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-gray-400 mb-1">Upload your resume</p>
                    <p className="text-xs text-gray-600">PDF or DOCX (max 10MB)</p>
                  </>
                )}
              </div>
              <input ref={fileRef} type="file" accept=".pdf,.docx,.doc" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            </div>

            <div className="glass-card p-6">
              <label className="block text-sm text-gray-400 mb-2">Target Job Description (optional)</label>
              <textarea
                value={jobDesc}
                onChange={(e) => setJobDesc(e.target.value)}
                rows={4}
                placeholder="Paste the job description to compare your resume against..."
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-brand-purple transition resize-none"
              />
            </div>

            <button onClick={analyze} disabled={loading || !file} className="w-full btn-primary disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? (
                <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Analyzing...</>
              ) : (
                <><Target className="w-5 h-5" /> Analyze Resume</>
              )}
            </button>
          </div>
        )}

        {report && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Top Score Card */}
            <div className="glass-card p-8">
              <div className="flex flex-col sm:flex-row items-center gap-8">
                <CircularScore score={report.overallScore} />
                <div className="flex-1 text-center sm:text-left">
                  <div className={`inline-block px-4 py-1.5 rounded-full text-sm font-bold border mb-3 ${verdictColor(report.verdict)}`}>
                    {report.verdict}
                  </div>
                  <h2 className="text-xl font-bold mb-1">Overall Resume Score</h2>
                  <p className="text-sm text-gray-400">Based on content, formatting, ATS compatibility, and best practices</p>
                </div>
              </div>
            </div>

            {/* ATS Score */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2"><Award className="w-5 h-5 text-brand-violet" /> ATS Compatibility</h3>
              <ProgressBar label="ATS Score" value={report.atsScore} />
              <p className="text-sm text-gray-400 mt-3">{report.atsExplanation}</p>
            </div>

            {/* Section Scores */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-bold mb-4">Section Scores</h3>
              <div className="space-y-4">
                {Object.entries(report.sectionScores).map(([key, val]) => (
                  <ProgressBar key={key} label={sectionLabels[key] || key} value={val} />
                ))}
              </div>
            </div>

            {/* Strengths & Weaknesses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-card p-6">
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-400" /> Strengths
                </h3>
                <ul className="space-y-2">
                  {report.strengths.map((s, i) => (
                    <li key={i} className="flex gap-2 text-sm text-gray-300">
                      <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0 mt-0.5" /> {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="glass-card p-6">
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-400" /> Areas to Improve
                </h3>
                <ul className="space-y-2">
                  {report.weaknesses.map((w, i) => (
                    <li key={i} className="flex gap-2 text-sm text-gray-300">
                      <AlertTriangle className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" /> {w}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Missing Keywords */}
            {report.missingKeywords.length > 0 && (
              <div className="glass-card p-6">
                <h3 className="text-lg font-bold mb-3">Missing Keywords</h3>
                <div className="flex flex-wrap gap-2">
                  {report.missingKeywords.map((k, i) => (
                    <span key={i} className="px-3 py-1.5 rounded-xl bg-red-500/10 text-red-400 text-xs border border-red-500/20">
                      {k}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-bold mb-3">Recommendations</h3>
              <ol className="space-y-3">
                {report.recommendations.map((r, i) => (
                  <li key={i} className="flex gap-3 text-sm text-gray-300">
                    <span className="w-6 h-6 rounded-full bg-brand-purple/20 flex items-center justify-center shrink-0 text-xs font-bold text-brand-violet">
                      {i + 1}
                    </span>
                    {r}
                  </li>
                ))}
              </ol>
            </div>

            <button onClick={() => setReport(null)} className="btn-outline w-full">
              Analyze Another Resume
            </button>
          </motion.div>
        )}
      </div>
    </PageWrapper>
  );
}
