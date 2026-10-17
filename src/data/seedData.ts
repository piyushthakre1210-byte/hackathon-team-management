import { HackathonProject, Member, Task, Milestone, SubmissionChecklist } from '../types/hackathon';

// Helper to generate dynamic future timestamp (e.g. 14 hours from now)
export const getInitialDeadline = (): string => {
  const d = new Date();
  d.setHours(d.getHours() + 14);
  d.setMinutes(d.getMinutes() + 45);
  d.setSeconds(0);
  return d.toISOString();
};

export const INITIAL_MEMBERS: Member[] = [
  {
    id: 'm-1',
    name: 'Elena Rostova',
    role: 'Full-Stack',
    bio: 'Systems builder with 4 hackathon wins. Obsessed with high-throughput WebSockets, fluid telemetry visualizations, and crisp component architecture.',
    email: 'elena@hackhub.io',
    handle: '@elena_dev',
    avatarColor: '#6366F1', // Indigo
    status: 'coding',
    skills: ['Frontend Development', 'API Integration', 'TypeScript', 'React', 'WebSockets'],
    joinedAt: new Date(Date.now() - 3600000 * 20).toISOString(),
  },
  {
    id: 'm-2',
    name: 'Marcus Vance',
    role: 'ML / AI',
    bio: 'CS graduate researcher specializing in real-time biosignal classification, PyTorch model quantizations, and ONNX edge inference pipelines.',
    email: 'marcus@hackhub.io',
    handle: '@mvance_ai',
    avatarColor: '#10B981', // Emerald
    status: 'coding',
    skills: ['Machine Learning', 'API Integration', 'Python', 'PyTorch', 'FastAPI'],
    joinedAt: new Date(Date.now() - 3600000 * 20).toISOString(),
  },
  {
    id: 'm-3',
    name: 'Sophia Lin',
    role: 'UI / UX Designer',
    bio: 'Product designer passionate about accessibility, high-contrast dark medical interfaces, and rapid interactive Figma prototypes.',
    email: 'sophia@hackhub.io',
    handle: '@sophialin',
    avatarColor: '#EC4899', // Pink
    status: 'reviewing',
    skills: ['UI/UX Design', 'Frontend Development', 'Figma', 'Wireframing', 'Design Systems'],
    joinedAt: new Date(Date.now() - 3600000 * 19).toISOString(),
  },
  {
    id: 'm-4',
    name: 'Tariq Al-Mansoor',
    role: 'Backend',
    bio: 'Distributed systems engineer focused on sub-millisecond in-memory priority queues, Docker orchestration, and rock-solid failover pipelines.',
    email: 'tariq@hackhub.io',
    handle: '@tariq_ops',
    avatarColor: '#F59E0B', // Amber
    status: 'available',
    skills: ['API Integration', 'Backend Architecture', 'Go', 'PostgreSQL', 'Docker'],
    joinedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
  },
  {
    id: 'm-5',
    name: 'Chloe Dupont',
    role: 'PM / Pitch Lead',
    bio: 'Startup strategist and competitive debater. Bridges technical moats with punchy judge-focused pitch decks and crisp 3-minute stage delivery.',
    email: 'chloe@hackhub.io',
    handle: '@chloedupont',
    avatarColor: '#8B5CF6', // Purple
    status: 'reviewing',
    skills: ['Pitching & Storytelling', 'Product Strategy', 'UI/UX Design', 'User Research'],
    joinedAt: new Date(Date.now() - 3600000 * 16).toISOString(),
  },
];

export const getInitialTasks = (members: Member[]): Task[] => {
  const now = Date.now();
  const formatOffset = (hoursFromNow: number) => {
    const d = new Date(now + hoursFromNow * 3600000);
    return d.toISOString();
  };

  return [
    {
      id: 't-1',
      title: 'Define system architecture & streaming data contracts',
      desc: 'Lock in JSON schema for real-time vitals ingest and WebSocket payload specifications between Go microservice and React UI.',
      priority: 'High',
      status: 'Done',
      tag: 'Infra',
      assignees: [members[3]?.id || 'm-4', members[0]?.id || 'm-1'],
      deadline: formatOffset(-8),
      checklist: [
        { id: 'c-1', text: 'Document schema in shared README', done: true },
        { id: 'c-2', text: 'Verify WebSocket heartbeat packet shape', done: true },
      ],
      prUrl: 'https://github.com/hackhub-team/pulsea-core/pull/1',
      createdAt: formatOffset(-18),
    },
    {
      id: 't-2',
      title: 'Train & export ECG anomaly detection model weights',
      desc: 'Fine-tune 1D convolutional neural network on PhysioNet synthetic arrhythmia stream and export ONNX runtime container.',
      priority: 'Critical',
      status: 'Done',
      tag: 'AI / Model',
      assignees: [members[1]?.id || 'm-2'],
      deadline: formatOffset(-4),
      checklist: [
        { id: 'c-3', text: 'Download training split (10k patient traces)', done: true },
        { id: 'c-4', text: 'Evaluate F1 score against benchmark (target > 0.94)', done: true },
        { id: 'c-5', text: 'Wrap inference engine in FastAPI endpoints', done: true },
      ],
      prUrl: 'https://github.com/hackhub-team/pulsea-core/pull/3',
      createdAt: formatOffset(-16),
    },
    {
      id: 't-3',
      title: 'Build real-time waveform telemetry canvas in React',
      desc: 'High-frequency 60fps ECG canvas visualizer rendering multi-channel systolic spikes with zero frame drops.',
      priority: 'Critical',
      status: 'In Progress',
      tag: 'Frontend',
      assignees: [members[0]?.id || 'm-1', members[2]?.id || 'm-3'],
      deadline: formatOffset(3),
      checklist: [
        { id: 'c-6', text: 'Canvas 2D buffer double-buffering', done: true },
        { id: 'c-7', text: 'Dynamic threshold alert lines & pulse sound', done: false },
        { id: 'c-8', text: 'Simulated playback toggle for demo testing', done: true },
      ],
      prUrl: 'https://github.com/hackhub-team/pulsea-core/pull/7',
      createdAt: formatOffset(-10),
    },
    {
      id: 't-4',
      title: 'Implement patient triage priority queue & alert routing',
      desc: 'Rank emergency severity automatically from ML inference outputs and assign emergency tags.',
      priority: 'High',
      status: 'In Progress',
      tag: 'Backend',
      assignees: [members[3]?.id || 'm-4'],
      deadline: formatOffset(4),
      checklist: [
        { id: 'c-9', text: 'Priority queue with in-memory Redis sorted set', done: true },
        { id: 'c-10', text: 'Broadcast state update event via WebSocket', done: false },
      ],
      createdAt: formatOffset(-7),
    },
    {
      id: 't-5',
      title: 'Design final 10-slide judge presentation & deck narrative',
      desc: 'Figma pitch deck highlighting the problem, live demo walkthrough screenshots, competitive moat, and architecture diagram.',
      priority: 'Critical',
      status: 'In Progress',
      tag: 'Pitch & Demo',
      assignees: [members[4]?.id || 'm-5', members[2]?.id || 'm-3'],
      deadline: formatOffset(6),
      checklist: [
        { id: 'c-11', text: 'Slide 1-3: The $40B emergency room triage bottleneck', done: true },
        { id: 'c-12', text: 'Slide 4-6: Live architecture & 98.4% detection accuracy', done: true },
        { id: 'c-13', text: 'Slide 7-9: Business model & sponsor API integration', done: false },
        { id: 'c-14', text: 'Slide 10: Team credentials & ask', done: false },
      ],
      createdAt: formatOffset(-5),
    },
    {
      id: 't-6',
      title: 'Record 2-minute 45-second backup demo video',
      desc: 'Screen recording with crisp microphone commentary showcasing real-time patient crisis alert simulation.',
      priority: 'High',
      status: 'Todo',
      tag: 'Pitch & Demo',
      assignees: [members[4]?.id || 'm-5'],
      deadline: formatOffset(9),
      checklist: [
        { id: 'c-15', text: 'Write 180-word video script', done: true },
        { id: 'c-16', text: 'Record OBS 1080p demo flow', done: false },
        { id: 'c-17', text: 'Upload to unlisted YouTube / Loom backup', done: false },
      ],
      createdAt: formatOffset(-3),
    },
    {
      id: 't-7',
      title: 'Staging smoke test & load latency check on Cloud Run',
      desc: 'Deploy full stack to public URL and verify cold start is under 1.5 seconds for live judging demo.',
      priority: 'Medium',
      status: 'Review',
      tag: 'Infra',
      assignees: [members[3]?.id || 'm-4', members[0]?.id || 'm-1'],
      deadline: formatOffset(2),
      checklist: [
        { id: 'c-18', text: 'Environment variables configured properly', done: true },
        { id: 'c-19', text: 'SSL certificate validated on custom domain', done: true },
        { id: 'c-20', text: 'Test from mobile hotspot network condition', done: false },
      ],
      prUrl: 'https://github.com/hackhub-team/pulsea-core/pull/9',
      createdAt: formatOffset(-8),
    },
    {
      id: 't-8',
      title: 'Complete Devpost project profile & sponsor bounty tags',
      desc: 'Verify all required submission questions, GitHub repository license, sponsor bounty checkmarks, and team member tags.',
      priority: 'High',
      status: 'Todo',
      tag: 'Documentation',
      assignees: [members[4]?.id || 'm-5', members[0]?.id || 'm-1'],
      deadline: formatOffset(11),
      checklist: [
        { id: 'c-21', text: 'Tag sponsor API prizes', done: false },
        { id: 'c-22', text: 'Paste README installation instructions', done: false },
      ],
      createdAt: formatOffset(-2),
    },
  ];
};

export const INITIAL_MILESTONES: Milestone[] = [
  {
    id: 'ms-1',
    title: 'Hacking Kickoff & Concept Finalization',
    phaseNumber: 1,
    targetHoursRemaining: 36,
    completed: true,
    notes: 'Problem statement locked, scope narrowed to ICU/ER telemetry triage.',
  },
  {
    id: 'ms-2',
    title: 'Model Prototype & WebSocket Contracts',
    phaseNumber: 2,
    targetHoursRemaining: 24,
    completed: true,
    notes: 'ONNX model exported, data contracts approved across frontend and backend.',
  },
  {
    id: 'ms-3',
    title: 'Interactive Frontend & Streaming Integration',
    phaseNumber: 3,
    targetHoursRemaining: 12,
    completed: false,
    notes: 'Canvas charts running smoothly, testing simulated alarm triggers.',
  },
  {
    id: 'ms-4',
    title: 'Code Freeze & Public Staging Deployment',
    phaseNumber: 4,
    targetHoursRemaining: 5,
    completed: false,
    notes: 'Zero new feature commits after this point. Only bugfixes and speed tweaks.',
  },
  {
    id: 'ms-5',
    title: 'Pitch Rehearsal & Backup Video Upload',
    phaseNumber: 5,
    targetHoursRemaining: 2,
    completed: false,
    notes: '3-minute timer run-through with entire team present. Backup video rendered.',
  },
  {
    id: 'ms-6',
    title: 'Devpost Final Submission Lock',
    phaseNumber: 6,
    targetHoursRemaining: 0,
    completed: false,
    notes: 'Hit submit on Devpost 30 minutes before hard cutoff to prevent server traffic jams.',
  },
];

export const INITIAL_CHECKLIST: SubmissionChecklist[] = [
  {
    id: 'chk-1',
    label: 'Public GitHub Repo with MIT / Apache 2.0 License',
    category: 'Code',
    done: true,
    hint: 'Judges must be able to inspect code without requesting access.',
  },
  {
    id: 'chk-2',
    label: 'Clear README with Local Setup Instructions',
    category: 'Documentation',
    done: true,
    hint: 'Include prerequisites, env variables, and `npm run dev` steps.',
  },
  {
    id: 'chk-3',
    label: 'Working Live Demo URL (SSL enabled)',
    category: 'Deployment',
    done: true,
    hint: 'Must be accessible without internal intranet or localhost restrictions.',
  },
  {
    id: 'chk-4',
    label: 'Pre-recorded 3-Minute Video Walkthrough',
    category: 'Media',
    done: false,
    hint: 'Critical fail-safe if WiFi drops during judging or live staging glitches.',
  },
  {
    id: 'chk-5',
    label: '10-Slide Pitch Presentation PDF / Link',
    category: 'Media',
    done: false,
    hint: 'Clean slides ready to project on screen or share via URL.',
  },
  {
    id: 'chk-6',
    label: 'Sponsor API / Track Checklist Verified',
    category: 'Documentation',
    done: false,
    hint: 'Confirm all specific hackathon bounty requirements are satisfied.',
  },
  {
    id: 'chk-7',
    label: 'All Team Members Linked on Devpost',
    category: 'Documentation',
    done: true,
    hint: 'Every teammate must be registered so everyone receives prizes/swag.',
  },
];

export const INITIAL_PROJECT: HackathonProject = {
  id: 'proj-hack-2026',
  name: 'PulseAI',
  tagline: 'Autonomous ER Triage & 60fps Real-Time Vital Telemetry',
  eventName: 'Global AI & Health Sprint 2026',
  targetTrack: 'Healthcare & Ambient Intelligence ($15k Grand Prize)',
  description:
    'An edge-accelerated emergency room triage system that processes multi-channel streaming patient vitals, detects life-threatening cardiac anomalies in under 200ms, and routes dynamic nurse dispatch queues with predictive acuity scoring.',
  targetDeadline: getInitialDeadline(),
  startedAt: new Date(Date.now() - 3600000 * 22).toISOString(),
  links: {
    repo: 'https://github.com/hackhub-team/pulse-ai-telemetry',
    demo: 'https://pulse-ai-telemetry-demo.app',
    slides: 'https://pitch.com/p/pulse-ai-pitch-deck-2026',
    video: 'https://youtu.be/pulse-ai-demo-walkthrough',
    figma: 'https://figma.com/file/pulse-ai-triage-system-design',
  },
  pitchDraft: {
    problem:
      'Overburdened emergency departments lose critical minutes during triage handoffs. 35% of cardiac arrhythmia spikes are missed during manual vitals charting, causing avoidable patient deterioration and $42B in preventable emergency complications annually.',
    solution:
      'PulseAI connects directly to bedside telemetry sensors or edge gateways. Our streaming inference pipeline processes 12-lead ECG waveforms at 250Hz, flags anomalies with 98.4% precision, and automatically prioritizes nurse triage queues in real time.',
    techStack:
      'React 19, TypeScript, Tailwind CSS, HTML5 High-Performance Canvas, FastAPI, Python ONNX Runtime, Go WebSocket broker, Redis Sorted Sets, Docker.',
    challenges:
      'Rendering smooth 60fps waveform traces without choking browser memory while concurrently ingesting 500 WebSocket events per second, solved by implementing offscreen double-buffered canvas rendering.',
    accomplishments:
      'Built a fully end-to-end working system in under 24 hours: from synthetic ECG dataset ingestion to instantaneous triage alert dispatch.',
  },
};
