import React, { useState } from 'react';
import { HackathonProject, SubmissionChecklist } from '../types/hackathon';

interface SubmissionViewProps {
  project: HackathonProject;
  checklist: SubmissionChecklist[];
  onToggleChecklist: (id: string) => void;
  onUpdateProject: (project: HackathonProject) => void;
}

export const SubmissionView: React.FC<SubmissionViewProps> = ({
  project,
  checklist,
  onToggleChecklist,
  onUpdateProject,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const completedCount = checklist.filter((c) => c.done).length;
  const readinessPct = checklist.length > 0 ? Math.round((completedCount / checklist.length) * 100) : 0;

  const filteredChecklist = checklist.filter((c) => {
    if (activeCategory !== 'All' && c.category !== activeCategory) return false;
    return true;
  });

  const generateDevpostMarkdown = () => {
    return `# ${project.name}
> ${project.tagline}

**Event:** ${project.eventName}  
**Track Target:** ${project.targetTrack}  
**Live Demo:** [${project.links.demo}](${project.links.demo})  
**GitHub Repository:** [${project.links.repo}](${project.links.repo})  
**Pitch Slides:** [${project.links.slides}](${project.links.slides})  
**Demo Video:** [${project.links.video}](${project.links.video})

---

### Inspiration & Problem
${project.pitchDraft.problem}

### What It Does & Solution
${project.pitchDraft.solution}

### How We Built It (Tech Stack)
${project.pitchDraft.techStack}

### Challenges We Ran Into
${project.pitchDraft.challenges}

### Accomplishments That We're Proud Of
${project.pitchDraft.accomplishments}
`;
  };

  const handleCopyMarkdown = () => {
    const md = generateDevpostMarkdown();
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLinkChange = (key: keyof typeof project.links, val: string) => {
    onUpdateProject({
      ...project,
      links: {
        ...project.links,
        [key]: val,
      },
    });
  };

  const handlePitchChange = (key: keyof typeof project.pitchDraft, val: string) => {
    onUpdateProject({
      ...project,
      pitchDraft: {
        ...project.pitchDraft,
        [key]: val,
      },
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Devpost & Hackathon Submission Hub
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
            <span>Readiness Score:</span>
            <span className="text-indigo-400 font-bold font-mono">{readinessPct}%</span>
            <span aria-hidden="true">·</span>
            <span>{completedCount} of {checklist.length} checklist gates passed</span>
          </div>
        </div>

        <button
          onClick={handleCopyMarkdown}
          className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors cursor-pointer shadow-sm flex items-center gap-1.5 self-start sm:self-auto"
        >
          <span>{copied ? '✓ Copied Markdown!' : '📋 Copy Devpost Markdown'}</span>
        </button>
      </div>

      {/* Progress & Category Filter */}
      <div className="p-5 bg-slate-900/60 border border-slate-800/80 rounded-xl space-y-4">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-200">
            Pre-Submission Audit Checklist
          </span>
          <span className="font-mono tabular-nums text-indigo-400 font-bold">
            {readinessPct}% Ready
          </span>
        </div>
        <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
          <div
            className="bg-indigo-500 h-full transition-all duration-300"
            style={{ width: `${readinessPct}%` }}
          />
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 pt-1">
          {['All', 'Code', 'Documentation', 'Deployment', 'Media'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                activeCategory === cat
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Checklist items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredChecklist.map((item) => (
          <div
            key={item.id}
            onClick={() => onToggleChecklist(item.id)}
            className={`p-3.5 rounded-xl border transition-colors flex items-start gap-3 cursor-pointer ${
              item.done
                ? 'bg-slate-900/50 border-emerald-900/60'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <input
              type="checkbox"
              checked={item.done}
              onChange={() => onToggleChecklist(item.id)}
              className="mt-0.5 rounded border-slate-700 text-indigo-600 focus:ring-0 cursor-pointer"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <h4
                  className={`text-xs font-semibold ${
                    item.done ? 'text-slate-200 line-through' : 'text-white'
                  }`}
                >
                  {item.label}
                </h4>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider shrink-0 font-medium">
                  {item.category}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                {item.hint}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Two columns: Deliverables Links & Devpost Pitch Story */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        {/* Deliverables URLs */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Project Deliverables & URLs
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              These URLs are automatically formatted into your submission summary.
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                GitHub Repository URL
              </label>
              <input
                type="url"
                value={project.links.repo}
                onChange={(e) => handleLinkChange('repo', e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Hosted Live Demo URL
              </label>
              <input
                type="url"
                value={project.links.demo}
                onChange={(e) => handleLinkChange('demo', e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Pitch Deck URL (Pitch.com / Google Slides / PDF)
              </label>
              <input
                type="url"
                value={project.links.slides}
                onChange={(e) => handleLinkChange('slides', e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                3-Minute Demo Video (YouTube / Loom)
              </label>
              <input
                type="url"
                value={project.links.video}
                onChange={(e) => handleLinkChange('video', e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Figma Prototype
              </label>
              <input
                type="url"
                value={project.links.figma}
                onChange={(e) => handleLinkChange('figma', e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Pitch Narrative Editor */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Devpost Project Description Story
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Draft answers to standard hackathon judging criteria.
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                The Problem & Inspiration
              </label>
              <textarea
                rows={2}
                value={project.pitchDraft.problem}
                onChange={(e) => handlePitchChange('problem', e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500 resize-y"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                What It Does & Key Solution
              </label>
              <textarea
                rows={2}
                value={project.pitchDraft.solution}
                onChange={(e) => handlePitchChange('solution', e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500 resize-y"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Tech Stack Architecture
              </label>
              <input
                type="text"
                value={project.pitchDraft.techStack}
                onChange={(e) => handlePitchChange('techStack', e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Challenges Overcome
              </label>
              <textarea
                rows={2}
                value={project.pitchDraft.challenges}
                onChange={(e) => handlePitchChange('challenges', e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500 resize-y"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
