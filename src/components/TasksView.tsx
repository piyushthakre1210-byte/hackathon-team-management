import React, { useState, useMemo } from 'react';
import { Member, Task, TaskPriority, TaskStatus, TaskTag } from '../types/hackathon';

interface TasksViewProps {
  tasks: Task[];
  members: Member[];
  onOpenNewTask: () => void;
  onEditTask: (task: Task) => void;
  onUpdateTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
  onDeleteTask: (taskId: string) => void;
}

const STATUS_COLUMNS: { status: TaskStatus; label: string; desc: string }[] = [
  { status: 'Todo', label: 'Backlog / Todo', desc: 'Queued for current sprint' },
  { status: 'In Progress', label: 'In Progress', desc: 'Active implementation' },
  { status: 'Review', label: 'Code Review & QA', desc: 'PR open or verification' },
  { status: 'Done', label: 'Completed', desc: 'Shipped & tested' },
];

export const TasksView: React.FC<TasksViewProps> = ({
  tasks,
  members,
  onOpenNewTask,
  onEditTask,
  onUpdateTaskStatus,
  onDeleteTask,
}) => {
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [tagFilter, setTagFilter] = useState<string>('All');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('All');

  // Drag and drop state
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (statusFilter !== 'All' && t.status !== statusFilter) return false;
      if (priorityFilter !== 'All' && t.priority !== priorityFilter) return false;
      if (tagFilter !== 'All' && t.tag !== tagFilter) return false;
      if (assigneeFilter !== 'All' && !t.assignees.includes(assigneeFilter)) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchTitle = t.title.toLowerCase().includes(q);
        const matchDesc = t.desc.toLowerCase().includes(q);
        const matchChecklist = t.checklist.some((c) => c.text.toLowerCase().includes(q));
        if (!matchTitle && !matchDesc && !matchChecklist) return false;
      }
      return true;
    });
  }, [tasks, statusFilter, priorityFilter, tagFilter, assigneeFilter, search]);

  const memberMap = useMemo(() => {
    const map = new Map<string, Member>();
    members.forEach((m) => map.set(m.id, m));
    return map;
  }, [members]);

  // Priority color
  const getPriorityStyle = (priority: TaskPriority) => {
    switch (priority) {
      case 'Critical':
        return 'text-rose-400 font-semibold';
      case 'High':
        return 'text-amber-400 font-medium';
      case 'Medium':
        return 'text-sky-400';
      case 'Low':
        return 'text-slate-400';
    }
  };

  const getTagStyle = (tag: TaskTag) => {
    switch (tag) {
      case 'Frontend':
        return 'text-indigo-400';
      case 'Backend':
        return 'text-emerald-400';
      case 'AI / Model':
        return 'text-violet-400';
      case 'UI / UX':
        return 'text-pink-400';
      case 'Infra':
        return 'text-amber-400';
      case 'Pitch & Demo':
        return 'text-rose-400';
      case 'Documentation':
        return 'text-cyan-400';
    }
  };

  const formatDeadline = (isoString: string) => {
    if (!isoString) return 'No deadline';
    const d = new Date(isoString);
    const now = Date.now();
    const diffHours = (d.getTime() - now) / 3600000;

    if (diffHours < 0) {
      return (
        <span className="text-rose-400 font-medium">
          {Math.abs(Math.round(diffHours))}h overdue
        </span>
      );
    }
    if (diffHours < 3) {
      return (
        <span className="text-amber-400 font-medium">
          Due in {Math.round(diffHours * 60)}m
        </span>
      );
    }
    if (diffHours < 24) {
      return <span className="text-slate-300">Due in {Math.round(diffHours)}h</span>;
    }
    return (
      <span className="text-slate-400">
        {d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
      </span>
    );
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (taskId) {
      onUpdateTaskStatus(taskId, targetStatus);
    }
    setDraggedTaskId(null);
  };

  const doneCount = tasks.filter((t) => t.status === 'Done').length;
  const completionPct = tasks.length > 0 ? Math.round((doneCount / tasks.length) * 100) : 0;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top action & filter bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Sprint Tasks</h2>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
            <span>{tasks.length} total deliverables</span>
            <span aria-hidden="true">·</span>
            <span className="text-indigo-400 font-semibold">{doneCount} completed ({completionPct}%)</span>
            <span aria-hidden="true">·</span>
            <span>{filteredTasks.length} matching filter</span>
          </div>
        </div>

        {/* View toggles & New Task button */}
        <div className="flex items-center gap-3">
          {/* Segmented control for Board / List */}
          <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg">
            <button
              onClick={() => setViewMode('board')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                viewMode === 'board'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Kanban Board
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              List View
            </button>
          </div>

          <button
            onClick={onOpenNewTask}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors cursor-pointer shadow-sm flex items-center gap-1.5"
          >
            <span>+</span>
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Multi-Dimensional Filters */}
      <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-xl space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search deliverables, PRs, checklist items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Filter dropdowns */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="All">All Statuses</option>
              {STATUS_COLUMNS.map((col) => (
                <option key={col.status} value={col.status}>
                  {col.label}
                </option>
              ))}
            </select>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="All">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            {/* Tag Filter */}
            <select
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="All">All Tracks</option>
              <option value="Frontend">Frontend</option>
              <option value="Backend">Backend</option>
              <option value="AI / Model">AI / Model</option>
              <option value="UI / UX">UI / UX</option>
              <option value="Infra">Infra</option>
              <option value="Pitch & Demo">Pitch & Demo</option>
              <option value="Documentation">Documentation</option>
            </select>

            {/* Assignee Filter */}
            <select
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="All">All Teammates</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.role})
                </option>
              ))}
            </select>

            {(search ||
              statusFilter !== 'All' ||
              priorityFilter !== 'All' ||
              tagFilter !== 'All' ||
              assigneeFilter !== 'All') && (
              <button
                onClick={() => {
                  setSearch('');
                  setStatusFilter('All');
                  setPriorityFilter('All');
                  setTagFilter('All');
                  setAssigneeFilter('All');
                }}
                className="text-xs text-slate-400 hover:text-white px-2 py-1 underline cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Board View */}
      {viewMode === 'board' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
          {STATUS_COLUMNS.map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.status);
            return (
              <div
                key={col.status}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, col.status)}
                className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-3 flex flex-col min-h-[460px] transition-colors"
              >
                {/* Column header */}
                <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      {col.label}
                    </span>
                    <span className="text-xs font-mono tabular-nums text-slate-400 px-1.5 py-0.5 rounded bg-slate-800">
                      {colTasks.length}
                    </span>
                  </div>
                  <button
                    onClick={onOpenNewTask}
                    title="Add task in this column"
                    className="text-slate-500 hover:text-slate-200 text-sm cursor-pointer p-0.5"
                  >
                    +
                  </button>
                </div>

                {/* Cards Container */}
                <div className="space-y-2.5 flex-1 overflow-y-auto">
                  {colTasks.map((task) => {
                    const checkedCount = task.checklist.filter((c) => c.done).length;
                    const totalCheck = task.checklist.length;

                    return (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        onClick={() => onEditTask(task)}
                        className="p-3.5 bg-slate-950/80 border border-slate-800/80 rounded-lg hover:border-slate-700 transition-all cursor-pointer group shadow-sm"
                      >
                        {/* Tag and Priority */}
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className={`font-medium ${getTagStyle(task.tag)}`}>
                            {task.tag}
                          </span>
                          <span className={getPriorityStyle(task.priority)}>
                            {task.priority}
                          </span>
                        </div>

                        {/* Title */}
                        <h4 className="text-sm font-semibold text-slate-100 group-hover:text-indigo-300 transition-colors leading-snug">
                          {task.title}
                        </h4>

                        {/* Description snippet */}
                        {task.desc && (
                          <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                            {task.desc}
                          </p>
                        )}

                        {/* Checklist count if any */}
                        {totalCheck > 0 && (
                          <div className="mt-2.5 flex items-center gap-2 text-[11px] text-slate-400">
                            <span className="font-mono tabular-nums">
                              ☑ {checkedCount}/{totalCheck} checks
                            </span>
                            <div className="flex-1 bg-slate-800 h-1 rounded-full overflow-hidden">
                              <div
                                className="bg-indigo-500 h-full transition-all"
                                style={{
                                  width: `${(checkedCount / totalCheck) * 100}%`,
                                }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Footer: Assignees & Deadline */}
                        <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-xs">
                          {/* Assignee circles */}
                          <div className="flex items-center -space-x-1.5">
                            {task.assignees.map((aid) => {
                              const m = memberMap.get(aid);
                              if (!m) return null;
                              return (
                                <div
                                  key={aid}
                                  title={`${m.name} (${m.role})`}
                                  className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white ring-2 ring-slate-950"
                                  style={{ backgroundColor: m.avatarColor }}
                                >
                                  {m.name.charAt(0)}
                                </div>
                              );
                            })}
                          </div>

                          {/* Deadline */}
                          <div className="text-[11px]">
                            {formatDeadline(task.deadline)}
                          </div>
                        </div>

                        {/* Quick status mover bar */}
                        <div
                          className="mt-2 pt-2 border-t border-slate-900 flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {STATUS_COLUMNS.filter((c) => c.status !== task.status).map((c) => (
                            <button
                              key={c.status}
                              onClick={() => onUpdateTaskStatus(task.id, c.status)}
                              className="text-[10px] px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors cursor-pointer"
                            >
                              → {c.status}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}

                  {colTasks.length === 0 && (
                    <div className="h-28 flex flex-col items-center justify-center border border-dashed border-slate-800 rounded-lg text-slate-500 text-xs text-center p-3">
                      <span>No tasks in {col.status.toLowerCase()}</span>
                      <button
                        onClick={onOpenNewTask}
                        className="text-indigo-400 hover:underline mt-1 cursor-pointer"
                      >
                        + Create deliverable
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Dense List View */
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold">
                  <th className="py-3 px-4">Deliverable</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Track</th>
                  <th className="py-3 px-3">Priority</th>
                  <th className="py-3 px-3">Assignees</th>
                  <th className="py-3 px-3 text-right">Deadline</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredTasks.map((task) => (
                  <tr
                    key={task.id}
                    onClick={() => onEditTask(task)}
                    className="hover:bg-slate-850/50 cursor-pointer transition-colors group"
                  >
                    <td className="py-3 px-4 max-w-sm">
                      <div className="font-semibold text-slate-100 group-hover:text-indigo-300 transition-colors">
                        {task.title}
                      </div>
                      {task.desc && (
                        <div className="text-slate-400 truncate max-w-xs mt-0.5">
                          {task.desc}
                        </div>
                      )}
                      {task.checklist.length > 0 && (
                        <div className="text-[11px] text-slate-500 mt-1 font-mono">
                          {task.checklist.filter((c) => c.done).length}/{task.checklist.length} checklist
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={task.status}
                        onChange={(e) =>
                          onUpdateTaskStatus(task.id, e.target.value as TaskStatus)
                        }
                        className="px-2 py-1 bg-slate-950 border border-slate-800 rounded text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                      >
                        {STATUS_COLUMNS.map((col) => (
                          <option key={col.status} value={col.status}>
                            {col.status}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`font-medium ${getTagStyle(task.tag)}`}>
                        {task.tag}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={getPriorityStyle(task.priority)}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center -space-x-1">
                        {task.assignees.map((aid) => {
                          const m = memberMap.get(aid);
                          if (!m) return null;
                          return (
                            <div
                              key={aid}
                              title={`${m.name} (${m.role})`}
                              className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white ring-1 ring-slate-950"
                              style={{ backgroundColor: m.avatarColor }}
                            >
                              {m.name.charAt(0)}
                            </div>
                          );
                        })}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right tabular-nums">
                      {formatDeadline(task.deadline)}
                    </td>
                    <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onDeleteTask(task.id)}
                        className="text-slate-500 hover:text-rose-400 p-1 rounded transition-colors cursor-pointer"
                        title="Delete task"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredTasks.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      No deliverables match current filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
