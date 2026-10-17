import React, { useMemo } from 'react';
import { Member, MemberStatus, Task } from '../types/hackathon';

interface TeamViewProps {
  members: Member[];
  tasks: Task[];
  currentUserId: string;
  onSelectActiveUser: (memberId: string) => void;
  onOpenAddMember: () => void;
  onEditMember: (member: Member) => void;
  onUpdateMemberStatus: (memberId: string, newStatus: MemberStatus) => void;
  onFilterTasksByMember?: (memberId: string) => void;
}

const HACKATHON_PILLARS = [
  {
    key: 'frontend',
    title: 'Frontend & UI',
    roles: ['Frontend', 'Full-Stack'],
    skills: ['react', 'typescript', 'tailwind', 'vue', 'next', 'html', 'css'],
  },
  {
    key: 'backend',
    title: 'Backend & APIs',
    roles: ['Backend', 'Full-Stack'],
    skills: ['node', 'go', 'python', 'fastapi', 'postgresql', 'redis', 'sql', 'grpc'],
  },
  {
    key: 'ml_ai',
    title: 'AI & Data Engineering',
    roles: ['ML / AI'],
    skills: ['pytorch', 'python', 'ai', 'hugging face', 'onnx', 'tensorflow', 'llm', 'vector'],
  },
  {
    key: 'design',
    title: 'UI/UX & Prototyping',
    roles: ['UI / UX Designer'],
    skills: ['figma', 'wireframing', 'design systems', 'motion', 'prototyping', 'ux'],
  },
  {
    key: 'pitch',
    title: 'Pitch & Presentation',
    roles: ['PM / Pitch Lead'],
    skills: ['pitching', 'slide decks', 'product strategy', 'storyboarding', 'speech'],
  },
  {
    key: 'devops',
    title: 'Deployment & DevOps',
    roles: ['DevOps / Cloud', 'Backend', 'Full-Stack'],
    skills: ['docker', 'cloud', 'aws', 'gcp', 'kubernetes', 'ci/cd', 'vercel'],
  },
];

export const TeamView: React.FC<TeamViewProps> = ({
  members,
  tasks,
  currentUserId,
  onSelectActiveUser,
  onOpenAddMember,
  onEditMember,
  onUpdateMemberStatus,
}) => {
  // Compute workload per member
  const memberWorkload = useMemo(() => {
    return members.map((m) => {
      const assignedTasks = tasks.filter((t) => t.assignees.includes(m.id));
      const doneTasks = assignedTasks.filter((t) => t.status === 'Done');
      const inProgressTasks = assignedTasks.filter((t) => t.status === 'In Progress');
      const reviewTasks = assignedTasks.filter((t) => t.status === 'Review');
      const todoTasks = assignedTasks.filter((t) => t.status === 'Todo');

      const pct = assignedTasks.length > 0
        ? Math.round((doneTasks.length / assignedTasks.length) * 100)
        : 0;

      return {
        member: m,
        total: assignedTasks.length,
        done: doneTasks.length,
        active: inProgressTasks.length + reviewTasks.length,
        todo: todoTasks.length,
        pct,
      };
    });
  }, [members, tasks]);

  // Skill Gap Analysis
  const pillarCoverage = useMemo(() => {
    return HACKATHON_PILLARS.map((pillar) => {
      const coveredBy = members.filter((m) => {
        const roleMatches = pillar.roles.includes(m.role);
        const skillMatches = m.skills.some((sk) =>
          pillar.skills.some((ps) => sk.toLowerCase().includes(ps))
        );
        return roleMatches || skillMatches;
      });

      return {
        ...pillar,
        coveredBy,
        isCovered: coveredBy.length > 0,
      };
    });
  }, [members]);

  const missingPillars = pillarCoverage.filter((p) => !p.isCovered);

  const getStatusBadge = (status: MemberStatus) => {
    switch (status) {
      case 'coding':
        return { label: 'Active Coding', color: 'text-emerald-400 bg-emerald-950/60 border-emerald-800' };
      case 'reviewing':
        return { label: 'Reviewing PRs', color: 'text-sky-400 bg-sky-950/60 border-sky-800' };
      case 'available':
        return { label: 'Ready to Pair', color: 'text-amber-400 bg-amber-950/60 border-amber-800' };
      case 'resting':
        return { label: 'Resting / AFK', color: 'text-purple-400 bg-purple-950/60 border-purple-800' };
    }
  };

  const activeMember = members.find((m) => m.id === currentUserId) || members[0];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Team Member Profiles & Skills</h2>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
            <span>{members.length} registered teammates</span>
            <span aria-hidden="true">·</span>
            <span>
              Logged in as <strong className="text-white">{activeMember?.name}</strong> ({activeMember?.role})
            </span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-400">
              {missingPillars.length === 0
                ? 'All 6 critical hackathon roles covered'
                : `${missingPillars.length} role gap alert`}
            </span>
          </div>
        </div>

        <button
          onClick={onOpenAddMember}
          className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors cursor-pointer shadow-sm flex items-center gap-1.5 self-start sm:self-auto"
        >
          <span>+</span>
          <span>Add Teammate</span>
        </button>
      </div>

      {/* Member Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {memberWorkload.map(({ member, total, done, active, pct }) => {
          const statusConfig = getStatusBadge(member.status);
          const isCurrentUser = member.id === currentUserId;

          return (
            <div
              key={member.id}
              className={`bg-slate-900/60 border rounded-xl p-4 flex flex-col justify-between transition-colors shadow-sm ${
                isCurrentUser ? 'border-indigo-500/80 ring-1 ring-indigo-500/30' : 'border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div>
                {/* Header: Avatar, Name, Role, and Edit */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-white text-base shadow-sm shrink-0"
                      style={{ backgroundColor: member.avatarColor }}
                    >
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-white text-sm leading-tight">
                          {member.name}
                        </h4>
                        {isCurrentUser && (
                          <span className="text-[10px] bg-indigo-950 text-indigo-300 border border-indigo-700/80 px-1.5 py-0.2 rounded font-medium">
                            You
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-indigo-400 font-medium mt-0.5">
                        {member.role}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {!isCurrentUser && (
                      <button
                        onClick={() => onSelectActiveUser(member.id)}
                        className="text-[11px] text-slate-400 hover:text-indigo-300 px-2 py-0.5 rounded bg-slate-950 border border-slate-800 hover:border-indigo-700 transition-colors cursor-pointer"
                        title="Switch to chat/post as this teammate"
                      >
                        Select
                      </button>
                    )}
                    <button
                      onClick={() => onEditMember(member)}
                      className="text-xs text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Edit profile & skills"
                    >
                      ✏️
                    </button>
                  </div>
                </div>

                {/* Brief Bio */}
                <div className="mt-3 text-xs text-slate-300 leading-relaxed bg-slate-950/70 p-2.5 rounded-lg border border-slate-800/60">
                  {member.bio ? (
                    <p className="line-clamp-3">{member.bio}</p>
                  ) : (
                    <p className="text-slate-500 italic">No bio provided. Click edit to add a brief background.</p>
                  )}
                </div>

                {/* Handles & Status Ticker */}
                <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-slate-800/60">
                  <span className="font-mono text-slate-400 truncate max-w-[140px]">
                    {member.handle}
                  </span>

                  {/* Status Dropdown */}
                  <select
                    value={member.status}
                    onChange={(e) =>
                      onUpdateMemberStatus(member.id, e.target.value as MemberStatus)
                    }
                    className={`px-2 py-0.5 rounded border text-[11px] font-medium focus:outline-none cursor-pointer ${statusConfig.color}`}
                  >
                    <option value="coding">Coding</option>
                    <option value="reviewing">Reviewing</option>
                    <option value="available">Ready to pair</option>
                    <option value="resting">Resting</option>
                  </select>
                </div>

                {/* Key Skills */}
                <div className="mt-3">
                  <div className="text-[11px] text-slate-400 font-semibold mb-1 uppercase tracking-wider">
                    Key Skills
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {member.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-0.5 text-[11px] rounded bg-slate-950 border border-slate-800 text-slate-300"
                      >
                        {skill}
                      </span>
                    ))}
                    {member.skills.length === 0 && (
                      <span className="text-[11px] text-slate-500 italic">No skills listed</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Workload Progress Bar */}
              <div className="mt-4 pt-3 border-t border-slate-800/80">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-slate-400 font-medium">Sprint Deliverables</span>
                  <span className="font-mono tabular-nums text-slate-200">
                    <span className="text-emerald-400 font-semibold">{done}</span>
                    <span className="text-slate-500"> / </span>
                    <span>{total}</span>
                    <span className="text-slate-400 ml-1">({pct}%)</span>
                  </span>
                </div>

                <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800/60">
                  <div
                    className="bg-indigo-500 h-full transition-all duration-300"
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                  <span>{active} active tasks</span>
                  <span>{total - done} pending</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Workload Distribution Matrix */}
      <div className="p-5 bg-slate-900/60 border border-slate-800/80 rounded-xl">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
          Sprint Workload Distribution
        </h3>
        <div className="space-y-3">
          {memberWorkload.map(({ member, total, done, active }) => {
            const maxTasks = Math.max(...memberWorkload.map((m) => m.total), 1);
            const totalWidthPct = (total / maxTasks) * 100;

            return (
              <div key={member.id} className="text-xs">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full inline-block"
                      style={{ backgroundColor: member.avatarColor }}
                    />
                    <span className="font-semibold text-slate-200">{member.name}</span>
                    <span className="text-slate-400">({member.role})</span>
                  </div>
                  <span className="font-mono tabular-nums text-slate-300">
                    {total} tasks ({done} done · {active} in progress)
                  </span>
                </div>

                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden flex border border-slate-800">
                  <div
                    className="bg-indigo-500 h-full"
                    style={{ width: `${totalWidthPct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
