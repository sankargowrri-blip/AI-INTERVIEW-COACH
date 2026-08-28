import { useState } from 'react';
import { Building2, ChevronRight, BookOpen, Users, Lightbulb } from 'lucide-react';
import { mockCompanies } from '../data/mockCompanies';
import type { CompanyData } from '../types';
import { clsx } from 'clsx';
import Button from '../components/common/Button';
import { useNavigate } from 'react-router-dom';

const companyColors: Record<string, string> = {
  google: 'bg-blue-50 border-blue-200',
  amazon: 'bg-amber-50 border-amber-200',
  microsoft: 'bg-indigo-50 border-indigo-200',
  infosys: 'bg-cyan-50 border-cyan-200',
  tcs: 'bg-purple-50 border-purple-200',
  zoho: 'bg-emerald-50 border-emerald-200',
};

function CompanyCard({ company, selected, onClick }: { company: CompanyData; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={selected}
      className={clsx(
        'w-full text-left p-5 rounded-xl border-2 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
        selected
          ? 'border-primary-600 bg-primary-50'
          : `${companyColors[company.id] || 'bg-surface-50 border-surface-200'} hover:shadow-card`
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="w-10 h-10 rounded-xl bg-white border border-surface-200 flex items-center justify-center">
          <Building2 className="w-5 h-5 text-surface-500" aria-hidden="true" />
        </div>
        {selected && <div className="w-2 h-2 rounded-full bg-primary-600" aria-hidden="true" />}
      </div>
      <h3 className="font-bold text-surface-900 mb-1">{company.name}</h3>
      <p className="text-xs text-surface-500 line-clamp-2">{company.description}</p>
    </button>
  );
}

export default function CompanyPreparationPage() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<CompanyData | null>(null);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-surface-900">Company-Specific Preparation</h1>
        <p className="text-surface-500 text-sm mt-1">
          Study company interview styles and common patterns.
        </p>
        <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
          <Lightbulb className="w-3.5 h-3.5" aria-hidden="true" />
          Practice content is AI-generated for preparation purposes. This does not reproduce actual company interviews.
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        {mockCompanies.map(company => (
          <CompanyCard
            key={company.id}
            company={company}
            selected={selected?.id === company.id}
            onClick={() => setSelected(selected?.id === company.id ? null : company)}
          />
        ))}
      </div>

      {selected && (
        <div className="space-y-5 animate-fade-in">
          {/* Header */}
          <div className="bg-white border border-surface-200 rounded-2xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-surface-100 flex items-center justify-center shrink-0">
                <Building2 className="w-7 h-7 text-surface-500" aria-hidden="true" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-surface-900 mb-1">{selected.name}</h2>
                <p className="text-surface-600 text-sm mb-3">{selected.description}</p>
                <div>
                  <p className="text-xs font-semibold text-surface-500 uppercase tracking-wide mb-2">Interview Style</p>
                  <p className="text-sm text-surface-700">{selected.interviewStyle}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Common roles */}
          <div className="bg-white border border-surface-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-5 h-5 text-primary-600" aria-hidden="true" />
              <h3 className="font-semibold text-surface-900">Common Roles</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {selected.commonRoles.map(role => (
                <span key={role} className="px-3 py-1.5 text-sm bg-primary-50 text-primary-700 rounded-lg border border-primary-100">
                  {role}
                </span>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="bg-white border border-surface-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-emerald-600" aria-hidden="true" />
              <h3 className="font-semibold text-surface-900">Preparation Tips</h3>
            </div>
            <ol className="space-y-3">
              {selected.tipsList.map((tip, i) => (
                <li key={i} className="flex gap-3 text-sm text-surface-700">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {tip}
                </li>
              ))}
            </ol>
          </div>

          {/* Practice CTA */}
          <div className="bg-primary-50 border border-primary-200 rounded-xl p-5 flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-1">
              <h3 className="font-semibold text-primary-900 mb-1">Ready to practice for {selected.name}?</h3>
              <p className="text-sm text-primary-700">Start a company-specific practice interview with questions inspired by {selected.name}'s interview style.</p>
            </div>
            <Button
              onClick={() => navigate('/interview/setup')}
              rightIcon={<ChevronRight className="w-4 h-4" />}
              className="shrink-0"
            >
              Start Practice
            </Button>
          </div>
        </div>
      )}

      {!selected && (
        <div className="text-center py-12 text-surface-400">
          <Building2 className="w-12 h-12 mx-auto mb-3 opacity-30" aria-hidden="true" />
          <p className="text-sm">Select a company above to view preparation tips and start practising.</p>
        </div>
      )}
    </div>
  );
}
