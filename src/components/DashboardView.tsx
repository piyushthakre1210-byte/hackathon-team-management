import React from 'react';
import { HackathonProject, Member, Task, Milestone } from '../types/hackathon';
import { NavTab } from './Header';

interface DashboardViewProps {
  project: HackathonProject;
  members: Member[];
  tasks: Task[];
  milestones: Milestone[];
  currentUserId: string;
  onNavigate: (tab: NavTab) => void;
  onOpenNewTask: () => void;
  onEditTask: (task: Task) => void;
  onEditMember: (member: Member) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  project,
  members,
  tasks,
  milestones,
  currentUserId,
  onNavigate,
  onOpenNewTask,
  onEditTask,
  onEditMember,
}) => {
  const doneTasks = tasks.filter((t) => t.status === 'Done');
  const inProgressTasks = tasks.filter((t) => t.status === 'In Progress');
  const criticalTasks = tasks.filter((t) => t.priority === 'Critical' && t.status !== 'Done');
  const completedMilestones = milestones.filter((m) => m.completed);

  const taskPct = tasks.length > 0 ? Math.round((doneTasks.length / tasks.length) * 100) : 0;
  const milestonePct = milestones.length > 0 ? Math.round((completedMilestones.length / milestones.length) * 100) : 0;

  // Active teammates
  const activeCoders = members.filter((m) => m.status === 'coding');

  // Urgent tasks
  const urgentTasks = tasks
    .filter((t) => t.status !== 'Done')
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 4);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* KPI Stat Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4">
          <div className="text-xs text-slate-400 font-medium">Sprint Completion</div>
          <div className="text-2xl font-bold text-white mt-1 font-mono tabular-nums">
            {taskPct}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {doneTasks.length} of {tasks.length} deliverables shipped
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4">
          <div className="text-xs text-slate-400 font-medium">In Active Flight</div>
          <div className="text-2xl font-bold text-indigo-400 mt-1 font-mono tabular-nums">
            {inProgressTasks.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {criticalTasks.length} critical blocker priorities
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4">
          <div className="text-xs text-slate-400 font-medium">Team Force</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1 font-mono tabular-nums">
            {activeCoders.length} / {members.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            teammates currently writing code
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4">
          <div className="text-xs text-slate-400 font-medium">Milestone Gates</div>
          <div className="text-2xl font-bold text-sky-400 mt-1 font-mono tabular-nums">
            {completedMilestones.length} / {milestones.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {milestonePct}% of roadmap cleared
          </div>
        </div>
      </div>

      {/* Main Grid: Urgent Deliverables & Team Profiles */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Sprint Pipeline & Urgent Items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Urgent Deliverables */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Urgent Sprint Deliverables
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  High-priority tasks closest to code freeze.
                </p>
              </div>
              <button
                onClick={() => onNavigate('tasks')}
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
              >
                View Full Kanban →
              </button>
            </div>

            <div className="space-y-2.5">
              {urgentTasks.map((t) => (
                <div
                  key={t.id}
                  onClick={() => onEditTask(t)}
                  className="p-3 bg-slate-950/80 border border-slate-800/80 rounded-lg hover:border-slate-700 transition-colors flex items-center justify-between gap-3 cursor-pointer group"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.2 rounded border ${
                          t.priority === 'Critical'
                            ? 'bg-rose-950/60 border-rose-800 text-rose-300'
                            : 'bg-amber-950/60 border-amber-800 text-amber-300'
                        }`}
                      >
                        {t.priority}
                      </span>
                      <span className="text-[11px] text-slate-400">{t.tag}</span>
                    </div>
                    <h4 className="text-xs font-semibold text-white group-hover:text-indigo-300 transition-colors truncate">
                      {t.title}
                    </h4>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[11px] text-slate-400 block font-mono">
                      {t.status}
                    </span>
                    <span className="text-[10px] text-indigo-400">
                      {t.checklist.filter((c) => c.done).length}/{t.checklist.length} checks
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between">
              <span className="text-xs text-slate-400">Need to dispatch another task?</span>
              <button
                onClick={onOpenNewTask}
                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-xs font-medium transition-colors cursor-pointer"
              >
                + New Deliverable
              </button>
            </div>
          </div>

          {/* Project Overview & Deliverables Repository Links */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">
              Hackathon Artifacts & Demo Links
            </h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              {project.description}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
              <a
                href={project.links.repo}
                target="_blank"
                rel="noreferrer"
                className="p-2.5 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-lg text-slate-300 hover:text-white transition-colors flex items-center gap-2"
              >
                <span>📦</span>
                <span className="truncate">GitHub Repo</span>
              </a>

              <a
                href={project.links.demo}
                target="_blank"
                rel="noreferrer"
                className="p-2.5 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-lg text-slate-300 hover:text-white transition-colors flex items-center gap-2"
              >
                <span>🌐</span>
                <span className="truncate">Live Demo App</span>
              </a>

              <a
                href={project.links.slides}
                target="_blank"
                rel="noreferrer"
                className="p-2.5 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-lg text-slate-300 hover:text-white transition-colors flex items-center gap-2"
              >
                <span>📑</span>
                <span className="truncate">Pitch Deck Slides</span>
              </a>

              <a
                href={project.links.video}
                target="_blank"
                rel="noreferrer"
                className="p-2.5 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-lg text-slate-300 hover:text-white transition-colors flex items-center gap-2"
              >
                <span>📹</span>
                <span className="truncate">Demo Walkthrough</span>
              </a>

              <a
                href={project.links.figma}
                target="_blank"
                rel="noreferrer"
                className="p-2.5 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-lg text-slate-300 hover:text-white transition-colors flex items-center gap-2"
              >
                <span>🎨</span>
                <span className="truncate">Figma Prototype</span>
              </a>

              <button
                onClick={() => onNavigate('submission')}
                className="p-2.5 bg-indigo-950/60 border border-indigo-800/80 hover:bg-indigo-900 rounded-lg text-indigo-300 hover:text-indigo-200 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <span>📝</span>
                <span className="truncate font-semibold">Devpost Hub →</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Col: Team Profiles & Real-Time Chat Teaser */}
        <div className="space-y-6">
          {/* Team Member Profiles */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Squad Profiles
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Bio, primary role & key skills
                </p>
              </div>
              <button
                onClick={() => onNavigate('team')}
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
              >
                Manage →
              </button>
            </div>

            <div className="space-y-3">
              {members.slice(0, 4).map((m) => (
                <div
                  key={m.id}
                  onClick={() => onEditMember(m)}
                  className="p-3 bg-slate-950/80 border border-slate-800/80 rounded-lg hover:border-slate-700 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-white text-xs shrink-0"
                      style={{ backgroundColor: m.avatarColor }}
                    >
                      {m.name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white truncate">
                          {m.name}
                        </span>
                        <span className="text-[10px] text-indigo-400">{m.role}</span>
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                    {m.bio || 'Hackathon builder.'}
                  </p>

                  {/* Key Skills */}
                  <div className="mt-2 flex flex-wrap gap-1">
                    {m.skills.slice(0, 3).map((sk) => (
                      <span
                        key={sk}
                        className="text-[10px] px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800 text-slate-300"
                      >
                        {sk}
                      </span>
                    ))}
                    {m.skills.length > 3 && (
                      <span className="text-[10px] text-slate-500">
                        +{m.skills.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Chat Entry Banner */}
          <div className="bg-gradient-to-br from-indigo-950/80 via-slate-900 to-slate-950 border border-indigo-900/60 rounded-xl p-5 text-center">
            <span className="text-2xl mb-2 inline-block">⚡</span>
            <h4 className="text-sm font-bold text-white">Live Team War Room</h4>
            <p className="text-xs text-slate-300 mt-1 mb-3">
              Real-time WebSocket chat connects all logged-in teammates instantly with channels & handles.
            </p>
            <button
              onClick={() => onNavigate('chat')}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer shadow-sm"
            >
              Open War Room Chat →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
