import { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronUp, Lightbulb } from 'lucide-react';
import { hrQuestions, behavioralQuestions, situationalQuestions, resumeQuestions, roleSpecificQuestions } from '../data/mockQuestions';
import type { PracticeQuestion, QuestionCategory, Difficulty } from '../types';
import Input from '../components/common/Input';
import Badge from '../components/common/Badge';
import { clsx } from 'clsx';

const categories: { value: QuestionCategory | 'all'; label: string; icon: string }[] = [
  { value: 'all', label: 'All Categories', icon: '📚' },
  { value: 'hr', label: 'HR Questions', icon: '👥' },
  { value: 'role-specific', label: 'Role Questions', icon: '🎯' },
  { value: 'resume', label: 'Resume Questions', icon: '📄' },
  { value: 'behavioral', label: 'Behavioral', icon: '💡' },
  { value: 'situational', label: 'Situational', icon: '🔄' },
  { value: 'introduction', label: 'Introduction', icon: '👋' },
];

const allPracticeQuestions: PracticeQuestion[] = [
  ...hrQuestions.map(q => ({ ...q, sampleAnswer: 'Structure your answer using STAR: Situation, Task, Action, Result.', tips: ['Be specific', 'Keep it concise', 'Use real examples'] })),
  ...behavioralQuestions.map(q => ({ ...q, sampleAnswer: 'Use the STAR method with a concrete example from your experience.', tips: ['Be honest', 'Focus on your actions', 'Quantify results where possible'] })),
  ...situationalQuestions.map(q => ({ ...q, sampleAnswer: 'Walk through your thought process step by step.', tips: ['Show problem-solving skills', 'Demonstrate communication', 'Consider team dynamics'] })),
  ...resumeQuestions.map(q => ({ ...q, sampleAnswer: 'Be specific about your role, technologies, and outcomes.', tips: ['Quantify impact', 'Highlight your contribution', 'Show what you learned'] })),
  ...roleSpecificQuestions.default.map(q => ({ ...q, sampleAnswer: 'Connect your answer to industry knowledge and your experience.', tips: ['Use technical terminology', 'Reference real trends', 'Be confident in your knowledge'] })),
];

function QuestionCard({ question }: { question: PracticeQuestion }) {
  const [open, setOpen] = useState(false);

  const diffBadge = question.difficulty === 'easy' ? 'success' : question.difficulty === 'medium' ? 'warning' : 'danger';

  return (
    <div className="bg-white rounded-xl border border-surface-200 overflow-hidden">
      <button
        className="w-full flex items-start gap-3 p-4 sm:p-5 text-left hover:bg-surface-50 transition-colors"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        <div className="flex-1 min-w-0">
          <p className="font-medium text-surface-900 text-sm leading-relaxed">{question.text}</p>
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge variant={diffBadge}>{question.difficulty}</Badge>
            <Badge variant="default">{question.category.replace('-', ' ')}</Badge>
          </div>
        </div>
        {open
          ? <ChevronUp className="w-4 h-4 text-surface-400 shrink-0 mt-0.5" aria-hidden="true" />
          : <ChevronDown className="w-4 h-4 text-surface-400 shrink-0 mt-0.5" aria-hidden="true" />
        }
      </button>

      {open && (
        <div className="px-4 sm:px-5 pb-5 space-y-4 border-t border-surface-100">
          {question.sampleAnswer && (
            <div className="bg-primary-50 border border-primary-100 rounded-lg p-3">
              <p className="text-xs font-semibold text-primary-700 mb-1">📝 Approach</p>
              <p className="text-sm text-primary-700">{question.sampleAnswer}</p>
            </div>
          )}
          {question.tips && question.tips.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-surface-500 mb-2 flex items-center gap-1">
                <Lightbulb className="w-3.5 h-3.5" aria-hidden="true" /> Tips
              </p>
              <ul className="space-y-1">
                {question.tips.map((tip, i) => (
                  <li key={i} className="text-xs text-surface-600 flex gap-2">
                    <span className="text-amber-400 mt-0.5" aria-hidden="true">•</span> {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {question.followUps && question.followUps.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-surface-500 mb-2">Possible Follow-ups</p>
              <ul className="space-y-1">
                {question.followUps.map((q, i) => (
                  <li key={i} className="text-xs text-surface-600 italic">"{q}"</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function PracticePage() {
  const [activeCategory, setActiveCategory] = useState<QuestionCategory | 'all'>('all');
  const [activeDifficulty, setActiveDifficulty] = useState<Difficulty | 'all'>('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let q = allPracticeQuestions;
    if (activeCategory !== 'all') q = q.filter(x => x.category === activeCategory);
    if (activeDifficulty !== 'all') q = q.filter(x => x.difficulty === activeDifficulty);
    if (search.trim()) q = q.filter(x => x.text.toLowerCase().includes(search.toLowerCase()));
    return q;
  }, [activeCategory, activeDifficulty, search]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-surface-900">Practice Questions</h1>
        <p className="text-surface-500 text-sm mt-1">
          Browse and study interview questions across all categories. Practice your answers before your mock interview.
        </p>
      </div>

      {/* Search */}
      <Input
        placeholder="Search questions..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        leftIcon={<Search className="w-4 h-4" />}
        className="mb-4"
        aria-label="Search practice questions"
      />

      {/* Category filter */}
      <div className="flex flex-wrap gap-2 mb-3">
        {categories.map(cat => (
          <button
            key={cat.value}
            onClick={() => setActiveCategory(cat.value)}
            aria-pressed={activeCategory === cat.value}
            className={clsx(
              'px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
              activeCategory === cat.value
                ? 'bg-primary-600 text-white border-primary-600'
                : 'bg-white text-surface-600 border-surface-200 hover:border-surface-300'
            )}
          >
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      {/* Difficulty filter */}
      <div className="flex gap-2 mb-6">
        {(['all', 'easy', 'medium', 'hard'] as const).map(d => (
          <button
            key={d}
            onClick={() => setActiveDifficulty(d)}
            aria-pressed={activeDifficulty === d}
            className={clsx(
              'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all capitalize',
              activeDifficulty === d
                ? 'bg-surface-800 text-white border-surface-800'
                : 'bg-white text-surface-600 border-surface-200 hover:border-surface-300'
            )}
          >
            {d}
          </button>
        ))}
      </div>

      <p className="text-xs text-surface-400 mb-4">{filtered.length} question{filtered.length !== 1 ? 's' : ''} found</p>

      <div className="space-y-3">
        {filtered.map(q => (
          <QuestionCard key={q.id} question={q} />
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-surface-400">
            <p>No questions found for your current filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
