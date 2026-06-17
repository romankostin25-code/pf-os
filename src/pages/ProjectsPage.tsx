import { useState } from 'react';
import { useStore } from '../lib/store';
import { Project, ProjectPhase, PhaseStatus } from '../lib/types';

const STATUS_COLORS: Record<PhaseStatus, string> = {
  not_started: 'bg-gray-200 text-gray-600',
  in_progress: 'bg-blue-100 text-blue-700',
  done: 'bg-green-100 text-green-700',
};

function phaseProgress(phase: ProjectPhase, tasks: ReturnType<typeof useStore>['tasks']) {
  const phaseTasks = tasks.filter(t => phase.taskIds.includes(t.id));
  if (phaseTasks.length === 0) return null;
  const done = phaseTasks.filter(t => t.status === 'done').length;
  return { done, total: phaseTasks.length };
}

function ProjectCard({ project, tasks, onEdit }: { project: Project; tasks: ReturnType<typeof useStore>['tasks']; onEdit: () => void }) {
  const [expanded, setExpanded] = useState(true);
  const totalTasks = project.phases.flatMap(p => p.taskIds).length;
  const doneTasks = project.phases.flatMap(p => p.taskIds).filter(id => tasks.find(t => t.id === id)?.status === 'done').length;
  const pct = totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 p-4 cursor-pointer" onClick={() => setExpanded(e => !e)}>
        <div className="w-3 h-3 rounded-full shrink-0" style={{ background: project.color }} />
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-sm">{project.name}</h3>
          {project.description && <p className="text-xs text-gray-400 mt-0.5">{project.description}</p>}
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs font-semibold text-gray-600">{pct}%</p>
          <p className="text-[10px] text-gray-400">{doneTasks}/{totalTasks} tasks</p>
        </div>
        <button onClick={e => { e.stopPropagation(); onEdit(); }} className="text-gray-400 hover:text-gray-600 text-xs ml-2">✎</button>
        <span className="text-gray-400 text-xs">{expanded ? '▲' : '▼'}</span>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-gray-100">
        <div className="h-1 transition-all" style={{ width: `${pct}%`, background: project.color }} />
      </div>

      {expanded && (
        <div className="px-4 pb-4 pt-3 space-y-2">
          {project.phases.map(phase => {
            const prog = phaseProgress(phase, tasks);
            return (
              <div key={phase.id} className="flex items-center gap-3 py-1.5 border-b border-gray-50 last:border-0">
                <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${STATUS_COLORS[phase.status]}`}>
                  {phase.status.replace('_', ' ')}
                </span>
                <span className="text-sm text-gray-800 flex-1">{phase.name}</span>
                {phase.startDate && (
                  <span className="text-xs text-gray-400">{phase.startDate} → {phase.endDate ?? '…'}</span>
                )}
                {prog && (
                  <span className="text-xs text-gray-500">{prog.done}/{prog.total}</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function ProjectsPage() {
  const { projects, tasks } = useStore();

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-sm text-gray-500 mt-0.5">{projects.length} active projects</p>
        </div>
      </div>

      <div className="space-y-4 max-w-3xl">
        {projects.map(p => (
          <ProjectCard key={p.id} project={p} tasks={tasks} onEdit={() => {}} />
        ))}
        {projects.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">◈</p>
            <p>No projects yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
