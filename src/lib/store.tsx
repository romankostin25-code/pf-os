import { createContext, useContext, useEffect, useState } from 'react';
import { AppStore, CalendarEvent, Task, Project, TaskStatus, nextStatus } from './types';
import { sampleEvents, sampleTasks, sampleProjects } from './sampleData';

const VERSION = 'pf-os-v1';
const EVENTS_KEY = 'pf-os-events';
const TASKS_KEY = 'pf-os-tasks';
const PROJECTS_KEY = 'pf-os-projects';
const VER_KEY = 'pf-os-version';

function loadOrDefault<T>(key: string, fallback: T[]): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function initStorage(): { events: CalendarEvent[]; tasks: Task[]; projects: Project[] } {
  if (localStorage.getItem(VER_KEY) !== VERSION) {
    localStorage.removeItem(EVENTS_KEY);
    localStorage.removeItem(TASKS_KEY);
    localStorage.removeItem(PROJECTS_KEY);
    localStorage.setItem(VER_KEY, VERSION);
    localStorage.setItem(EVENTS_KEY, JSON.stringify(sampleEvents));
    localStorage.setItem(TASKS_KEY, JSON.stringify(sampleTasks));
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(sampleProjects));
    return { events: sampleEvents, tasks: sampleTasks, projects: sampleProjects };
  }
  return {
    events: loadOrDefault(EVENTS_KEY, sampleEvents),
    tasks: loadOrDefault(TASKS_KEY, sampleTasks),
    projects: loadOrDefault(PROJECTS_KEY, sampleProjects),
  };
}

const StoreCtx = createContext<AppStore>(null!);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const init = initStorage();
  const [events, setEvents] = useState<CalendarEvent[]>(init.events);
  const [tasks, setTasks] = useState<Task[]>(init.tasks);
  const [projects, setProjects] = useState<Project[]>(init.projects);

  useEffect(() => { localStorage.setItem(EVENTS_KEY, JSON.stringify(events)); }, [events]);
  useEffect(() => { localStorage.setItem(TASKS_KEY, JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects)); }, [projects]);

  const saveEvent = (e: CalendarEvent) =>
    setEvents(prev => prev.some(x => x.id === e.id) ? prev.map(x => x.id === e.id ? e : x) : [...prev, e]);

  const deleteEvent = (id: string) => setEvents(prev => prev.filter(x => x.id !== id));

  const cycleStageStatus = (episodeId: string, stageId: string) =>
    setEvents(prev => prev.map(ev => {
      if (ev.id !== episodeId || ev.type !== 'episode') return ev;
      return { ...ev, stages: ev.stages.map(s => s.id === stageId ? { ...s, status: nextStatus(s.status) } : s) };
    }));

  const saveTask = (t: Task) =>
    setTasks(prev => prev.some(x => x.id === t.id) ? prev.map(x => x.id === t.id ? t : x) : [...prev, t]);

  const deleteTask = (id: string) => setTasks(prev => prev.filter(x => x.id !== id));

  const setTaskStatus = (id: string, status: TaskStatus) =>
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));

  const saveProject = (p: Project) =>
    setProjects(prev => prev.some(x => x.id === p.id) ? prev.map(x => x.id === p.id ? p : x) : [...prev, p]);

  const deleteProject = (id: string) => setProjects(prev => prev.filter(x => x.id !== id));

  return (
    <StoreCtx.Provider value={{
      events, tasks, projects,
      saveEvent, deleteEvent, cycleStageStatus,
      saveTask, deleteTask, setTaskStatus,
      saveProject, deleteProject,
    }}>
      {children}
    </StoreCtx.Provider>
  );
}

export const useStore = () => useContext(StoreCtx);
