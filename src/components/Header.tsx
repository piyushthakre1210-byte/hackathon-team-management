import React from 'react';

export type NavTab =
  | 'dashboard'
  | 'tasks'
  | 'team'
  | 'chat'
  | 'milestones'
  | 'submission'
  | 'pitch';

interface HeaderProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onNewTaskClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onNewTaskClick,
}) => {
  const tabs: { id: NavTab; label: string }[] = [
    { id: 'dashboard', label: 'Cockpit' },
    { id: 'tasks', label: 'Sprint Tasks' },
    { id: 'team', label: 'Team & Skills' },
    { id: 'chat', label: 'Team Chat' },
    { id: 'milestones', label: 'Milestones' },
    { id: 'submission', label: 'Submission Hub' },
    { id: 'pitch', label: 'Pitch Room' },
  ];

  return (
    <header className="flex items-center justify-between gap-8 px-6 py-3.5 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30">
      {/* Zone 1: Single text element wordmark */}
      <div 
        onClick={() => onTabChange('dashboard')} 
        className="text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-2"
      >
        <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500 inline-block"></span>
        <span>HackHub</span>
      </div>

      {/* Zone 2: 4-6 concise single-line text links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer relative ${
                isActive
                  ? 'text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-full" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onNewTaskClick}
          className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
        >
          <span>+</span>
          <span>New Task</span>
        </button>
      </div>
    </header>
  );
};
