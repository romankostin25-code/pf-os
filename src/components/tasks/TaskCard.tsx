import { Task } from '../../lib/types';
import { useStore } from '../../lib/store';
import { format, parseISO, isPast } from 'date-fns';

const PRIORITY_BADGE: Record<string, string> = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-gray-100 text-gray-500',
};

interface Props {
  task: Task;
  onClick: () => void;
}

export default function TaskCard({ task, onClick }: Props) {
  const { setTaskStatus } = useStore();
  const overdue = task.dueDate && task.status !== 'done' && isPast(parseISO(task.dueDate));

  return (
    <div
      className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm hover:shadow-md cursor-pointer transition-shadow"
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2">
        <p className={`text-sm font-medium leading-snug ${task.status === 'done' ? 'line-through text-gray-400' : 'text-gray-800'}`}>
          {task.recurring && <span className="mr-1 text-xs">↻</span>}
          {task.title}
        </p>
        <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded shrink-0 ${PRIORITY_BADGE[task.priority]}`}>
          {task.priority}
        </span>
      </div>

      {task.description && (
        <p className="text-xs text-gray-400 mt-1 line-clamp-2">{task.description}</p>
      )}

      <div className="mt-2 flex items-center gap-2 flex-wrap">
        {task.assignee && (
          <span className="text-[10px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded">{task.assignee}</span>
        )}
        {task.dueDate && (
          <span className={`text-[10px] px-1.5 py-0.5 rounded ${overdue ? 'bg-red-50 text-red-600 font-semibold' : 'text-gray-400'}`}>
            {overdue ? '⚠ ' : ''}{format(parseISO(task.dueDate), 'd MMM')}
          </span>
        )}
        {task.tags.map(tag => (
          <span key={tag} className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{tag}</span>
        ))}
      </div>

      <div className="mt-2 flex gap-1">
        {(['todo', 'in_progress', 'done'] as const).map(s => (
          <button
            key={s}
            onClick={e => { e.stopPropagation(); setTaskStatus(task.id, s); }}
            className={`text-[10px] px-2 py-0.5 rounded transition-colors ${
              task.status === s ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {s === 'todo' ? 'To Do' : s === 'in_progress' ? 'In Prog.' : 'Done'}
          </button>
        ))}
      </div>
    </div>
  );
}
