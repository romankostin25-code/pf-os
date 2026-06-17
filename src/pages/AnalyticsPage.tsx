import { useStore } from '../lib/store';

const PLATFORMS = [
  {
    name: 'YouTube Studio',
    handle: '@weareprivilegedfew',
    icon: '▶',
    color: 'bg-red-50 border-red-200',
    iconColor: 'text-red-600',
    instructions: 'Connect via YouTube Analytics API. Add YOUTUBE_API_KEY to Vercel env vars.',
  },
  {
    name: 'Instagram (@weareprivilegedfew)',
    handle: '@weareprivilegedfew',
    icon: '◈',
    color: 'bg-purple-50 border-purple-200',
    iconColor: 'text-purple-600',
    instructions: 'Connect via Meta Graph API. Add IG_ACCESS_TOKEN to Vercel env vars.',
  },
  {
    name: 'Instagram (@aliyevaal)',
    handle: '@aliyevaal',
    icon: '◈',
    color: 'bg-pink-50 border-pink-200',
    iconColor: 'text-pink-600',
    instructions: 'Separate IG business account. Add ALIYEVAAL_IG_TOKEN to Vercel env vars.',
  },
];

export default function AnalyticsPage() {
  const { events, tasks } = useStore();

  const totalDeals = events.filter(e => e.type === 'brand_deal').length;
  const totalRevenue = events.filter(e => e.type === 'brand_deal').reduce((sum, e) => sum + ((e as any).rate ?? 0), 0);
  const activeTasks = tasks.filter(t => t.status !== 'done').length;
  const episodesInProd = events.filter(e => e.type === 'episode').length;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-sm text-gray-500 mt-0.5">Production overview + platform connections</p>
      </div>

      {/* Quick stats from local data */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Episodes in Production', value: episodesInProd, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Active Tasks', value: activeTasks, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Brand Deals', value: totalDeals, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Pipeline Value (£)', value: totalRevenue.toLocaleString(), color: 'text-green-600', bg: 'bg-green-50' },
        ].map(stat => (
          <div key={stat.label} className={`rounded-xl ${stat.bg} p-4`}>
            <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Platform connections */}
      <h2 className="text-sm font-semibold text-gray-700 mb-3">Platform Connections</h2>
      <div className="space-y-3 max-w-2xl">
        {PLATFORMS.map(p => (
          <div key={p.name} className={`rounded-xl border p-4 ${p.color}`}>
            <div className="flex items-center gap-3 mb-2">
              <span className={`text-xl ${p.iconColor}`}>{p.icon}</span>
              <div>
                <h3 className="font-semibold text-sm text-gray-900">{p.name}</h3>
                <p className="text-xs text-gray-500">{p.handle}</p>
              </div>
              <span className="ml-auto text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">Not connected</span>
            </div>
            <p className="text-xs text-gray-500 ml-8">{p.instructions}</p>
          </div>
        ))}
      </div>

      <p className="mt-6 text-xs text-gray-400 max-w-lg">
        Analytics dashboards (views, subscribers, engagement, revenue) will appear here once platform APIs are connected. Ask in AI Chat for analysis of your current production data.
      </p>
    </div>
  );
}
