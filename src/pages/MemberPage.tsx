import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStore } from '../lib/store';
import { Task } from '../lib/types';
import { format, parseISO, isPast } from 'date-fns';

const STATUS_COLORS: Record<Task['status'], string> = {
  todo: 'bg-gray-100 text-gray-600',
  in_progress: 'bg-blue-100 text-blue-700',
  done: 'bg-green-100 text-green-700',
};

export default function MemberPage() {
  const { member: memberSlug } = useParams<{ member: string }>();
  const { tasks, events, teamMembers } = useStore();

  const member = teamMembers.find(m => m.name.toLowerCase() === memberSlug);

  const memberTasks = useMemo(
    () => tasks.filter(t => t.assignee === member?.name),
    [tasks, member]
  );

  const assignedStages = useMemo(() => {
    return events
      .filter(e => e.type === 'episode')
      .flatMap(e => (e as any).stages.map((s: any) => ({
        ...s,
        episodeName: (e as any).episodeName,
        episodeId: e.id,
      })))
      .filter((s: any) => s.responsible === member?.name);
  }, [events, member]);

  if (!member) {
    return (
      <div className="p-6">
        <Link to="/team" className="text-xs text-indigo-500 hover:underline mb-4 block">← Team</Link>
        <p className="text-gray-400">Member not found</p>
      </div>
    );
  }

  const active = memberTasks.filter(t => t.status !== 'done');
  const done = memberTasks.filter(t => t.status === 'done');

  return (
    <div className="p-6 max-w-3xl">
      <Link to="/team" className="text-xs text-indigo-500 hover:underline mb-4 block">← Team</Link>

      <div className="flex items-center gap-4 mb-6">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-2xl"
          style={{ background: member.color }}
        >
          {member.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{member.name}</h1>
          <p className="text-sm text-gray-400">{member.role || 'Team Member'}</p>
        </div>
      </div>

      <div className="space-y-6">
        <section>
          <h2 className="text-sm font-semibold text-gray-700 mb-2">Active Tasks ({active.length})</h2>
          {active.length === 0 && <p className="text-xs text-gray-400">No active tasks</p>}
          <div className="space-y-2">
            {active.map(t => (
              <div key={t.id} className="flex items-center gap-3 bg-white rounded-lg border border-gray-200 px-4 py-2.5">
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded uppercase ${STATUS_COLORS[t.status]}`}>
                  {t.status.replace('_', ' ')}
                </span>
                <span className="text-sm text-gray-800 flex-1">{t.title}</span>
                {t.dueDate && (
                  <span className={`text-xs ${isPast(parseISO(t.dueDate)) ? 'text-red-500 font-semibold' : 'text-gray-400'}`}>
                    {format(parseISO(t.dueDate), 'd MMM')}
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>

        {assignedStages.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-gray-700 mb-2">Production Stages ({assignedStages.length})</h2>
            <div className="space-y-1">
              {assignedStages.map((s: any) => (
                <div key={`${s.episodeId}-${s.id}`} className="flex items-center gap-3 bg-white rounded-lg border border-gray-100 px-4 py-2">
                  <span className="text-xs text-gray-500 w-20">{s.episodeName}</span>
                  <span className="text-sm text-gray-800 flex-1">{s.name}</span>
                  {s.endDate && <span className="text-xs text-gray-400">{s.endDate}</span>}
                </div>
              ))}
            </div>
          </section>
        )}

        {done.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-gray-400 mb-2">Completed ({done.length})</h2>
            <div className="space-y-1 opacity-60">
              {done.map(t => (
                <div key={t.id} className="flex items-center gap-3 bg-white rounded-lg border border-gray-100 px-4 py-2">
                  <span className="text-sm text-gray-500 line-through">{t.title}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
