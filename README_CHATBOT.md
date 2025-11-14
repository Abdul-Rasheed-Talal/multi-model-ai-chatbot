# 🤖 AI Chatbot - Free Multi-Provider Chat Application

A modern, full-stack AI chatbot that integrates multiple FREE AI providers including Google Gemini, DeepSeek, and Groq LLaMA. Built with Next.js 15, TypeScript, and Tailwind CSS.

## ✨ Features

- 🚀 **Multiple AI Providers**: Switch between Google Gemini, DeepSeek, and Groq LLaMA
- 💬 **Real-time Streaming**: See AI responses as they're generated
- 🎨 **Modern UI**: Beautiful dark theme with smooth animations
- 📝 **Markdown Support**: Rich text formatting with code highlighting
- 💾 **Chat History**: Save and manage multiple conversations
- 📤 **Export Chats**: Download conversations as JSON files
- 🔑 **Flexible API Keys**: Set keys via environment variables or UI
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile
- ⚡ **Fast & Efficient**: Edge runtime for optimal performance

## 🎯 Supported AI Providers

### 1. Google Gemini (Free Tier)
- **Models**: Gemini 1.5 Flash, Gemini 1.5 Pro
- **Get API Key**: [https://ai.google.dev/](https://ai.google.dev/)
- **Free Quota**: Generous free tier with high rate limits
- **Best For**: General conversation, creative tasks

### 2. DeepSeek (Free Credits)
- **Models**: DeepSeek Chat
- **Get API Key**: [https://platform.deepseek.com/](https://platform.deepseek.com/)
- **Free Quota**: Free credits on signup
- **Best For**: Technical questions, coding assistance

### 3. Groq (Free High-Speed)
- **Models**: LLaMA 3.3 70B, LLaMA 3.1 70B, Mixtral 8x7B
- **Get API Key**: [https://console.groq.com/](https://console.groq.com/)
- **Free Quota**: Extremely fast inference with free tier
- **Best For**: Speed-critical applications, real-time chat

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ or Bun
- At least one API key from the providers above

### Installation

1. **Clone or navigate to your project directory**

2. **Install dependencies**
```bash
npm install
# or
bun install
```

3. **Set up API keys** (Choose one method)

**Method A: Environment Variables (Recommended for production)**
```bash
# Copy the example file
cp .env.example .env.local

# Edit .env.local and add your API keys
GEMINI_API_KEY=your_gemini_api_key_here
DEEPSEEK_API_KEY=your_deepseek_api_key_here
GROQ_API_KEY=your_groq_api_key_here
```

**Method B: UI Configuration (Recommended for testing)**
- Start the app and click the Settings icon (⚙️) in the sidebar
- Enter your API keys in the settings dialog
- Keys are stored locally in your browser's localStorage

4. **Run the development server**
```bash
npm run dev
# or
bun dev
```

5. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 Usage Guide

### Starting a Conversation
1. Select an AI provider from the sidebar (Gemini, DeepSeek, or Groq)
2. Choose a model from the dropdown
3. Type your message in the input box
4. Press Enter or click Send

### Managing Chats
- **New Chat**: Click the "New Chat" button in the sidebar
- **Switch Chats**: Click on any chat in the history to load it
- **Delete Chat**: Hover over a chat and click the trash icon
- **Export Chat**: Hover over a chat and click the download icon

### Switching Providers
- Use the Provider dropdown to switch between AI services
- Each provider has different models available
- Your conversation history is preserved when switching

### Configuring API Keys
- Click the Settings icon (⚙️) in the sidebar
- Enter API keys for any providers you want to use
- Keys are stored securely in your browser
- You can update keys at any time

## 🏗️ Architecture

### Backend (API Routes)
```
src/app/api/chat/[provider]/route.ts
```
- Dynamic API route handling multiple providers
- Streaming support for real-time responses
- Error handling with user-friendly messages
- Edge runtime for optimal performance

### Frontend Components
```
src/components/
├── ChatbotApp.tsx          # Main app container
├── ChatInterface.tsx       # Chat messages and input
├── ChatSidebar.tsx         # Provider selection and history
└── SettingsDialog.tsx      # API key configuration
```

### State Management
- React hooks for local state
- localStorage for persistence
- No external state management library needed

## 🔧 Configuration

### Available Models

**Gemini**
- `gemini-1.5-flash` (default) - Fast and efficient
- `gemini-1.5-pro` - More capable, higher quality

**DeepSeek**
- `deepseek-chat` - Optimized for conversations

**Groq**
- `llama-3.3-70b-versatile` (default) - Latest LLaMA model
- `llama-3.1-70b-versatile` - Previous version
- `mixtral-8x7b-32768` - Mixtral model with large context

### Customizing Default Models
Edit `src/components/ChatbotApp.tsx`:
```typescript
const DEFAULT_MODELS: Record<string, string> = {
  gemini: 'gemini-1.5-flash',
  deepseek: 'deepseek-chat',
  groq: 'llama-3.3-70b-versatile',
};
```

## 🎨 Styling

The app uses:
- **Tailwind CSS v4**: Utility-first styling
- **Shadcn/UI**: High-quality component library
- **Dark Theme**: Modern dark color scheme
- **Responsive Design**: Mobile-first approach

### Customizing Colors
Edit `src/app/globals.css` to modify the color scheme.

## 📝 API Response Format

All providers stream responses in the same format:
```
data: {"content": "text chunk"}
data: {"content": "more text"}
data: [DONE]
```

## 🚨 Error Handling

The app handles various error scenarios:
- Missing API keys
- Invalid API responses
- Network errors
- Rate limiting
- Invalid provider selection

All errors are displayed to users with helpful messages.

## 🔐 Security Notes

- API keys entered in the UI are stored in browser localStorage
- Keys are never sent to any server except the official AI provider APIs
- Environment variables are the recommended approach for production
- Always keep your API keys confidential

## 📦 Built With

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS v4** - Utility-first CSS framework
- **Shadcn/UI** - Component library
- **React Markdown** - Markdown rendering
- **Google Generative AI** - Gemini API client
- **OpenAI SDK** - Compatible with DeepSeek and Groq

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Credits

- Google for Gemini API
- DeepSeek for their API
- Groq for ultra-fast LLaMA inference
- Vercel for Next.js
- Shadcn for the amazing UI components

## 🆘 Troubleshooting

### "API key not configured" error
- Make sure you've entered the API key in Settings or .env.local
- Verify the key is correct and active
- Check if the provider's API service is available

### Slow responses
- Try switching to Groq (fastest provider)
- Check your internet connection
- Verify the provider's API status

### Chat history not saving
- Ensure localStorage is enabled in your browser
- Check browser console for errors
- Try clearing localStorage and starting fresh

### Streaming not working
- Verify your browser supports EventSource/ReadableStream
- Check for browser extensions blocking requests
- Try a different browser

## 📞 Support

For issues related to:
- **API Keys**: Contact the respective provider's support
- **App Issues**: Check the browser console for errors
- **Feature Requests**: Open an issue on the repository

---

**Enjoy chatting with free AI models! 🎉**
