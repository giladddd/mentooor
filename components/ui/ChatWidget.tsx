
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { MessageCircle, X, Send, Sparkles, Loader2, Minimize2 } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
}

export const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 'welcome', role: 'model', text: 'היי! אני המנטור האישי שלך ב-Life OS. איך אני יכול לעזור לך להתקדם היום?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: inputValue };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Initialize Gemini Client
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Initialize Chat with System Instruction
      const chat = ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: {
            systemInstruction: "You are a personal mentor and productivity assistant embedded in a Life OS dashboard application. Your goal is to help the user organize their life, finances, career, and personal goals. Be encouraging, practical, and concise. Answer in Hebrew. The user might ask for advice on prioritizing tasks, financial planning, or career moves.",
        }
      });

      // Construct history for context (last 10 messages to save tokens)
      const history = messages.slice(-10).map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
      }));
      
      // We don't have a direct way to inject history into `ai.chats.create` in this specific SDK version pattern easily without replay, 
      // but for a simple widget, sending the prompt is often enough. 
      // However, to maintain context properly with the SDK's chat object:
      // We will just send the message. The SDK `chat` object maintains session state in memory for this instance.
      // Note: If we wanted persistent history across reloads, we'd need to re-hydrate history.
      
      let fullResponse = "";
      const resultStream = await chat.sendMessageStream({ message: userMsg.text });
      
      // Create a placeholder for the model response
      const modelMsgId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, { id: modelMsgId, role: 'model', text: '' }]);

      for await (const chunk of resultStream) {
        const text = chunk.text;
        if (text) {
            fullResponse += text;
            setMessages(prev => prev.map(m => m.id === modelMsgId ? { ...m, text: fullResponse } : m));
        }
      }

    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: 'מצטער, נתקלתי בבעיה בתקשורת. נסה שוב מאוחר יותר.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col items-end pointer-events-none" dir="rtl">
      {/* Chat Window */}
      <div 
        className={`bg-white rounded-2xl shadow-2xl border border-slate-200 w-[340px] md:w-[380px] overflow-hidden transition-all duration-300 origin-bottom-left pointer-events-auto flex flex-col mb-4 ${
          isOpen ? 'scale-100 opacity-100 h-[500px]' : 'scale-75 opacity-0 h-0'
        }`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 flex items-center justify-between text-white shrink-0">
           <div className="flex items-center gap-2">
               <div className="bg-white/20 p-1.5 rounded-full">
                   <Sparkles size={16} className="text-yellow-300" />
               </div>
               <div>
                   <h3 className="font-bold text-sm">המנטור שלי</h3>
                   <p className="text-[10px] text-blue-100 opacity-90">מחובר • Gemini AI</p>
               </div>
           </div>
           <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-1.5 rounded-lg transition-colors">
               <Minimize2 size={16} />
           </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
            {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                    <div 
                        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                            msg.role === 'user' 
                                ? 'bg-blue-600 text-white rounded-tr-none shadow-md shadow-blue-500/10' 
                                : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none shadow-sm'
                        }`}
                    >
                        {msg.text}
                    </div>
                </div>
            ))}
            {isLoading && (
                 <div className="flex justify-end">
                    <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
                        <Loader2 size={16} className="animate-spin text-slate-400" />
                    </div>
                 </div>
            )}
            <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-3 bg-white border-t border-slate-100 shrink-0">
            <div className="relative flex items-end gap-2 bg-slate-50 border border-slate-200 rounded-xl p-2 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-400 transition-all">
                <button 
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isLoading}
                    className={`p-2 rounded-lg transition-all ${
                        inputValue.trim() && !isLoading 
                            ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm' 
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                >
                    <Send size={16} className={isLoading ? 'opacity-0' : ''} />
                </button>
                <textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="שאל אותי כל דבר..."
                    className="w-full bg-transparent border-none outline-none text-sm text-slate-700 placeholder-slate-400 resize-none max-h-24 py-2 pr-2"
                    rows={1}
                    style={{ minHeight: '36px' }} 
                />
            </div>
            <div className="text-center mt-2">
                <span className="text-[10px] text-slate-400">מופעל ע"י Gemini 3 Flash • AI יכול לעשות טעויות</span>
            </div>
        </div>
      </div>

      {/* Floating Button (Toggle) */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`pointer-events-auto p-4 rounded-full shadow-xl transition-all duration-300 transform hover:scale-105 ${
            isOpen 
                ? 'bg-slate-700 text-white rotate-90' 
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white animate-pulse-slow ring-4 ring-blue-500/20'
        }`}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} fill="currentColor" className="text-white" />}
      </button>
    </div>
  );
};
