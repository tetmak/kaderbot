import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Lock, X, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createChatService } from '@/services/chatService';
import type { ChatMessage, ChatContext } from '@/services/chatService';
import { PaywallModal } from './PaywallModal';

interface ChatBotProps {
  context: ChatContext;
  hasPremiumAccess: boolean;
  onPremiumRequired: () => void;
  initialMessage?: string;
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
}

// Konuşma animasyonu için tip
interface SpeakingState {
  isSpeaking: boolean;
  text: string;
}

export function ChatBot({ 
  context, 
  hasPremiumAccess, 
  onPremiumRequired,
  initialMessage,
  isOpen: controlledIsOpen,
  onOpenChange
}: ChatBotProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const setIsOpen = (value: boolean) => {
    setInternalIsOpen(value);
    onOpenChange?.(value);
  };
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [chatService, setChatService] = useState<ReturnType<typeof createChatService> | null>(null);
  const [hasSentInitialMessage, setHasSentInitialMessage] = useState(false);
  const [speakingState, setSpeakingState] = useState<SpeakingState>({ isSpeaking: false, text: '' });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && !chatService) {
      const service = createChatService(context);
      setChatService(service);
      setMessages(service.getMessages());
    }
  }, [isOpen, context, chatService]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current && !isLoading) {
      inputRef.current.focus();
    }
  }, [isOpen, isLoading]);

  useEffect(() => {
    if (isOpen && initialMessage && chatService && !hasSentInitialMessage) {
      setHasSentInitialMessage(true);
      handleSendMessage(initialMessage);
    }
  }, [isOpen, initialMessage, chatService, hasSentInitialMessage]);

  // Konuşma animasyonu
  const animateSpeaking = useCallback((text: string) => {
    setSpeakingState({ isSpeaking: true, text: '' });
    let index = 0;
    const interval = setInterval(() => {
      if (index <= text.length) {
        setSpeakingState({ isSpeaking: true, text: text.slice(0, index) });
        index++;
      } else {
        clearInterval(interval);
        setTimeout(() => setSpeakingState({ isSpeaking: false, text: '' }), 500);
      }
    }, 30);
    return () => clearInterval(interval);
  }, []);

  const handleSendMessage = useCallback(async (question: string) => {
    if (!question.trim() || !chatService) return;

    setIsLoading(true);
    
    try {
      const response = await chatService.askQuestion(question);
      
      if (!response || !response.content) {
        throw new Error('Boş yanıt alındı');
      }
      
      setMessages(prev => [...prev, 
        { id: `user_${Date.now()}`, role: 'user', content: question, timestamp: new Date() },
        response
      ]);
      
      // Konuşma animasyonunu başlat
      animateSpeaking(response.content);
    } catch (error) {
      console.error('Chat hatası:', error);
      const errorMessage = 'Kaderin sesini şu an duyamıyorum, ruhunu dinlendirip tekrar sor...';
      setMessages(prev => [...prev,
        { id: `user_${Date.now()}`, role: 'user', content: question, timestamp: new Date() },
        { 
          id: `error_${Date.now()}`, 
          role: 'assistant', 
          content: errorMessage, 
          timestamp: new Date() 
        }
      ]);
      animateSpeaking(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [chatService, animateSpeaking]);

  const handleSend = useCallback(() => {
    if (!inputValue.trim()) return;
    
    if (!hasPremiumAccess && chatService?.needsPayment()) {
      setShowPaywall(true);
      return;
    }
    
    handleSendMessage(inputValue);
    setInputValue('');
  }, [inputValue, chatService, hasPremiumAccess, handleSendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handlePaywallSuccess = useCallback(() => {
    setShowPaywall(false);
    onPremiumRequired();
    if (chatService) {
      chatService.purchaseUnlimitedQuestions().then(() => {
        const successMessage = 'Sınırsız soru paketin aktif! Artık kaderinle istediğin kadar konuşabilirsin.';
        setMessages(prev => [...prev, {
          id: `system_${Date.now()}`,
          role: 'assistant',
          content: successMessage,
          timestamp: new Date()
        }]);
        animateSpeaking(successMessage);
      });
    }
  }, [chatService, onPremiumRequired, animateSpeaking]);

  const getWelcomeMessage = () => {
    const { analysisType, userData } = context;
    const name = userData.firstName;
    
    if (initialMessage) {
      return `${name}, gölgenin farkına vardın... Onu nasıl bir güce dönüştüreceğimizi bilmek istiyor musun?`;
    }
    
    switch (analysisType) {
      case 'love':
        return `${name}, kalbinin derinliklerine inmeye hazır mısın?`;
      case 'wealth':
        return `${name}, servetinin anahtarını arıyorsun.`;
      default:
        return `${name}, kaderinle konuşmaya hazır mısın?`;
    }
  };

  // Chat kapalıyken gösterilecek buton
  if (!isOpen) {
    return (
      <>
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 group"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-[#D4AF37] rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity animate-pulse" />
            <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-[#D4AF37] shadow-lg shadow-[#D4AF37]/30 group-hover:scale-110 transition-transform">
              <img 
                src="/avatars/karanlik-numerolog.png" 
                alt="Karanlık Numerolog" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap">
              <span className="px-3 py-1 bg-[#0a0a0a] border border-[#D4AF37]/30 rounded-full text-[#D4AF37] text-xs font-medium">
                Kaderinle Konuş
              </span>
            </div>
          </div>
        </button>

        <PaywallModal
          isOpen={showPaywall}
          onClose={() => setShowPaywall(false)}
          onSuccess={handlePaywallSuccess}
          analysisType="chat"
        />
      </>
    );
  }

  return (
    <>
      {/* Full Screen Chat Overlay */}
      <div className="fixed inset-0 z-50 bg-black">
        {/* Falling Numbers Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute text-[#D4AF37]/10 font-bold animate-fall"
              style={{
                top: `${-10 - Math.random() * 20}%`,
                left: `${Math.random() * 100}%`,
                fontSize: `${28 + Math.random() * 36}px`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${4 + Math.random() * 4}s`,
                animationIterationCount: 'infinite'
              }}
            >
              {Math.floor(Math.random() * 9) + 1}
            </div>
          ))}
        </div>

        {/* Close Button */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-6 right-6 z-20 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors border border-[#D4AF37]/30"
        >
          <X className="w-6 h-6 text-[#D4AF37]" />
        </button>

        {/* Main Content */}
        <div className="h-full flex flex-col relative z-10">
          {/* HERO SECTION - BÜYÜK AVATAR */}
          <div className="flex-shrink-0 pt-4 pb-4 flex flex-col items-center">
            {/* DEV AVATAR */}
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute inset-0 w-48 h-48 md:w-64 md:h-64 rounded-full bg-gradient-to-r from-[#D4AF37]/40 via-purple-500/40 to-[#D4AF37]/40 blur-3xl animate-pulse" />
              
              {/* Rotating rings */}
              <div className="absolute inset-0 w-48 h-48 md:w-64 md:h-64 rounded-full border-2 border-[#D4AF37]/30 animate-spin" style={{ animationDuration: '20s' }} />
              <div className="absolute inset-0 w-48 h-48 md:w-64 md:h-64 rounded-full border border-dashed border-[#D4AF37]/20 animate-spin" style={{ animationDuration: '30s', animationDirection: 'reverse' }} />
              
              {/* Speaking animation ring */}
              {speakingState.isSpeaking && (
                <>
                  <div className="absolute inset-0 w-48 h-48 md:w-64 md:h-64 rounded-full border-4 border-[#D4AF37]/50 animate-ping" />
                  <div className="absolute inset-0 w-48 h-48 md:w-64 md:h-64 rounded-full bg-[#D4AF37]/20 animate-pulse" />
                </>
              )}
              
              {/* Main Avatar */}
              <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden border-4 border-[#D4AF37] shadow-[0_0_60px_rgba(212,175,55,0.5)]">
                <img 
                  src="/avatars/karanlik-numerolog.png" 
                  alt="Karanlık Numerolog" 
                  className={`w-full h-full object-cover transition-transform duration-300 ${speakingState.isSpeaking ? 'scale-105' : ''}`}
                />
                
                {/* Speaking overlay */}
                {speakingState.isSpeaking && (
                  <div className="absolute inset-0 bg-gradient-to-t from-[#D4AF37]/30 to-transparent" />
                )}
              </div>
              
              {/* Orbiting particles */}
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="absolute inset-0 animate-spin"
                  style={{ 
                    animationDuration: `${3 + i}s`,
                    animationDelay: `${i * 0.3}s`
                  }}
                >
                  <div 
                    className={`absolute w-4 h-4 rounded-full ${speakingState.isSpeaking ? 'bg-[#D4AF37] scale-150' : 'bg-[#D4AF37]/60'}`}
                    style={{ 
                      top: '0%',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      boxShadow: speakingState.isSpeaking ? '0 0 20px #D4AF37' : '0 0 10px #D4AF37',
                      transition: 'all 0.3s'
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Title */}
            <h2 className="mt-6 text-3xl md:text-4xl font-bold text-[#D4AF37] tracking-wider drop-shadow-[0_0_15px_rgba(212,175,55,0.5)]">
              Karanlık Numerolog
            </h2>
            
            {/* Speaking text indicator */}
            {speakingState.isSpeaking && (
              <div className="mt-4 px-6 py-3 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-2xl max-w-md mx-4">
                <p className="text-[#D4AF37]/80 text-sm text-center">
                  <span className="inline-flex gap-1">
                    <span className="w-2 h-2 bg-[#D4AF37] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-[#D4AF37] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-[#D4AF37] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                  <span className="ml-2">Konuşuyor...</span>
                </p>
              </div>
            )}
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-4 space-y-4">
            {/* Welcome Message */}
            {messages.length === 0 && (
              <div className="flex gap-3 justify-center">
                <div className="w-10 h-10 rounded-full overflow-hidden border border-[#D4AF37]/50 flex-shrink-0">
                  <img 
                    src="/avatars/karanlik-numerolog.png" 
                    alt="Karanlık Numerolog" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-2xl rounded-tl-sm p-4 max-w-lg">
                  <p className="text-[#D4AF37]/90 text-base leading-relaxed">
                    {getWelcomeMessage()}
                  </p>
                </div>
              </div>
            )}

            {/* Chat Messages */}
            {messages.map((message, index) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''} animate-fade-in-up`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {message.role === 'assistant' ? (
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-[#D4AF37]/50 flex-shrink-0">
                    <img 
                      src="/avatars/karanlik-numerolog.png" 
                      alt="Karanlık Numerolog" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-br from-[#D4AF37]/30 to-[#D4AF37]/10 rounded-full flex items-center justify-center flex-shrink-0 border border-[#D4AF37]/30">
                    <span className="text-[#D4AF37] text-lg font-bold">
                      {context.userData.firstName.charAt(0)}
                    </span>
                  </div>
                )}
                <div
                  className={`rounded-2xl p-4 max-w-lg whitespace-pre-line ${
                    message.role === 'user'
                      ? 'bg-[#D4AF37]/20 border border-[#D4AF37]/40 rounded-tr-sm'
                      : 'bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-tl-sm'
                  }`}
                >
                  <p className={`text-base leading-relaxed ${
                    message.role === 'user' ? 'text-[#D4AF37]' : 'text-[#D4AF37]/90'
                  }`}>
                    {message.content}
                  </p>
                  <p className="text-[#D4AF37]/40 text-xs mt-2">
                    {message.timestamp.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden border border-[#D4AF37]/50 flex-shrink-0">
                  <img 
                    src="/avatars/karanlik-numerolog.png" 
                    alt="Karanlık Numerolog" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-2xl rounded-tl-sm p-4">
                  <div className="flex gap-2">
                    <span className="w-3 h-3 bg-[#D4AF37] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-3 h-3 bg-[#D4AF37] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-3 h-3 bg-[#D4AF37] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            {/* Payment Lock Message */}
            {!hasPremiumAccess && chatService?.needsPayment() && (
              <div className="bg-gradient-to-r from-[#D4AF37]/20 to-[#D4AF37]/5 border border-[#D4AF37]/40 rounded-2xl p-6 text-center max-w-md mx-auto">
                <Lock className="w-8 h-8 text-[#D4AF37] mx-auto mb-3" />
                <p className="text-[#D4AF37] text-lg font-bold mb-2">
                  Sınırsız Soru Paketi
                </p>
                <p className="text-[#D4AF37]/70 text-sm mb-4">
                  Daha fazla soru sormak için paketi satın al
                </p>
                <Button
                  onClick={() => setShowPaywall(true)}
                  className="bg-gradient-to-r from-[#D4AF37] to-[#B8960C] text-black hover:opacity-90 text-base px-6 py-3"
                >
                  <Crown className="w-5 h-5 mr-2" />
                  ₺99 - Satın Al
                </Button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="flex-shrink-0 border-t border-[#D4AF37]/20 p-4 md:p-6 bg-black/80 backdrop-blur-md">
            <div className="max-w-3xl mx-auto flex gap-3">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Sayıların ne anlama geliyor?..."
                disabled={isLoading || (!hasPremiumAccess && chatService?.needsPayment())}
                className="flex-1 bg-white/5 border border-[#D4AF37]/30 rounded-xl px-5 py-4 text-[#D4AF37] placeholder:text-[#D4AF37]/40 text-base focus:outline-none focus:border-[#D4AF37] focus:shadow-[0_0_20px_rgba(212,175,55,0.2)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              />
              <Button
                onClick={handleSend}
                disabled={isLoading || !inputValue.trim() || (!hasPremiumAccess && chatService?.needsPayment())}
                className="bg-gradient-to-r from-[#D4AF37] to-[#B8960C] text-black hover:opacity-90 disabled:opacity-50 px-6 rounded-xl"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        <style>{`
          @keyframes fall {
            0% { transform: translateY(-100vh) rotate(0deg); opacity: 0; }
            10% { opacity: 0.2; }
            90% { opacity: 0.2; }
            100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
          }
          .animate-fall {
            animation-name: fall;
            animation-timing-function: linear;
          }
          @keyframes fade-in-up {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in-up {
            animation: fade-in-up 0.5s ease-out forwards;
          }
        `}</style>
      </div>

      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        onSuccess={handlePaywallSuccess}
        analysisType="chat"
      />
    </>
  );
}
