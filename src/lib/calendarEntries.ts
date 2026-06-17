import { CalendarEvent, CalendarEntry, EpisodeEvent, BrandDealEvent, ReminderEvent } from './types';

const DEAL_STAGE_COLOR: Record<string, string> = {
  negotiation: 'bg-yellow-200 text-yellow-800',
  contract: 'bg-orange-200 text-orange-800',
  filming: 'bg-blue-200 text-blue-800',
  edit: 'bg-purple-200 text-purple-800',
  published: 'bg-green-200 text-green-800',
  paid: 'bg-green-400 text-white',
};

const STAGE_ICON: Record<string, string> = {
  'Draft 1': '📝', 'Draft 2': '📝', 'Draft 3': '📝', 'Draft': '📝',
  'Comments': '💬',
  'Final': '✅',
  'Graphics': '🎨',
  'Thumbnail': '🖼️',
  'Publishing': '🚀',
};

const STATUS_COLOR: Record<string, string> = {
  done: 'bg-green-200 text-green-800',
  in_progress: 'bg-blue-200 text-blue-800',
  not_started: 'bg-gray-100 text-gray-500',
};

function episodeEntries(ev: EpisodeEvent): CalendarEntry[] {
  const entries: CalendarEntry[] = [];
  for (const stage of ev.stages) {
    const date = stage.endDate || stage.startDate;
    if (!date) continue;
    const iconKey = Object.keys(STAGE_ICON).find(k => stage.name.startsWith(k)) ?? '';
    entries.push({
      id: `${ev.id}-${stage.id}`,
      date,
      label: `${ev.episodeName} · ${stage.name}`,
      color: STATUS_COLOR[stage.status] ?? STATUS_COLOR.not_started,
      eventId: ev.id,
      icon: STAGE_ICON[iconKey] ?? '🎬',
    });
  }
  // fallback if no stages have dates — show episode start date
  if (entries.length === 0) {
    entries.push({
      id: ev.id,
      date: ev.date,
      label: `${ev.episodeName} · ${ev.theme}`,
      color: 'bg-indigo-200 text-indigo-800',
      eventId: ev.id,
      icon: '🎬',
    });
  }
  return entries;
}

function dealEntry(ev: BrandDealEvent): CalendarEntry {
  return {
    id: ev.id,
    date: ev.date,
    label: `${ev.brand} · ${ev.dealStage}`,
    color: DEAL_STAGE_COLOR[ev.dealStage] ?? 'bg-gray-200 text-gray-700',
    eventId: ev.id,
    icon: '🤝',
  };
}

function reminderEntry(ev: ReminderEvent): CalendarEntry {
  return {
    id: ev.id,
    date: ev.date,
    label: ev.title,
    color: ev.done ? 'bg-gray-100 text-gray-400 line-through' : 'bg-red-100 text-red-700',
    eventId: ev.id,
    icon: '🔔',
    done: ev.done,
  };
}

export function buildCalendarEntries(events: CalendarEvent[]): CalendarEntry[] {
  const entries: CalendarEntry[] = [];
  for (const ev of events) {
    if (ev.type === 'episode') entries.push(...episodeEntries(ev));
    else if (ev.type === 'brand_deal') entries.push(dealEntry(ev));
    else if (ev.type === 'reminder') entries.push(reminderEntry(ev));
  }
  return entries;
}
