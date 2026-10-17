import React, { useState, useEffect } from 'react';
import { HackathonProject, Member } from '../types/hackathon';

interface PitchRoomViewProps {
  project: HackathonProject;
  members: Member[];
}

const RUBRIC_CRITERIA = [
  {
    key: 'tech',
    title: 'Technical Execution',
    weight: '30%',
    prompt: 'End-to-end working system with non-trivial architecture, APIs, or ML pipeline.',
  },
  {
    key: 'novelty',
    title: 'Innovation & Originality',
    weight: '25%',
    prompt: 'Distinctive take on the problem statement; avoids generic commodity patterns.',
  },
  {
    key: 'ux',
    title: 'Design & User Polish',
    weight: '25%',
    prompt: 'Clean visual hierarchy, responsive layout, fluid interaction feedback.',
  },
  {
    key: 'impact',
    title: 'Viability & Track Alignment',
    weight: '20%',
    prompt: 'Directly addresses the hackathon sponsor bounty and demonstrates clear value.',
  },
];

export const PitchRoomView: React.FC<PitchRoomViewProps> = ({
  project,
  members,
}) => {
  const [pitchDuration, setPitchDuration] = useState<number>(180); // 180s = 3 min
  const [secondsRemaining, setSecondsRemaining] = useState<number>(180);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [speakerNotes, setSpeakerNotes] = useState<string>(
    `1. Hook (0-45s): "Emergency departments lose $42B yearly because manual triage misses subtle ECG arrhythmia spikes..."\n2. Demo (45-120s): "Watch our live 60fps canvas ingest 250Hz patient signals. Within 200ms of an abnormal waveform, the model alerts the triage nurse."\n3. Tech Moat (120-155s): "Powered by ONNX edge models and low-latency Go WebSockets running on Google Cloud Run."\n4. Close (155-180s): "PulseAI saves lives by replacing clipboard lag with ambient intelligence. Thank you!"`
  );
  const [rubricScores, setRubricScores] = useState<Record<string, number>>({
    tech: 9,
    novelty: 9,
    ux: 10,
    impact: 9,
  });

  useEffect(() => {
    let interval: any = null;
    if (isRunning && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => prev - 1);
      }, 1000);
    } else if (secondsRemaining === 0) {
      setIsRunning(false);
    }
    return () => clearInterval(interval);
  }, [isRunning, secondsRemaining]);

  const handleSetDuration = (duration: number) => {
    setIsRunning(false);
    setPitchDuration(duration);
    setSecondsRemaining(duration);
  };

  const handleReset = () => {
    setIsRunning(false);
    setSecondsRemaining(pitchDuration);
  };

  const handleAdd30s = () => {
    setSecondsRemaining((prev) => prev + 30);
  };

  const elapsed = pitchDuration - secondsRemaining;
  const progressPct = pitchDuration > 0 ? (elapsed / pitchDuration) * 100 : 0;

  // Determine presentation cue stage
  const getCueStage = () => {
    if (pitchDuration === 180) {
      if (elapsed <= 45) {
        return {
          phase: 'Phase 1: The Problem & Hook (0:00 - 0:45)',
          tip: 'State the burning problem and measurable cost in 2 crisp sentences. Do not bury the lede!',
          color: 'text-sky-300',
        };
      }
      if (elapsed <= 120) {
        return {
          phase: 'Phase 2: Live Product Walkthrough (0:45 - 2:00)',
          tip: 'Show the working interface! Walk through the primary user flow. Let the demo speak for itself.',
          color: 'text-emerald-300',
        };
      }
      if (elapsed <= 155) {
        return {
          phase: 'Phase 3: Technical Architecture & Moat (2:00 - 2:35)',
          tip: 'Explain how you built it, key APIs used, models trained, and how it scales reliably.',
          color: 'text-indigo-300',
        };
      }
      return {
        phase: 'Phase 4: Market Impact, Ask & Conclusion (2:35 - 3:00)',
        tip: 'Wrap up with market upside, team credentials, and invite judges to test the live demo link!',
        color: 'text-amber-300',
      };
    }
    return {
      phase: `Presentation Time Elapsed: ${Math.floor(elapsed / 60)}m ${elapsed % 60}s`,
      tip: 'Keep pacing steady and ensure sufficient time for live software demonstration.',
      color: 'text-indigo-300',
    };
  };

  const cue = getCueStage();

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const isTimeUp = secondsRemaining === 0;
  const isFinalSprint = secondsRemaining < 30 && secondsRemaining > 0;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Hackathon Pitch Rehearsal Room
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Practice strict 3-minute & 5-minute timed demo presentations with live stage cues and judging rubric.
          </p>
        </div>

        {/* Pitch Duration Switcher */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSetDuration(180)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              pitchDuration === 180
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            3-Min Standard Pitch
          </button>
          <button
            onClick={() => handleSetDuration(300)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              pitchDuration === 300
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            5-Min Extended Demo
          </button>
        </div>
      </div>

      {/* Main Pitch Timer Display */}
      <div className="p-8 bg-slate-900/70 border border-slate-800/80 rounded-2xl flex flex-col items-center justify-center text-center relative overflow-hidden shadow-2xl">
        {/* Background glow when time running out */}
        {isFinalSprint && (
          <div className="absolute inset-0 bg-rose-500/10 animate-pulse pointer-events-none" />
        )}

        <div className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-2">
          {project.name} · {pitchDuration / 60}-Minute Rehearsal
        </div>

        {/* Large Monospace Timer */}
        <div
          className={`font-mono tabular-nums text-6xl sm:text-8xl font-black tracking-tight my-2 ${
            isTimeUp
              ? 'text-rose-500'
              : isFinalSprint
              ? 'text-rose-400'
              : 'text-white'
          }`}
        >
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>

        {/* Progress Bar */}
        <div className="w-full max-w-xl bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800 my-4">
          <div
            className={`h-full transition-all duration-300 ${
              isFinalSprint ? 'bg-rose-500' : 'bg-indigo-500'
            }`}
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* Dynamic Cue Stage */}
        <div className="max-w-xl mx-auto my-2 p-3 bg-slate-950/80 border border-slate-800/80 rounded-xl text-xs">
          <div className={`font-bold ${cue.color} mb-1 flex items-center justify-center gap-1.5`}>
            <span>⚡</span>
            <span>{cue.phase}</span>
          </div>
          <p className="text-slate-300 leading-relaxed">{cue.tip}</p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 mt-4">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm shadow-md transition-transform active:scale-95 cursor-pointer ${
              isRunning
                ? 'bg-amber-600 hover:bg-amber-500 text-white'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white'
            }`}
          >
            {isRunning ? '⏸ Pause Timer' : '▶ Start Pitch'}
          </button>

          <button
            onClick={handleReset}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Reset
          </button>

          <button
            onClick={handleAdd30s}
            className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer font-mono"
          >
            +30s
          </button>
        </div>
      </div>

      {/* Two Columns: Speaker Notes & Judging Rubric Audit */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Speaker Notes */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Speaker Cue Card & Notes
            </h3>
            <span className="text-xs text-slate-500">Live rehearsal teleprompter</span>
          </div>

          <textarea
            rows={8}
            value={speakerNotes}
            onChange={(e) => setSpeakerNotes(e.target.value)}
            placeholder="Type your speaking bullet points, transition cues, or judge answers..."
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-sans text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed resize-y"
          />
        </div>

        {/* Judging Rubric Audit */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Mock Judging Rubric Checklist
            </h3>
            <span className="text-xs font-mono text-indigo-400 font-bold">
              Total Score:{' '}
              {Object.values(rubricScores).reduce((a, b) => a + b, 0)} / 40
            </span>
          </div>

          <div className="space-y-2.5">
            {RUBRIC_CRITERIA.map((criterion) => (
              <div
                key={criterion.key}
                className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">{criterion.title}</span>
                    <span className="text-[10px] text-slate-500">({criterion.weight})</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {[7, 8, 9, 10].map((score) => (
                      <button
                        key={score}
                        onClick={() =>
                          setRubricScores({ ...rubricScores, [criterion.key]: score })
                        }
                        className={`w-6 h-6 rounded text-[11px] font-mono font-bold transition-colors cursor-pointer ${
                          rubricScores[criterion.key] === score
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-900 text-slate-400 hover:text-white'
                        }`}
                      >
                        {score}
                      </button>
                    ))}
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {criterion.prompt}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
