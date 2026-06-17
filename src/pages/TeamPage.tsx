import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../lib/store';
import { TeamMember } from '../lib/types';

const MEMBERS: { name: TeamMember; role: string; avatar: string }[] = [
  { name: 'Roman', role: 'Founder & Creative Director', avatar: 'R' },
  { name: 'Albina', role: 'Talent & Brand Partnerships', avatar: 'A' },
  { name: 'Victoria', role: 'Scriptwriter', avatar: 'V' },
  { name: 'Aliya', role: 'Graphic Designer', avatar: 'Al' },
];

const AVATAR_COLORS: Record<TeamMember, string> = {
  Roman: 'bg-indigo-500',
  Albina: 'bg-pink-500',
  Victoria: 'bg-emerald-500',
  Aliya: 'bg-amber-500',
  Other: 'bg-gray-400',
};

export default function TeamPage() {
  const { tasks, events } = useStore();

  const stats = useMemo(() => {
    return MEMBERS.map(m => {
      const memberTasks = tasks.filter(t => t.assignee === m.name);
      const active = memberTasks.filter(t => t.status !== 'done').length;
      const done = memberTasks.filter(t => t.status === 'done').length;
      const episodeStages = events
        .filter(e => e.type === 'episode')
        .flatMap(e => (e as any).stages)
        .filter((s: any) => s.responsible === m.name);
      return { ...m, active, done, total: memberTasks.length, episodeStages: episodeStages.length };
    });
  }, [tasks, events]);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Team</h1>
        <p className="text-sm text-gray-500 mt-0.5">Privileged Few crew — {MEMBERS.length} members</p>
      </div>

      <div className="grid grid-cols-2 gap-4 max-w-3xl">
        {stats.map(member => (
          <Link
            key={member.name}
            to={`/team/${member.name.toLowerCase()}`}
            className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-12 h-12 rounded-full ${AVATAR_COLORS[member.name]} flex items-center justify-center text-white font-bold text-lg`}>
                {member.avatar}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">{member.name}</h3>
                <p className="text-xs text-gray-400">{member.role}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-gray-50 rounded-lg py-2">
                <p className="text-xl font-bold text-gray-800">{member.total}</p>
                <p className="text-[10px] text-gray-400">Tasks</p>
              </div>
              <div className="bg-blue-50 rounded-lg py-2">
                <p className="text-xl font-bold text-blue-600">{member.active}</p>
                <p className="text-[10px] text-gray-400">Active</p>
              </div>
              <div className="bg-green-50 rounded-lg py-2">
                <p className="text-xl font-bold text-green-600">{member.done}</p>
                <p className="text-[10px] text-gray-400">Done</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
