import { useState, useEffect } from 'react';
import { TeamMemberRecord } from '../../lib/types';
import { useStore } from '../../lib/store';

const PRESET_COLORS = [
  '#6366f1', '#ec4899', '#10b981', '#f59e0b',
  '#3b82f6', '#ef4444', '#8b5cf6', '#06b6d4',
  '#f97316', '#84cc16',
];

interface Props {
  member?: TeamMemberRecord | null;
  onClose: () => void;
}

export default function MemberModal({ member, onClose }: Props) {
  const { saveMember, deleteMember } = useStore();
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);

  useEffect(() => {
    if (member) { setName(member.name); setRole(member.role); setColor(member.color); }
  }, [member]);

  const handleSave = () => {
    if (!name.trim()) return;
    saveMember({ id: member?.id ?? `tm-${Date.now()}`, name: name.trim(), role: role.trim(), color });
    onClose();
  };

  const handleDelete = () => {
    if (member) { deleteMember(member.id); onClose(); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 space-y-4" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-lg">{member ? 'Edit Member' : 'Add Member'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        {/* Avatar preview */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold" style={{ background: color }}>
            {name.charAt(0).toUpperCase() || '?'}
          </div>
          <div className="flex-1">
            <input
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              placeholder="Name"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>
        </div>

        <input
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          placeholder="Role (e.g. Scriptwriter)"
          value={role}
          onChange={e => setRole(e.target.value)}
        />

        <div>
          <p className="text-xs text-gray-500 mb-2">Colour</p>
          <div className="flex gap-2 flex-wrap">
            {PRESET_COLORS.map(c => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-7 h-7 rounded-full border-2 transition-transform ${color === c ? 'border-gray-800 scale-110' : 'border-transparent hover:scale-105'}`}
                style={{ background: c }}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-between pt-2">
          {member ? (
            <button onClick={handleDelete} className="text-red-500 text-sm hover:underline">Remove</button>
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
