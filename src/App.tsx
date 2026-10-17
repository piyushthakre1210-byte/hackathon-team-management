import React, { useState, useEffect } from 'react';
import {
  HackathonProject,
  Member,
  MemberStatus,
  Milestone,
  SubmissionChecklist,
  Task,
  TaskStatus,
} from './types/hackathon';
import {
  INITIAL_CHECKLIST,
  INITIAL_MEMBERS,
  INITIAL_MILESTONES,
  INITIAL_PROJECT,
  getInitialTasks,
} from './data/seedData';
import { Header, NavTab } from './components/Header';
import { CountdownBanner } from './components/CountdownBanner';
import { DashboardView } from './components/DashboardView';
import { TasksView } from './components/TasksView';
import { TeamView } from './components/TeamView';
import { ChatView } from './components/ChatView';
import { MilestonesView } from './components/MilestonesView';
import { SubmissionView } from './components/SubmissionView';
import { PitchRoomView } from './components/PitchRoomView';
import { TaskModal } from './components/TaskModal';
import { MemberModal } from './components/MemberModal';
import { ProjectSettingsModal } from './components/ProjectSettingsModal';

// Local storage key helpers
const STORAGE_PREFIX = 'hackhub_v2_';
const loadFromStorage = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    console.error(`Failed to load ${key} from storage:`, e);
    return fallback;
  }
};

const saveToStorage = <T,>(key: string, val: T): void => {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(val));
  } catch (e) {
    console.error(`Failed to save ${key} to storage:`, e);
  }
};

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');

  // Application Data
  const [project, setProject] = useState<HackathonProject>(() =>
    loadFromStorage('project', INITIAL_PROJECT)
  );

  const [members, setMembers] = useState<Member[]>(() =>
    loadFromStorage('members', INITIAL_MEMBERS)
  );

  const [tasks, setTasks] = useState<Task[]>(() =>
    loadFromStorage('tasks', getInitialTasks(INITIAL_MEMBERS))
  );

  const [milestones, setMilestones] = useState<Milestone[]>(() =>
    loadFromStorage('milestones', INITIAL_MILESTONES)
  );

  const [checklist, setChecklist] = useState<SubmissionChecklist[]>(() =>
    loadFromStorage('checklist', INITIAL_CHECKLIST)
  );

  // Active logged-in teammate identity
  const [currentUserId, setCurrentUserId] = useState<string>(() =>
    loadFromStorage('active_user_id', INITIAL_MEMBERS[0]?.id || 'm-1')
  );

  // Modals state
  const [editingTask, setEditingTask] = useState<Task | null | 'new'>(null);
  const [editingMember, setEditingMember] = useState<Member | null | 'new'>(null);
  const [showSettings, setShowSettings] = useState(false);

  // Persistence effects
  useEffect(() => {
    saveToStorage('project', project);
  }, [project]);

  useEffect(() => {
    saveToStorage('members', members);
  }, [members]);

  useEffect(() => {
    saveToStorage('tasks', tasks);
  }, [tasks]);

  useEffect(() => {
    saveToStorage('milestones', milestones);
  }, [milestones]);

  useEffect(() => {
    saveToStorage('checklist', checklist);
  }, [checklist]);

  useEffect(() => {
    saveToStorage('active_user_id', currentUserId);
  }, [currentUserId]);

  // Tasks handlers
  const handleSaveTask = (taskToSave: Task) => {
    setTasks((prev) => {
      const exists = prev.some((t) => t.id === taskToSave.id);
      if (exists) {
        return prev.map((t) => (t.id === taskToSave.id ? taskToSave : t));
      }
      return [taskToSave, ...prev];
    });
    setEditingTask(null);
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    setEditingTask(null);
  };

  const handleUpdateTaskStatus = (taskId: string, newStatus: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
  };

  // Member handlers
  const handleSaveMember = (memberToSave: Member) => {
    setMembers((prev) => {
      const exists = prev.some((m) => m.id === memberToSave.id);
      if (exists) {
        return prev.map((m) => (m.id === memberToSave.id ? memberToSave : m));
      }
      return [...prev, memberToSave];
    });
    setEditingMember(null);
  };

  const handleDeleteMember = (memberId: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== memberId));
    // Remove assignee from tasks
    setTasks((prev) =>
      prev.map((t) => ({
        ...t,
        assignees: t.assignees.filter((a) => a !== memberId),
      }))
    );
    if (currentUserId === memberId) {
      setCurrentUserId(members.find((m) => m.id !== memberId)?.id || '');
    }
    setEditingMember(null);
  };

  const handleUpdateMemberStatus = (memberId: string, newStatus: MemberStatus) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, status: newStatus } : m))
    );
  };

  // Milestones handlers
  const handleToggleMilestone = (id: string) => {
    setMilestones((prev) =>
      prev.map((m) => (m.id === id ? { ...m, completed: !m.completed } : m))
    );
  };

  const handleAddMilestone = (m: Milestone) => {
    setMilestones((prev) => [...prev, m]);
  };

  const handleUpdateMilestoneNotes = (id: string, notes: string) => {
    setMilestones((prev) =>
      prev.map((m) => (m.id === id ? { ...m, notes } : m))
    );
  };

  const handleDeleteMilestone = (id: string) => {
    setMilestones((prev) => prev.filter((m) => m.id !== id));
  };

  // Checklist handlers
  const handleToggleChecklist = (id: string) => {
    setChecklist((prev) =>
      prev.map((c) => (c.id === id ? { ...c, done: !c.done } : c))
    );
  };

  // Deadline & Time controls
  const handleQuickAddHours = (hours: number) => {
    const cur = new Date(project.targetDeadline).getTime();
    const updated = new Date(cur + hours * 3600000).toISOString();
    setProject({ ...project, targetDeadline: updated });
  };

  // Data Export & Reset
  const handleExportData = () => {
    const backup = {
      project,
      members,
      tasks,
      milestones,
      checklist,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name.toLowerCase().replace(/\s+/g, '-')}-backup.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleResetAllData = () => {
    if (
      window.confirm(
        'Reset all hackathon tasks, members, and countdown to initial demo state?'
      )
    ) {
      setProject(INITIAL_PROJECT);
      setMembers(INITIAL_MEMBERS);
      setTasks(getInitialTasks(INITIAL_MEMBERS));
      setMilestones(INITIAL_MILESTONES);
      setChecklist(INITIAL_CHECKLIST);
      setCurrentUserId(INITIAL_MEMBERS[0].id);
      setShowSettings(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Bar following Top Bar Contract */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onNewTaskClick={() => setEditingTask('new')}
      />

      {/* Real-time Sprint Countdown & Milestone Banner */}
      <CountdownBanner
        project={project}
        milestones={milestones}
        onOpenSettings={() => setShowSettings(true)}
        onQuickAddHours={handleQuickAddHours}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 overflow-y-auto">
        {activeTab === 'dashboard' && (
          <DashboardView
            project={project}
            members={members}
            tasks={tasks}
            milestones={milestones}
            currentUserId={currentUserId}
            onNavigate={setActiveTab}
            onOpenNewTask={() => setEditingTask('new')}
            onEditTask={(t) => setEditingTask(t)}
            onEditMember={(m) => setEditingMember(m)}
          />
        )}

        {activeTab === 'tasks' && (
          <TasksView
            tasks={tasks}
            members={members}
            onOpenNewTask={() => setEditingTask('new')}
            onEditTask={(t) => setEditingTask(t)}
            onUpdateTaskStatus={handleUpdateTaskStatus}
            onDeleteTask={handleDeleteTask}
          />
        )}

        {activeTab === 'team' && (
          <TeamView
            members={members}
            tasks={tasks}
            currentUserId={currentUserId}
            onSelectActiveUser={setCurrentUserId}
            onOpenAddMember={() => setEditingMember('new')}
            onEditMember={(m) => setEditingMember(m)}
            onUpdateMemberStatus={handleUpdateMemberStatus}
          />
        )}

        {activeTab === 'chat' && (
          <ChatView
            members={members}
            currentUserId={currentUserId}
            onSelectActiveUser={setCurrentUserId}
          />
        )}

        {activeTab === 'milestones' && (
          <MilestonesView
            milestones={milestones}
            tasks={tasks}
            onToggleMilestone={handleToggleMilestone}
            onAddMilestone={handleAddMilestone}
            onUpdateMilestoneNotes={handleUpdateMilestoneNotes}
            onDeleteMilestone={handleDeleteMilestone}
          />
        )}

        {activeTab === 'submission' && (
          <SubmissionView
            project={project}
            checklist={checklist}
            onToggleChecklist={handleToggleChecklist}
            onUpdateProject={setProject}
          />
        )}

        {activeTab === 'pitch' && (
          <PitchRoomView project={project} members={members} />
        )}
      </main>

      {/* Modals */}
      {editingTask && (
        <TaskModal
          task={editingTask === 'new' ? null : editingTask}
          members={members}
          onClose={() => setEditingTask(null)}
          onSave={handleSaveTask}
          onDelete={handleDeleteTask}
        />
      )}

      {editingMember && (
        <MemberModal
          member={editingMember === 'new' ? null : editingMember}
          onClose={() => setEditingMember(null)}
          onSave={handleSaveMember}
          onDelete={handleDeleteMember}
        />
      )}

      {showSettings && (
        <ProjectSettingsModal
          project={project}
          onClose={() => setShowSettings(false)}
          onSave={setProject}
          onResetAllData={handleResetAllData}
          onExportData={handleExportData}
        />
      )}
    </div>
  );
}
