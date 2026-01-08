# Gemini API Setup Guide for AI Assistant & Translator

## ⚠️ Current Status

The Gemini API key provided appears to be **invalid or has insufficient permissions**.

## How to Get a Valid Gemini API Key

1. **Go to Google AI Studio**: https://aistudio.google.com/
2. **Sign in** with your Google account
3. **Click "Get API Key"** or go to https://aistudio.google.com/app/apikey
4. **Click "Create API Key"** → **"Create new secret key in new project"**
5. **Copy the API Key** that's generated
6. **Update the `.env` file** in `/server/.env`:
   ```
   GEMINI_API_KEY=your_new_api_key_here
   ```

## Testing the Gemini Integration

Once you have a valid API key:

```bash
cd server
npm install  # Make sure axios is installed
node test-gemini.js  # Run the test script
```

Expected output:

```
✅ Chat Response: The capital of France is Paris.
✅ Translation Response: Hola, ¿cómo estás?
✨ All tests passed! Gemini API is working correctly.
```

## How the Integration Works

### 1. **AI Chat** (`/assistant/chat`)

- Users can ask questions and get AI-powered responses
- Uses Gemini 2.0 Flash model for fast, natural responses

### 2. **Translator** (`/assistant/translate`)

- Translates text to any language
- Returns only the translated text, no explanation

### 3. **API Endpoints**

- **Chat**: `POST /api/assistant/chat`

  ```json
  {
    "message": "What is the weather?",
    "mode": "chat",
    "history": []
  }
  ```

- **Translation**: `POST /api/assistant/chat`
  ```json
  {
    "message": "Hello, how are you?",
    "mode": "translate",
    "targetLanguage": "Spanish",
    "history": []
  }
  ```

## Troubleshooting

### "API key not valid"

- The API key might be expired or have usage restrictions
- Check that you copied it correctly from https://aistudio.google.com/app/apikey
- Ensure there are no extra spaces or characters

### "Rate limit exceeded"

- Free tier has usage limits
- Wait a few hours before trying again
- Consider upgrading to a paid Google Cloud project

### "Gemini 2.0 Flash not available"

- The model might be in limited availability
- Try using `gemini-1.5-flash` instead by modifying `assistantController.js`

## Current Configuration

- **Model**: `gemini-2.0-flash` (free tier available)
- **Max Tokens**: 300 per response
- **Temperature**: 0.7 (balanced creativity)
- **Features**: Chat, Translation, Context-aware responses

## Next Steps

1. ✅ Update `.env` with a valid Gemini API key
2. ✅ Run `npm install` in server folder
3. ✅ Restart the server: `npm run start`
4. ✅ Test from the frontend: Dashboard → AI Chat or Translator
