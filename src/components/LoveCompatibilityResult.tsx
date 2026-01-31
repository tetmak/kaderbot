import { useState, useEffect } from 'react';
import { Lock, Heart, AlertTriangle, Sparkles, TrendingUp, Users, Flame, RefreshCw, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { PaywallModal } from './PaywallModal';
import type { LoveCompatibilityResult as ResultType } from '@/types/loveCompatibility';
import { RiskLevelColors } from '@/types/loveCompatibility';

interface LoveCompatibilityResultProps {
  result: ResultType;
  userName: string;
  partnerName: string;
  onReset: () => void;
  hasPremiumAccess?: boolean;
  onRevealLocked?: () => Promise<boolean>;
  onOpenChatbot?: (initialMessage: string) => void;
}

function ScoreCard({ 
  title, 
  score, 
  avatar, 
  color 
}: { 
  title: string; 
  score: number; 
  avatar: string;
  color: string;
}) {
  return (
    <div className="gold-border rounded-lg p-4 bg-black/40 backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 rounded-full overflow-hidden border border-white/20">
          <img src={avatar} alt={title} className="w-full h-full object-cover" />
        </div>
        <span className="text-[#D4AF37]/60 text-xs uppercase tracking-wider">{title}</span>
      </div>
      <div className="flex items-end gap-2">
        <span className="text-3xl font-bold" style={{ color }}>{score}%</span>
      </div>
      <Progress 
        value={score} 
        className="mt-2 h-1.5 bg-white/10"
      />
    </div>
  );
}

// Fallback içerik - API yanıt vermezse gösterilecek
const FALLBACK_LOCKED_CONTENT = {
  breakupRisk: `**Ayrılık Riski Analizi**

Sayılarınız arasındaki bu gizli gerilim, ilişkinizin kırılgan noktalarını işaret ediyor. Ruh güdüleriniz arasındaki fark, bazen birbirinizi anlamakta zorlanmanıza neden olabilir. Özellikle stresli dönemlerde, bu fark daha belirgin hissedilecek.

Ancak unutma: Ayrılık riski sadece bir uyarıdır, bir kader değil. Sayılar sana bir yol haritası sunuyor, sonunu yazmıyor. Eğer bu çatışma alanlarını bilinçli olarak fark ederseniz, ilişkinizi güçlendirmek için adımlar atabilirsiniz.

Önümüzdeki 6 ay kritik. Özellikle doğum günlerinize yakın dönemlerde hassas olabilirsiniz. Bu dönemlerde sabırlı olmak, birbirinize alan tanımak önemli.`,
  
  karmicDebt: `**Karmik Borç Analizi**

İkinizin de sayılarında belirgin bir karmik imza var. Bu, ruhlarınızın bir önceki hayatta da karşılaşmış olabileceğini gösteriyor. Belki de o hayatta tamamlanmamış bir hikaye vardı ve şimdi bu hayatta tamamlamanız gerekiyor.

Karmik borçlar, ceza değil, öğrenme fırsatlarıdır. İlişkinizde tekrar eden desenler varsa - aynı konularda tartışıyorsanız, aynı durumlar karşınıza çıkıyorsa - bu, henüz öğrenilmemiş bir dersin işareti olabilir.

"Ne ekersen onu biçersin" yasası burada devreye giriyor. Geçmişte ne yaşandıysa, şimdi dengeyi kurma şansınız var. Bu borcu ödemek için empati, sabır ve birbirinizi gerçekten anlamaya çalışmak gerekiyor.`,
  
  futurePrediction: `**Gelecek Öngörüsü**

Sayılarınız birlikteyken, önümüzdeki 2 yıl için önemli dönüm noktaları görünüyor. İlişkinizin derinleşeceği, ama aynı zamanda test edileceği dönemler olacak.

Özellikle bir sonraki yılın başlarında, ilişkinizin seyrini değiştirebilecek bir kararla karşılaşabilirsiniz. Bu karar, sizi birbirinize daha çok bağlayabilir veya ayrı yönlere çekebilir. Ama unutma: Seçim sizin.

Eğer bu süreci bilinçli olarak yaşarsanız, ilişkiniz daha da güçlenecek. Sayılar size potansiyeli gösteriyor, ama o potansiyeli gerçekleştirmek sizin elinizde. Kaderin size sunduğu bu fırsatı değerlendirmeye hazır mısınız?`
};

// ÜCRETSİZ KISIM - Uzun, edebi, sarsıcı metinler
function generateFreeContent(result: ResultType, userName: string, partnerName: string) {
  const userFirstName = userName.split(' ')[0];
  const partnerFirstName = partnerName.split(' ')[0];
  
  // Ruh Bağlantısı metni
  const soulConnectionText = result.soulConnection >= 80 
    ? `${userFirstName} ve ${partnerFirstName}... İki ruh, iki titreşim, iki kader. Sayılarınız bir araya geldiğinde ortaya çıkan bu uyum, sıradan bir tesadüf değil. Ruh güdüleriniz arasındaki bu derin rezonans, sizin birbirinizi 'tanıdığınızı' gösteriyor. Belki de bin yıl önce, başka bir hayatta, başka bir coğrafyada karşılaştınız. O zamandan kalan bir söz, bir bakış, bir dokunuş hala ruhlarınızda yankılanıyor.

Ama unutma: Yüksek uyum, kolay bir ilişki demek değildir. Tam tersine, derin bağlar bazen en derin yaraları da açar. Çünkü birbirinizi o kadar iyi tanıyorsunuz ki, nereden vuracağınızı da biliyorsunuz. Bu güç, birbirinizi şifalandırmak için de, incitmek için de kullanılabilir.

Ruhlarınızın bu dansı, size ne anlatıyor? Belki de zamanın ötesinde bir söz verdiniz birbirinize. Şimdi o sözü tutma zamanı.`
    : result.soulConnection >= 60
    ? `${userFirstName} ve ${partnerFirstName}... Ruhlarınız arasında bir çekim var, bu kesin. Ama bu çekim, her zaman uyumlu bir dansa dönüşmüyor. Ruh güdüleriniz arasındaki bu fark, bazen birbirinizi anlamakta zorlanmanıza neden oluyor. Biriz çok verirken, diğeri almayı bilmiyor. Ya da biriz çok konuşurken, diğeri suskunluğu tercih ediyor.

Bu fark, bir sorun değil, bir fırsat. Çünkü farklılıklar, birbirinizi tamamlamanızı sağlar. Ama bu tamamlanma için önce birbirinizin dilini öğrenmeniz gerekiyor. Ruhunuzun fısıldadıklarını, partnerinizin duyabileceği bir dile çevirmek zorundasınız.

Ruhlarınızın bu sessiz konuşmasını duymaya hazır mısınız?`
    : `${userFirstName} ve ${partnerFirstName}... Ruhlarınız arasında bir mesafe var. Bu mesafe, fiziksel değil, enerjisel. Ruh güdülerinizin bu farklılığı, bazen birbirinizi yabancı gibi hissetmenize neden oluyor. Biriz Mars'ta yaşarken, diğeri Venüs'te. İkiniz de aynı dili konuşuyorsunuz ama farklı aksanlarla.

Ama bu mesafe, aşılamaz değil. Çünkü en güçlü bağlar, bazen en farklı ruhlar arasında kurulur. Farklılık, merakı doğurur. Merak, ilgiyi. İlgi, sevgiyi. Bu zinciri kırmak mı yoksa güçlendirmek mi istediğiniz, sizin seçiminiz.

Ruhlarınızın bu mesafesini bir köprüye mi, yoksa bir duvara mı dönüştüreceksiniz?`;

  // Kader Uyumu metni
  const destinyText = result.destinyAlignment >= 80
    ? `Kader çizgileriniz kesişiyor. Bu kesişme, tesadüf değil, kaderin bir oyunu. İfade sayılarınızın bu uyumu, dünyevi hedeflerinizin, hayallerinizin, yolculuklarınızın birbiriyle örtüştüğünü gösteriyor. Biriz zirveye tırmanırken, diğeri de aynı zirveyi hedefliyor.

Ama aynı zirveye tırmanmak, aynı zirvede yaşamak demek değildir. Zirveye ulaştığınızda, orada nasıl bir hayat kuracağınız, kaderinizin gerçek sınavı olacak. Çünkü başarmak kolaydır, başarıyı sürdürmek zordur.

Kaderinizin bu kesişme noktasında, birbirinize ne söz verdiniz? Bu sözü tutmak için ne kadar ileri gidersiniz?`
    : result.destinyAlignment >= 60
    ? `Kader çizgileriniz paralel görünüyor ama aynı yolda değilsiniz. İfade sayılarınızın bu orta seviye uyumu, bazen aynı yöne baktığınızı ama farklı rotalar izlediğinizi gösteriyor. Biriz sağdan giderken, diğeri soldan. Hedef aynı ama yöntemler farklı.

Bu paralellik, bir arada yürümenizi sağlar ama aynı adımları atmanızı değil. Ve bazen, paralel yollar birbirinden o kadar uzaklaşır ki, artık aynı hedefi göremez hale gelirsiniz.

Kaderinizin bu paralel çizgilerini birleştirmek mi, yoksa ayrı yollara sapmak mı istediğiniz, önümüzdeki aylarda belli olacak.`
    : `Kader çizgileriniz çarpışıyor. Bu çarpışma, her zaman kötü değildir. Ateşle çeliğin çarpışmasından kıvılcımlar çıkar. İfade sayılarınızın bu düşük uyumu, farklı dünyalarda yaşadığınızı gösteriyor. Biriz güneşin doğuşunu beklerken, diğeri batışını izliyor.

Bu çarpışma, ya sizi birbirinizden uzaklaştıracak ya da en güçlü bağları oluşturacak. Çünkü zıt kutuplar birbirini çeker. Ama bu çekim, sürdürülebilir mi? Zaman gösterecek.

Kaderinizin bu çarpışmasını bir savaşa mı, yoksa bir dansa mı dönüştüreceksiniz?`;

  // Fiziksel Çekim metni
  const chemistryText = result.physicalChemistry >= 80
    ? `Bedenlerinizin dili, sözlerinizden daha net konuşuyor. Yaşam yollarınızın bu manyetik uyumu, fiziksel çekiminizi güçlü kılıyor. Birbirinize yaklaştığınızda hava değişiyor, elektriklenme hissediliyor. Bu kimyasal reaksiyon, açıklanamaz ama hissedilir.

Ama bedenlerin dansı, ruhların dansından ayrı değildir. Fiziksel çekim, duygusal bağlılık olmadan sönükleşir. Ateşi yakmak kolaydır, alevi canlı tutmak zordur.

Bedenlerinizin bu dansını, ruhlarınızın şarkısıyla birleştirebilecek misiniz?`
    : result.physicalChemistry >= 60
    ? `Bedenleriniz arasında bir çekim var ama bu çekim, her zaman alev almıyor. Yaşam yollarınızın bu orta seviye uyumu, fiziksel yakınlığın zamanla gelişebileceğini gösteriyor. İlk görüşte ateş değil, yavaş yanan bir mum gibi.

Ama yavaş yanan ateş, en uzun süre dayananıdır. Acele etmeyin, zamanınız var. Bedenlerin tanışması, ruhların tanışmasından sonra gelir.

Bedenlerinizin bu yavaş dansını sabırla mı, yoksa aceleyle mi izleyeceksiniz?`
    : `Bedenleriniz arasında bir mesafe var. Bu mesafe, fiziksel değil, enerjisel. Yaşam yollarınızın bu düşük uyumu, fiziksel çekimin zorlandığını gösteriyor. Biriz ateşken, diğeri su. Birbirinizi söndürmekten korkuyorsunuz.

Ama ateş ve su bir araya geldiğinde buhar oluşur. Buhar, hem ateşin hem suyun ruhudur. Belki de sizin çekiminiz, geleneksel anlamda değil, başka bir boyutta yaşanıyor.

Bedenlerinizin bu mesafesini bir ayrılık mı, yoksa farklı bir birliktelik mi olarak göreceksiniz?`;

  return { soulConnectionText, destinyText, chemistryText };
}

export function LoveCompatibilityResult({ 
  result, 
  userName, 
  partnerName, 
  onReset,
  hasPremiumAccess = false,
  onRevealLocked,
  onOpenChatbot
}: LoveCompatibilityResultProps) {
  const [showPaywall, setShowPaywall] = useState(false);
  const [lockedRevealed, setLockedRevealed] = useState(hasPremiumAccess);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [unlockError, setUnlockError] = useState<string | null>(null);
  
  const userFirstName = userName.split(' ')[0];
  
  // Ücretsiz içerik metinleri
  const freeContent = generateFreeContent(result, userName, partnerName);
  
  // Premium erişimi değiştiğinde state'i güncelle
  useEffect(() => {
    if (hasPremiumAccess) {
      setLockedRevealed(true);
    }
  }, [hasPremiumAccess]);
  
  const handleRevealLocked = async () => {
    setUnlockError(null);
    
    if (hasPremiumAccess) {
      setLockedRevealed(true);
      return;
    }
    
    if (onRevealLocked) {
      setIsUnlocking(true);
      try {
        const canAccess = await onRevealLocked();
        if (canAccess) {
          setLockedRevealed(true);
        } else {
          setShowPaywall(true);
        }
      } catch (error) {
        console.error('Kilit açma hatası:', error);
        setUnlockError('Kilidi açarken bir sorun oluştu. Lütfen tekrar deneyin.');
      } finally {
        setIsUnlocking(false);
      }
    } else {
      setShowPaywall(true);
    }
  };

  // Chatbot'a yönlendirme
  const handleChatbotRedirect = () => {
    if (onOpenChatbot) {
      onOpenChatbot('Gölgenin farkına vardım... Aşkımın kaderini değiştirmek için ne yapmalıyım?');
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#22c55e';
    if (score >= 60) return '#eab308';
    if (score >= 40) return '#f97316';
    return '#ef4444';
  };

  // Kilitli içerik verisi var mı kontrol et, yoksa fallback kullan
  const lockedContent = result.lockedContent || FALLBACK_LOCKED_CONTENT;

  return (
    <div className="w-full max-w-2xl mx-auto pb-20">
      {/* Header */}
      <div className="text-center mb-8 animate-fade-in-up">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-rose-500/20 to-rose-500/5 mb-4">
          <Heart className="w-8 h-8 text-rose-400" />
        </div>
        <h2 className="text-2xl font-bold gold-gradient mb-1">
          {userName} & {partnerName}
        </h2>
        <p className="text-[#D4AF37]/50 text-sm">
          Kalplerinizin frekans analizi
        </p>
      </div>

      {/* Overall Score */}
      <div className="text-center mb-8 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        <div className="inline-block">
          <div 
            className="w-32 h-32 rounded-full flex items-center justify-center border-4 animate-glow"
            style={{ 
              borderColor: getScoreColor(result.overallScore),
              boxShadow: `0 0 30px ${getScoreColor(result.overallScore)}40`
            }}
          >
            <div className="text-center">
              <span 
                className="text-4xl font-bold block"
                style={{ color: getScoreColor(result.overallScore) }}
              >
                {result.overallScore}%
              </span>
              <span className="text-[#D4AF37]/50 text-xs">Uyum</span>
            </div>
          </div>
        </div>
      </div>

      {/* Score Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        <ScoreCard 
          title="Ruh Bağlantısı" 
          score={result.soulConnection} 
          avatar="/avatars/kisisel-analiz.png"
          color="#D4AF37"
        />
        <ScoreCard 
          title="Kader Uyumu" 
          score={result.destinyAlignment} 
          avatar="/avatars/kader-matrisi-logo.png"
          color="#F4E4BC"
        />
        <ScoreCard 
          title="Fiziksel Çekim" 
          score={result.physicalChemistry} 
          avatar="/avatars/ask-karma.png"
          color="#f43f5e"
        />
      </div>

      {/* ÜCRETSİZ: Ruh Bağlantısı Detay */}
      <div className="mb-6 gold-border rounded-lg p-6 bg-black/40 backdrop-blur-sm animate-fade-in-up" style={{ animationDelay: '250ms' }}>
        <h3 className="text-[#D4AF37] font-cinzel text-lg mb-4 flex items-center gap-2">
          <Users className="w-5 h-5" />
          Ruhların Sessiz Konuşması
        </h3>
        <p className="text-[#D4AF37]/80 text-sm leading-relaxed whitespace-pre-line">
          {freeContent.soulConnectionText}
        </p>
      </div>

      {/* ÜCRETSİZ: Kader Uyumu Detay */}
      <div className="mb-6 gold-border rounded-lg p-6 bg-black/40 backdrop-blur-sm animate-fade-in-up" style={{ animationDelay: '300ms' }}>
        <h3 className="text-[#F4E4BC] font-cinzel text-lg mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Kader Çizgilerinin Kesişimi
        </h3>
        <p className="text-[#D4AF37]/80 text-sm leading-relaxed whitespace-pre-line">
          {freeContent.destinyText}
        </p>
      </div>

      {/* ÜCRETSİZ: Fiziksel Çekim Detay */}
      <div className="mb-6 gold-border rounded-lg p-6 bg-black/40 backdrop-blur-sm animate-fade-in-up" style={{ animationDelay: '350ms' }}>
        <h3 className="text-rose-400 font-cinzel text-lg mb-4 flex items-center gap-2">
          <Flame className="w-5 h-5" />
          Bedenlerin Dansı
        </h3>
        <p className="text-[#D4AF37]/80 text-sm leading-relaxed whitespace-pre-line">
          {freeContent.chemistryText}
        </p>
      </div>

      {/* Year Cycle Warning */}
      {result.yearCycleWarning && (
        <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-200/80 text-sm">{result.yearCycleWarning}</p>
          </div>
        </div>
      )}

      {/* ÜCRETSİZ: Çatışma Analizi */}
      <div className="mb-6 animate-fade-in-up" style={{ animationDelay: '450ms' }}>
        <h3 className="text-[#D4AF37] font-cinzel text-lg mb-3 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Sayıların Savaşı: Neden Çatışıyorsunuz?
        </h3>
        <div className="space-y-3">
          {result.conflictAnalysis.map((conflict: { title: string; description: string; severity: 'low' | 'medium' | 'high' | 'critical' }, idx: number) => {
            const severityColor = RiskLevelColors[conflict.severity];
            return (
              <div 
                key={idx}
                className="p-4 rounded-lg bg-black/40 backdrop-blur-sm border"
                style={{ borderColor: severityColor + '40' }}
              >
                <h4 
                  className="font-semibold text-sm mb-2"
                  style={{ color: severityColor }}
                >
                  {conflict.title}
                </h4>
                <p className="text-[#D4AF37]/70 text-sm leading-relaxed">{conflict.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ÜCRETSİZ: Rezonans */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
        <div className="gold-border rounded-lg p-4 bg-black/40 backdrop-blur-sm">
          <h4 className="text-rose-400 font-cinzel text-sm mb-2 flex items-center gap-2">
            <Flame className="w-4 h-4" />
            Cinsel Rezonans
          </h4>
          <p className="text-[#D4AF37]/80 text-sm leading-relaxed">{result.sexualResonance}</p>
        </div>
        <div className="gold-border rounded-lg p-4 bg-black/40 backdrop-blur-sm">
          <h4 className="text-[#D4AF37] font-cinzel text-sm mb-2 flex items-center gap-2">
            <Heart className="w-4 h-4" />
            Duygusal Rezonans
          </h4>
          <p className="text-[#D4AF37]/80 text-sm leading-relaxed">{result.emotionalResonance}</p>
        </div>
      </div>

      {/* KADER KÖPRÜSÜ: Chatbot yönlendirmesi */}
      <div className="mb-8 p-8 rounded-xl bg-gradient-to-br from-rose-900/30 via-purple-900/20 to-black/60 border border-rose-500/40 backdrop-blur-sm animate-fade-in-up" style={{ animationDelay: '550ms' }}>
        <h3 className="text-rose-400 font-cinzel text-xl mb-4 flex items-center gap-3">
          <Sparkles className="w-6 h-6" />
          Gölgenin Çağrısı
        </h3>
        <p className="text-[#D4AF37]/90 text-sm leading-relaxed mb-4">
          {userFirstName}, şimdiye kadar sana söylediklerim, buzdağının sadece görünen kısmı. 
          Sayılarının gölgesinde, ilişkinizin kaderini değiştirecek gizli kodlar var. 
          Bu bağın <strong>ne zaman kopacağını</strong>, <strong>karmik borcunuzu</strong> ödeme zamanınızı, 
          ve <strong>gelecek 2 yıl içindeki dönüm noktalarını</strong> biliyorum.
        </p>
        <p className="text-[#D4AF37]/80 text-sm leading-relaxed mb-6 italic">
          Bu gölgeyi dağıtmadan, ilişkinizin gerçek potansiyeline asla ulaşamazsınız. 
          Bu karanlığı nasıl aydınlatacağınızı, aşka giden o gizli kapıyı nasıl açacağınızı merak ediyorsanız; 
          Karanlık Numerolog sizi aşağıda, fısıltılarını dinlemek için bekliyor.
        </p>
        
        {/* Chatbot yönlendirme butonu */}
        <div className="flex justify-center">
          <Button
            onClick={handleChatbotRedirect}
            className="bg-gradient-to-r from-rose-600 via-purple-600 to-rose-600 hover:from-rose-500 hover:via-purple-500 hover:to-rose-500 text-white font-cinzel font-semibold px-8 py-6 text-base shadow-lg shadow-rose-500/30 hover:shadow-rose-500/50 transition-all duration-300"
          >
            <MessageCircle className="w-5 h-5 mr-3" />
            Karanlık Numerolog ile Konuş ve Sırrı Çöz
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {unlockError && (
        <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30">
          <p className="text-red-200/80 text-sm">{unlockError}</p>
        </div>
      )}

      {/* Locked Content - Derin Analiz */}
      <div className="animate-fade-in-up" style={{ animationDelay: '600ms' }}>
        {!lockedRevealed ? (
          <div className="relative gold-border rounded-lg p-6 bg-gradient-to-b from-black/60 to-black/40 backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80 z-10" />
            
            <h3 className="text-[#D4AF37] font-cinzel text-xl mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Derin Analiz: Kaderin Gerçek Yüzü
            </h3>
            
            <div className="space-y-3">
              <div className="h-4 bg-white/5 rounded w-3/4" />
              <div className="h-4 bg-white/5 rounded w-full" />
              <div className="h-4 bg-white/5 rounded w-5/6" />
            </div>
            
            <div className="relative z-20 mt-6 text-center">
              <p className="text-[#D4AF37]/70 text-sm mb-2">
                Bu bağın kopuş tarihini ve kurtuluş anahtarını görmek için
              </p>
              <p className="text-rose-400/80 text-xs mb-4 italic">
                "Belki de son şansın..."
              </p>
              <Button
                onClick={handleRevealLocked}
                disabled={isUnlocking}
                className="bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 text-white font-semibold px-8"
              >
                {isUnlocking ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Lock className="w-4 h-4 mr-2" />
                )}
                {isUnlocking ? 'Açılıyor...' : 'Kilidi Aç'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="gold-border rounded-lg p-6 bg-black/40 backdrop-blur-sm animate-fade-in-up">
            <h3 className="text-[#D4AF37] font-cinzel text-xl mb-4">
              Derin Analiz
            </h3>
            
            {/* Breakup Risk */}
            <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30">
              <h4 className="text-red-400 font-semibold text-sm mb-2">Ayrılık Riski Analizi</h4>
              <p className="text-red-200/80 text-sm whitespace-pre-line">{lockedContent.breakupRisk}</p>
            </div>
            
            {/* Karmic Debt */}
            <div className="mb-6 p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
              <h4 className="text-purple-400 font-semibold text-sm mb-2">Karmik Borç</h4>
              <p className="text-purple-200/80 text-sm whitespace-pre-line">{lockedContent.karmicDebt}</p>
            </div>
            
            {/* Future Prediction */}
            <div className="mb-6 p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
              <h4 className="text-blue-400 font-semibold text-sm mb-2">Gelecek Öngörüsü</h4>
              <p className="text-blue-200/80 text-sm whitespace-pre-line">{lockedContent.futurePrediction}</p>
            </div>
          </div>
        )}
      </div>

      {/* Reset Button */}
      <div className="mt-10 text-center animate-fade-in-up" style={{ animationDelay: '700ms' }}>
        <button
          onClick={onReset}
          className="text-[#D4AF37]/40 text-sm hover:text-[#D4AF37]/70 transition-colors"
        >
          Yeni bir analiz yap
        </button>
      </div>

      {/* Paywall Modal */}
      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        onSuccess={() => {
          setShowPaywall(false);
          setLockedRevealed(true);
        }}
        analysisType="love"
      />
    </div>
  );
}
