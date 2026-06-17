import { useMemo, useRef } from 'react';
import { useState } from 'react';
import { addMonths, subMonths, format, parseISO, differenceInDays, startOfDay } from 'date-fns';
import { useStore } from '../lib/store';
import { EpisodeEvent } from '../lib/types';

const DAY_W = 26;
const EP_ROW_H = 36;
const STAGE_ROW_H = 26;
const LABEL_W = 220;
const MONTHS = 3;

const STATUS_BAR: Record<string, string> = {
  done: 'bg-green-400',
  in_progress: 'bg-blue-500',
  not_started: 'bg-gray-200',
};

export default function GanttPage() {
  const { events } = useStore();
  const [ganttDate, setGanttDate] = useState(new Date());
  const episodes = useMemo(() => events.filter((e): e is EpisodeEvent => e.type === 'episode'), [events]);

  const startDate = useMemo(() => startOfDay(new Date(ganttDate.getFullYear(), ganttDate.getMonth(), 1)), [ganttDate]);
  const endDate = useMemo(() => startOfDay(addMonths(startDate, MONTHS)), [startDate]);
  const totalDays = differenceInDays(endDate, startDate);

  const months = useMemo(() => {
    const ms = [];
    let d = new Date(startDate);
    while (d < endDate) {
      const name = format(d, 'MMM yyyy');
      const days = differenceInDays(
        new Date(Math.min(new Date(d.getFullYear(), d.getMonth() + 1, 1).getTime(), endDate.getTime())),
        d
      );
      ms.push({ name, days, startDay: differenceInDays(d, startDate) });
      d = new Date(d.getFullYear(), d.getMonth() + 1, 1);
    }
    return ms;
  }, [startDate, endDate]);

  const todayOffset = differenceInDays(startOfDay(new Date()), startDate);

  function xForDate(dateStr: string): number {
    const d = parseISO(dateStr);
    const diff = differenceInDays(d, startDate);
    return Math.max(0, Math.min(diff, totalDays)) * DAY_W;
  }

  function widthBetween(start?: string, end?: string): number {
    if (!start || !end) return DAY_W * 3;
    const s = parseISO(start);
    const e = parseISO(end);
    return Math.max(DAY_W, differenceInDays(e, s) * DAY_W);
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Post-Prod Gantt</h1>
          <p className="text-xs text-gray-400 mt-0.5">Click a stage pill to cycle status</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setGanttDate(d => subMonths(d, 1))} className="px-3 py-1.5 rounded border border-gray-200 text-sm hover:bg-gray-50">‹</button>
          <span className="text-sm font-medium w-32 text-center">{format(ganttDate, 'MMM yyyy')}</span>
          <button onClick={() => setGanttDate(d => addMonths(d, 1))} className="px-3 py-1.5 rounded border border-gray-200 text-sm hover:bg-gray-50">›</button>
          <button onClick={() => setGanttDate(new Date())} className="ml-1 text-xs px-2 py-1 border border-gray-200 rounded hover:bg-gray-50">Today</button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="flex" style={{ minWidth: LABEL_W + totalDays * DAY_W }}>
          {/* Labels */}
          <div className="shrink-0" style={{ width: LABEL_W, position: 'sticky', left: 0, zIndex: 10, background: '#fff' }}>
            {/* Month header spacer */}
            <div className="border-b border-gray-200 h-8 bg-gray-50" />
            {episodes.map(ep => (
              <div key={ep.id}>
                <div className="flex items-center px-3 border-b border-gray-100 bg-indigo-50 font-medium text-sm text-indigo-900" style={{ height: EP_ROW_H }}>
                  {ep.episodeName} · {ep.theme}
                </div>
                {ep.stages.map(stage => (
                  <div key={stage.id} className="flex items-center px-4 text-xs text-gray-500 border-b border-gray-50" style={{ height: STAGE_ROW_H }}>
                    {stage.name}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Timeline */}
          <div className="relative" style={{ width: totalDays * DAY_W }}>
            {/* Month headers */}
            <div className="flex border-b border-gray-200 h-8 bg-gray-50 sticky top-0 z-10">
              {months.map(m => (
                <div key={m.name} className="border-r border-gray-200 flex items-center px-2 text-xs font-semibold text-gray-500" style={{ width: m.days * DAY_W }}>
                  {m.name}
                </div>
              ))}
            </div>

            {/* Rows */}
            {episodes.map(ep => (
              <div key={ep.id}>
                <div className="relative border-b border-gray-100 bg-indigo-50/30" style={{ height: EP_ROW_H }}>
                  {/* episode span line */}
                  {ep.stages.find(s => s.startDate) && ep.stages.slice().reverse().find(s => s.endDate) && (
                    <div className="absolute top-1/2 -translate-y-1/2 h-1 rounded bg-indigo-200"
                      style={{
                        left: xForDate(ep.stages.find(s => s.startDate)!.startDate!),
                        width: xForDate(ep.stages.slice().reverse().find(s => s.endDate)!.endDate!) - xForDate(ep.stages.find(s => s.startDate)!.startDate!),
                      }}
                    />
                  )}
                </div>
                {ep.stages.map(stage => (
                  <div key={stage.id} className="relative border-b border-gray-50" style={{ height: STAGE_ROW_H }}>
                    {(stage.startDate || stage.endDate) && (
                      <div
                        className={`absolute top-1/2 -translate-y-1/2 rounded h-4 ${STATUS_BAR[stage.status]}`}
                        style={{
                          left: stage.startDate ? xForDate(stage.startDate) : xForDate(stage.endDate!),
                          width: widthBetween(stage.startDate, stage.endDate),
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
            ))}

            {/* Today line */}
            {todayOffset >= 0 && todayOffset <= totalDays && (
              <div className="absolute top-0 bottom-0 w-px bg-red-500 z-20 pointer-events-none" style={{ left: todayOffset * DAY_W }} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
