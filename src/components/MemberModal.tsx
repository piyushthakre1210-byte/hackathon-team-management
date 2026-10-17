import React, { useState } from 'react';
import { Member, MemberRole, MemberStatus } from '../types/hackathon';

interface MemberModalProps {
  member: Member | null;
  onClose: () => void;
  onSave: (member: Member) => void;
  onDelete?: (id: string) => void;
}

const ROLES: MemberRole[] = [
  'Full-Stack',
  'Frontend',
  'Backend',
  'ML / AI',
  'UI / UX Designer',
  'PM / Pitch Lead',
  'DevOps / Cloud',
  'QA & Testing',
];

const STATUSES: { id: MemberStatus; label: string }[] = [
  { id: 'coding', label: 'Active Coding' },
  { id: 'reviewing', label: 'Reviewing PRs' },
  { id: 'available', label: 'Ready to Pair' },
  { id: 'resting', label: 'Resting / AFK' },
];

const AVATAR_COLORS = [
  '#6366F1', // Indigo
  '#10B981', // Emerald
  '#EC4899', // Pink
  '#F59E0B', // Amber
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#EF4444', // Red
  '#14B8A6', // Teal
];

const COMMON_SKILL_SUGGESTIONS = [
  'Frontend Development',
  'UI/UX Design',
  'API Integration',
  'Machine Learning',
  'Backend Architecture',
  'DevOps & Cloud',
  'Pitch & Storytelling',
  'TypeScript',
  'Python',
  'FastAPI',
  'React',
  'Figma',
  'Docker',
];

export const MemberModal: React.FC<MemberModalProps> = ({
  member,
  onClose,
  onSave,
  onDelete,
}) => {
  const isEditing = !!member;

  const [name, setName] = useState(member?.name || '');
  const [role, setRole] = useState<MemberRole>(member?.role || 'Full-Stack');
  const [bio, setBio] = useState(
    member?.bio || ''
  );
  const [email, setEmail] = useState(member?.email || '');
  const [handle, setHandle] = useState(member?.handle || '');
  const [avatarColor, setAvatarColor] = useState(member?.avatarColor || AVATAR_COLORS[0]);
  const [status, setStatus] = useState<MemberStatus>(member?.status || 'coding');
  const [skills, setSkills] = useState<string[]>(
    member?.skills || ['Frontend Development', 'API Integration']
  );
  const [newSkillText, setNewSkillText] = useState('');

  const handleAddSkill = () => {
    const s = newSkillText.trim();
    if (s && !skills.includes(s)) {
      setSkills([...skills, s]);
      setNewSkillText('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const saved: Member = {
      id: member?.id || `mem-${Date.now()}`,
      name: name.trim(),
      role,
      bio: bio.trim(),
      email: email.trim() || `${name.toLowerCase().replace(/\s+/g, '')}@hackhub.io`,
      handle: handle.trim() || `@${name.toLowerCase().replace(/\s+/g, '_')}`,
      avatarColor,
      status,
      skills,
      joinedAt: member?.joinedAt || new Date().toISOString(),
    };

    onSave(saved);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-white">
              {isEditing ? 'Edit Teammate Profile' : 'Add Teammate'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Set role, skills, and communication handles.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {/* Name & Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Full Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Alex Rivera"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Primary Track Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as MemberRole)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Brief Bio */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-300">
                Brief Bio & Focus
              </label>
              <span className="text-[11px] text-slate-500 font-mono">
                {bio.length}/180
              </span>
            </div>
            <textarea
              rows={2}
              maxLength={220}
              placeholder="e.g. Full-Stack developer focusing on real-time API integrations, WebSocket telemetry, and UI components..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-y"
            />
          </div>

          {/* Email & Handle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Email / Contact
              </label>
              <input
                type="email"
                placeholder="alex@hackhub.io"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                GitHub / Discord Handle
              </label>
              <input
                type="text"
                placeholder="@alex_dev"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Status & Avatar Color */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Current Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as MemberStatus)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                {STATUSES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Avatar Theme Color
              </label>
              <div className="flex items-center gap-1.5 pt-1">
                {AVATAR_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setAvatarColor(c)}
                    className={`w-6 h-6 rounded-full cursor-pointer transition-transform ${
                      avatarColor === c ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-slate-900' : 'opacity-80 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Skills Tag Management */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Key Skills ({skills.length})
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Type skill and press Add (e.g. Machine Learning)..."
                value={newSkillText}
                onChange={(e) => setNewSkillText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
                className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg cursor-pointer"
              >
                + Add
              </button>
            </div>

            {/* Quick Suggestions Chips */}
            <div className="mb-2">
              <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block mb-1">
                Quick Add Suggestions:
              </span>
              <div className="flex flex-wrap gap-1">
                {COMMON_SKILL_SUGGESTIONS.filter((s) => !skills.includes(s)).map((sug) => (
                  <button
                    type="button"
                    key={sug}
                    onClick={() => setSkills([...skills, sug])}
                    className="text-[10px] px-2 py-0.5 rounded bg-slate-950 hover:bg-indigo-950/60 border border-slate-800 hover:border-indigo-700 text-slate-300 hover:text-indigo-300 transition-colors cursor-pointer"
                  >
                    + {sug}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1.5 bg-slate-950/60 rounded-lg border border-slate-800/80">
              {skills.map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-slate-850 border border-slate-700 text-slate-200"
                >
                  <span>{s}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(s)}
                    className="text-slate-400 hover:text-rose-400 ml-0.5 cursor-pointer"
                  >
                    ✕
                  </button>
                </span>
              ))}
              {skills.length === 0 && (
                <span className="text-xs text-slate-500 p-1">No skills added yet. Click suggestions above.</span>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <div>
              {isEditing && onDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(member.id)}
                  className="text-xs text-rose-400 hover:text-rose-300 py-1.5 px-2.5 rounded hover:bg-rose-950/30 transition-colors cursor-pointer"
                >
                  Remove Member
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors cursor-pointer shadow-sm"
              >
                {isEditing ? 'Save Profile' : 'Add Teammate'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
