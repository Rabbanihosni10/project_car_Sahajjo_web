const axios = require('axios');
require('dotenv').config();

const testGeminiAPI = async () => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error('❌ GEMINI_API_KEY not found in .env');
      return;
    }

    console.log('🔍 Testing Gemini API with key:', apiKey.slice(0, 20) + '...');

    // Test 1: Simple chat
    console.log('\n📝 Test 1: Simple Chat');
    const chatResponse = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        contents: [
          {
            parts: [
              {
                text: 'Hello! What is the capital of France?',
              },
            ],
          },
        ],
      }
    );

    const chatReply = chatResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    console.log('✅ Chat Response:', chatReply);

    // Test 2: Translation
    console.log('\n🌐 Test 2: Translation');
    const translateResponse = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        contents: [
          {
            parts: [
              {
                text: 'Translate the following text to Spanish and return ONLY the translation:\n\nHello, how are you?',
              },
            ],
          },
        ],
      }
    );

    const translateReply = translateResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    console.log('✅ Translation Response:', translateReply);

    console.log('\n✨ All tests passed! Gemini API is working correctly.');
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
};

testGeminiAPI();
