import { useState } from 'react';
import { Sparkles, Send } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const AiChat = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! I am your AI chat assistant. Ask me anything.' },
  ]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    const updated = [...messages, { role: 'user', content: input.trim() }];
    setMessages(updated);
    setInput('');
    setLoading(true);
    try {
      const res = await api.post('/assistant/chat', {
        message: input.trim(),
        mode: 'chat',
        history: updated.slice(-8),
      });
      const reply = res.data?.reply || 'I could not generate a response.';
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'AI assistant is unavailable right now.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold dark:text-white">AI Chat</h1>
            <p className="text-gray-600 dark:text-gray-300 text-sm">Ask anything. Friendly, concise answers.</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-md overflow-hidden flex flex-col min-h-[520px]">
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-white to-indigo-50/40 dark:from-gray-800 dark:to-gray-900/40">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`max-w-3xl rounded-xl px-4 py-3 text-sm shadow-sm border ${
                  m.role === 'assistant'
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-100 dark:border-indigo-800 text-indigo-900 dark:text-indigo-50'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white'
                }`}
              >
                <p className="font-semibold text-xs mb-1">{m.role === 'assistant' ? 'Assistant' : 'You'}</p>
                <p className="leading-relaxed whitespace-pre-wrap">{m.content}</p>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
            <div className="flex gap-3 items-center">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={2}
                placeholder="Ask anything..."
                className="flex-1 resize-none rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 text-sm"
              />
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="h-10 w-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiChat;
