import { NavLink } from 'react-router-dom';

const nav = [
  {
    section: 'Planning',
    items: [
      { to: '/tasks', icon: '✓', label: 'Tasks' },
      { to: '/projects', icon: '◈', label: 'Projects' },
      { to: '/calendar', icon: '▦', label: 'Calendar' },
      { to: '/gantt', icon: '▬', label: 'Post-Prod Gantt' },
      { to: '/team', icon: '◉', label: 'Team' },
    ],
  },
  {
    section: 'Analytics',
    items: [
      { to: '/analytics', icon: '◆', label: 'Dashboards' },
      { to: '/chat', icon: '◎', label: 'AI Chat' },
    ],
  },
];

export default function NavSidebar() {
  return (
    <aside className="w-56 shrink-0 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
      <div className="px-5 py-4 border-b border-gray-100">
        <span className="font-bold text-sm tracking-widest text-gray-900 uppercase">Privileged Few</span>
        <p className="text-xs text-gray-400 mt-0.5">Production OS</p>
      </div>
      <nav className="flex-1 overflow-y-auto py-4 space-y-6">
        {nav.map(({ section, items }) => (
          <div key={section}>
            <p className="px-5 text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">{section}</p>
            {items.map(({ to, icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-5 py-2 text-sm transition-colors ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 font-medium border-r-2 border-indigo-500'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <span className="text-base">{icon}</span>
                {label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
      <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400">
        Roman · Founder
      </div>
    </aside>
  );
}
