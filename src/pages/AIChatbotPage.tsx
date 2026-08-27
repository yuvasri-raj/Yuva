import React, { useState, useRef, useEffect } from 'react';
import {
  BotMessageSquare,
  Send,
  Sparkles,
  User,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Wheat,
  Trash2
} from 'lucide-react';
import { ChatMessage, PageId } from '../types.js';
import { useLanguage } from '../context/LanguageContext.js';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';

interface AIChatbotPageProps {
  setCurrentPage?: (page: PageId) => void;
}

const SUGGESTED_QUERIES_EN = [
  'How to manage Fall Armyworm in Maize?',
  'What is the ideal NPK fertilizer schedule for Turmeric?',
  'How can I apply for PM-KISAN 6,000 subsidy?',
  'What are the organic remedies for Tomato early blight?'
];

const SUGGESTED_QUERIES_TA = [
  'மக்காச்சோள படைப்புழு தாக்குதலை கட்டுப்படுத்துவது எப்படி?',
  'மஞ்சள் பயிருக்கு ஏற்ற உர மேலாண்மை என்ன?',
  'சொட்டு நீர் பாசன அரசு மானியம் பெறுவது எப்படி?',
  'தக்காளி இலை கருகல் நோய்க்கு இயற்கை மருந்துகள் என்ன?'
];

export const AIChatbotPage: React.FC<AIChatbotPageProps> = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'bot',
      text: language === 'ta'
        ? 'வணக்கம்! நான் உங்கள் Agro Vision AI உதவியாளர். பயிர் தேர்வு, நோயியல் மருத்துவம், உரம் கணக்கீடு மற்றும் அரசு மானியங்கள் குறித்து எதையும் கேளுங்கள்.'
        : 'Namaste! I am your Agro Vision AI Farming Assistant. Ask me anything about crop planning, plant diseases, fertilizer calculations, mandi market prices, or government schemes.',
      timestamp: new Date().toISOString()
    }
  ]);

  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      // Build conversation history format for API
      const historyPayload = messages.map(m => ({
        role: m.sender === 'user' ? 'user' : 'model',
        text: m.text
      }));

      const res = await api.sendChatMessage(query.trim(), language, historyPayload);

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: res.reply,
        timestamp: new Date().toISOString(),
        isDemo: res.isDemo
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `bot-err-${Date.now()}`,
        sender: 'bot',
        text: 'Sorry, I encountered an issue processing your agronomy query. Please try again.',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'bot',
        text: language === 'ta'
          ? 'புதிய உரையாடல் தொடங்கியது. உங்கள் விவசாய கேள்விகளைக் கேளுங்கள்.'
          : 'New session started. How can I assist your farm today?',
        timestamp: new Date().toISOString()
      }
    ]);
  };

  const promptSuggestions = language === 'ta' ? SUGGESTED_QUERIES_TA : SUGGESTED_QUERIES_EN;

  return (
    <div id="ai-chatbot-root" className="h-[calc(100vh-140px)] flex flex-col bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Sleek Header */}
      <div className="p-4 sm:p-5 bg-white border-b border-slate-100 text-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
            <BotMessageSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-slate-800">
                {t.chatbot.title}
              </h2>
              <span className="text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200/60 px-2 py-0.5 rounded-full">
                Gemini 2.5 Live
              </span>
            </div>
            <p className="text-xs text-slate-500">{t.chatbot.subtitle}</p>
          </div>
        </div>

        <button
          onClick={handleClearChat}
          className="p-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all"
          title="Reset conversation"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>

      {/* Suggested Prompt Chips */}
      <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 overflow-x-auto flex items-center gap-2 shrink-0">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 shrink-0">
          <Sparkles className="w-3 h-3 text-emerald-600" />
          <span>{language === 'ta' ? 'கேள்விகள்:' : 'Quick Prompts:'}</span>
        </span>
        {promptSuggestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(q)}
            className="px-3 py-1 rounded-xl bg-white border border-slate-200/80 hover:border-emerald-500 hover:bg-emerald-50 text-[11px] font-semibold text-slate-700 whitespace-nowrap shadow-2xs transition-all shrink-0"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50/50">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${
              msg.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.sender === 'bot' && (
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-1 shadow-xs">
                <BotMessageSquare className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[85%] sm:max-w-xl rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-xs ${
                msg.sender === 'user'
                  ? 'bg-emerald-600 text-white rounded-tr-xs'
                  : 'bg-white text-slate-800 border border-slate-100 rounded-tl-xs'
              }`}
            >
              <p className="whitespace-pre-line">{msg.text}</p>

              <div className={`mt-2 flex items-center justify-between text-[10px] ${msg.sender === 'user' ? 'text-emerald-100' : 'text-slate-400'}`}>
                <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                {msg.isDemo !== undefined && (
                  <span className={msg.isDemo ? 'text-amber-600' : 'text-emerald-600'}>
                    {msg.isDemo ? 'Knowledge Base Fallback' : 'Gemini AI Verified'}
                  </span>
                )}
              </div>
            </div>

            {msg.sender === 'user' && (
              <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 mt-1 shadow-xs font-bold text-xs">
                {user?.name ? user.name.charAt(0) : <User className="w-4 h-4" />}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-start gap-3 justify-start">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-1 shadow-xs">
              <BotMessageSquare className="w-4 h-4" />
            </div>
            <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-xs p-4 text-xs text-slate-600 flex items-center gap-2 shadow-xs">
              <RefreshCw className="w-4 h-4 text-emerald-600 animate-spin" />
              <span>{language === 'ta' ? 'Agro AI பதில் தயாரிக்கிறது...' : 'Agro AI is formulating agronomy advice...'}</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="p-4 bg-white border-t border-slate-100 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            id="chatbot-query-input"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={t.chatbot.placeholder}
            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-xs sm:text-sm bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-800"
          />

          <button
            type="submit"
            id="btn-send-chat"
            disabled={!inputText.trim() || loading}
            className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-xs flex items-center gap-1.5 transition-all"
          >
            <span>{t.chatbot.sendBtn}</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
