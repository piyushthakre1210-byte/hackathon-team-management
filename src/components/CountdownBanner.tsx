import React, { useState, useEffect } from 'react';
import { HackathonProject, Milestone } from '../types/hackathon';

interface CountdownBannerProps {
  project: HackathonProject;
  milestones: Milestone[];
  onOpenSettings: () => void;
  onQuickAddHours: (hours: number) => void;
}

export const CountdownBanner: React.FC<CountdownBannerProps> = ({
  project,
  milestones,
  onOpenSettings,
  onQuickAddHours,
}) => {
  const [timeLeft, setTimeLeft] = useState<{
    totalMs: number;
    hours: number;
    minutes: number;
    seconds: number;
    isOver: boolean;
  }>({
    totalMs: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isOver: false,
  });

  useEffect(() => {
    const calc = () => {
      const target = new Date(project.targetDeadline).getTime();
      const now = Date.now();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft({ totalMs: 0, hours: 0, minutes: 0, seconds: 0, isOver: true });
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({
        totalMs: diff,
        hours,
        minutes,
        seconds,
        isOver: false,
      });
    };

    calc();
    const interval = setInterval(calc, 1000);
    return () => clearInterval(interval);
  }, [project.targetDeadline]);

  // Current milestone
  const nextMilestone = milestones.find((m) => !m.completed) || milestones[milestones.length - 1];

  const pad = (n: number) => String(n).padStart(2, '0');

  // Urgency color
  const hoursLeft = timeLeft.hours;
  const isUrgent = hoursLeft < 4 && !timeLeft.isOver;
  const isWarning = hoursLeft >= 4 && hoursLeft < 12 && !timeLeft.isOver;

  return (
    <div className="bg-slate-900 border-b border-slate-800/80 px-6 py-3.5">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Left: Hackathon Identity & Milestone Phase */}
        <div className="flex items-center gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="font-semibold text-slate-200">{project.eventName}</span>
              <span aria-hidden="true">·</span>
              <span className="truncate max-w-[260px]">{project.targetTrack}</span>
            </div>
            <h1 className="text-base font-bold text-white flex items-center gap-2 mt-0.5">
              <span>{project.name}</span>
              <span className="text-xs font-normal text-slate-400 font-sans hidden sm:inline">
                — {project.tagline}
              </span>
            </h1>
          </div>

          {nextMilestone && (
            <div className="hidden xl:flex items-center gap-2 px-3 py-1 bg-slate-950/70 border border-slate-800 rounded-md text-xs">
              <span className="text-slate-400">Active Phase:</span>
              <span className="font-medium text-indigo-300">
                {nextMilestone.phaseNumber}. {nextMilestone.title}
              </span>
            </div>
          )}
        </div>

        {/* Right: Real-time countdown & Quick Adjusters */}
        <div className="flex items-center gap-3 sm:gap-5 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider text-slate-400 font-medium">
              Code Freeze In
            </span>

            {/* Countdown digits in tabular monospace */}
            <div
              className={`flex items-center gap-1 font-mono text-sm sm:text-base font-bold px-3 py-1 rounded-md border tabular-nums ${
                timeLeft.isOver
                  ? 'bg-rose-950/40 border-rose-800 text-rose-300'
                  : isUrgent
                  ? 'bg-rose-950/30 border-rose-800/80 text-rose-400'
                  : isWarning
                  ? 'bg-amber-950/30 border-amber-800/70 text-amber-300'
                  : 'bg-slate-950 border-slate-800 text-indigo-300'
              }`}
            >
              {timeLeft.isOver ? (
                <span>SUBMISSION CLOSED</span>
              ) : (
                <>
                  <span className="w-8 text-center">{pad(timeLeft.hours)}h</span>
                  <span className="text-slate-600">:</span>
                  <span className="w-8 text-center">{pad(timeLeft.minutes)}m</span>
                  <span className="text-slate-600">:</span>
                  <span className="w-8 text-center">{pad(timeLeft.seconds)}s</span>
                </>
              )}
            </div>
          </div>

          {/* Quick controls */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onQuickAddHours(2)}
              title="Add 2 hours for testing sprint"
              className="px-2 py-1 text-xs text-slate-400 hover:text-slate-200 bg-slate-800/60 hover:bg-slate-800 rounded border border-slate-700/60 transition-colors cursor-pointer"
            >
              +2h
            </button>
            <button
              onClick={() => onQuickAddHours(-1)}
              title="Minus 1 hour for rush drill"
              className="px-2 py-1 text-xs text-slate-400 hover:text-slate-200 bg-slate-800/60 hover:bg-slate-800 rounded border border-slate-700/60 transition-colors cursor-pointer"
            >
              -1h
            </button>
            <button
              onClick={onOpenSettings}
              className="px-2.5 py-1 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700/80 rounded border border-slate-700 transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>⚙️</span>
              <span>Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
