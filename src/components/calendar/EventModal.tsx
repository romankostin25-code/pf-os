import { useState, useEffect } from 'react';
import { CalendarEvent, EpisodeEvent, ProductionStage, ShowName, DealStage, TeamMember, DEFAULT_STAGES } from '../../lib/types';
import { useStore } from '../../lib/store';

const SHOWS: ShowName[] = ['Privileged Gossip', 'PF Interviews', 'RGM', 'Albina IG/TikTok', 'Other'];
const DEAL_STAGES: DealStage[] = ['negotiation', 'contract', 'filming', 'edit', 'published', 'paid'];

interface Props { event?: CalendarEvent | null; defaultDate?: string; onClose: () => void; }

export default function EventModal({ event, defaultDate, onClose }: Props) {
  const { saveEvent, deleteEvent, teamMembers } = useStore();
  const [type, setType] = useState<CalendarEvent['type']>('reminder');
  const [date, setDate] = useState(defaultDate ?? '');
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');

  // episode fields
  const [show, setShow] = useState<ShowName>('Privileged Gossip');
  const [epName, setEpName] = useState('');
  const [theme, setTheme] = useState('');
  const [stages, setStages] = useState<ProductionStage[]>([]);
  const [stagesOpen, setStagesOpen] = useState(false);

  // brand deal fields
  const [brand, setBrand] = useState('');
  const [rate, setRate] = useState('');
  const [currency, setCurrency] = useState('GBP');
  const [dealStage, setDealStage] = useState<DealStage>('negotiation');
  const [responsible, setResponsible] = useState<TeamMember | ''>('');

  // reminder fields
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!event) {
      setStages(DEFAULT_STAGES.map((s, i) => ({ ...s, id: `new-${i}` })));
      return;
    }
    setType(event.type);
    setDate(event.date);
    setTitle(event.title);
    setNotes(event.notes ?? '');
    if (event.type === 'episode') {
      setShow(event.show); setEpName(event.episodeName); setTheme(event.theme);
      setStages(event.stages);
    } else if (event.type === 'brand_deal') {
      setBrand(event.brand); setRate(String(event.rate)); setCurrency(event.currency);
      setDealStage(event.dealStage); setResponsible(event.responsible ?? '');
    } else {
      setDone(event.done); setResponsible(event.responsible ?? '');
    }
  }, [event]);

  const updateStage = (idx: number, field: keyof ProductionStage, val: string) =>
    setStages(prev => prev.map((s, i) => i === idx ? { ...s, [field]: val } : s));

  const handleSave = () => {
    const base = { id: event?.id ?? `ev-${Date.now()}`, title: title || 'Untitled', date, notes };
    let ev: CalendarEvent;
    if (type === 'episode') {
      ev = { ...base, type: 'episode', show, episodeName: epName, theme, stages, linkedDealIds: (event as EpisodeEvent)?.linkedDealIds ?? [] };
    } else if (type === 'brand_deal') {
      ev = { ...base, type: 'brand_deal', brand, rate: Number(rate), currency, dealStage, responsible: responsible || undefined };
    } else {
      ev = { ...base, type: 'reminder', done, responsible: responsible || undefined };
    }
    saveEvent(ev);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg my-8 p-6 space-y-4" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-lg">{event ? 'Edit Event' : 'New Event'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        <div className="flex gap-2">
          {(['episode', 'brand_deal', 'reminder'] as const).map(t => (
            <button key={t} onClick={() => setType(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${type === t ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {t === 'episode' ? '🎬 Episode' : t === 'brand_deal' ? '🤝 Brand Deal' : '🔔 Reminder'}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="text-xs text-gray-500 mb-1 block">Title</label>
            <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              value={title} onChange={e => setTitle(e.target.value)} placeholder="Event title" />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Date</label>
            <input type="date" className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm" value={date} onChange={e => setDate(e.target.value)} />
          </div>
        </div>

        {type === 'episode' && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Show</label>
                <select className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm" value={show} onChange={e => setShow(e.target.value as ShowName)}>
                  {SHOWS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Episode</label>
                <input className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm" value={epName} onChange={e => setEpName(e.target.value)} placeholder="S6E1" />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-gray-500 mb-1 block">Theme</label>
                <input className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm" value={theme} onChange={e => setTheme(e.target.value)} placeholder="Episode theme" />
              </div>
            </div>

            <div>
              <button className="flex items-center gap-2 text-xs text-indigo-600 hover:underline" onClick={() => setStagesOpen(o => !o)}>
                {stagesOpen ? '▲' : '▼'} Production Stages ({stages.length})
              </button>
              {stagesOpen && (
                <div className="mt-2 space-y-1 max-h-64 overflow-y-auto">
                  {stages.map((s, i) => (
                    <div key={s.id} className="grid grid-cols-[1fr_110px_110px_90px_24px] gap-1 items-center">
                      <input className="border border-gray-200 rounded px-2 py-1 text-xs" value={s.name} onChange={e => updateStage(i, 'name', e.target.value)} />
                      <input type="date" className="border border-gray-200 rounded px-1 py-1 text-xs" value={s.startDate ?? ''} onChange={e => updateStage(i, 'startDate', e.target.value)} />
                      <input type="date" className="border border-gray-200 rounded px-1 py-1 text-xs" value={s.endDate ?? ''} onChange={e => updateStage(i, 'endDate', e.target.value)} />
                      <select className="border border-gray-200 rounded px-1 py-1 text-xs" value={s.status} onChange={e => updateStage(i, 'status', e.target.value)}>
                        <option value="not_started">–</option>
                        <option value="in_progress">In prog.</option>
                        <option value="done">Done</option>
                      </select>
                      <button onClick={() => setStages(prev => prev.filter((_, j) => j !== i))} className="text-red-400 text-xs hover:text-red-600">✕</button>
                    </div>
                  ))}
                  <button onClick={() => setStages(prev => [...prev, { id: `new-${Date.now()}`, name: 'Stage', status: 'not_started' }])}
                    className="text-xs text-indigo-500 hover:underline mt-1">+ Add stage</button>
                </div>
              )}
            </div>
          </>
        )}

        {type === 'brand_deal' && (
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs text-gray-500 mb-1 block">Brand</label>
              <input className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm" value={brand} onChange={e => setBrand(e.target.value)} placeholder="Brand name" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Rate</label>
              <input type="number" className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm" value={rate} onChange={e => setRate(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Currency</label>
              <input className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm" value={currency} onChange={e => setCurrency(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Deal Stage</label>
              <select className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm" value={dealStage} onChange={e => setDealStage(e.target.value as DealStage)}>
                {DEAL_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Responsible</label>
              <select className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm" value={responsible} onChange={e => setResponsible(e.target.value as TeamMember | '')}>
                <option value="">—</option>
                {teamMembers.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
              </select>
            </div>
          </div>
        )}

        {type === 'reminder' && (
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={done} onChange={e => setDone(e.target.checked)} />
              Mark as done
            </label>
            <select className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm" value={responsible} onChange={e => setResponsible(e.target.value as TeamMember | '')}>
              <option value="">— assign —</option>
              {teamMembers.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
            </select>
          </div>
        )}

        <textarea className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300"
          rows={2} placeholder="Notes…" value={notes} onChange={e => setNotes(e.target.value)} />

        <div className="flex justify-between pt-2">
          {event ? (
            <button onClick={() => { deleteEvent(event.id); onClose(); }} className="text-red-500 text-sm hover:underline">Delete</button>
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
