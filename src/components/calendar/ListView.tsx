import { useMemo } from 'react';
import { format, parseISO, startOfMonth, endOfMonth } from 'date-fns';
import { CalendarEntry } from '../../lib/types';

interface Props {
  currentDate: Date;
  entries: CalendarEntry[];
  onEntryClick: (eventId: string) => void;
}

export default function ListView({ currentDate, entries, onEntryClick }: Props) {
  const grouped = useMemo(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    const month = entries
      .filter(e => { const d = parseISO(e.date); return d >= start && d <= end; })
      .sort((a, b) => a.date.localeCompare(b.date));
    const map = new Map<string, CalendarEntry[]>();
    for (const e of month) {
      if (!map.has(e.date)) map.set(e.date, []);
      map.get(e.date)!.push(e);
    }
    return map;
  }, [currentDate, entries]);

  if (grouped.size === 0) return <div className="flex-1 flex items-center justify-center text-gray-400">No events this month</div>;

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {[...grouped.entries()].map(([date, dayEntries]) => (
        <div key={date}>
          <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">
            {format(parseISO(date), 'EEEE, d MMMM')}
          </h3>
          <div className="space-y-1">
            {dayEntries.map(e => (
              <div
                key={e.id}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:opacity-80 ${e.color}`}
                onClick={() => onEntryClick(e.eventId)}
              >
                <span>{e.icon}</span>
                <span className="text-sm">{e.label}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
