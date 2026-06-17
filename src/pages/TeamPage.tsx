import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../lib/store';
import { TeamMemberRecord } from '../lib/types';
import MemberModal from '../components/team/MemberModal';

function MemberCard({ member, taskCount, activeCount, onEdit }: {
  member: TeamMemberRecord;
  taskCount: number;
  activeCount: number;
  onEdit: () => void;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow group relative">
      <button
        onClick={e => { e.preventDefault(); onEdit(); }}
        className="absolute top-3 right-3 text-gray-300 hover:text-gray-500 text-sm opacity-0 group-hover:opacity-100 transition-opacity"
      >
        ✎
      </button>
      <Link to={`/team/${member.name.toLowerCase()}`} className="block">
        <div className="flex items-center gap-4 mb-4">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0"
            style={{ background: member.color }}
          >
            {member.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">{member.name}</h3>
            <p className="text-xs text-gray-400">{member.role || '—'}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="bg-blue-50 rounded-lg py-2">
            <p className="text-xl font-bold text-blue-600">{activeCount}</p>
            <p className="text-[10px] text-gray-400">Active</p>
          </div>
          <div className="bg-gray-50 rounded-lg py-2">
            <p className="text-xl font-bold text-gray-600">{taskCount}</p>
            <p className="text-[10px] text-gray-400">Total tasks</p>
          </div>
        </div>
      </Link>
    </div>
  );
}

export default function TeamPage() {
  const { tasks, teamMembers } = useStore();
  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [editMember, setEditMember] = useState<TeamMemberRecord | null>(null);

  const openNew = () => { setEditMember(null); setMemberModalOpen(true); };
  const openEdit = (m: TeamMemberRecord) => { setEditMember(m); setMemberModalOpen(true); };
  const closeModal = () => setMemberModalOpen(false);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team</h1>
          <p className="text-sm text-gray-500 mt-0.5">{teamMembers.length} members</p>
        </div>
        <button
          onClick={openNew}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 transition-colors"
        >
          + Add Member
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 max-w-3xl">
        {teamMembers.map(member => {
          const memberTasks = tasks.filter(t => t.assignee === member.name);
          const active = memberTasks.filter(t => t.status !== 'done').length;
          return (
            <MemberCard
              key={member.id}
              member={member}
              taskCount={memberTasks.length}
              activeCount={active}
              onEdit={() => openEdit(member)}
            />
          );
        })}

        {teamMembers.length === 0 && (
          <div className="col-span-2 text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">◉</p>
            <p>No team members yet</p>
            <button onClick={openNew} className="mt-3 text-indigo-500 text-sm hover:underline">Add the first one</button>
          </div>
        )}
      </div>

      {memberModalOpen && (
        <MemberModal
          member={editMember}
          onClose={closeModal}
        />
      )}
    </div>
  );
}
