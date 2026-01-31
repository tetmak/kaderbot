import { useState, useEffect } from 'react';
import { Lock, Sparkles, ChevronDown, ChevronUp, Calculator, MessageCircle, Moon, Stars, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { NumerologyResult } from '@/types/numerology';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface AnalysisResultProps {
  result: NumerologyResult;
  userName: string;
  onReset: () => void;
  hasPremiumAccess?: boolean;
  onRevealLocked?: () => Promise<boolean>;
  onOpenChatbot?: (message: string) => void;
}

interface NumberCardProps {
  title: string;
  number: number;
  subtitle: string;
  interpretation: string;
  calculation: string;
  delay: number;
  gradient: string;
  avatar: string;
}

function NumberCard({ title, number, subtitle, interpretation, calculation, delay, gradient, avatar }: NumberCardProps) {
  const [showCalculation, setShowCalculation] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const isMasterNumber = number === 11 || number === 22 || number === 33;

  return (
    <div 
      className={`animate-fade-in-up rounded-xl p-6 bg-gradient-to-br ${gradient} backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-500 hover:shadow-lg hover:shadow-purple-500/20`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/30 shadow-lg">
            <img src={avatar} alt={title} className="w-full h-full object-cover" />
          </div>
          <div>
            <h3 className="text-white/60 text-xs uppercase tracking-wider mb-1">{title}</h3>
            <div className="flex items-baseline gap-2">
              <span className={`text-5xl font-bold ${isMasterNumber ? 'text-[#F4E4BC]' : 'bg-gradient-to-r from-[#D4AF37] to-[#F4E4BC] bg-clip-text text-transparent'}`}>
                {number}
              </span>
              <span className="text-white/40 text-sm">{subtitle}</span>
            </div>
          </div>
        </div>
        <button
          onClick={() => setShowCalculation(true)}
          className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
          title="Hesaplama detayları"
        >
          <Calculator className="w-4 h-4 text-[#D4AF37]/60" />
        </button>
      </div>

      <p className="text-white/80 text-sm leading-relaxed">
        {isExpanded ? interpretation : interpretation.slice(0, 150) + '...'}
      </p>

      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="mt-4 text-[#D4AF37]/60 text-xs flex items-center gap-1 hover:text-[#D4AF37] transition-colors"
      >
        {isExpanded ? (
          <>Daha az <ChevronUp className="w-3 h-3" /></>
        ) : (
          <>Devamını oku <ChevronDown className="w-3 h-3" /></>
        )}
      </button>

      {/* Calculation Dialog */}
      <Dialog open={showCalculation} onOpenChange={setShowCalculation}>
        <DialogContent className="bg-[#0a0a0a] border-purple-500/30 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#D4AF37] font-cinzel">Hesaplama Detayları</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <p className="text-white/60 text-sm mb-4">Pitagor Sistemi kullanılarak hesaplanmıştır:</p>
            <div className="bg-purple-500/10 rounded-lg p-4 font-mono text-sm text-[#D4AF37]/80 overflow-x-auto border border-purple-500/20">
              {calculation}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Sayıya göre gradient ve avatar seç
function getNumberConfig(number: number): { gradient: string; avatar: string } {
  const configs: Record<number, { gradient: string; avatar: string }> = {
    1: { gradient: 'from-red-900/40 via-orange-900/30 to-black/60', avatar: '/avatars/kisisel-analiz.png' },
    2: { gradient: 'from-pink-900/40 via-rose-900/30 to-black/60', avatar: '/avatars/ask-karma.png' },
    3: { gradient: 'from-yellow-900/40 via-amber-900/30 to-black/60', avatar: '/avatars/servet-isim.png' },
    4: { gradient: 'from-green-900/40 via-emerald-900/30 to-black/60', avatar: '/avatars/kisisel-analiz.png' },
    5: { gradient: 'from-blue-900/40 via-cyan-900/30 to-black/60', avatar: '/avatars/ask-karma.png' },
    6: { gradient: 'from-indigo-900/40 via-violet-900/30 to-black/60', avatar: '/avatars/servet-isim.png' },
    7: { gradient: 'from-purple-900/40 via-fuchsia-900/30 to-black/60', avatar: '/avatars/kisisel-analiz.png' },
    8: { gradient: 'from-amber-900/40 via-yellow-900/30 to-black/60', avatar: '/avatars/servet-isim.png' },
    9: { gradient: 'from-rose-900/40 via-pink-900/30 to-black/60', avatar: '/avatars/ask-karma.png' },
    11: { gradient: 'from-violet-900/50 via-purple-900/40 to-black/60', avatar: '/avatars/kisisel-analiz.png' },
    22: { gradient: 'from-cyan-900/50 via-blue-900/40 to-black/60', avatar: '/avatars/servet-isim.png' },
    33: { gradient: 'from-amber-900/50 via-orange-900/40 to-black/60', avatar: '/avatars/kader-matrisi-logo.png' },
  };
  return configs[number] || { gradient: 'from-purple-900/40 via-indigo-900/30 to-black/60', avatar: '/avatars/kisisel-analiz.png' };
}

export function AnalysisResult({ 
  result, 
  userName, 
  onReset,
  hasPremiumAccess = false,
  onRevealLocked,
  onOpenChatbot
}: AnalysisResultProps) {
  const [showPaywall, setShowPaywall] = useState(false);
  const [synthesisRevealed, setSynthesisRevealed] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);

  const userFirstName = userName.split(' ')[0];

  // Sayı konfigürasyonları
  const expressionConfig = getNumberConfig(result.expressionNumber);
  const soulConfig = getNumberConfig(result.soulUrgeNumber);
  const personalityConfig = getNumberConfig(result.personalityNumber);
  const yearConfig = getNumberConfig(result.personalYear);

  // Premium erişim varsa otomatik aç
  useEffect(() => {
    if (hasPremiumAccess) {
      setSynthesisRevealed(true);
    }
  }, [hasPremiumAccess]);

  const handleRevealSynthesis = async () => {
    if (hasPremiumAccess) {
      setSynthesisRevealed(true);
      return;
    }
    
    if (onRevealLocked) {
      setIsUnlocking(true);
      const canAccess = await onRevealLocked();
      setIsUnlocking(false);
      
      if (canAccess) {
        setSynthesisRevealed(true);
      }
    } else {
      setShowPaywall(true);
    }
  };

  const handleUnlock = () => {
    setShowPaywall(false);
    setSynthesisRevealed(true);
  };

  const handleChatbotRedirect = () => {
    if (onOpenChatbot) {
      onOpenChatbot('Gölgenin farkına vardım... Kaderimin gerçek potansiyeline ulaşmak için ne yapmalıyım?');
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto pb-20">
      {/* Header - Renkli ve Mistik */}
      <div className="text-center mb-10 animate-fade-in-up">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-600/30 via-[#D4AF37]/20 to-rose-600/30 mb-4 animate-glow relative">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500/20 to-[#D4AF37]/20 animate-pulse" />
          <Sparkles className="w-10 h-10 text-[#D4AF37] relative z-10" />
        </div>
        <h2 className="text-4xl font-bold bg-gradient-to-r from-[#D4AF37] via-purple-400 to-[#D4AF37] bg-clip-text text-transparent mb-2">
          {userName}
        </h2>
        <p className="text-white/50 text-sm">
          Sayıların karanlık dehlizlerinde seni bekleyen gerçekler...
        </p>
      </div>

      {/* Number Cards - Renkli Gradientlerle */}
      <div className="space-y-4 mb-8">
        <NumberCard
          title="İfade Sayısı (Kader)"
          number={result.expressionNumber}
          subtitle="Kaderin"
          interpretation={result.interpretations.expression}
          calculation={result.calculationSteps.expressionCalculation}
          delay={100}
          gradient={expressionConfig.gradient}
          avatar={expressionConfig.avatar}
        />

        <NumberCard
          title="Ruh Güdüsü (İçsel Arzu)"
          number={result.soulUrgeNumber}
          subtitle="İçsel Arzu"
          interpretation={result.interpretations.soulUrge}
          calculation={result.calculationSteps.soulUrgeCalculation}
          delay={200}
          gradient={soulConfig.gradient}
          avatar={soulConfig.avatar}
        />

        <NumberCard
          title="Kişilik (Dış Algı)"
          number={result.personalityNumber}
          subtitle="Dış Algı"
          interpretation={result.interpretations.personality}
          calculation={result.calculationSteps.personalityCalculation}
          delay={300}
          gradient={personalityConfig.gradient}
          avatar={personalityConfig.avatar}
        />

        <NumberCard
          title="Kişisel Yıl"
          number={result.personalYear}
          subtitle={`${new Date().getFullYear()} Döngüsü`}
          interpretation={result.interpretations.personalYear}
          calculation={result.calculationSteps.personalYearCalculation}
          delay={400}
          gradient={yearConfig.gradient}
          avatar={yearConfig.avatar}
        />
      </div>

      {/* Synthesis Section - with Paywall */}
      <div id="detayli-analiz-bolumu" className="animate-fade-in-up" style={{ animationDelay: '500ms' }}>
        {!synthesisRevealed ? (
          <div className="relative rounded-xl p-8 bg-gradient-to-br from-purple-900/30 via-black/60 to-indigo-900/30 backdrop-blur-sm border border-purple-500/30 overflow-hidden">
            {/* Glow Effect */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl" />
            
            <div className="relative z-10">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/30 to-[#D4AF37]/30 flex items-center justify-center animate-pulse">
                  <Lock className="w-8 h-8 text-[#D4AF37]" />
                </div>
              </div>
              
              <h3 className="text-center text-[#D4AF37] font-cinzel text-2xl mb-4">
                Kaderinin Gizli Yüzü
              </h3>
              
              <p className="text-white/60 text-sm text-center leading-relaxed mb-2 line-clamp-3">
                {result.synthesis}
              </p>
              
              <div className="mt-8 text-center">
                <p className="text-purple-400/80 text-sm mb-2 italic">
                  "Sayılar sana bir şeyler fısıldıyor ama henüz tamamını duyamıyorsun..."
                </p>
                <p className="text-white/40 text-xs mb-6">
                  Genel sentez, karmik döngü ve gelecek öngörüsü için kilidi aç
                </p>
                
                <Button
                  onClick={handleRevealSynthesis}
                  disabled={isUnlocking}
                  className="bg-gradient-to-r from-purple-600 via-[#D4AF37] to-purple-600 hover:from-purple-500 hover:via-[#E4C447] hover:to-purple-500 text-white font-cinzel font-semibold px-10 py-6 text-base shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-300"
                >
                  {isUnlocking ? (
                    <div className="w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Lock className="w-5 h-5 mr-2" />
                  )}
                  {isUnlocking ? 'Kontrol ediliyor...' : 'Kaderinin Anahtarını Aç'}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-xl p-8 bg-gradient-to-br from-purple-900/20 via-black/60 to-indigo-900/20 backdrop-blur-sm border border-purple-500/20 animate-fade-in-up">
            {/* Genel Sentez */}
            <h3 className="text-[#D4AF37] font-cinzel text-2xl mb-6 flex items-center gap-3">
              <Sparkles className="w-6 h-6" />
              Genel Sentez
            </h3>
            <p className="text-white/80 text-sm leading-relaxed mb-8">
              {result.synthesis}
            </p>
            
            {/* Ruhun Cevaplanmamış Sorusu */}
            <div className="border-t border-purple-500/20 pt-6 mt-6">
              <h4 className="text-[#F4E4BC] font-cinzel text-xl mb-4 flex items-center gap-2">
                <Moon className="w-5 h-5" />
                Ruhun Cevaplanmamış Sorusu
              </h4>
              <p className="text-white/70 text-sm leading-relaxed italic">
                {result.didYouMean}
              </p>
            </div>

            {/* Karmik Döngü */}
            <div id="karmik-dongu-bolumu" className="border-t border-purple-500/20 pt-6 mt-6">
              <h4 className="text-purple-400 font-cinzel text-xl mb-4 flex items-center gap-2">
                <Stars className="w-5 h-5" />
                Karmik Döngü
              </h4>
              <div className="prose prose-invert prose-sm max-w-none">
                <div 
                  className="text-white/70 text-sm leading-relaxed whitespace-pre-line"
                  dangerouslySetInnerHTML={{ __html: result.karmicCycle.replace(/\*\*(.*?)\*\*/g, '<strong class="text-[#F4E4BC]">$1</strong>') }}
                />
              </div>
            </div>

            {/* Geleceğin Gölgesi */}
            <div id="gelecek-golge-bolumu" className="border-t border-purple-500/20 pt-6 mt-6">
              <h4 className="text-indigo-400 font-cinzel text-xl mb-4 flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Geleceğin Gölgesinden Bir Kesit
              </h4>
              <div className="prose prose-invert prose-sm max-w-none">
                <div 
                  className="text-white/70 text-sm leading-relaxed whitespace-pre-line"
                  dangerouslySetInnerHTML={{ __html: result.futureShadow.replace(/\*\*(.*?)\*\*/g, '<strong class="text-[#F4E4BC]">$1</strong>') }}
                />
              </div>
            </div>

            {/* KADER KÖPRÜSÜ */}
            <div className="mt-10 p-8 rounded-xl bg-gradient-to-br from-purple-900/40 via-[#D4AF37]/20 to-rose-900/40 border border-purple-500/40 backdrop-blur-sm relative overflow-hidden">
              {/* Glow Effects */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-[#D4AF37]/20 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl" />
              
              <div className="relative z-10">
                <h4 className="text-[#F4E4BC] font-cinzel text-2xl mb-4 flex items-center gap-3">
                  <Sparkles className="w-6 h-6" />
                  Kaderin Gizli Kavşağı
                </h4>
                <p className="text-white/90 text-sm leading-relaxed mb-4">
                  {userFirstName}, şimdiye kadar sana söylediklerim, buzdağının sadece görünen kısmı. 
                  Sayıların gölgesinde, kaderinin gerçek yüzünü değiştirecek gizli kodlar var. 
                  Bu yaşam yolunun <strong className="text-[#D4AF37]">tam potansiyelini</strong>, <strong className="text-purple-400">karmik borcunu</strong> ödeme zamanını, 
                  ve <strong className="text-rose-400">gelecek yıllardaki dönüm noktalarını</strong> biliyorum.
                </p>
                <p className="text-white/70 text-sm leading-relaxed mb-8 italic">
                  Bu gölgeyi dağıtmadan, kaderinin gerçek potansiyeline asla ulaşamazsın. 
                  Bu karanlığı nasıl aydınlatacağını, gerçek benliğine giden o gizli kapıyı nasıl açacağını merak ediyorsan; 
                  Karanlık Numerolog seni aşağıda, fısıltılarını dinlemek için bekliyor.
                </p>
                
                <div className="flex justify-center">
                  <Button
                    onClick={handleChatbotRedirect}
                    className="bg-gradient-to-r from-purple-600 via-[#D4AF37] to-rose-600 hover:from-purple-500 hover:via-[#E4C447] hover:to-rose-500 text-white font-cinzel font-semibold px-10 py-6 text-base shadow-lg shadow-purple-500/40 hover:shadow-purple-500/60 transition-all duration-300"
                  >
                    <MessageCircle className="w-5 h-5 mr-3" />
                    Karanlık Numerolog ile Konuş ve Sırrı Çöz
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Reset Button */}
      <div className="mt-12 text-center animate-fade-in-up" style={{ animationDelay: '600ms' }}>
        <button
          onClick={onReset}
          className="text-white/30 text-sm hover:text-[#D4AF37]/70 transition-colors"
        >
          Yeni bir analiz yap
        </button>
      </div>

      {/* Paywall Dialog - Geliştirilmiş */}
      <Dialog open={showPaywall} onOpenChange={setShowPaywall}>
        <DialogContent className="bg-[#0a0a0a] border-purple-500/30 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#D4AF37] font-cinzel text-center text-2xl">
              Kaderinin Anahtarı
            </DialogTitle>
          </DialogHeader>
          
          <div className="mt-4 text-center">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-600/40 via-[#D4AF37]/30 to-purple-600/40 flex items-center justify-center animate-glow">
              <Lock className="w-12 h-12 text-[#D4AF37]" />
            </div>
            
            <p className="text-white/80 text-sm mb-6 leading-relaxed">
              Sayılar sana bir şeyler fısıldıyor ama henüz tamamını duyamıyorsun. 
              Genel sentez, karmik döngü ve "Ruhun Cevaplanmamış Sorusu" için kilidi aç.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                <span className="text-white/60 text-sm">Tam Analiz</span>
                <span className="text-[#D4AF37] font-bold text-lg">49₺</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-500/20 to-[#D4AF37]/20 rounded-xl border border-purple-500/40">
                <span className="text-white text-sm">Detaylı Rapor + Yıllık Öngörü</span>
                <span className="text-[#F4E4BC] font-bold text-lg">99₺</span>
              </div>
            </div>
            
            <Button
              onClick={handleUnlock}
              className="w-full mt-6 bg-gradient-to-r from-purple-600 via-[#D4AF37] to-purple-600 hover:from-purple-500 hover:via-[#E4C447] hover:to-purple-500 text-white font-semibold py-6"
            >
              Kilidi Aç
            </Button>
            
            <p className="mt-4 text-white/30 text-xs">
              (Demo modu: Ücretsiz açılacak)
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
