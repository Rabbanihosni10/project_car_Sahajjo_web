import { useState } from 'react';
import { Languages, Send } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

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

const AiTranslate = () => {
  const [input, setInput] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('English');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTranslate = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setOutput('');
    try {
      const res = await api.post('/assistant/chat', {
        message: input.trim(),
        mode: 'translate',
        targetLanguage,
      });
      const reply = res.data?.reply || 'No translation available.';
      setOutput(reply);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Translator is unavailable right now.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-teal-600 text-white flex items-center justify-center">
            <Languages className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold dark:text-white">AI Translator</h1>
            <p className="text-gray-600 dark:text-gray-300 text-sm">Translate text instantly into many languages.</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-md p-4">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Source Text</p>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={8}
              placeholder="Type text to translate..."
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 text-sm"
            />

            <div className="mt-4 flex gap-3 items-center">
              <div className="flex-1">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Target Language</p>
                <select
                  value={targetLanguage}
                  onChange={(e) => setTargetLanguage(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm px-3 py-2 text-gray-800 dark:text-white"
                >
                  {languageOptions.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleTranslate}
                disabled={loading || !input.trim()}
                className="h-12 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-2 justify-center disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                Translate
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-md p-4">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Translation</p>
            <div className="min-h-[240px] rounded-xl border border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 p-3 text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
              {loading ? 'Translating…' : output || 'Translation will appear here.'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiTranslate;
