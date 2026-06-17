import { useMemo } from 'react';
import { startOfWeek, addDays, format, isToday } from 'date-fns';
import { CalendarEntry } from '../../lib/types';

interface Props {
  currentDate: Date;
  entries: CalendarEntry[];
  onDayClick: (date: string) => void;
  onEntryClick: (eventId: string) => void;
}

export default function WeekView({ currentDate, entries, onDayClick, onEntryClick }: Props) {
  const days = useMemo(() => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, [currentDate]);

  return (
    <div className="flex-1 overflow-hidden grid grid-cols-7">
      {days.map(day => {
        const key = format(day, 'yyyy-MM-dd');
        const dayEntries = entries.filter(e => e.date === key);
        const today = isToday(day);
        return (
          <div
            key={key}
            className={`border-r border-gray-100 p-2 cursor-pointer hover:bg-gray-50 min-h-[200px] ${today ? 'bg-indigo-50/40' : ''}`}
            onClick={() => onDayClick(key)}
          >
            <div className="text-center mb-2">
              <p className="text-xs text-gray-400">{format(day, 'EEE')}</p>
              <div className={`w-7 h-7 mx-auto flex items-center justify-center rounded-full text-sm font-semibold ${today ? 'bg-indigo-600 text-white' : 'text-gray-700'}`}>
                {format(day, 'd')}
              </div>
            </div>
            <div className="space-y-1">
              {dayEntries.map(e => (
                <div
                  key={e.id}
                  className={`text-[10px] px-1.5 py-1 rounded cursor-pointer hover:opacity-80 ${e.color}`}
                  onClick={ev => { ev.stopPropagation(); onEntryClick(e.eventId); }}
                >
                  {e.icon} {e.label}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
