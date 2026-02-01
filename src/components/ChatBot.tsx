import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Lock, Sparkles } from 'lucide-react';

interface ChatBotProps {
  context: {
    analysisType: 'personal' | 'love' | 'wealth';
    userData: any;
    analysisResult: any;
  };
  hasPremiumAccess: boolean;
  onPremiumRequired: () => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  initialMessage?: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function ChatBot({
  context,
  hasPremiumAccess,
  onPremiumRequired,
  isOpen,
  onOpenChange,
  initialMessage
}: ChatBotProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (initialMessage && isOpen && !hasStarted) {
      setInput(initialMessage);
      setHasStarted(true);
    }
  }, [initialMessage, isOpen, hasStarted]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    // Premium kontrolü
    if (!hasPremiumAccess) {
      onPremiumRequired();
      return;
    }

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // API çağrısı - analyze.js endpoint'ini kullan
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mode: context.analysisType,
          payload: {
            ...context.userData,
            analysisResult: context.analysisResult
          },
          chatHistory: messages.map(m => ({
            role: m.role,
            content: m.content
          }))
        })
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.content || 'Bir hata oluştu. Lütfen tekrar deneyin.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Üzgünüm, şu anda yanıt veremiyorum. Lütfen daha sonra tekrar deneyin.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => onOpenChange(true)}
        className="fixed bottom-6 right-6 z-50 p-4 bg-gradient-to-br from-[#D4AF37] to-[#F4E4BC] text-black rounded-full shadow-lg hover:shadow-xl hover:shadow-[#D4AF37]/30 transition-all hover:scale-110 group"
        aria-label="Karanlık Numerolog AI"
      >
        <MessageCircle className="w-6 h-6 group-hover:rotate-12 transition-transform" />
        {!hasPremiumAccess && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
            <Lock className="w-3 h-3 text-white" />
          </div>
        )}
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-full max-w-md">
      <div className="bg-gradient-to-br from-[#0f0f0f] to-[#1a1a1a] rounded-2xl border border-[#D4AF37]/30 shadow-2xl shadow-[#D4AF37]/10 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#D4AF37]/20 to-transparent border-b border-[#D4AF37]/20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#F4E4BC] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-black" />
            </div>
            <div>
              <h3 className="text-sm font-cinzel font-bold text-[#D4AF37]">
                Karanlık Numerolog
              </h3>
              <p className="text-xs text-[#D4AF37]/60">
                {hasPremiumAccess ? 'Premium AI' : 'Premium Gerekli'}
              </p>
            </div>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="p-1 rounded-full hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5 text-[#D4AF37]" />
          </button>
        </div>

        {/* Messages */}
        <div className="h-96 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-[#D4AF37]/30 scrollbar-track-transparent">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <Sparkles className="w-12 h-12 text-[#D4AF37]/30 mx-auto mb-4" />
              <p className="text-[#D4AF37]/60 text-sm">
                Karanlık Numerolog ile sohbete başla...
              </p>
              {!hasPremiumAccess && (
                <button
                  onClick={onPremiumRequired}
                  className="mt-4 px-4 py-2 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-lg text-[#D4AF37] text-sm hover:bg-[#D4AF37]/20 transition-colors"
                >
                  <Lock className="w-4 h-4 inline mr-2" />
                  Premium Erişim Gerekli
                </button>
              )}
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] px-4 py-2 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-gradient-to-br from-[#D4AF37] to-[#F4E4BC] text-black'
                    : 'bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[#D4AF37]'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <p className="text-xs opacity-60 mt-1">
                  {message.timestamp.toLocaleTimeString('tr-TR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-[#D4AF37]/10 border border-[#D4AF37]/20 px-4 py-2 rounded-lg">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-[#D4AF37] rounded-full animate-pulse" />
                  <div className="w-2 h-2 bg-[#D4AF37] rounded-full animate-pulse delay-100" />
                  <div className="w-2 h-2 bg-[#D4AF37] rounded-full animate-pulse delay-200" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-[#D4AF37]/20">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={hasPremiumAccess ? "Sorunu sor..." : "Premium erişim gerekli"}
              disabled={!hasPremiumAccess || isLoading}
              className="flex-1 px-4 py-2 bg-[#D4AF37]/5 border border-[#D4AF37]/30 rounded-lg text-[#D4AF37] placeholder-[#D4AF37]/40 focus:outline-none focus:border-[#D4AF37] disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              onClick={handleSendMessage}
              disabled={!hasPremiumAccess || isLoading || !input.trim()}
              className="px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#F4E4BC] text-black rounded-lg hover:shadow-lg hover:shadow-[#D4AF37]/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
