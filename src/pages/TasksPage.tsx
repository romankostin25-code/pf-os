import { useState, useMemo } from 'react';
import { useStore } from '../lib/store';
import { Task, TaskStatus, TeamMember } from '../lib/types';
import TaskCard from '../components/tasks/TaskCard';
import TaskModal from '../components/tasks/TaskModal';

const COLUMNS: { key: TaskStatus; label: string; color: string }[] = [
  { key: 'todo', label: 'To Do', color: 'border-gray-300' },
  { key: 'in_progress', label: 'In Progress', color: 'border-blue-400' },
  { key: 'done', label: 'Done', color: 'border-green-400' },
];

const MEMBERS: TeamMember[] = ['Roman', 'Albina', 'Victoria', 'Aliya', 'Other'];

export default function TasksPage() {
  const { tasks } = useStore();
  const [editTask, setEditTask] = useState<Task | null | 'new'>('new' as any);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [filterMember, setFilterMember] = useState<TeamMember | ''>('');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return tasks.filter(t => {
      if (filterMember && t.assignee !== filterMember) return false;
      if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [tasks, filterMember, search]);

  const openNew = () => { setActiveTask(null); setModalOpen(true); };
  const openEdit = (t: Task) => { setActiveTask(t); setModalOpen(true); };

  return (
    <div className="p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          <p className="text-sm text-gray-500 mt-0.5">{tasks.filter(t => t.status !== 'done').length} active</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 transition-colors"
        >
          + New Task
        </button>
      </div>

      <div className="flex gap-3 mb-6 flex-wrap">
        <input
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm w-52 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          placeholder="Search tasks…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none"
          value={filterMember}
          onChange={e => setFilterMember(e.target.value as TeamMember | '')}
        >
          <option value="">All members</option>
          {MEMBERS.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-3 gap-4 items-start">
        {COLUMNS.map(col => {
          const colTasks = filtered.filter(t => t.status === col.key);
          return (
            <div key={col.key} className={`rounded-xl border-t-4 ${col.color} bg-gray-50 p-3 min-h-[200px]`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700">{col.label}</h3>
                <span className="text-xs bg-gray-200 text-gray-600 rounded-full px-2 py-0.5">{colTasks.length}</span>
              </div>
              <div className="space-y-2">
                {colTasks.map(t => (
                  <TaskCard key={t.id} task={t} onClick={() => openEdit(t)} />
                ))}
                {colTasks.length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-6">Nothing here</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {modalOpen && (
        <TaskModal
          task={activeTask}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}
