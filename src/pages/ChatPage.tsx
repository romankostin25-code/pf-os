import AIChat from '../components/chat/AIChat';

export default function ChatPage() {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-white">
        <h1 className="text-xl font-bold text-gray-900">AI Chat</h1>
        <p className="text-xs text-gray-400 mt-0.5">Powered by Claude · has context of your tasks, episodes, and deals</p>
      </div>
      <div className="flex-1 overflow-hidden">
        <AIChat />
      </div>
    </div>
  );
}
