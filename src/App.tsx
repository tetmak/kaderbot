import { useState, useEffect, useCallback } from 'react';
import { InputForm } from '@/components/InputForm';
import { LoadingAnimation } from '@/components/LoadingAnimation';
import { AnalysisResult } from '@/components/AnalysisResult';
import { LoveCompatibilityForm } from '@/components/LoveCompatibilityForm';
import { LoveCompatibilityResult } from '@/components/LoveCompatibilityResult';
import { WealthAnalysisForm } from '@/components/WealthAnalysisForm';
import { WealthAnalysisResult } from '@/components/WealthAnalysisResult';
import { PaywallModal } from '@/components/PaywallModal';
import { ChatBot } from '@/components/ChatBot';
import { calculateNumerology } from '@/lib/numerologyEngine';
import { calculateLoveCompatibility } from '@/lib/loveCompatibilityEngine';
import { calculateWealthAnalysis } from '@/lib/wealthAnalysisEngine';
import { PurchaseService } from '@/services/purchaseService';
import type { NumerologyResult, UserData } from '@/types/numerology';
import type { PartnerData, LoveCompatibilityResult as LoveResultType } from '@/types/loveCompatibility';
import type { BusinessData, WealthAnalysisResult as WealthResultType } from '@/types/wealthAnalysis';
import { Crown, Sparkles, Moon } from 'lucide-react';

type AppMode = 'menu' | 'personal' | 'loading-personal' | 'result-personal' | 
                'love' | 'loading-love' | 'result-love' | 
                'wealth' | 'loading-wealth' | 'result-wealth';

function App() {
  const [appMode, setAppMode] = useState<AppMode>('menu');
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasPremiumAccess, setHasPremiumAccess] = useState(false);
  const [freeStatus, setFreeStatus] = useState({ remainingToday: 3, remainingMonth: 10, usedToday: 0, usedMonth: 0 });
  
  // Personal Analysis State
  const [personalResult, setPersonalResult] = useState<NumerologyResult | null>(null);
  const [userName, setUserName] = useState('');
  
  // Love Compatibility State
  const [loveResult, setLoveResult] = useState<LoveResultType | null>(null);
  const [loveUserName, setLoveUserName] = useState('');
  const [lovePartnerName, setLovePartnerName] = useState('');
  
  // Wealth Analysis State
  const [wealthResult, setWealthResult] = useState<WealthResultType | null>(null);
  const [wealthFounderName, setWealthFounderName] = useState('');
  const [wealthCompanyName, setWealthCompanyName] = useState('');
  
  // User Data for ChatBot context
  const [currentUserData, setCurrentUserData] = useState<UserData | null>(null);
  const [currentPartnerData, setCurrentPartnerData] = useState<PartnerData | null>(null);
  const [currentBusinessData, setCurrentBusinessData] = useState<BusinessData | null>(null);
  
  // ChatBot State
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [chatbotInitialMessage, setChatbotInitialMessage] = useState<string | undefined>(undefined);
  
  // Paywall State
  const [showPaywall, setShowPaywall] = useState(false);
  const [paywallAnalysisType, setPaywallAnalysisType] = useState<'personal' | 'love' | 'wealth'>('personal');
  const [onPaywallSuccess, setOnPaywallSuccess] = useState<(() => void) | null>(null);

  // ============================================
  // BAŞLATMA VE ENTITLEMENTS KONTROLÜ
  // ============================================
  
  useEffect(() => {
    const initialize = async () => {
      const userId = PurchaseService.getOrCreateUserId();
      await PurchaseService.initialize(userId);
      
      // Premium erişim kontrolü
      const hasPremium = await PurchaseService.canAccessLockedContent('personal');
      setHasPremiumAccess(hasPremium.canAccess);
      
      // Ücretsiz kullanım durumu
      const freeUsage = PurchaseService.getFreeUsageStatus();
      setFreeStatus(freeUsage);
      
      setIsInitialized(true);
    };
    
    initialize();
  }, []);
  
  // Entitlements yenileme
  const refreshEntitlements = useCallback(async () => {
    const hasPremium = await PurchaseService.canAccessLockedContent('personal');
    setHasPremiumAccess(hasPremium.canAccess);
    
    const freeUsage = PurchaseService.getFreeUsageStatus();
    setFreeStatus(freeUsage);
  }, []);

  // ============================================
  // PAYWALL YÖNETİMİ
  // ============================================
  
  const checkAccessAndShowPaywall = async (
    analysisType: 'personal' | 'love' | 'wealth',
    onSuccess: () => void
  ): Promise<boolean> => {
    const access = await PurchaseService.canAccessLockedContent(analysisType);
    
    if (access.canAccess) {
      // Erişim var, devam et
      return true;
    }
    
    // Paywall göster
    setPaywallAnalysisType(analysisType);
    setOnPaywallSuccess(() => onSuccess);
    setShowPaywall(true);
    return false;
  };
  
  const handlePaywallSuccess = async () => {
    // Önce hemen premium state'ini true yap (UI anında güncellensin)
    setHasPremiumAccess(true);
    
    // Paywall'u hemen kapat
    setShowPaywall(false);
    
    // Arka planda entitlements'i güncelle
    await refreshEntitlements();
    
    // Callback'i çağır
    if (onPaywallSuccess) {
      onPaywallSuccess();
    }
    
    // Kısa bir gecikmeyle kilitli bölüme kaydır (render tamamlansın)
    setTimeout(() => {
      const lockedSection = document.getElementById('detayli-analiz-bolumu');
      if (lockedSection) {
        lockedSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 300);
  };
  
  const handlePaywallClose = () => {
    setShowPaywall(false);
    setOnPaywallSuccess(null);
  };

  // ============================================
  // CHATBOT YÖNLENDİRMESİ
  // ============================================
  
  const handleOpenChatbot = (message: string) => {
    setChatbotInitialMessage(message);
    setIsChatbotOpen(true);
    // Chatbot'a kaydır
    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }, 100);
  };

  // ============================================
  // PERSONAL ANALYSIS HANDLERS
  // ============================================
  const handlePersonalSubmit = async (data: UserData) => {
    setUserName(`${data.firstName} ${data.lastName}`);
    setCurrentUserData(data);
    setAppMode('loading-personal');
    
    const result = calculateNumerology(data);
    setPersonalResult(result);
  };

  const handlePersonalLoadingComplete = async () => {
    setAppMode('result-personal');
    
    // Ücretsiz kullanımı kaydet
    PurchaseService.recordFreeUsage();
    await refreshEntitlements();
  };
  
  const handleRevealPersonalLocked = async () => {
    const canAccess = await checkAccessAndShowPaywall('personal', () => {
      // Başarılı satın alma sonrası yapılacaklar
      // AnalysisResult component'i içindeki state güncellenecek
    });
    
    return canAccess;
  };

  // ============================================
  // LOVE COMPATIBILITY HANDLERS
  // ============================================
  const handleLoveSubmit = async (user: PartnerData, partner: PartnerData) => {
    setLoveUserName(`${user.firstName} ${user.lastName}`);
    setLovePartnerName(`${partner.firstName} ${partner.lastName}`);
    setCurrentPartnerData(user);
    setAppMode('loading-love');
    
    const result = calculateLoveCompatibility(user, partner);
    setLoveResult(result);
  };

  const handleLoveLoadingComplete = async () => {
    setAppMode('result-love');
    PurchaseService.recordFreeUsage();
    await refreshEntitlements();
  };
  
  const handleRevealLoveLocked = async () => {
    return await checkAccessAndShowPaywall('love', () => {
      // Başarılı satın alma sonrası
    });
  };

  // ============================================
  // WEALTH ANALYSIS HANDLERS
  // ============================================
  const handleWealthSubmit = async (data: BusinessData) => {
    setWealthFounderName(`${data.founderFirstName} ${data.founderLastName}`);
    setWealthCompanyName(data.companyName);
    setCurrentBusinessData(data);
    setAppMode('loading-wealth');
    
    const result = calculateWealthAnalysis(data);
    setWealthResult(result);
  };

  const handleWealthLoadingComplete = async () => {
    setAppMode('result-wealth');
    PurchaseService.recordFreeUsage();
    await refreshEntitlements();
  };
  
  const handleRevealWealthLocked = async () => {
    return await checkAccessAndShowPaywall('wealth', () => {
      // Başarılı satın alma sonrası
    });
  };

  // ============================================
  // RESET HANDLERS
  // ============================================
  const handleReset = () => {
    setAppMode('menu');
    setPersonalResult(null);
    setLoveResult(null);
    setWealthResult(null);
    setUserName('');
    setLoveUserName('');
    setLovePartnerName('');
    setWealthFounderName('');
    setWealthCompanyName('');
    setIsChatbotOpen(false);
    setChatbotInitialMessage(undefined);
  };

  // ============================================
  // RENDER MENU - ETKİLEYİCİ GİRİŞ SAYFASI
  // ============================================
  const renderMenu = () => (
    <div className="w-full max-w-5xl mx-auto animate-fade-in-up px-4">
      {/* Header */}
      <div className="text-center mb-16">
        {/* Animated Logo - Kader Matrisi */}
        <div className="relative inline-block mb-8">
          {/* Outer glow rings */}
          <div className="absolute inset-0 w-40 h-40 -m-2 rounded-full bg-gradient-to-r from-[#D4AF37]/30 via-purple-500/30 to-[#D4AF37]/30 blur-2xl animate-pulse" />
          <div className="absolute inset-0 w-40 h-40 -m-2 rounded-full border-2 border-[#D4AF37]/30 animate-spin" style={{ animationDuration: '10s' }} />
          <div className="absolute inset-0 w-40 h-40 -m-2 rounded-full border border-dashed border-[#D4AF37]/20 animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }} />
          
          {/* Main Logo Image */}
          <div className="relative w-36 h-36 rounded-full overflow-hidden shadow-[0_0_50px_rgba(212,175,55,0.5)] animate-glow border-2 border-[#D4AF37]/50">
            <img 
              src="/avatars/kader-matrisi-logo.png" 
              alt="Kader Matrisi" 
              className="w-full h-full object-cover"
            />
            {hasPremiumAccess && (
              <div className="absolute -bottom-1 -right-1 w-10 h-10 bg-gradient-to-br from-yellow-300 to-yellow-600 rounded-full flex items-center justify-center shadow-lg animate-bounce border-2 border-black">
                <Crown className="w-5 h-5 text-black" />
              </div>
            )}
          </div>
        </div>
        
        {/* Title with glow effect */}
        <div className="relative">
          <h1 className="text-6xl md:text-7xl font-bold gold-gradient mb-4 drop-shadow-[0_0_30px_rgba(212,175,55,0.3)]">
            Kader Matrisi
          </h1>
          <div className="absolute inset-0 text-6xl md:text-7xl font-bold gold-gradient blur-xl opacity-30 -z-10">
            Kader Matrisi
          </div>
        </div>
        
        <p className="text-[#D4AF37]/70 text-xl tracking-wide max-w-xl mx-auto">
          Sayıların karanlık dehlizlerinde seni bekleyen gerçekleri keşfet
        </p>
        
        {/* Ücretsiz kullanım bilgisi */}
        {!hasPremiumAccess && (
          <div className="mt-6 inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-[#D4AF37]/10 to-purple-500/10 rounded-full border border-[#D4AF37]/20 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-[#D4AF37] animate-pulse" />
            <span className="text-[#D4AF37] text-sm font-medium">
              Bugün <span className="text-white font-bold">{freeStatus.remainingToday}</span> ücretsiz analiz hakkın kaldı
            </span>
          </div>
        )}
        
        {hasPremiumAccess && (
          <div className="mt-6 inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-yellow-500/20 via-yellow-400/20 to-yellow-500/20 rounded-full border border-yellow-400/40 backdrop-blur-sm shadow-[0_0_20px_rgba(234,179,8,0.2)]">
            <Crown className="w-5 h-5 text-yellow-400 animate-pulse" />
            <span className="text-yellow-400 text-sm font-bold">
              Premium Aktif - Sınırsız Erişim
            </span>
          </div>
        )}
      </div>

      {/* Menu Cards - Etkileyici Butonlar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Personal Analysis */}
        <button
          onClick={() => setAppMode('personal')}
          className="group relative overflow-hidden rounded-2xl p-8 transition-all duration-500 hover:scale-[1.02]"
        >
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/60 via-black/80 to-indigo-900/60" />
          <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Animated border */}
          <div className="absolute inset-0 rounded-2xl border-2 border-[#D4AF37]/30 group-hover:border-[#D4AF37]/60 transition-colors duration-500" />
          <div className="absolute inset-0 rounded-2xl border border-[#D4AF37]/10 group-hover:shadow-[0_0_30px_rgba(212,175,55,0.3)] transition-shadow duration-500" />
          
          {/* Corner decorations */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#D4AF37]/50 rounded-tl-2xl" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#D4AF37]/50 rounded-tr-2xl" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#D4AF37]/50 rounded-bl-2xl" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#D4AF37]/50 rounded-br-2xl" />
          
          {/* Content */}
          <div className="relative z-10">
            {/* Avatar Image with glow */}
            <div className="relative w-28 h-28 mx-auto mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37] to-purple-600 rounded-full blur-xl opacity-50 group-hover:opacity-80 transition-opacity duration-500 animate-pulse" />
              <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-[#D4AF37]/50 group-hover:border-[#D4AF37] group-hover:scale-110 transition-all duration-500 shadow-lg">
                <img 
                  src="/avatars/kisisel-analiz.png" 
                  alt="Kişisel Analiz" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            
            <h3 className="text-[#D4AF37] font-cinzel text-2xl font-bold mb-3 group-hover:text-white transition-colors duration-300">
              Kişisel Analiz
            </h3>
            <p className="text-[#D4AF37]/60 text-sm leading-relaxed group-hover:text-[#D4AF37]/80 transition-colors duration-300">
              Kader kodlarını, ruh güdünü ve kişisel yılını keşfet. Sayıların senin için ne fısıldıyor?
            </p>
            
            {/* Arrow indicator */}
            <div className="mt-6 flex items-center justify-center gap-2 text-[#D4AF37]/50 group-hover:text-[#D4AF37] transition-colors duration-300">
              <span className="text-xs font-medium">Analizi Başlat</span>
              <Sparkles className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
            </div>
          </div>
        </button>

        {/* Love Compatibility */}
        <button
          onClick={() => setAppMode('love')}
          className="group relative overflow-hidden rounded-2xl p-8 transition-all duration-500 hover:scale-[1.02]"
        >
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-rose-900/60 via-black/80 to-pink-900/60" />
          <div className="absolute inset-0 bg-gradient-to-br from-rose-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Animated border */}
          <div className="absolute inset-0 rounded-2xl border-2 border-rose-500/30 group-hover:border-rose-400/60 transition-colors duration-500" />
          <div className="absolute inset-0 rounded-2xl border border-rose-500/10 group-hover:shadow-[0_0_30px_rgba(244,63,94,0.3)] transition-shadow duration-500" />
          
          {/* Corner decorations */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-rose-400/50 rounded-tl-2xl" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-rose-400/50 rounded-tr-2xl" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-rose-400/50 rounded-bl-2xl" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-rose-400/50 rounded-br-2xl" />
          
          {/* Content */}
          <div className="relative z-10">
            {/* Avatar Image with glow */}
            <div className="relative w-28 h-28 mx-auto mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-rose-500 to-pink-600 rounded-full blur-xl opacity-50 group-hover:opacity-80 transition-opacity duration-500 animate-pulse" />
              <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-rose-400/50 group-hover:border-rose-400 group-hover:scale-110 transition-all duration-500 shadow-lg">
                <img 
                  src="/avatars/ask-karma.png" 
                  alt="Aşk & Karma" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            
            <h3 className="text-rose-400 font-cinzel text-2xl font-bold mb-3 group-hover:text-white transition-colors duration-300">
              Aşk & Karma
            </h3>
            <p className="text-rose-300/60 text-sm leading-relaxed group-hover:text-rose-300/80 transition-colors duration-300">
              İlişkinizin uyumunu, çatışmalarını ve karmik bağını analiz et. Aşkın gizemli kodlarını çöz.
            </p>
            
            {/* Arrow indicator */}
            <div className="mt-6 flex items-center justify-center gap-2 text-rose-400/50 group-hover:text-rose-400 transition-colors duration-300">
              <span className="text-xs font-medium">Analizi Başlat</span>
              <Sparkles className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
            </div>
          </div>
        </button>

        {/* Wealth Analysis */}
        <button
          onClick={() => setAppMode('wealth')}
          className="group relative overflow-hidden rounded-2xl p-8 transition-all duration-500 hover:scale-[1.02]"
        >
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/60 via-black/80 to-amber-900/60" />
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Animated border */}
          <div className="absolute inset-0 rounded-2xl border-2 border-emerald-500/30 group-hover:border-emerald-400/60 transition-colors duration-500" />
          <div className="absolute inset-0 rounded-2xl border border-emerald-500/10 group-hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-shadow duration-500" />
          
          {/* Corner decorations */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-emerald-400/50 rounded-tl-2xl" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-emerald-400/50 rounded-tr-2xl" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-emerald-400/50 rounded-bl-2xl" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-emerald-400/50 rounded-br-2xl" />
          
          {/* Content */}
          <div className="relative z-10">
            {/* Avatar Image with glow */}
            <div className="relative w-28 h-28 mx-auto mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-amber-500 rounded-full blur-xl opacity-50 group-hover:opacity-80 transition-opacity duration-500 animate-pulse" />
              <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-emerald-400/50 group-hover:border-emerald-400 group-hover:scale-110 transition-all duration-500 shadow-lg">
                <img 
                  src="/avatars/servet-isim.png" 
                  alt="Servet & İsim" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            
            <h3 className="text-emerald-400 font-cinzel text-2xl font-bold mb-3 group-hover:text-white transition-colors duration-300">
              Servet & İsim
            </h3>
            <p className="text-emerald-300/60 text-sm leading-relaxed group-hover:text-emerald-300/80 transition-colors duration-300">
              Şirketinin bereket kodlarını ve iflas riskini öğren. Zenginliğin anahtarını bul.
            </p>
            
            {/* Arrow indicator */}
            <div className="mt-6 flex items-center justify-center gap-2 text-emerald-400/50 group-hover:text-emerald-400 transition-colors duration-300">
              <span className="text-xs font-medium">Analizi Başlat</span>
              <Sparkles className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
            </div>
          </div>
        </button>
      </div>

      {/* Footer Quote */}
      <div className="mt-16 text-center">
        <div className="inline-block relative">
          <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/20 via-purple-500/20 to-[#D4AF37]/20 blur-xl" />
          <p className="relative text-[#D4AF37]/50 text-lg italic font-light">
            "Sayılar yalan söylemez. Sadece sen dinlemeyi unutmuş olabilirsin."
          </p>
        </div>
      </div>
    </div>
  );

  // ============================================
  // RENDER
  // ============================================
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] mystic-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#D4AF37]/30 to-[#D4AF37]/10 flex items-center justify-center mb-4 animate-pulse">
            <Moon className="w-8 h-8 text-[#D4AF37]" />
          </div>
          <p className="text-[#D4AF37]/60 text-sm">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] mystic-bg">
      {/* Background Stars */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-[#D4AF37] rounded-full animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.5 + 0.1,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-gradient-to-b from-black/80 to-transparent backdrop-blur-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button 
            onClick={handleReset}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity group"
          >
            <div className="w-8 h-8 rounded-full overflow-hidden border border-[#D4AF37]/50 group-hover:border-[#D4AF37] transition-colors shadow-[0_0_10px_rgba(212,175,55,0.3)]">
              <img 
                src="/avatars/kader-matrisi-logo.png" 
                alt="Kader Matrisi" 
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-[#D4AF37] font-cinzel font-bold tracking-wider text-lg">
              KADER MATRİSİ
            </span>
          </button>
          
          <div className="flex items-center gap-4">
            {/* Premium Badge */}
            {hasPremiumAccess ? (
              <div className="flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 rounded-full border border-yellow-500/30">
                <Crown className="w-4 h-4 text-yellow-400" />
                <span className="text-yellow-400 text-xs font-bold">Premium</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-[#D4AF37]/10 rounded-full border border-[#D4AF37]/20">
                <span className="text-[#D4AF37] text-xs font-medium">{freeStatus.remainingToday} ücretsiz</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 min-h-screen flex items-center justify-center px-4 py-20">
        {/* MENU */}
        {appMode === 'menu' && renderMenu()}

        {/* PERSONAL ANALYSIS */}
        {appMode === 'personal' && (
          <div className="w-full animate-fade-in-up">
            <InputForm onSubmit={handlePersonalSubmit} />
          </div>
        )}
        {appMode === 'loading-personal' && (
          <LoadingAnimation onComplete={handlePersonalLoadingComplete} />
        )}
        {appMode === 'result-personal' && personalResult && currentUserData && (
          <div className="w-full animate-fade-in-up">
            <AnalysisResult 
              result={personalResult} 
              userName={userName}
              hasPremiumAccess={hasPremiumAccess}
              onRevealLocked={handleRevealPersonalLocked}
              onReset={handleReset}
              onOpenChatbot={handleOpenChatbot}
            />
            <ChatBot
              context={{
                analysisType: 'personal',
                userData: {
                  firstName: currentUserData.firstName,
                  lastName: currentUserData.lastName,
                  birthDate: currentUserData.birthDate
                },
                analysisResult: personalResult
              }}
              hasPremiumAccess={hasPremiumAccess}
              onPremiumRequired={() => {
                setPaywallAnalysisType('personal');
                setShowPaywall(true);
              }}
              isOpen={isChatbotOpen}
              onOpenChange={setIsChatbotOpen}
              initialMessage={chatbotInitialMessage}
            />
          </div>
        )}

        {/* LOVE COMPATIBILITY */}
        {appMode === 'love' && (
          <div className="w-full animate-fade-in-up">
            <LoveCompatibilityForm onSubmit={handleLoveSubmit} />
          </div>
        )}
        {appMode === 'loading-love' && (
          <LoadingAnimation onComplete={handleLoveLoadingComplete} />
        )}
        {appMode === 'result-love' && loveResult && currentPartnerData && (
          <div className="w-full animate-fade-in-up">
            <LoveCompatibilityResult 
              result={loveResult}
              userName={loveUserName}
              partnerName={lovePartnerName}
              hasPremiumAccess={hasPremiumAccess}
              onRevealLocked={handleRevealLoveLocked}
              onReset={handleReset}
              onOpenChatbot={handleOpenChatbot}
            />
            <ChatBot
              context={{
                analysisType: 'love',
                userData: {
                  firstName: currentPartnerData.firstName,
                  lastName: currentPartnerData.lastName,
                  birthDate: currentPartnerData.birthDate,
                  partnerName: lovePartnerName.split(' ')[0],
                  partnerBirthDate: ''
                },
                analysisResult: loveResult
              }}
              hasPremiumAccess={hasPremiumAccess}
              onPremiumRequired={() => {
                setPaywallAnalysisType('love');
                setShowPaywall(true);
              }}
              isOpen={isChatbotOpen}
              onOpenChange={setIsChatbotOpen}
              initialMessage={chatbotInitialMessage}
            />
          </div>
        )}

        {/* WEALTH ANALYSIS */}
        {appMode === 'wealth' && (
          <div className="w-full animate-fade-in-up">
            <WealthAnalysisForm onSubmit={handleWealthSubmit} />
          </div>
        )}
        {appMode === 'loading-wealth' && (
          <LoadingAnimation onComplete={handleWealthLoadingComplete} />
        )}
        {appMode === 'result-wealth' && wealthResult && currentBusinessData && (
          <div className="w-full animate-fade-in-up">
            <WealthAnalysisResult 
              result={wealthResult}
              founderName={wealthFounderName}
              companyName={wealthCompanyName}
              hasPremiumAccess={hasPremiumAccess}
              onRevealLocked={handleRevealWealthLocked}
              onReset={handleReset}
              onOpenChatbot={handleOpenChatbot}
            />
            <ChatBot
              context={{
                analysisType: 'wealth',
                userData: {
                  firstName: currentBusinessData.founderFirstName,
                  lastName: currentBusinessData.founderLastName,
                  birthDate: currentBusinessData.founderBirthDate,
                  companyName: currentBusinessData.companyName
                },
                analysisResult: wealthResult
              }}
              hasPremiumAccess={hasPremiumAccess}
              onPremiumRequired={() => {
                setPaywallAnalysisType('wealth');
                setShowPaywall(true);
              }}
              isOpen={isChatbotOpen}
              onOpenChange={setIsChatbotOpen}
              initialMessage={chatbotInitialMessage}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 z-50 px-6 py-3">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-[#D4AF37]/20 text-xs">
            Kader Matrisi © 2026 — Sayılar yalan söylemez
          </p>
        </div>
      </footer>

      {/* Paywall Modal */}
      <PaywallModal
        isOpen={showPaywall}
        onClose={handlePaywallClose}
        onSuccess={handlePaywallSuccess}
        analysisType={paywallAnalysisType}
      />
    </div>
  );
}

export default App;
