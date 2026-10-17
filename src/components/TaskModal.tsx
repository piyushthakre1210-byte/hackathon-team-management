import React, { useState } from 'react';
import { Member, Task, TaskPriority, TaskStatus, TaskTag, TaskChecklistItem } from '../types/hackathon';

interface TaskModalProps {
  task: Task | null; // null if creating
  members: Member[];
  onClose: () => void;
  onSave: (task: Task) => void;
  onDelete?: (id: string) => void;
}

const PRIORITIES: TaskPriority[] = ['Low', 'Medium', 'High', 'Critical'];
const STATUSES: TaskStatus[] = ['Todo', 'In Progress', 'Review', 'Done'];
const TAGS: TaskTag[] = [
  'Frontend',
  'Backend',
  'AI / Model',
  'UI / UX',
  'Infra',
  'Pitch & Demo',
  'Documentation',
];

export const TaskModal: React.FC<TaskModalProps> = ({
  task,
  members,
  onClose,
  onSave,
  onDelete,
}) => {
  const isEditing = !!task;

  const [title, setTitle] = useState(task?.title || '');
  const [desc, setDesc] = useState(task?.desc || '');
  const [priority, setPriority] = useState<TaskPriority>(task?.priority || 'Medium');
  const [status, setStatus] = useState<TaskStatus>(task?.status || 'Todo');
  const [tag, setTag] = useState<TaskTag>(task?.tag || 'Frontend');
  const [assignees, setAssignees] = useState<string[]>(task?.assignees || []);
  const [deadline, setDeadline] = useState(
    task?.deadline
      ? new Date(task.deadline).toISOString().slice(0, 16)
      : new Date(Date.now() + 3600000 * 6).toISOString().slice(0, 16)
  );
  const [checklist, setChecklist] = useState<TaskChecklistItem[]>(task?.checklist || []);
  const [newChecklistText, setNewChecklistText] = useState('');
  const [prUrl, setPrUrl] = useState(task?.prUrl || '');

  const toggleAssignee = (id: string) => {
    setAssignees((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const handleAddChecklistItem = () => {
    if (!newChecklistText.trim()) return;
    const newItem: TaskChecklistItem = {
      id: `chk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      text: newChecklistText.trim(),
      done: false,
    };
    setChecklist([...checklist, newItem]);
    setNewChecklistText('');
  };

  const handleToggleChecklistItem = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
    );
  };

  const handleRemoveChecklistItem = (id: string) => {
    setChecklist((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const savedTask: Task = {
      id: task?.id || `task-${Date.now()}`,
      title: title.trim(),
      desc: desc.trim(),
      priority,
      status,
      tag,
      assignees,
      deadline: new Date(deadline).toISOString(),
      checklist,
      prUrl: prUrl.trim() || undefined,
      createdAt: task?.createdAt || new Date().toISOString(),
    };

    onSave(savedTask);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-white">
              {isEditing ? 'Edit Sprint Task' : 'New Sprint Task'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Assign deliverables, milestones, and sprint subtasks.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Task Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Wire up real-time ECG telemetry canvas"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Description & Acceptance Criteria
            </label>
            <textarea
              rows={2}
              placeholder="Specific technical details, endpoint paths, or judge demo expectations..."
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors resize-y"
            />
          </div>

          {/* Status, Priority & Tag */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Track Tag</label>
              <select
                value={tag}
                onChange={(e) => setTag(e.target.value as TaskTag)}
                className="w-full px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                {TAGS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Deadline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Target Deadline
              </label>
              <input
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                GitHub PR / Commit (optional)
              </label>
              <input
                type="url"
                placeholder="https://github.com/.../pull/12"
                value={prUrl}
                onChange={(e) => setPrUrl(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Assignees */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Assigned Teammates ({assignees.length})
            </label>
            <div className="flex flex-wrap gap-2">
              {members.map((m) => {
                const isSelected = assignees.includes(m.id);
                return (
                  <button
                    type="button"
                    key={m.id}
                    onClick={() => toggleAssignee(m.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-950/60 border-indigo-500/80 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span
                      className="w-2 h-2 rounded-full inline-block"
                      style={{ backgroundColor: m.avatarColor }}
                    />
                    <span>{m.name.split(' ')[0]}</span>
                    <span className="text-[10px] text-slate-400">({m.role})</span>
                    {isSelected && <span className="text-indigo-400 font-bold">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Subtask Checklist */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Checklist ({checklist.filter((c) => c.done).length}/{checklist.length})
              </label>
            </div>
            <div className="space-y-1.5 mb-2">
              {checklist.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-2 px-2.5 py-1.5 bg-slate-950 border border-slate-800/80 rounded-md text-xs group"
                >
                  <label className="flex items-center gap-2 flex-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={item.done}
                      onChange={() => handleToggleChecklistItem(item.id)}
                      className="rounded border-slate-700 text-indigo-600 focus:ring-0 cursor-pointer"
                    />
                    <span
                      className={
                        item.done ? 'line-through text-slate-500' : 'text-slate-200'
                      }
                    >
                      {item.text}
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={() => handleRemoveChecklistItem(item.id)}
                    className="text-slate-600 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add acceptance check (e.g. Unit tests passing)..."
                value={newChecklistText}
                onChange={(e) => setNewChecklistText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddChecklistItem();
                  }
                }}
                className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={handleAddChecklistItem}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors cursor-pointer"
              >
                + Add Check
              </button>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <div>
              {isEditing && onDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(task.id)}
                  className="text-xs text-rose-400 hover:text-rose-300 py-1.5 px-2.5 rounded hover:bg-rose-950/30 transition-colors cursor-pointer"
                >
                  Delete Task
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
                {isEditing ? 'Save Changes' : 'Create Task'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
