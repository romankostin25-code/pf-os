import { useState, useMemo } from 'react';
import { format, addMonths, subMonths, addWeeks, subWeeks } from 'date-fns';
import { useStore } from '../lib/store';
import { buildCalendarEntries } from '../lib/calendarEntries';
import { CalendarEvent, ViewMode } from '../lib/types';
import MonthView from '../components/calendar/MonthView';
import WeekView from '../components/calendar/WeekView';
import ListView from '../components/calendar/ListView';
import EventModal from '../components/calendar/EventModal';
import EventDetail from '../components/calendar/EventDetail';

const VIEWS: { key: ViewMode; label: string }[] = [
  { key: 'month', label: 'Month' },
  { key: 'week', label: 'Week' },
  { key: 'list', label: 'List' },
];

export default function CalendarPage() {
  const { events } = useStore();
  const [view, setView] = useState<ViewMode>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editEvent, setEditEvent] = useState<CalendarEvent | null>(null);
  const [defaultDate, setDefaultDate] = useState('');

  const entries = useMemo(() => buildCalendarEntries(events), [events]);

  const selectedEvent = selectedEventId ? events.find(e => e.id === selectedEventId) ?? null : null;

  const prev = () => {
    if (view === 'week') setCurrentDate(d => subWeeks(d, 1));
    else setCurrentDate(d => subMonths(d, 1));
  };
  const next = () => {
    if (view === 'week') setCurrentDate(d => addWeeks(d, 1));
    else setCurrentDate(d => addMonths(d, 1));
  };

  const openNew = (date?: string) => {
    setEditEvent(null);
    setDefaultDate(date ?? '');
    setModalOpen(true);
  };

  const openEdit = (ev: CalendarEvent) => {
    setEditEvent(ev);
    setSelectedEventId(null);
    setModalOpen(true);
  };

  const headerLabel = view === 'week'
    ? `Week of ${format(currentDate, 'd MMM yyyy')}`
    : format(currentDate, 'MMMM yyyy');

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-gray-900">Calendar</h1>
          <div className="flex items-center gap-1">
            <button onClick={prev} className="px-2 py-1 rounded hover:bg-gray-100 text-gray-600">‹</button>
            <span className="text-sm font-medium text-gray-700 min-w-[160px] text-center">{headerLabel}</span>
            <button onClick={next} className="px-2 py-1 rounded hover:bg-gray-100 text-gray-600">›</button>
            <button onClick={() => setCurrentDate(new Date())} className="ml-2 text-xs px-2 py-1 border border-gray-200 rounded hover:bg-gray-50">Today</button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            {VIEWS.map(v => (
              <button key={v.key} onClick={() => setView(v.key)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${view === v.key ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
                {v.label}
              </button>
            ))}
          </div>
          <button onClick={() => openNew()} className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-indigo-700">+ Event</button>
        </div>
      </div>

      {/* View */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {view === 'month' && (
          <MonthView
            currentDate={currentDate}
            entries={entries}
            onDayClick={date => openNew(date)}
            onEntryClick={id => setSelectedEventId(id)}
          />
        )}
        {view === 'week' && (
          <WeekView
            currentDate={currentDate}
            entries={entries}
            onDayClick={date => openNew(date)}
            onEntryClick={id => setSelectedEventId(id)}
          />
        )}
        {view === 'list' && (
          <ListView
            currentDate={currentDate}
            entries={entries}
            onEntryClick={id => setSelectedEventId(id)}
          />
        )}
      </div>

      {selectedEvent && (
        <EventDetail
          event={selectedEvent}
          onEdit={() => openEdit(selectedEvent)}
          onClose={() => setSelectedEventId(null)}
        />
      )}
      {modalOpen && (
        <EventModal
          event={editEvent}
          defaultDate={defaultDate}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}
