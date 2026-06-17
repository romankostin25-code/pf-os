// ── Shared ────────────────────────────────────────────────────────────────────

export type TeamMember = string;

export interface TeamMemberRecord {
  id: string;
  name: string;
  role: string;
  color: string; // hex colour for avatar
}

// ── Calendar / Episodes ───────────────────────────────────────────────────────

export type ShowName =
  | 'Privileged Gossip'
  | 'PF Interviews'
  | 'RGM'
  | 'Albina IG/TikTok'
  | 'Other';

export type StageStatus = 'not_started' | 'in_progress' | 'done';

export interface ProductionStage {
  id: string;
  name: string;
  startDate?: string;
  endDate?: string;
  status: StageStatus;
  responsible?: TeamMember;
}

export function nextStatus(current: StageStatus): StageStatus {
  if (current === 'not_started') return 'in_progress';
  if (current === 'in_progress') return 'done';
  return 'not_started';
}

export const DEFAULT_STAGES: Omit<ProductionStage, 'id'>[] = [
  { name: 'Draft 1', status: 'not_started' },
  { name: 'Comments', status: 'not_started' },
  { name: 'Draft 2', status: 'not_started' },
  { name: 'Comments', status: 'not_started' },
  { name: 'Draft 3', status: 'not_started' },
  { name: 'Comments', status: 'not_started' },
  { name: 'Final', status: 'not_started' },
  { name: 'Graphics', status: 'not_started' },
  { name: 'Thumbnail', status: 'not_started' },
];

export type DealStage = 'negotiation' | 'contract' | 'filming' | 'edit' | 'published' | 'paid';

interface BaseEvent {
  id: string;
  title: string;
  date: string; // ISO yyyy-MM-dd
  notes?: string;
}

export interface EpisodeEvent extends BaseEvent {
  type: 'episode';
  show: ShowName;
  episodeName: string;
  theme: string;
  stages: ProductionStage[];
  linkedDealIds: string[];
}

export interface BrandDealEvent extends BaseEvent {
  type: 'brand_deal';
  brand: string;
  rate: number;
  currency: string;
  dealStage: DealStage;
  responsible?: TeamMember;
}

export interface ReminderEvent extends BaseEvent {
  type: 'reminder';
  done: boolean;
  responsible?: TeamMember;
}

export type CalendarEvent = EpisodeEvent | BrandDealEvent | ReminderEvent;

export interface CalendarEntry {
  id: string;
  date: string;
  label: string;
  color: string;
  eventId: string;
  icon?: string;
  done?: boolean;
}

export type ViewMode = 'month' | 'week' | 'list' | 'gantt';

// ── Tasks ─────────────────────────────────────────────────────────────────────

export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';
export type RecurringInterval = 'daily' | 'weekly' | 'monthly' | null;

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee?: TeamMember;
  dueDate?: string;
  projectId?: string;
  phaseId?: string;
  tags: string[];
  recurring: RecurringInterval;
  createdAt: string;
}

// ── Projects ──────────────────────────────────────────────────────────────────

export type PhaseStatus = 'not_started' | 'in_progress' | 'done';

export interface ProjectPhase {
  id: string;
  name: string;
  status: PhaseStatus;
  startDate?: string;
  endDate?: string;
  taskIds: string[];
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  color: string;
  phases: ProjectPhase[];
  createdAt: string;
}

// ── App Store ─────────────────────────────────────────────────────────────────

export interface AppStore {
  events: CalendarEvent[];
  tasks: Task[];
  projects: Project[];
  teamMembers: TeamMemberRecord[];

  // events
  saveEvent: (e: CalendarEvent) => void;
  deleteEvent: (id: string) => void;
  cycleStageStatus: (episodeId: string, stageId: string) => void;

  // tasks
  saveTask: (t: Task) => void;
  deleteTask: (id: string) => void;
  setTaskStatus: (id: string, status: TaskStatus) => void;

  // projects
  saveProject: (p: Project) => void;
  deleteProject: (id: string) => void;

  // team
  saveMember: (m: TeamMemberRecord) => void;
  deleteMember: (id: string) => void;
}
