import { useState } from 'react';
import { useStore } from '../lib/store';
import { Project, ProjectPhase, PhaseStatus } from '../lib/types';
import ProjectModal from '../components/projects/ProjectModal';

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

function ProjectCard({
  project,
  tasks,
  onEdit,
}: {
  project: Project;
  tasks: ReturnType<typeof useStore>['tasks'];
  onEdit: () => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const allTaskIds = project.phases.flatMap(p => p.taskIds);
  const totalTasks = allTaskIds.length;
  const doneTasks = allTaskIds.filter(id => tasks.find(t => t.id === id)?.status === 'done').length;
  const pct = totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 p-4 cursor-pointer group" onClick={() => setExpanded(e => !e)}>
        <div className="w-3 h-3 rounded shrink-0" style={{ background: project.color }} />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-sm truncate">{project.name}</h3>
          {project.description && <p className="text-xs text-gray-400 mt-0.5 truncate">{project.description}</p>}
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs font-semibold text-gray-600">{pct}%</p>
          <p className="text-[10px] text-gray-400">{doneTasks}/{totalTasks} tasks</p>
        </div>
        <button
          onClick={e => { e.stopPropagation(); onEdit(); }}
          className="text-gray-300 hover:text-gray-500 text-sm ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          ✎
        </button>
        <span className="text-gray-400 text-xs">{expanded ? '▲' : '▼'}</span>
      </div>

      <div className="h-1 bg-gray-100">
        <div className="h-1 transition-all" style={{ width: `${pct}%`, background: project.color }} />
      </div>

      {expanded && project.phases.length > 0 && (
        <div className="px-4 pb-4 pt-3 space-y-2">
          {project.phases.map(phase => {
            const prog = phaseProgress(phase, tasks);
            return (
              <div key={phase.id} className="flex items-center gap-3 py-1.5 border-b border-gray-50 last:border-0">
                <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded shrink-0 ${STATUS_COLORS[phase.status]}`}>
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
          {project.phases.length === 0 && (
            <p className="text-xs text-gray-400">No phases — click ✎ to add some</p>
          )}
        </div>
      )}
    </div>
  );
}

export default function ProjectsPage() {
  const { projects, tasks } = useStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);

  const openNew = () => { setEditProject(null); setModalOpen(true); };
  const openEdit = (p: Project) => { setEditProject(p); setModalOpen(true); };
  const closeModal = () => setModalOpen(false);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-sm text-gray-500 mt-0.5">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={openNew}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 transition-colors"
        >
          + New Project
        </button>
      </div>

      <div className="space-y-4 max-w-3xl">
        {projects.map(p => (
          <ProjectCard key={p.id} project={p} tasks={tasks} onEdit={() => openEdit(p)} />
        ))}
        {projects.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">◈</p>
            <p>No projects yet</p>
            <button onClick={openNew} className="mt-3 text-indigo-500 text-sm hover:underline">Create your first project</button>
          </div>
        )}
      </div>

      {modalOpen && (
        <ProjectModal
          project={editProject}
          onClose={closeModal}
        />
      )}
    </div>
  );
}
