import React, { useState } from 'react';
import { Milestone, Task } from '../types/hackathon';

interface MilestonesViewProps {
  milestones: Milestone[];
  tasks: Task[];
  onToggleMilestone: (id: string) => void;
  onAddMilestone: (milestone: Milestone) => void;
  onUpdateMilestoneNotes: (id: string, notes: string) => void;
  onDeleteMilestone: (id: string) => void;
}

export const MilestonesView: React.FC<MilestonesViewProps> = ({
  milestones,
  tasks,
  onToggleMilestone,
  onAddMilestone,
  onUpdateMilestoneNotes,
  onDeleteMilestone,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [newHoursRemaining, setNewHoursRemaining] = useState(6);

  const completedCount = milestones.filter((m) => m.completed).length;
  const pct = milestones.length > 0 ? Math.round((completedCount / milestones.length) * 100) : 0;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newM: Milestone = {
      id: `ms-${Date.now()}`,
      title: newTitle.trim(),
      phaseNumber: milestones.length + 1,
      targetHoursRemaining: Number(newHoursRemaining) || 0,
      completed: false,
      notes: newNotes.trim(),
    };

    onAddMilestone(newM);
    setNewTitle('');
    setNewNotes('');
    setShowAddModal(false);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Hackathon Sprint Milestones</h2>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
            <span>{milestones.length} defined roadmap gates</span>
            <span aria-hidden="true">·</span>
            <span className="text-indigo-400 font-semibold">{completedCount} achieved ({pct}%)</span>
            <span aria-hidden="true">·</span>
            <span>Stay on pace for code freeze & judging</span>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors cursor-pointer shadow-sm flex items-center gap-1.5 self-start sm:self-auto"
        >
          <span>+</span>
          <span>Add Milestone</span>
        </button>
      </div>

      {/* Progress Timeline Header */}
      <div className="p-5 bg-slate-900/60 border border-slate-800/80 rounded-xl">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="font-semibold text-slate-300">Sprint Completion Velocity</span>
          <span className="font-mono tabular-nums text-indigo-400 font-bold">{pct}%</span>
        </div>
        <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
          <div
            className="bg-indigo-500 h-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Timeline Steps */}
      <div className="relative border-l border-slate-800 ml-4 sm:ml-8 space-y-6 py-2">
        {milestones.map((milestone, idx) => {
          const isCurrent =
            !milestone.completed &&
            (idx === 0 || milestones[idx - 1]?.completed);

          return (
            <div key={milestone.id} className="relative pl-6 sm:pl-8 group">
              {/* Timeline marker */}
              <button
                onClick={() => onToggleMilestone(milestone.id)}
                className={`absolute -left-3.5 sm:-left-3.5 top-1.5 w-7 h-7 rounded-full border flex items-center justify-center text-xs font-bold transition-all cursor-pointer ${
                  milestone.completed
                    ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                    : isCurrent
                    ? 'bg-indigo-950 border-indigo-500 text-indigo-300 ring-4 ring-indigo-500/20 animate-pulse'
                    : 'bg-slate-950 border-slate-700 text-slate-500 hover:border-slate-500'
                }`}
                title={milestone.completed ? 'Mark incomplete' : 'Mark completed'}
              >
                {milestone.completed ? '✓' : milestone.phaseNumber}
              </button>

              {/* Milestone Card */}
              <div
                className={`p-4 rounded-xl border transition-colors ${
                  milestone.completed
                    ? 'bg-slate-900/40 border-slate-800/60 opacity-90'
                    : isCurrent
                    ? 'bg-slate-900/90 border-indigo-500/60 shadow-lg'
                    : 'bg-slate-900/40 border-slate-800/80'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <h3
                      className={`text-sm font-bold ${
                        milestone.completed ? 'line-through text-slate-400' : 'text-white'
                      }`}
                    >
                      Phase {milestone.phaseNumber}: {milestone.title}
                    </h3>
                    {isCurrent && (
                      <span className="text-[10px] font-semibold text-indigo-300 bg-indigo-950/70 border border-indigo-800 px-2 py-0.5 rounded">
                        Active Target
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <span className="font-mono tabular-nums text-slate-400">
                      Target: ~{milestone.targetHoursRemaining}h remaining
                    </span>
                    <button
                      onClick={() => onToggleMilestone(milestone.id)}
                      className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors cursor-pointer ${
                        milestone.completed
                          ? 'bg-slate-800 text-slate-300 border-slate-700'
                          : 'bg-emerald-950/80 text-emerald-300 border-emerald-800 hover:bg-emerald-900'
                      }`}
                    >
                      {milestone.completed ? 'Reopen Phase' : 'Mark Achieved ✓'}
                    </button>
                    <button
                      onClick={() => onDeleteMilestone(milestone.id)}
                      className="text-slate-500 hover:text-rose-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete milestone"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* Notes & Deliverables Context */}
                <div className="mt-3 text-xs text-slate-300">
                  <textarea
                    rows={2}
                    value={milestone.notes}
                    onChange={(e) => onUpdateMilestoneNotes(milestone.id, e.target.value)}
                    placeholder="Add milestone criteria, dependencies, or links..."
                    className="w-full px-2.5 py-1.5 bg-slate-950/80 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-y"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Milestone Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-5">
            <h3 className="text-base font-bold text-white mb-3">Add Custom Milestone</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Milestone Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. End-to-End WebSocket smoke test"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Target Hours Remaining before Code Freeze
                </label>
                <input
                  type="number"
                  min={0}
                  max={72}
                  value={newHoursRemaining}
                  onChange={(e) => setNewHoursRemaining(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Notes</label>
                <textarea
                  rows={2}
                  placeholder="Exit criteria or required deliverables..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg"
                >
                  Save Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
