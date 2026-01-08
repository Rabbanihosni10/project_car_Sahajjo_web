import { useState } from 'react';
import { Sparkles, Languages, Send } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const modeOptions = [
  { value: 'chat', label: 'AI Chat' },
  { value: 'translate', label: 'Translator' },
];

const languageOptions = [
  'English',
  'Bangla',
  'Hindi',
  'Arabic',
  'French',
  'Spanish',
  'German',
  'Chinese',
];

const AiAssistant = () => {
  const [mode, setMode] = useState('chat');
  const [targetLanguage, setTargetLanguage] = useState('English');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! I am your AI assistant. Ask me anything or choose translator mode.' },
  ]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    const nextMessages = [...messages, { role: 'user', content: input.trim() }];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/assistant/chat', {
        message: input.trim(),
        mode,
        targetLanguage,
        history: nextMessages.slice(-6),
      });
      const reply = res.data?.reply || 'I could not generate a response.';
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      console.error(err);
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
            <h1 className="text-2xl font-bold dark:text-white">AI Assistant</h1>
            <p className="text-gray-600 dark:text-gray-300 text-sm">Ask anything or translate text instantly.</p>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <div className="md:col-span-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Mode</p>
            <div className="flex gap-2">
              {modeOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setMode(opt.value)}
                  className={`flex-1 px-3 py-2 rounded-lg border text-sm transition-all ${
                    mode === opt.value
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Languages className="w-4 h-4 text-indigo-600" />
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Target Language (for translate)</p>
            </div>
            <select
              value={targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value)}
              className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm px-3 py-2 text-gray-800 dark:text-white"
              disabled={mode !== 'translate'}
            >
              {languageOptions.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
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
            {messages.length === 0 && (
              <div className="text-center text-gray-500 dark:text-gray-400 text-sm">Start chatting...</div>
            )}
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
            <div className="flex gap-3 items-center">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={2}
                placeholder={mode === 'translate' ? 'Type text to translate...' : 'Ask anything...'}
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
            {mode === 'translate' && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Translation mode returns only translated text.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiAssistant;
