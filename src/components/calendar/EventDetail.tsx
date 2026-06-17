import { CalendarEvent, StageStatus } from '../../lib/types';
import { useStore } from '../../lib/store';

const STATUS_PILL: Record<StageStatus, string> = {
  done: 'bg-green-100 text-green-700',
  in_progress: 'bg-blue-100 text-blue-700',
  not_started: 'bg-gray-100 text-gray-500',
};
const STATUS_LABEL: Record<StageStatus, string> = { done: 'Done', in_progress: 'In Prog.', not_started: '–' };

interface Props { event: CalendarEvent; onEdit: () => void; onClose: () => void; }

export default function EventDetail({ event, onEdit, onClose }: Props) {
  const { cycleStageStatus, saveEvent } = useStore();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 space-y-4 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-start">
          <div>
            <h2 className="font-semibold text-lg">{event.title}</h2>
            <p className="text-xs text-gray-400">{event.date}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={onEdit} className="text-indigo-600 text-sm hover:underline">Edit</button>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
          </div>
        </div>

        {event.notes && <p className="text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2">{event.notes}</p>}

        {event.type === 'episode' && (
          <>
            <div className="text-xs text-gray-500 space-y-1">
              <p><span className="font-medium">Show:</span> {event.show}</p>
              <p><span className="font-medium">Episode:</span> {event.episodeName} · {event.theme}</p>
            </div>

            {/* Progress bar */}
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Production progress</span>
                <span>{event.stages.filter(s => s.status === 'done').length}/{event.stages.length} stages</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-2 bg-indigo-500 rounded-full transition-all"
                  style={{ width: `${Math.round(event.stages.filter(s => s.status === 'done').length / event.stages.length * 100)}%` }}
                />
              </div>
            </div>

            <div className="space-y-1">
              {event.stages.map(stage => (
                <div key={stage.id} className="flex items-center gap-2 py-1 border-b border-gray-50 last:border-0">
                  <button
                    onClick={() => cycleStageStatus(event.id, stage.id)}
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded cursor-pointer hover:opacity-80 transition-opacity ${STATUS_PILL[stage.status]}`}
                  >
                    {STATUS_LABEL[stage.status]}
                  </button>
                  <span className="text-sm flex-1 text-gray-800">{stage.name}</span>
                  {stage.endDate && <span className="text-xs text-gray-400">→ {stage.endDate}</span>}
                </div>
              ))}
            </div>
          </>
        )}

        {event.type === 'brand_deal' && (
          <div className="text-sm space-y-1">
            <p><span className="text-gray-500">Brand:</span> {event.brand}</p>
            <p><span className="text-gray-500">Rate:</span> {event.currency} {event.rate.toLocaleString()}</p>
            <p><span className="text-gray-500">Stage:</span> <span className="capitalize">{event.dealStage}</span></p>
            {event.responsible && <p><span className="text-gray-500">Responsible:</span> {event.responsible}</p>}
          </div>
        )}

        {event.type === 'reminder' && (
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={event.done}
                onChange={() => saveEvent({ ...event, done: !event.done })}
              />
              {event.done ? 'Completed' : 'Mark as done'}
            </label>
            {event.responsible && <span className="text-xs text-gray-400">{event.responsible}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
