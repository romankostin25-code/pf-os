import { useMemo } from 'react';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, format, isSameMonth, isToday } from 'date-fns';
import { CalendarEntry } from '../../lib/types';

interface Props {
  currentDate: Date;
  entries: CalendarEntry[];
  onDayClick: (date: string) => void;
  onEntryClick: (eventId: string) => void;
}

export default function MonthView({ currentDate, entries, onDayClick, onEntryClick }: Props) {
  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      <div className="grid grid-cols-7 border-b border-gray-200">
        {WEEKDAYS.map(d => (
          <div key={d} className="py-2 text-center text-xs font-semibold text-gray-500">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 flex-1" style={{ gridTemplateRows: `repeat(${Math.ceil(days.length / 7)}, minmax(90px, 1fr))` }}>
        {days.map(day => {
          const key = format(day, 'yyyy-MM-dd');
          const dayEntries = entries.filter(e => e.date === key);
          const inMonth = isSameMonth(day, currentDate);
          const today = isToday(day);

          return (
            <div
              key={key}
              className={`border-b border-r border-gray-100 p-1.5 cursor-pointer hover:bg-gray-50 transition-colors ${!inMonth ? 'opacity-40' : ''}`}
              onClick={() => onDayClick(key)}
            >
              <div className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-semibold mb-1 ${today ? 'bg-indigo-600 text-white' : 'text-gray-700'}`}>
                {format(day, 'd')}
              </div>
              <div className="space-y-0.5">
                {dayEntries.slice(0, 3).map(e => (
                  <div
                    key={e.id}
                    className={`text-[10px] px-1.5 py-0.5 rounded truncate cursor-pointer hover:opacity-80 ${e.color}`}
                    onClick={ev => { ev.stopPropagation(); onEntryClick(e.eventId); }}
                  >
                    {e.icon} {e.label}
                  </div>
                ))}
                {dayEntries.length > 3 && (
                  <div className="text-[10px] text-gray-400 pl-1">+{dayEntries.length - 3} more</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
