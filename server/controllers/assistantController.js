const axios = require('axios');

// Get Gemini API key from environment
const getGeminiApiKey = () => {
  return process.env.GEMINI_API_KEY;
};

// Build a prompt based on mode
const buildPrompt = (mode, message, targetLanguage, history) => {
  if (mode === 'translate') {
    return `Translate the following text to ${targetLanguage || 'English'} and return ONLY the translation without any explanation:\n\n${message}`;
  }

  // Chat mode with context
  let context = '';
  if (Array.isArray(history) && history.length > 0) {
    const trimmedHistory = history.slice(-6);
    context = trimmedHistory.map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n');
    context += '\n\n';
  }

  return `You are a helpful AI assistant for Car Sahajjo. Keep replies concise, friendly, and safe.\n\n${context}User: ${message}`;
};

// @route POST /api/assistant/chat
// @access Private
exports.chat = async (req, res) => {
  try {
    const apiKey = getGeminiApiKey();
    if (!apiKey) {
      return res.status(503).json({ message: 'AI is temporarily unavailable. Missing GEMINI_API_KEY.' });
    }

    const { message, mode = 'chat', targetLanguage = 'English', history = [] } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ message: 'Message is required.' });
    }

    const prompt = buildPrompt(mode, message, targetLanguage, history);

    // Try primary model first, fallback to lite if quota exceeded
    const models = ['gemini-2.5-flash', 'gemini-flash-lite-latest', 'gemini-2.0-flash-lite'];
    let lastError = null;

    for (const model of models) {
      try {
        // Call Google Gemini API
        const response = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            contents: [
              {
                parts: [
                  {
                    text: prompt,
                  },
                ],
              },
            ],
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        const reply = response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (!reply) {
          continue; // Try next model
        }

        return res.json({ success: true, reply, model: model });
      } catch (error) {
        lastError = error;
        // If quota exceeded, try next model
        if (error.response?.data?.error?.code === 429) {
          console.log(`Quota exceeded for ${model}, trying next model...`);
          continue;
        }
        // For other errors, break and return error
        break;
      }
    }

    // All models failed
    console.error('AI assistant error:', lastError?.response?.data || lastError?.message);
    res.status(500).json({ 
      message: 'Failed to process AI request. Please try again later.', 
      error: lastError?.response?.data?.error?.message || lastError?.message 
    });
  } catch (error) {
    console.error('AI assistant error:', error.response?.data || error.message);
    res.status(500).json({ 
      message: 'Failed to process AI request.', 
      error: error.response?.data?.error?.message || error.message 
    });
  }
};
