import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, ListChecks, CreditCard, BookOpen, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api';
import PageWrapper from '../components/PageWrapper';

type Action = 'summarize' | 'mcq' | 'flashcards' | 'explain';

interface MCQ {
  question: string;
  options: { A: string; B: string; C: string; D: string };
  correct: string;
  explanation: string;
}

interface Flashcard {
  front: string;
  back: string;
}

const actions: { key: Action; label: string; icon: typeof FileText }[] = [
  { key: 'summarize', label: 'Summarize', icon: FileText },
  { key: 'mcq', label: 'Generate MCQs', icon: ListChecks },
  { key: 'flashcards', label: 'Flashcards', icon: CreditCard },
  { key: 'explain', label: 'Explain Concepts', icon: BookOpen },
];

export default function PdfAssistant() {
  const [file, setFile] = useState<File | null>(null);
  const [action, setAction] = useState<Action>('summarize');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [resultType, setResultType] = useState<string>('');
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [flipped, setFlipped] = useState<Set<number>>(new Set());
  const fileRef = useRef<HTMLInputElement>(null);

  const submit = async () => {
    if (!file) { toast.error('Upload a file first'); return; }
    setLoading(true);
    setResult(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('action', action);
      const res = await api.post('/ai/pdf-assistant', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(res.data.result);
      setResultType(res.data.type);
      setRevealed(new Set());
      setFlipped(new Set());
    } catch {
      toast.error('Failed to process file');
    } finally {
      setLoading(false);
    }
  };

  const toggleReveal = (i: number) => {
    setRevealed((prev) => {
      const n = new Set(prev);
      n.has(i) ? n.delete(i) : n.add(i);
      return n;
    });
  };

  const toggleFlip = (i: number) => {
    setFlipped((prev) => {
      const n = new Set(prev);
      n.has(i) ? n.delete(i) : n.add(i);
      return n;
    });
  };

  return (
    <PageWrapper className="px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-2">
            <span className="gradient-text">AI PDF Assistant</span>
          </h1>
          <p className="text-gray-400">Upload your notes and let AI help you study</p>
        </div>

        {/* Upload */}
        <div className="glass-card p-6 mb-6">
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
                <p className="text-sm text-gray-400 mb-1">Drop your file here or click to browse</p>
                <p className="text-xs text-gray-600">PDF, DOCX, TXT (max 10MB)</p>
              </>
            )}
          </div>
          <input ref={fileRef} type="file" accept=".pdf,.docx,.doc,.txt" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {actions.map((a) => (
            <button
              key={a.key}
              onClick={() => setAction(a.key)}
              className={`p-4 rounded-2xl border text-sm flex flex-col items-center gap-2 transition-all ${
                action === a.key
                  ? 'border-brand-purple bg-brand-purple/10 text-white'
                  : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
              }`}
            >
              <a.icon className="w-5 h-5" />
              {a.label}
            </button>
          ))}
        </div>

        <button onClick={submit} disabled={loading || !file} className="w-full btn-primary disabled:opacity-50 flex items-center justify-center gap-2">
          {loading ? (
            <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Processing...</>
          ) : (
            'Analyze File'
          )}
        </button>

        {/* Results */}
        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
              {resultType === 'mcq' && Array.isArray(result) ? (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold">Generated MCQs</h3>
                  {(result as MCQ[]).map((q, i) => (
                    <div key={i} className="glass-card p-5">
                      <p className="font-medium mb-3">Q{i + 1}. {q.question}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                        {Object.entries(q.options).map(([key, val]) => (
                          <div
                            key={key}
                            className={`p-3 rounded-xl text-sm border transition ${
                              revealed.has(i) && key === q.correct
                                ? 'border-green-500/50 bg-green-500/10 text-green-400'
                                : 'border-white/10 bg-white/5 text-gray-300'
                            }`}
                          >
                            <span className="font-medium">{key}.</span> {val}
                          </div>
                        ))}
                      </div>
                      <button onClick={() => toggleReveal(i)} className="text-xs text-brand-violet hover:underline flex items-center gap-1">
                        <Check className="w-3 h-3" /> {revealed.has(i) ? 'Hide Answer' : 'Reveal Answer'}
                      </button>
                      {revealed.has(i) && q.explanation && (
                        <p className="text-xs text-gray-500 mt-2">💡 {q.explanation}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : resultType === 'flashcards' && Array.isArray(result) ? (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold">Flashcards</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {(result as Flashcard[]).map((f, i) => (
                      <div
                        key={i}
                        onClick={() => toggleFlip(i)}
                        className="glass-card p-6 cursor-pointer min-h-[120px] flex items-center justify-center text-center hover:border-brand-purple/30 transition"
                      >
                        <p className="text-sm">
                          {flipped.has(i) ? (
                            <span className="text-brand-violet">{f.back}</span>
                          ) : (
                            <span className="font-medium">{f.front}</span>
                          )}
                        </p>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 text-center">Click a card to flip</p>
                </div>
              ) : (
                <div className="glass-card p-6">
                  <h3 className="text-lg font-bold mb-4">
                    {action === 'summarize' ? 'Summary' : 'Key Concepts'}
                  </h3>
                  <div className="prose prose-invert prose-sm max-w-none text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {typeof result === 'string' ? result : JSON.stringify(result, null, 2)}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageWrapper>
  );
}
