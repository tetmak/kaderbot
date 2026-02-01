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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    if (initialMessage && isOpen && messages.length === 0 && !input) {
      setInput(initialMessage);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [initialMessage, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleSendMessage = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return;

    if (!hasPremiumAccess) {
      onPremiumRequired();
      return;
    }

    // Inputu hemen temizle
    setInput('');

    const userMessage: Message = {
      role: 'user',
      content: trimmedInput,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // ÖNEMLİ: Messages state'ini kullan, userMessage'ı da ekle
      const fullChatHistory = [...messages, userMessage].map(m => ({
        role: m.role,
        content: m.content
      }));

      console.log('Sending chat history:', fullChatHistory); // Debug

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mode: context.analysisType,
          isPremium: true,
          payload: {
            firstName: context.userData.firstName || '',
            lastName: context.userData.lastName || ''
          },
          chatHistory: fullChatHistory // ÖNEMLİ: Dolu chat history
        })
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      
      console.log('API response:', data); // Debug

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
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />

      <div className="relative w-full max-w-2xl max-h-[85vh] flex flex-col bg-gradient-to-br from-[#0f0f0f] to-[#1a1a1a] rounded-2xl border border-[#D4AF37]/30 shadow-2xl shadow-[#D4AF37]/10 overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#D4AF37]/20 to-transparent border-b border-[#D4AF37]/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#F4E4BC] flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5 text-black" />
            </div>
            <div>
              <h3 className="text-lg font-cinzel font-bold text-[#D4AF37]">
                Karanlık Numerolog
              </h3>
              <p className="text-xs text-[#D4AF37]/60">
                {hasPremiumAccess ? 'Premium AI Asistan' : 'Premium Gerekli'}
              </p>
            </div>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="p-2 rounded-full hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5 text-[#D4AF37]" />
          </button>
        </div>

        {/* Messages */}
        <div 
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto p-6 space-y-4"
          style={{
            scrollBehavior: 'smooth',
            overscrollBehavior: 'contain'
          }}
        >
          {messages.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="w-32 h-32 mb-6 rounded-full bg-gradient-to-br from-[#D4AF37]/20 to-transparent flex items-center justify-center border border-[#D4AF37]/30">
                <Sparkles className="w-16 h-16 text-[#D4AF37]/50" />
              </div>
              <h4 className="text-xl font-cinzel text-[#D4AF37] mb-2">
                Karanlık Numerolog Hazır
              </h4>
              <p className="text-[#D4AF37]/60 text-sm max-w-md">
                Kaderinle ilgili sorularını sor. Her soruya derin ve kişisel yanıtlar alacaksın.
              </p>
              {!hasPremiumAccess && (
                <button
                  onClick={onPremiumRequired}
                  className="mt-6 px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#F4E4BC] text-black font-bold rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  Premium Erişim Gerekli
                </button>
              )}
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={`${message.timestamp.getTime()}-${index}`}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}
            >
              <div
                className={`max-w-[85%] px-5 py-3 rounded-2xl shadow-lg ${
                  message.role === 'user'
                    ? 'bg-gradient-to-br from-[#D4AF37] to-[#F4E4BC] text-black'
                    : 'bg-[#1a1a1a] border border-[#D4AF37]/30 text-[#D4AF37]'
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                <p className={`text-xs mt-2 ${
                  message.role === 'user' ? 'text-black/60' : 'text-[#D4AF37]/50'
                }`}>
                  {message.timestamp.toLocaleTimeString('tr-TR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start animate-fade-in-up">
              <div className="bg-[#1a1a1a] border border-[#D4AF37]/30 px-5 py-4 rounded-2xl shadow-lg">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-[#D4AF37] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-[#D4AF37] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-[#D4AF37] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="flex-shrink-0 p-6 border-t border-[#D4AF37]/20 bg-gradient-to-t from-black/40 to-transparent">
          <div className="flex gap-3">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={hasPremiumAccess ? "Kaderinle ilgili sor..." : "Premium erişim gerekli"}
              disabled={!hasPremiumAccess || isLoading}
              className="flex-1 px-5 py-3 bg-[#D4AF37]/5 border border-[#D4AF37]/30 rounded-xl text-[#D4AF37] placeholder-[#D4AF37]/40 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            />
            <button
              onClick={handleSendMessage}
              disabled={!hasPremiumAccess || isLoading || !input.trim()}
              className="px-5 py-3 bg-gradient-to-r from-[#D4AF37] to-[#F4E4BC] text-black rounded-xl hover:shadow-lg hover:shadow-[#D4AF37]/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[60px]"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          {!hasPremiumAccess && (
            <p className="text-xs text-[#D4AF37]/50 mt-3 text-center">
              Karanlık Numerolog'la sohbet etmek için premium üyelik gereklidir
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
