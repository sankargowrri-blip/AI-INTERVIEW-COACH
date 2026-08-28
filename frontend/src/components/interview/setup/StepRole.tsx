import { useState, useMemo } from 'react';
import { Search, Check } from 'lucide-react';
import { useInterview } from '../../../context/InterviewContext';
import { roleCategories } from '../../../data/mockRoles';
import Button from '../../common/Button';
import Input from '../../common/Input';
import { clsx } from 'clsx';

export default function StepRole() {
  const { config, setRole, setCurrentStep } = useInterview();
  const [search, setSearch] = useState('');
  const [customRole, setCustomRole] = useState('');
  const [showCustom, setShowCustom] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filteredCategories = useMemo(() => {
    if (!search.trim()) return roleCategories;
    const q = search.toLowerCase();
    return roleCategories.map(cat => ({
      ...cat,
      roles: cat.roles.filter(r => r.toLowerCase().includes(q)),
    })).filter(cat => cat.roles.length > 0);
  }, [search]);

  const handleSelectRole = (role: string) => {
    setRole(role);
    setShowCustom(false);
    setCustomRole('');
  };

  const handleCustomSubmit = () => {
    const trimmed = customRole.trim();
    if (trimmed) {
      setRole(trimmed);
      setShowCustom(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-surface-900 mb-2">Select Your Career Role</h2>
      <p className="text-surface-500 text-sm mb-5">
        Choose your target role or enter a custom one. Questions will be tailored to your selection.
      </p>

      {/* Search */}
      <Input
        placeholder="Search roles..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        leftIcon={<Search className="w-4 h-4" />}
        className="mb-4"
        aria-label="Search career roles"
      />

      {/* Selected role indicator */}
      {config.role && (
        <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-primary-50 border border-primary-200 rounded-lg">
          <Check className="w-4 h-4 text-primary-600" aria-hidden="true" />
          <span className="text-sm font-medium text-primary-700">Selected: {config.role}</span>
          <button
            onClick={() => setRole('')}
            className="ml-auto text-xs text-primary-500 hover:text-primary-700 underline"
            aria-label="Clear selected role"
          >
            Change
          </button>
        </div>
      )}

      {/* Category tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setActiveCategory(null)}
          className={clsx(
            'px-3 py-1.5 rounded-full text-xs font-medium transition-colors border',
            activeCategory === null
              ? 'bg-primary-600 text-white border-primary-600'
              : 'bg-white text-surface-600 border-surface-200 hover:border-surface-300'
          )}
        >
          All
        </button>
        {roleCategories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
            className={clsx(
              'px-3 py-1.5 rounded-full text-xs font-medium transition-colors border',
              activeCategory === cat.id
                ? 'bg-primary-600 text-white border-primary-600'
                : 'bg-white text-surface-600 border-surface-200 hover:border-surface-300'
            )}
          >
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>

      {/* Roles list */}
      <div className="max-h-72 overflow-y-auto rounded-xl border border-surface-200 bg-white divide-y divide-surface-100">
        {filteredCategories
          .filter(cat => !activeCategory || cat.id === activeCategory)
          .map(cat => (
            <div key={cat.id}>
              <div className="px-4 py-2 bg-surface-50 sticky top-0">
                <span className="text-xs font-semibold text-surface-500 uppercase tracking-wide">
                  {cat.icon} {cat.name}
                </span>
              </div>
              {cat.roles.map(role => (
                <button
                  key={role}
                  onClick={() => handleSelectRole(role)}
                  className={clsx(
                    'w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between',
                    config.role === role
                      ? 'bg-primary-50 text-primary-700 font-medium'
                      : 'text-surface-700 hover:bg-surface-50'
                  )}
                  aria-pressed={config.role === role}
                >
                  {role}
                  {config.role === role && <Check className="w-4 h-4 text-primary-600" aria-hidden="true" />}
                </button>
              ))}
            </div>
          ))}
        {filteredCategories.filter(cat => !activeCategory || cat.id === activeCategory).length === 0 && (
          <div className="p-6 text-center text-sm text-surface-400">
            No roles found for "{search}"
          </div>
        )}
      </div>

      {/* Custom Role */}
      <div className="mt-4">
        {!showCustom ? (
          <button
            onClick={() => setShowCustom(true)}
            className="text-sm text-primary-600 hover:underline"
          >
            + Enter a custom role
          </button>
        ) : (
          <div className="flex gap-2">
            <Input
              placeholder="e.g. Procurement Manager"
              value={customRole}
              onChange={e => setCustomRole(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCustomSubmit()}
              aria-label="Enter custom role"
              className="flex-1"
            />
            <Button size="sm" onClick={handleCustomSubmit} disabled={!customRole.trim()}>
              Use
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setShowCustom(false)}>
              Cancel
            </Button>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <Button variant="secondary" onClick={() => setCurrentStep('resume')}>Back</Button>
        <Button onClick={() => setCurrentStep('difficulty')} disabled={!config.role}>Continue</Button>
      </div>
    </div>
  );
}
