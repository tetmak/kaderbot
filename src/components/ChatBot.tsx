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
  onOpenChange,
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
  const [chatService, setChatService] =
    useState<ReturnType<typeof createChatService> | null>(null);
  const [hasSentInitialMessage, setHasSentInitialMessage] = useState(false);
  const [speakingState, setSpeakingState] = useState<SpeakingState>({
    isSpeaking: false,
    text: '',
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ✅ Sayfa yenilenince sohbet geçmişi temizlensin (component gövdesinde olmalı)
  useEffect(() => {
    localStorage.removeItem('km_chat_history');
    localStorage.removeItem('chatHistory');
    localStorage.removeItem('dark_chat_history');
    sessionStorage.removeItem('km_chat_history');
    sessionStorage.removeItem('chatHistory');

    setMessages([]);
    setInputValue('');
  }, []);

  // ✅ Servis init + her açılışta temiz başlangıç
  useEffect(() => {
    if (isOpen && !chatService) {
      const service = createChatService(context);
      setChatService(service);
      setMessages([]);
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

  // ⛔️ SENDE BURADA KIRIK/ARTIK KOD VAR: bunu tamamen kaldırman lazım.
  // Şu bloklar dosyada kalmış:
  //    // ❌ setMessages(service.getMessages());
  //    // ✅ her açılışta temiz başla
  //    setMessages([]);
  //  }
  // }, [isOpen, context, chatService]);
  //
  // ve ayrıca:
  // }, [isOpen, initialMessage, chatService, hasSentInitialMessage]);
  //
  // Bunlar “yarım kalmış useEffect” kalıntısı; TSX’i bozuyor.

  // --- BURADAN SONRASI SENDEKİ KODUN AYNI ŞEKİLDE DEVAM EDEBİLİR ---

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

  const handleSendMessage = useCallback(
    async (question: string) => {
      if (!question.trim() || !chatService) return;

      setIsLoading(true);

      try {
        const response = await chatService.askQuestion(question);

        if (!response || !response.content) {
          throw new Error('Boş yanıt alındı');
        }

        setMessages((prev) => [
          ...prev,
          { id: `user_${Date.now()}`, role: 'user', content: question, timestamp: new Date() },
          response,
        ]);

        animateSpeaking(response.content);
      } catch (error) {
        console.error('Chat hatası:', error);
        const errorMessage = 'Kaderin sesini şu an duyamıyorum, ruhunu dinlendirip tekrar sor...';
        setMessages((prev) => [
          ...prev,
          { id: `user_${Date.now()}`, role: 'user', content: question, timestamp: new Date() },
          { id: `error_${Date.now()}`, role: 'assistant', content: errorMessage, timestamp: new Date() },
        ]);
        animateSpeaking(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [chatService, animateSpeaking]
  );

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
        const successMessage =
          'Sınırsız soru paketin aktif! Artık kaderinle istediğin kadar konuşabilirsin.';
        setMessages((prev) => [
          ...prev,
          { id: `system_${Date.now()}`, role: 'assistant', content: successMessage, timestamp: new Date() },
        ]);
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

  // ... senin JSX return kısmın aynen devam edebilir
  // (buraya dokunmadım)
  return (
    <>
      {/* senin mevcut JSX */}
    </>
  );
}
