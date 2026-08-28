import { useState } from 'react';
import { User, Mail, Briefcase, Target, FileText, BarChart2, Award, Edit2, Save, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { mockProgressStats } from '../data/mockProgress';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { roleCategories } from '../data/mockRoles';

const allRoles = roleCategories.flatMap(c => c.roles);

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    experienceLevel: user?.experienceLevel || '',
    preferredRole: user?.preferredRole || '',
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateUser({
      name: form.name,
      experienceLevel: form.experienceLevel as 'fresher' | 'experienced' | undefined,
      preferredRole: form.preferredRole,
    });
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-surface-900">My Profile</h1>
        {!editing && (
          <Button variant="secondary" size="sm" leftIcon={<Edit2 className="w-4 h-4" />} onClick={() => setEditing(true)}>
            Edit Profile
          </Button>
        )}
      </div>

      {saved && (
        <div role="status" aria-live="polite" className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-sm text-emerald-700">
          ✓ Profile updated successfully.
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-white rounded-2xl border border-surface-200 p-6 sm:p-8">
        <div className="flex items-start gap-5 mb-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-primary-100 flex items-center justify-center shrink-0">
            <span className="text-2xl sm:text-3xl font-bold text-primary-700">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-surface-900">{user.name}</h2>
            <p className="text-surface-500 text-sm">{user.email}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {user.experienceLevel && (
                <Badge variant="primary">{user.experienceLevel === 'fresher' ? 'Fresher' : 'Experienced'}</Badge>
              )}
              {user.preferredRole && (
                <Badge variant="default">{user.preferredRole}</Badge>
              )}
            </div>
          </div>
        </div>

        {editing ? (
          <div className="space-y-4 border-t border-surface-100 pt-5">
            <Input
              label="Full Name"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              leftIcon={<User className="w-4 h-4" />}
            />
            <div>
              <label className="label">Experience Level</label>
              <select
                className="input-field"
                value={form.experienceLevel}
                onChange={e => setForm(f => ({ ...f, experienceLevel: e.target.value }))}
                aria-label="Experience level"
              >
                <option value="">Select experience level</option>
                <option value="fresher">Fresher</option>
                <option value="experienced">Experienced</option>
              </select>
            </div>
            <div>
              <label className="label">Preferred Role</label>
              <select
                className="input-field"
                value={form.preferredRole}
                onChange={e => setForm(f => ({ ...f, preferredRole: e.target.value }))}
                aria-label="Preferred role"
              >
                <option value="">Select a role</option>
                {allRoles.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <Button onClick={handleSave} leftIcon={<Save className="w-4 h-4" />}>Save Changes</Button>
              <Button variant="secondary" onClick={() => setEditing(false)} leftIcon={<X className="w-4 h-4" />}>Cancel</Button>
            </div>
          </div>
        ) : (
          <div className="border-t border-surface-100 pt-5 space-y-4">
            {[
              { icon: User, label: 'Name', value: user.name },
              { icon: Mail, label: 'Email', value: user.email },
              { icon: Briefcase, label: 'Experience Level', value: user.experienceLevel ? (user.experienceLevel === 'fresher' ? 'Fresher' : 'Experienced') : 'Not set' },
              { icon: Target, label: 'Preferred Role', value: user.preferredRole || 'Not set' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-surface-100 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-surface-500" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-xs text-surface-400">{label}</p>
                  <p className="text-sm font-medium text-surface-900">{value}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Resume Status */}
      <div className="bg-white rounded-xl border border-surface-200 p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-primary-600" aria-hidden="true" />
          <h2 className="font-semibold text-surface-900">Resume Status</h2>
        </div>
        <div className="flex items-center gap-3 p-3 bg-surface-50 rounded-lg">
          <div className="w-2 h-2 rounded-full bg-amber-400" aria-hidden="true" />
          <span className="text-sm text-surface-600">No resume uploaded for your profile yet. Upload a resume when starting an interview.</span>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white rounded-xl border border-surface-200 p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart2 className="w-5 h-5 text-primary-600" aria-hidden="true" />
          <h2 className="font-semibold text-surface-900">Your Statistics</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            { icon: BarChart2, label: 'Interviews Completed', value: mockProgressStats.totalInterviews },
            { icon: Award, label: 'Best Score', value: `${mockProgressStats.bestScore}/100` },
            { icon: Target, label: 'Average Score', value: `${mockProgressStats.averageScore}/100` },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="bg-surface-50 rounded-lg p-4 text-center">
              <Icon className="w-5 h-5 text-primary-600 mx-auto mb-2" aria-hidden="true" />
              <div className="text-xl font-bold text-surface-900">{value}</div>
              <div className="text-xs text-surface-500 mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
