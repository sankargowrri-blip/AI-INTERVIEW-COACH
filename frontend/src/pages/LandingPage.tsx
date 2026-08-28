import { Link } from 'react-router-dom';
import {
  Mic, Camera, BarChart2, FileText, TrendingUp, Brain, Star, ChevronRight,
  CheckCircle, Briefcase, DollarSign, Users, Target, Megaphone, Building2,
  Layers, Sparkles, Bot, Play
} from 'lucide-react';

const steps = [
  { step: 1, title: 'Create Account', desc: 'Sign up in seconds — no payment required to start.', icon: '✍️' },
  { step: 2, title: 'Upload Resume', desc: 'Your resume personalizes questions to your background.', icon: '📄' },
  { step: 3, title: 'Choose Interview', desc: 'Select your role, experience, difficulty, and type.', icon: '⚙️' },
  { step: 4, title: 'Practice With AI', desc: 'Answer questions using your voice in a realistic setting.', icon: '🎙️' },
  { step: 5, title: 'Get Feedback', desc: 'Receive detailed scores across communication and knowledge.', icon: '📊' },
  { step: 6, title: 'Improve', desc: 'Follow your personalized practice plan to close the gaps.', icon: '🚀' },
];

const features = [
  { icon: FileText, title: 'Resume-Based Questions', desc: 'Questions generated from your specific resume content.' },
  { icon: Mic, title: 'Voice Interview', desc: 'Answer every question by speaking — just like a real interview.' },
  { icon: Camera, title: 'Live Camera', desc: 'Practice maintaining eye contact and on-camera presence.' },
  { icon: Layers, title: 'Easy / Medium / Hard', desc: 'Three difficulty levels that adapt to your preparation.' },
  { icon: Users, title: 'Fresher & Experienced', desc: 'Tailored experience for students and working professionals.' },
  { icon: Brain, title: 'AI Evaluation', desc: 'Mock AI-powered performance analysis after every session.' },
  { icon: BarChart2, title: 'Performance Analysis', desc: 'Scores across communication, knowledge, and confidence.' },
  { icon: TrendingUp, title: 'Progress Tracking', desc: 'Track your improvement across multiple sessions over time.' },
  { icon: Star, title: 'Improvement Plan', desc: 'A personalized daily plan to close your specific weak areas.' },
  { icon: Building2, title: 'Company Practice', desc: 'Practice with content inspired by specific company styles.' },
  { icon: FileText, title: 'Resume Analysis', desc: 'ATS score check and resume quality suggestions.' },
  { icon: Sparkles, title: 'Interview History', desc: 'Review every past interview with full result detail.' },
];

const careers = [
  { name: 'Technology', icon: '💻', examples: 'Software Developer, AI Engineer, Data Scientist' },
  { name: 'Business', icon: '📊', examples: 'MBA, BBA, Business Analyst, Product Manager' },
  { name: 'Finance', icon: '💰', examples: 'Financial Analyst, Stock Advisor, Accountant' },
  { name: 'Sales', icon: '🎯', examples: 'Sales Executive, Account Executive, BDE' },
  { name: 'Marketing', icon: '📢', examples: 'Digital Marketing, SEO, Brand Manager' },
  { name: 'HR', icon: '👥', examples: 'HR Executive, Recruiter, Talent Acquisition' },
  { name: 'Management', icon: '🏢', examples: 'General Manager, Team Lead, Operations' },
  { name: 'Other', icon: '✨', examples: 'Banking, Accounting, Healthcare, Legal' },
];

const interviewTypes = [
  { name: 'General Interview', desc: 'Covers a broad range of questions across multiple categories.' },
  { name: 'HR Interview', desc: 'Focused on soft skills, personality, and motivation.' },
  { name: 'Role-Specific', desc: 'Deep-dive into technical and domain knowledge.' },
  { name: 'Mixed Interview', desc: 'A balanced combination of HR, behavioral, and role-based questions.' },
  { name: 'Technical Interview', desc: 'Challenging technical and problem-solving questions.' },
  { name: 'Company Practice', desc: 'Practice inspired by common interview patterns from top companies.' },
];

export default function LandingPage() {
  return (
    <div className="overflow-x-hidden">
      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section id="home" className="relative bg-gradient-to-b from-surface-50 to-white pt-16 pb-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Copy */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 border border-primary-100 text-primary-700 text-xs font-medium mb-6">
                <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                AI-Powered Interview Preparation
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-surface-900 leading-tight tracking-tight mb-5">
                Practice.<br />
                <span className="text-primary-600">Improve.</span><br />
                Get Hired.
              </h1>
              <p className="text-lg text-surface-600 leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0">
                Practice realistic AI-powered interviews, improve your communication,
                understand your weaknesses, and become interview-ready.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Link
                  to="/register"
                  className="btn-primary px-7 py-3 text-base"
                  aria-label="Start practicing — create your account"
                >
                  Start Practicing
                </Link>
                <a
                  href="#how-it-works"
                  className="btn-secondary px-7 py-3 text-base"
                >
                  How It Works
                </a>
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-5 justify-center lg:justify-start text-sm text-surface-500">
                {['No credit card required', 'All career paths', 'Voice interview practice'].map(f => (
                  <span key={f} className="flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                    {f}
                  </span>
                ))}
              </div>
            </div>

            {/* Visual — AI Interview UI mockup */}
            <div className="relative hidden lg:block" aria-hidden="true">
              <div className="bg-white rounded-2xl border border-surface-200 shadow-card-lg p-6 space-y-4 max-w-md mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-medium text-surface-600">Interview in Progress</span>
                  </div>
                  <span className="text-xs bg-surface-100 px-2 py-0.5 rounded-full text-surface-600">Q 3 / 10</span>
                </div>

                {/* AI Interviewer */}
                <div className="bg-surface-50 rounded-xl p-4 flex gap-4 items-start">
                  <div className="w-12 h-12 rounded-full bg-primary-600 flex items-center justify-center shrink-0">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-primary-600 mb-1">AI Interviewer</p>
                    <p className="text-sm text-surface-800 font-medium">"Tell me about your most challenging project and how you handled it."</p>
                    <div className="flex items-center gap-1 mt-2">
                      {[...Array(9)].map((_, i) => (
                        <div
                          key={i}
                          className="wave-bar text-primary-400"
                          style={{ height: `${[6, 10, 14, 18, 22, 18, 14, 10, 6][i]}px` }}
                        />
                      ))}
                      <span className="text-xs text-primary-600 ml-2">Speaking...</span>
                    </div>
                  </div>
                </div>

                {/* Candidate */}
                <div className="flex items-center gap-3">
                  <div className="w-full h-28 bg-surface-900 rounded-lg flex items-center justify-center relative overflow-hidden">
                    <div className="text-surface-600 text-xs">Camera Preview</div>
                    <div className="absolute bottom-2 left-2 flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-[10px] text-emerald-400">Listening</span>
                    </div>
                  </div>
                </div>

                {/* Score preview */}
                <div className="grid grid-cols-3 gap-2">
                  {[['Role Knowledge', '90%', 'emerald'], ['Communication', '82%', 'blue'], ['Performance', '85%', 'purple']].map(([l, v, c]) => (
                    <div key={l} className="bg-surface-50 rounded-lg p-2 text-center">
                      <p className={`text-sm font-bold text-${c}-600`}>{v}</p>
                      <p className="text-[10px] text-surface-500 mt-0.5">{l}</p>
                    </div>
                  ))}
                </div>
              </div>
              {/* Floating badges */}
              <div className="absolute -top-3 -right-3 bg-white rounded-lg border border-surface-200 shadow-card px-3 py-2 text-xs font-medium text-emerald-700 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5" /> Resume Verified
              </div>
              <div className="absolute -bottom-3 -left-3 bg-white rounded-lg border border-surface-200 shadow-card px-3 py-2 text-xs font-medium text-blue-700 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" /> +22% Improvement
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-20 bg-white px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="section-title">How It Works</h2>
            <p className="section-subtitle text-lg">Six simple steps from signup to interview-ready.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {steps.map(({ step, title, desc, icon }) => (
              <div key={step} className="relative card p-6 hover:shadow-card-hover transition-shadow">
                <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-xl mb-4">
                  {icon}
                </div>
                <div className="absolute top-6 right-6 w-6 h-6 rounded-full bg-primary-600 text-white text-xs font-bold flex items-center justify-center">
                  {step}
                </div>
                <h3 className="font-semibold text-surface-900 mb-1">{title}</h3>
                <p className="text-sm text-surface-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────────────────── */}
      <section id="features" className="py-20 bg-surface-50 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="section-title">Everything You Need</h2>
            <p className="section-subtitle text-lg">Built for real interview preparation across every career path.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card p-5 hover:shadow-card-hover transition-shadow">
                <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5 text-primary-600" aria-hidden="true" />
                </div>
                <h3 className="font-semibold text-surface-900 text-sm mb-1">{title}</h3>
                <p className="text-xs text-surface-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── INTERVIEW TYPES ──────────────────────────────────────────────────── */}
      <section id="interview-types" className="py-20 bg-white px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="section-title">Six Interview Types</h2>
            <p className="section-subtitle text-lg">Practice any interview format with a single platform.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {interviewTypes.map(({ name, desc }) => (
              <div key={name} className="card p-5 flex gap-4 hover:shadow-card-hover transition-shadow">
                <div className="w-9 h-9 rounded-lg bg-primary-600 flex items-center justify-center shrink-0">
                  <Play className="w-4 h-4 text-white" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-semibold text-surface-900 text-sm mb-1">{name}</h3>
                  <p className="text-xs text-surface-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SUPPORTED CAREERS ────────────────────────────────────────────────── */}
      <section id="about" className="py-20 bg-surface-50 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-4">
            <h2 className="section-title">For Every Career Path</h2>
          </div>
          <p className="text-center text-surface-500 mb-12 max-w-2xl mx-auto">
            AI Interview Coach is not limited to engineering or tech. Whether you are pursuing a career in
            technology, business, finance, sales, HR, or management — we have you covered.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {careers.map(({ name, icon, examples }) => (
              <div key={name} className="card p-5 text-center hover:shadow-card-hover transition-shadow">
                <div className="text-3xl mb-3" role="img" aria-label={name}>{icon}</div>
                <h3 className="font-semibold text-surface-900 text-sm mb-1">{name}</h3>
                <p className="text-xs text-surface-500 leading-relaxed">{examples}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 text-center">
            <p className="text-sm text-surface-500">
              Don't see your role? Use the <strong>Custom Role</strong> option to enter any job title you are targeting.
            </p>
          </div>
        </div>
      </section>

      {/* ── STATS ─────────────────────────────────────────────────────────────── */}
      <section className="py-16 bg-primary-600 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center text-white">
            {[
              { value: '50+', label: 'Career Roles' },
              { value: '6', label: 'Interview Types' },
              { value: '3', label: 'Difficulty Levels' },
              { value: '100+', label: 'Practice Questions' },
            ].map(({ value, label }) => (
              <div key={label}>
                <div className="text-3xl sm:text-4xl font-extrabold mb-1">{value}</div>
                <div className="text-primary-200 text-sm font-medium">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SCORE BREAKDOWN PREVIEW ───────────────────────────────────────────── */}
      <section className="py-20 bg-white px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="section-title mb-4">Detailed Feedback After Every Interview</h2>
              <p className="text-surface-500 mb-8 text-lg">
                After each session you receive a comprehensive performance report covering
                communication, role knowledge, answer quality, and specific areas to improve.
              </p>
              <div className="space-y-4">
                {[
                  { label: 'Answer Quality', value: 88, color: 'bg-primary-500' },
                  { label: 'Communication', value: 82, color: 'bg-emerald-500' },
                  { label: 'Performance', value: 85, color: 'bg-purple-500' },
                  { label: 'Role Knowledge', value: 90, color: 'bg-amber-500' },
                ].map(({ label, value, color }) => (
                  <div key={label}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-medium text-surface-700">{label}</span>
                      <span className="font-semibold text-surface-900">{value}%</span>
                    </div>
                    <div className="h-2.5 bg-surface-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-surface-50 rounded-2xl p-6 border border-surface-200">
              <div className="text-center mb-6">
                <div className="inline-flex flex-col items-center">
                  <span className="text-6xl font-extrabold text-primary-600">84</span>
                  <span className="text-surface-400 text-sm">/100</span>
                  <span className="mt-2 px-4 py-1 rounded-full bg-blue-100 text-blue-700 font-bold text-sm">MARVELOUS</span>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { icon: '✅', label: 'What You Did Well', text: 'Strong role knowledge and project clarity.' },
                  { icon: '🎯', label: 'Key Improvement', text: 'Reduce filler words and structure answers better.' },
                  { icon: '📅', label: 'Practice Plan', text: '5-day personalised improvement roadmap.' },
                ].map(({ icon, label, text }) => (
                  <div key={label} className="flex gap-3 p-3 bg-white rounded-lg border border-surface-100">
                    <span className="text-base shrink-0" role="img" aria-hidden="true">{icon}</span>
                    <div>
                      <p className="text-xs font-semibold text-surface-700">{label}</p>
                      <p className="text-xs text-surface-500">{text}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-center text-xs text-surface-400 mt-4">
                *Mock data shown for illustration. Results are AI-generated practice feedback.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────────── */}
      <section className="py-20 bg-surface-900 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Ready to become interview-ready?
          </h2>
          <p className="text-surface-400 text-lg mb-8">
            Join thousands of candidates who use AI Interview Coach to prepare smarter.
          </p>
          <Link to="/register" className="btn-primary px-8 py-3.5 text-base">
            Start Your First Interview
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </Link>
          <div className="mt-6 flex flex-wrap justify-center gap-6 text-sm text-surface-500">
            {[Briefcase, DollarSign, Target, Megaphone].map((Icon, i) => (
              <span key={i} className="flex items-center gap-1.5">
                <Icon className="w-4 h-4" aria-hidden="true" />
                {['All Career Paths', 'Free to Start', 'Personalized Plan', 'Realistic Practice'][i]}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
