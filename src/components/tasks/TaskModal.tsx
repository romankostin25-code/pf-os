import { useState, useEffect } from 'react';
import { Task, TaskPriority, TaskStatus, TeamMember, RecurringInterval } from '../../lib/types';
import { useStore } from '../../lib/store';
const PRIORITIES: TaskPriority[] = ['low', 'medium', 'high'];
const STATUSES: TaskStatus[] = ['todo', 'in_progress', 'done'];

interface Props {
  task?: Task | null;
  onClose: () => void;
}

export default function TaskModal({ task, onClose }: Props) {
  const { saveTask, deleteTask, teamMembers } = useStore();
  const [form, setForm] = useState<Omit<Task, 'id' | 'createdAt'>>({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    assignee: undefined,
    dueDate: '',
    tags: [],
    recurring: null,
  });

  useEffect(() => {
    if (task) {
      const { id, createdAt, ...rest } = task;
      setForm(rest);
    }
  }, [task]);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm(prev => ({ ...prev, [k]: v }));

  const handleSave = () => {
    if (!form.title.trim()) return;
    saveTask({
      ...form,
      id: task?.id ?? `task-${Date.now()}`,
      createdAt: task?.createdAt ?? new Date().toISOString(),
    });
    onClose();
  };

  const handleDelete = () => {
    if (task) { deleteTask(task.id); onClose(); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 space-y-4" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-lg">{task ? 'Edit Task' : 'New Task'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        <input
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          placeholder="Task title"
          value={form.title}
          onChange={e => set('title', e.target.value)}
        />
        <textarea
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
          placeholder="Description (optional)"
          rows={2}
          value={form.description ?? ''}
          onChange={e => set('description', e.target.value)}
        />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Status</label>
            <select className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm" value={form.status} onChange={e => set('status', e.target.value as TaskStatus)}>
              {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Priority</label>
            <select className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm" value={form.priority} onChange={e => set('priority', e.target.value as TaskPriority)}>
              {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Assignee</label>
            <select className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm" value={form.assignee ?? ''} onChange={e => set('assignee', (e.target.value || undefined) as TeamMember | undefined)}>
              <option value="">— none —</option>
              {teamMembers.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Due date</label>
            <input type="date" className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm" value={form.dueDate ?? ''} onChange={e => set('dueDate', e.target.value)} />
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-500 mb-1 block">Recurring</label>
          <select className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm" value={form.recurring ?? ''} onChange={e => set('recurring', (e.target.value || null) as RecurringInterval)}>
            <option value="">None</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>

        <div className="flex justify-between pt-2">
          {task ? (
            <button onClick={handleDelete} className="text-red-500 text-sm hover:underline">Delete</button>
          ) : <span />}
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
            <button onClick={handleSave} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Save</button>
          </div>
        </div>
      </div>
    </div>
  );
}
