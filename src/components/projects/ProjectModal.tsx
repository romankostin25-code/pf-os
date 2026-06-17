import { useState, useEffect } from 'react';
import { Project, ProjectPhase } from '../../lib/types';
import { useStore } from '../../lib/store';

const PRESET_COLORS = [
  '#6366f1', '#3b82f6', '#10b981', '#f59e0b',
  '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4',
];

interface Props {
  project?: Project | null;
  onClose: () => void;
}

export default function ProjectModal({ project, onClose }: Props) {
  const { saveProject, deleteProject } = useStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [phases, setPhases] = useState<Omit<ProjectPhase, 'taskIds'>[]>([]);

  useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(project.description ?? '');
      setColor(project.color);
      setPhases(project.phases.map(({ taskIds: _t, ...rest }) => rest));
    } else {
      setPhases([{ id: `ph-${Date.now()}`, name: 'Phase 1', status: 'not_started' }]);
    }
  }, [project]);

  const addPhase = () =>
    setPhases(prev => [...prev, { id: `ph-${Date.now()}-${prev.length}`, name: '', status: 'not_started' }]);

  const updatePhase = (idx: number, field: string, val: string) =>
    setPhases(prev => prev.map((p, i) => i === idx ? { ...p, [field]: val } : p));

  const removePhase = (idx: number) =>
    setPhases(prev => prev.filter((_, i) => i !== idx));

  const handleSave = () => {
    if (!name.trim()) return;
    const existing = project?.phases ?? [];
    const mergedPhases: ProjectPhase[] = phases.map(p => {
      const existingPhase = existing.find(e => e.id === p.id);
      return { ...p, taskIds: existingPhase?.taskIds ?? [] };
    });
    saveProject({
      id: project?.id ?? `proj-${Date.now()}`,
      name: name.trim(),
      description: description.trim() || undefined,
      color,
      phases: mergedPhases,
      createdAt: project?.createdAt ?? new Date().toISOString(),
    });
    onClose();
  };

  const handleDelete = () => {
    if (project) { deleteProject(project.id); onClose(); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md my-8 p-6 space-y-4" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-lg">{project ? 'Edit Project' : 'New Project'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        {/* Color + name row */}
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded shrink-0" style={{ background: color }} />
          <input
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            placeholder="Project name"
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </div>

        <textarea
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300"
          placeholder="Description (optional)"
          rows={2}
          value={description}
          onChange={e => setDescription(e.target.value)}
        />

        <div>
          <p className="text-xs text-gray-500 mb-2">Colour</p>
          <div className="flex gap-2 flex-wrap">
            {PRESET_COLORS.map(c => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-7 h-7 rounded border-2 transition-transform ${color === c ? 'border-gray-800 scale-110' : 'border-transparent hover:scale-105'}`}
                style={{ background: c }}
              />
            ))}
          </div>
        </div>

        {/* Phases */}
        <div>
          <p className="text-xs text-gray-500 mb-2 font-medium">Phases</p>
          <div className="space-y-2">
            {phases.map((phase, i) => (
              <div key={phase.id} className="flex items-center gap-2">
                <input
                  className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  placeholder={`Phase ${i + 1} name`}
                  value={phase.name}
                  onChange={e => updatePhase(i, 'name', e.target.value)}
                />
                <select
                  className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs"
                  value={phase.status}
                  onChange={e => updatePhase(i, 'status', e.target.value)}
                >
                  <option value="not_started">Not started</option>
                  <option value="in_progress">In progress</option>
                  <option value="done">Done</option>
                </select>
                <button
                  onClick={() => removePhase(i)}
                  className="text-gray-300 hover:text-red-400 text-lg leading-none"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={addPhase}
            className="mt-2 text-xs text-indigo-500 hover:underline"
          >
            + Add phase
          </button>
        </div>

        <div className="flex justify-between pt-2">
          {project ? (
            <button onClick={handleDelete} className="text-red-500 text-sm hover:underline">Delete project</button>
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
