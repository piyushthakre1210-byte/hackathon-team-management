export type MemberRole =
  | 'Full-Stack'
  | 'Frontend'
  | 'Backend'
  | 'ML / AI'
  | 'UI / UX Designer'
  | 'PM / Pitch Lead'
  | 'DevOps / Cloud'
  | 'QA & Testing';

export type MemberStatus = 'coding' | 'reviewing' | 'resting' | 'available';

export interface Member {
  id: string;
  name: string;
  role: MemberRole;
  bio: string;
  email: string;
  handle: string; // e.g. @elena.dev
  avatarColor: string;
  status: MemberStatus;
  skills: string[];
  joinedAt: string;
}

export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type TaskStatus = 'Todo' | 'In Progress' | 'Review' | 'Done';
export type TaskTag =
  | 'Frontend'
  | 'Backend'
  | 'AI / Model'
  | 'UI / UX'
  | 'Infra'
  | 'Pitch & Demo'
  | 'Documentation';

export interface TaskChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface Task {
  id: string;
  title: string;
  desc: string;
  priority: TaskPriority;
  status: TaskStatus;
  tag: TaskTag;
  assignees: string[]; // member IDs
  deadline: string; // ISO date or date string YYYY-MM-DDTHH:mm
  checklist: TaskChecklistItem[];
  prUrl?: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  senderAvatarColor: string;
  senderHandle: string;
  text: string;
  timestamp: string;
  channel: string;
}

export interface Milestone {
  id: string;
  title: string;
  phaseNumber: number;
  targetHoursRemaining: number; // e.g., 28h left, 18h left, 6h left, 1h left
  completed: boolean;
  notes: string;
  ownerId?: string;
}

export interface SubmissionChecklist {
  id: string;
  label: string;
  category: 'Code' | 'Media' | 'Documentation' | 'Deployment';
  done: boolean;
  hint: string;
}

export interface HackathonProject {
  id: string;
  name: string;
  tagline: string;
  eventName: string;
  targetTrack: string;
  description: string;
  targetDeadline: string; // ISO string
  startedAt: string;
  links: {
    repo: string;
    demo: string;
    slides: string;
    video: string;
    figma: string;
  };
  pitchDraft: {
    problem: string;
    solution: string;
    techStack: string;
    challenges: string;
    accomplishments: string;
  };
}
