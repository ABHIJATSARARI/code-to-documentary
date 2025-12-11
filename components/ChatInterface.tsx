import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { createNarratorChat } from '../services/geminiService';

interface ChatInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  styleId: string;
  projectName: string;
  codebase: string;
}

interface Message {
  role: 'user' | 'model';
  text: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ isOpen, styleId, projectName, codebase }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatSessionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize chat when opened
  useEffect(() => {
    if (isOpen && !chatSessionRef.current) {
      chatSessionRef.current = createNarratorChat(codebase, projectName, styleId);
      // Add initial greeting from persona
      setMessages([{
        role: 'model',
        text: getGreeting(styleId)
      }]);
    }
    // Auto-focus input
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, codebase, projectName, styleId]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const getGreeting = (style: string) => {
    switch(style) {
      case 'nature': return "Ask me anything about the creatures we've observed today in this ecosystem.";
      case 'grumpy': return "What do you want? Make it quick, I have better things to do than explain your own code.";
      case 'hype': return "Yo! What part of this stack is absolutely blowing your mind right now? Ask away!";
      case 'noir': return "You got questions? I might have answers. But in this city, knowledge comes at a price.";
      case 'fantasy': return "Speak, traveler. What ancient lore do you seek from the scrolls of this repository?";
      default: return "How can I help you understand this code further?";
    }
  };

  const getThemeColor = () => {
     switch(styleId) {
        case 'grumpy': return 'text-amber-500 bg-amber-500';
        case 'hype': return 'text-cyan-400 bg-cyan-400';
        case 'noir': return 'text-slate-400 bg-slate-400';
        case 'fantasy': return 'text-purple-400 bg-purple-400';
        default: return 'text-green-400 bg-green-400';
     }
  };

  const themeClass = getThemeColor();
  const themeText = themeClass.split(' ')[0];
  const themeBg = themeClass.split(' ')[1];

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const result = await chatSessionRef.current.sendMessage({ message: userMsg });
      const responseText = result.text;
      setMessages(prev => [...prev, { role: 'model', text: responseText }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'model', text: "(The narrator is currently unreachable. Please try again.)" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/30 backdrop-blur-md">
      
      {/* Messages Area */}
      <div className="flex-grow overflow-y-auto p-4 space-y-6 custom-scrollbar">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
            
            {/* Avatar for Bot */}
            {msg.role === 'model' && (
              <div className={`w-8 h-8 rounded-full ${themeBg} bg-opacity-20 flex items-center justify-center mr-3 mt-1 shrink-0 border border-white/10`}>
                 <Bot size={16} className={themeText} />
              </div>
            )}

            <div className={`max-w-[85%] rounded-2xl p-4 shadow-lg ${
              msg.role === 'user' 
                ? 'bg-slate-800 text-slate-100 rounded-tr-sm border border-slate-700' 
                : 'bg-slate-950/60 text-slate-200 rounded-tl-sm border border-slate-800/50'
            }`}>
               <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
            </div>

            {/* Avatar for User */}
            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center ml-3 mt-1 shrink-0 border border-slate-700">
                 <User size={16} className="text-slate-400" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start animate-pulse">
            <div className={`w-8 h-8 rounded-full ${themeBg} bg-opacity-20 flex items-center justify-center mr-3 mt-1 shrink-0 border border-white/10`}>
                 <Bot size={16} className={themeText} />
            </div>
            <div className="bg-slate-950/60 border border-slate-800/50 rounded-2xl rounded-tl-sm p-4 flex gap-2 items-center">
               <span className={`w-1.5 h-1.5 rounded-full ${themeBg} animate-bounce`}></span>
               <span className={`w-1.5 h-1.5 rounded-full ${themeBg} animate-bounce delay-100`}></span>
               <span className={`w-1.5 h-1.5 rounded-full ${themeBg} animate-bounce delay-200`}></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-slate-950/80 border-t border-slate-800/50 backdrop-blur-xl">
        <div className="relative flex items-center group">
          <div className={`absolute inset-0 ${themeBg} opacity-0 group-focus-within:opacity-10 blur-xl transition-opacity rounded-xl`}></div>
          
          <input 
            ref={inputRef}
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={`Ask about ${projectName}...`}
            className={`
               w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-3.5 pr-12 
               text-sm text-slate-100 placeholder:text-slate-500
               focus:outline-none focus:border-${themeText.split('-')[1]}-500/50 focus:ring-1 focus:ring-${themeText.split('-')[1]}-500/50
               transition-all shadow-inner
            `}
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={`
              absolute right-2 p-2 rounded-lg transition-all
              ${!input.trim() || isLoading 
                 ? 'bg-slate-800 text-slate-600' 
                 : `${themeBg} text-slate-900 hover:scale-105 shadow-lg shadow-${themeText.split('-')[1]}-500/20`
              }
            `}
          >
            {isLoading ? <Sparkles size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </div>
        <div className="text-center mt-2">
           <span className="text-[10px] text-slate-600 uppercase tracking-widest font-mono">
              Powered by Gemini 3 Pro
           </span>
        </div>
      </div>
    </div>
  );
};