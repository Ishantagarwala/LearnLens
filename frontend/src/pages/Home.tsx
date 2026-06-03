import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles, Map, BookOpen, FileText, GraduationCap, Brain,
  FileSearch, ChevronRight, Star,
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

const features = [
  { icon: Sparkles, title: 'AI Career Discovery', desc: 'Take a quick quiz and let AI find your perfect career match with detailed insights.' },
  { icon: Map, title: 'Personalized Roadmaps', desc: 'Get a month-by-month learning plan tailored to your target career.' },
  { icon: BookOpen, title: 'Course Recommendations', desc: 'Curated courses from top platforms matched to your skill gaps.' },
  { icon: FileText, title: 'AI PDF Assistant', desc: 'Upload notes and get summaries, MCQs, flashcards, and explanations.' },
  { icon: Brain, title: 'AI Tutor', desc: 'Chat with an AI tutor for career advice, study help, and interview prep.' },
  { icon: FileSearch, title: 'Resume Analyzer', desc: 'Get a detailed score and actionable feedback on your resume.' },
];

const testimonials = [
  { name: 'Priya Sharma', college: 'IIT Delhi', initials: 'PS', quote: 'CareerPilot helped me discover data science as my ideal career. The roadmap was incredibly detailed!' },
  { name: 'Alex Chen', college: 'Stanford University', initials: 'AC', quote: 'The AI tutor is like having a personal mentor 24/7. My interview prep improved dramatically.' },
  { name: 'Sarah Williams', college: 'MIT', initials: 'SW', quote: 'The resume analyzer caught issues I never noticed. Went from 45 to 89 score and landed my dream internship!' },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-purple/10 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-brand-purple/20 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-brand-violet/10 rounded-full blur-[128px]" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-purple/10 border border-brand-purple/20 text-sm text-brand-violet mb-6">
                <Sparkles className="w-4 h-4" /> Powered by AI
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
                Discover Your Perfect{' '}
                <span className="gradient-text">Career Path</span>{' '}
                with AI
              </h1>
              <p className="text-lg text-gray-400 mb-8 max-w-lg leading-relaxed">
                Get personalized career recommendations, learning roadmaps, course suggestions, and AI-powered tools — all in one place.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/careers" className="btn-primary inline-flex items-center gap-2">
                  Explore Careers <ChevronRight className="w-4 h-4" />
                </Link>
                <Link to="/signup" className="btn-outline inline-flex items-center gap-2">
                  Get Started Free
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="glass-card p-8 relative">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Career Match Result</p>
                      <p className="text-xs text-gray-500">Based on your profile</p>
                    </div>
                  </div>
                  {['Full-Stack Developer', 'Data Scientist', 'UX Designer'].map((career, i) => (
                    <div key={career} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                      <span className="text-sm">{career}</span>
                      <span className="text-xs font-bold text-brand-violet">{94 - i * 5}% Match</span>
                    </div>
                  ))}
                </div>
                <motion.div
                  className="absolute -top-4 -right-4 px-4 py-2 rounded-xl bg-gradient-brand text-sm font-bold shadow-lg shadow-brand-purple/30"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ repeat: Infinity, duration: 3 }}
                >
                  94% Match
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Everything You Need to{' '}
              <span className="gradient-text">Launch Your Career</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              AI-powered tools designed to help students and professionals navigate their career journey.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                whileHover={{ scale: 1.02, y: -4 }}
                className="glass-card p-6 group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-brand flex items-center justify-center mb-4 group-hover:shadow-lg group-hover:shadow-brand-purple/20 transition">
                  <f.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Loved by <span className="gradient-text">Students</span> Worldwide
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="glass-card p-6"
              >
                <div className="flex items-center gap-1 mb-4">
                  {Array(5).fill(0).map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  ))}
                </div>
                <p className="text-sm text-gray-300 mb-6 leading-relaxed italic">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-brand flex items-center justify-center text-sm font-bold">
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.college}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto rounded-3xl bg-gradient-brand p-12 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent)]" />
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Ready to Discover Your Future?
            </h2>
            <p className="text-white/80 mb-8 max-w-lg mx-auto">
              Join thousands of students who've found their dream career with CareerPilot AI.
            </p>
            <Link to="/signup" className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white text-brand-purple font-bold hover:bg-white/90 transition-all hover:scale-105">
              Get Started — It's Free <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
