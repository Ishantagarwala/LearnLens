import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Sparkles, TrendingUp, DollarSign, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api';
import PageWrapper from '../components/PageWrapper';
import SkeletonCard from '../components/SkeletonCard';

const steps = [
  {
    key: 'interests',
    title: 'What are your interests?',
    options: ['Technology & Programming', 'Design & Creative Arts', 'Business & Management', 'Science & Research', 'Healthcare & Medicine', 'Education & Teaching', 'Finance & Accounting', 'Marketing & Communications'],
  },
  {
    key: 'skills',
    title: 'What skills do you have?',
    options: ['Problem Solving', 'Communication', 'Data Analysis', 'Coding / Programming', 'Leadership', 'Creative Thinking', 'Writing & Content', 'Math & Statistics'],
  },
  {
    key: 'education',
    title: 'Your education level?',
    options: ['High School', 'Undergraduate (Pursuing)', 'Bachelor\'s Degree', 'Master\'s Degree', 'PhD', 'Self-taught / Bootcamp'],
  },
  {
    key: 'workStyle',
    title: 'Preferred work style?',
    options: ['Remote / Work from Home', 'Office-based', 'Hybrid', 'Freelance / Independent', 'Startup Environment', 'Corporate / Enterprise'],
  },
  {
    key: 'salary',
    title: 'Salary expectations?',
    options: ['$30k – $50k', '$50k – $80k', '$80k – $120k', '$120k – $180k', '$180k+', 'Not a priority'],
  },
];

interface Career {
  title: string;
  matchPercent: number;
  description: string;
  requiredSkills: string[];
  avgSalary: string;
  growthOutlook: string;
}

export default function Careers() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [careers, setCareers] = useState<Career[] | null>(null);

  const current = steps[step];
  const progress = ((step + 1) / steps.length) * 100;

  const select = (value: string) => {
    setAnswers((prev) => ({ ...prev, [current.key]: value }));
  };

  const next = async () => {
    if (!answers[current.key]) {
      toast.error('Please select an option');
      return;
    }
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      setLoading(true);
      try {
        const res = await api.post('/ai/career-match', { answers });
        setCareers(res.data.careers);
      } catch {
        toast.error('Failed to generate matches. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const reset = () => {
    setStep(0);
    setAnswers({});
    setCareers(null);
  };

  if (loading) {
    return (
      <PageWrapper className="px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-brand flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold mb-2">AI is analyzing your profile...</h2>
            <p className="text-gray-400">Finding the best career matches for you</p>
          </div>
          <SkeletonCard count={3} />
        </div>
      </PageWrapper>
    );
  }

  if (careers) {
    return (
      <PageWrapper className="px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold mb-2">Your <span className="gradient-text">Career Matches</span></h1>
            <p className="text-gray-400">Based on your interests, skills, and preferences</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {careers.map((career, i) => (
              <motion.div
                key={career.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-6 relative group hover:border-brand-purple/30 transition-all"
              >
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-gradient-brand text-xs font-bold">
                  {career.matchPercent}% Match
                </div>
                <div className="w-10 h-10 rounded-xl bg-brand-purple/20 flex items-center justify-center mb-4">
                  <Briefcase className="w-5 h-5 text-brand-violet" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{career.title}</h3>
                <p className="text-sm text-gray-400 mb-4 leading-relaxed">{career.description}</p>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {career.requiredSkills.map((s) => (
                    <span key={s} className="px-2 py-1 text-xs rounded-lg bg-white/5 text-gray-300">{s}</span>
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-white/5">
                  <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" /> {career.avgSalary}</span>
                  <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" /> {career.growthOutlook} Growth</span>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-10">
            <button onClick={reset} className="btn-outline">Take Quiz Again</button>
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper className="px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            <span className="gradient-text">Career Discovery</span> Quiz
          </h1>
          <p className="text-gray-400">Answer 5 quick questions and let AI find your perfect career</p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>Step {step + 1} of {steps.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 rounded-full bg-white/5">
            <motion.div
              className="h-full rounded-full bg-gradient-brand"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="glass-card p-8"
          >
            <h2 className="text-xl font-semibold mb-6">{current.title}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {current.options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => select(opt)}
                  className={`p-4 rounded-xl border text-sm text-left transition-all ${
                    answers[current.key] === opt
                      ? 'border-brand-purple bg-brand-purple/10 text-white'
                      : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between mt-6">
          <button
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            className="btn-outline !px-4 !py-2 text-sm flex items-center gap-1 disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          <button onClick={next} className="btn-primary !px-6 !py-2 text-sm flex items-center gap-1">
            {step === steps.length - 1 ? 'Get Results' : 'Next'} <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </PageWrapper>
  );
}
