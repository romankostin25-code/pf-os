import { useState, useRef, useEffect } from 'react';
import { useStore } from '../../lib/store';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

function buildContext(store: ReturnType<typeof useStore>): string {
  const activeTasks = store.tasks.filter(t => t.status !== 'done');
  const episodes = store.events.filter(e => e.type === 'episode');
  const deals = store.events.filter(e => e.type === 'brand_deal');

  return `You are the AI assistant for Privileged Few, a content production company run by Roman.
Current date: ${new Date().toISOString().split('T')[0]}

ACTIVE TASKS (${activeTasks.length}):
${activeTasks.slice(0, 20).map(t => `- [${t.status}] ${t.title}${t.assignee ? ` (${t.assignee})` : ''}${t.dueDate ? ` due ${t.dueDate}` : ''}`).join('\n')}

EPISODES IN PRODUCTION (${episodes.length}):
${episodes.map(e => {
  const ep = e as any;
  const stagesStr = ep.stages?.map((s: any) => `${s.name}:${s.status}`).join(', ') ?? '';
  return `- ${ep.episodeName} "${ep.theme}" [${ep.show}] | ${stagesStr}`;
}).join('\n')}

BRAND DEALS (${deals.length}):
${deals.map(d => { const deal = d as any; return `- ${deal.brand} £${deal.rate} [${deal.dealStage}]`; }).join('\n')}

PROJECTS: ${store.projects.map(p => p.name).join(', ')}

Help Roman with production planning, scheduling, creative decisions, and business strategy.`;
}

export default function AIChat() {
  const store = useStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    setError('');

    const userMsg: Message = { role: 'user', content: text };
    const next = [...messages, userMsg];
    setMessages(next);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next, context: buildContext(store) }),
      });
      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.content }]);
    } catch (e: any) {
      setError(e.message ?? 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 mt-16">
            <p className="text-4xl mb-3">◎</p>
            <p className="font-medium text-gray-600 mb-1">AI Production Assistant</p>
            <p className="text-sm">Ask about your schedule, tasks, episodes, or brand deals.</p>
            <div className="mt-6 flex flex-wrap gap-2 justify-center">
              {["What's overdue?", "Summarise this week", "Which episode is closest to ready?", "How's the Bybit deal going?"].map(q => (
                <button key={q} onClick={() => { setInput(q); }}
                  className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-full hover:bg-indigo-100 border border-indigo-100">
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap ${
              m.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200 text-gray-800 shadow-sm'
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-400 shadow-sm">
              Thinking…
            </div>
          </div>
        )}
        {error && (
          <div className="text-center text-red-500 text-xs bg-red-50 rounded-lg px-4 py-2">{error}</div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <div className="flex gap-2">
          <textarea
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300"
            placeholder="Ask anything about your production…"
            rows={1}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
          />
          <button
            onClick={send}
            disabled={!input.trim() || loading}
            className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </div>
        <p className="text-[10px] text-gray-400 mt-1.5 text-center">Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  );
}
