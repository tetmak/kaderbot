import { useState, useEffect } from 'react';
import { Lock, TrendingUp, AlertTriangle, Sparkles, Building2, User, AlertOctagon, RefreshCw, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { PaywallModal } from './PaywallModal';
import type { WealthAnalysisResult as ResultType } from '@/types/wealthAnalysis';
import { CompatibilityStatusColors, CompatibilityStatusLabels } from '@/types/wealthAnalysis';

interface WealthAnalysisResultProps {
  result: ResultType;
  founderName: string;
  companyName: string;
  onReset: () => void;
  hasPremiumAccess?: boolean;
  onRevealLocked?: () => Promise<boolean>;
  onOpenChatbot?: (initialMessage: string) => void;
}

function ScoreCard({ 
  title, 
  score, 
  avatar 
}: { 
  title: string; 
  score: number; 
  avatar: string;
}) {
  const getColor = (s: number) => {
    if (s >= 80) return '#22c55e';
    if (s >= 60) return '#eab308';
    if (s >= 40) return '#f97316';
    return '#ef4444';
  };

  return (
    <div className="gold-border rounded-lg p-4 bg-black/40 backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 rounded-full overflow-hidden border border-white/20">
          <img src={avatar} alt={title} className="w-full h-full object-cover" />
        </div>
        <span className="text-[#D4AF37]/60 text-xs uppercase tracking-wider">{title}</span>
      </div>
      <div className="flex items-end gap-2">
        <span className="text-3xl font-bold" style={{ color: getColor(score) }}>{score}%</span>
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
  bankruptcyWarning: `**İflas Riski Detayı**

Şirketinizin numerolojik haritasında bazı kritik uyarı işaretleri var. Şirket isminizin enerjisi, kuruluş tarihinizle tam uyumlu değil. Bu enerjisel çatışma, özellikle ekonomik kriz dönemlerinde kendini daha belirgin gösterebilir.

Önümüzdeki 18 ay kritik. Özellikle şirket kuruluş yıl dönümüne yakın dönemlerde finansal kararlarınıza ekstra dikkat etmelisiniz. Büyük yatırımlar, genişleme planları veya borç alma kararları bu dönemlerde riskli olabilir.

Ancak bu sadece bir uyarıdır, bir kader değil. Bilinçli finansal yönetim, nakit akışını dikkatli takip etme ve gereksiz risklerden kaçınma ile bu riski minimize edebilirsiniz. Sayılar size potansiyel tehlikeleri gösteriyor, ama son karar sizin.`,
  
  criticalInvestmentDates: [
    '15 Mart - 30 Nisan 2026',
    '10 Ağustos - 5 Eylül 2026',
    '1 Aralık 2026 - 15 Ocak 2027'
  ],
  
  wealthActivation: `**Bereket Aktivasyonu**

Şirketinizin enerjisini dengelemek ve bereket akışını güçlendirmek için bazı ritüeller önerebilirim. Bunlar sadece sembolik değil, bilinçaltı ve kolektif bilinç seviyesinde etkili uygulamalardır.

1. **Her Pazartesi sabahı**: Ofisin en doğu köşesine sarı bir mum yakın. Sarı, bereketin ve zenginliğin rengidir.

2. **Şirket kuruluş günü**: Her yıl kuruluş gününüzde, tüm çalışanlarla birlikte bir dakikalık sessizlik ve şükran anı tutun. Bu, şirketin enerjisini yeniler.

3. **Para kasası/çekmecesi**: Para bulundurduğunuz yere bir tutam tarçın ve birkaç adet karanfil koyun. Bu, para enerjisini çeker ve tutar.

4. **Ofis girişi**: Giriş kapınızın sağ tarafına (içeriden bakınca) küçük bir ayna asın. Bu, fırsatları ve parayı içeri çeker.

Unutmayın: Bu ritüellerin etkisi, onlara ne kadar inandığınız ve ne kadar bilinçli uyguladığınızla doğru orantılıdır.`
};

// ÜCRETSİZ KISIM - Uzun, edebi, sarsıcı metinler
function generateFreeContent(result: ResultType, founderName: string, companyName: string) {
  const founderFirstName = founderName.split(' ')[0];
  
  // Şirket İsmi Analizi metni
  const companyText = result.companyNumber === 8
    ? `${companyName}... Bu isim, **8** sayısının güçlü enerjisini taşıyor. Sekiz, bolluk ve bereketin sayısıdır. Finansal dünyada altın değerinde bir frekanstır. Ama bilir misin, ${founderFirstName}? 8 aynı zamanda 'karmik denge' sayısıdır. Ne ekersen onu biçersin. Eğer bu şirket etik olmayan yöntemlerle para kazanmaya çalışırsa, 8 o parayı tutmaz. Çünkü 8, sadece kazanan değil, hak edenin sayısıdır.

Bu isim, seni köleleştirebilir. Evet, yanlış duymadın. 8'in gölgesi, açgözlülüktür. İşkolikliğe, aileyi ihmal etmeye, sağlığı feda etmeye götürebilir. Kazandığın her kuruş, başka bir şeyden çalınmış olabilir - uykundan, sevdiklerinden, ruhunun huzurundan.

${companyName} ismi, sana para getirecek. Ama o paranın bedelini ödemeye hazır mısın?`
    : result.companyNumber === 1
    ? `${companyName}... Bu isim, **1** sayısının öncü enerjisini taşıyor. Bir, liderliğin, bağımsızlığın, özgünlüğün sayısıdır. Bu isimle piyasaya çıktığında, fark edileceksin. Ama bilir misin, ${founderFirstName}? 1 aynı zamanda 'yalnızlık' sayısıdır. Zirvede tek başına olmak, bazen en büyük cezadır.

Bu isim, seni özgürleştirebilir. Ama aynı zamanda izole de edebilir. Çünkü 1, işbirliğinden uzak durur. Ortaklıklar, ittifaklar, paylaşımlar - 1 bunları zor bulur. Tek başına hareket etmek, hızlı karar almak güzeldir ama yükü tek başına taşımak zordur.

${companyName} ismi, seni lider yapacak. Ama o liderliğin bedelini ödemeye hazır mısın?`
    : result.companyNumber === 4
    ? `${companyName}... Bu isim, **4** sayısının stabil enerjisini taşıyor. Dört, temellerin, disiplinin, güvenilirliğin sayısıdır. Bu isimle verdiğin sözler tutulur, yapılan işler sağlam olur. Ama bilir misin, ${founderFirstName}? 4 aynı zamanda 'donukluk' sayısıdır. Değişimden korkar, rutine sıkı sıkıya sarılır.

Bu isim, seni güvenilir kılar. Ama aynı zamanda esnekliğini de kısıtlayabilir. Çünkü 4, inovasyondan uzak durur. Yeni fikirler, yeni yöntemler, yeni pazarlar - 4 bunları tehdit olarak görür. Güvenli bölgede kalmak rahattır ama büyümeyi de sınırlar.

${companyName} ismi, sana istikrar getirecek. Ama o istikrarın bedelini ödemeye hazır mısın?`
    : `${companyName}... Bu isim, **${result.companyNumber}** sayısının özgün enerjisini taşıyor. Her sayının bir dili, bir ruhu, bir kaderi vardır. Bu isim, senin şirketinin DNA'sını oluşturuyor. Ama bilir misin, ${founderFirstName}? Bir isim, sadece bir etiket değildir. O ismin titreşimi, şirketinin her kararına, her çalışanına, her müşterisine sirayet eder.

Bu isim, senin seçimin. Ama o isim seni de seçti. Şimdi bu enerjiyle nasıl dans edeceğine sen karar vereceksin. Çünkü isimler, kader çizmek için vardır. Ya kaderine hükmedersin, ya da isminin gölgesinde yaşarsın.

${companyName} ismi, sana bir yol gösterecek. Ama o yolun nereye çıktığını görmeye hazır mısın?`;

  // Kurucu Uyumu metni
  const compatibilityText = result.compatibilityStatus === 'danger'
    ? `${founderFirstName}, senin enerjin (${result.founderExpression}) ile şirketinin enerjisi (${result.companyNumber}) **çarpışıyor**. Bu çatışma, sadece sayılarda değil, gerçek hayatta da kendini gösterecek. Kazandığın para, elinin altından kayıp gidecek. Beklenmedik giderler, ödenmeyen alacaklar, verimsiz yatırımlar - bunlar senin kaderin olabilir.

Bu çatışma, seni köleleştirir. Çünkü ne kadar çok çalışsan çalış, sonuç alamazsın. Çünkü enerjiler uyumsuz. Balık, karada koşmaya çalışıyor. Kuş, suyun dibinde yüzmeye çalışıyor. Her ikisi de yetenekli ama yanlış yerdesin.

Ama bu çatışma, çözülemez değil. İsim değişikliği, enerji dengeleme, farklı bir yaklaşım - bunlar seni kurtarabilir. Ama önce bu çatışmayı kabul etmelisin. Görmezden gelmek, onu güçlendirir.`
    : result.compatibilityStatus === 'harmony'
    ? `${founderFirstName}, senin enerjin (${result.founderExpression}) ile şirketinin enerjisi (${result.companyNumber}) **uyumlu**. Bu uyum, nadir bulunan bir hazinedir. Çünkü sen ve şirketin aynı frekansta titresiyorsunuz. Kararlarınız, hedefleriniz, yöntemleriniz birbiriyle örtüşüyor.

Bu uyum, seni güçlendirir. Çünkü ne kadar çok çalışsan çalış, enerjin şirketine akar. Şirketin de enerjisi sana geri döner. Bu döngü, büyümenin, başarının, bereketin anahtarıdır.

Ama bu uyum, garanti değildir. Uyumlu bir evlilik bile bozulabilir. Dikkatini dağıtırsan, o uyumu koruyamazsın. Bu uyum, bir hediye ama onu korumak senin sorumluluğun.`
    : `${founderFirstName}, senin enerjin (${result.founderExpression}) ile şirketinin enerjisi (${result.companyNumber}) **nötr**. Ne büyük bir çatışma var, ne de büyük bir uyum. Bu, sıradan bir ilişki gibi. İşler yürüyor ama büyüme sınırlı.

Bu nötrlük, seni rahatlatır ama aynı zamanda uykuya da yatırabilir. Çünkü her şey yolunda gibi görünüyor. Ama 'yolunda' olmak, 'mükemmel' olmak değildir. Potansiyelinin çok altında çalışıyor olabilirsin.

Bu nötrlüğü kırmak, senin elinde. Ya enerjini değiştireceksin, ya da şirketinin enerjisini. Ama bir şeyler değişmeli. Çünkü nötrlük, zamanla çatışmaya veya uyuma dönüşür. Sen hangisini seçeceksin?`;

  // Kuruluş Tarihi metni
  const dateText = result.registrationEnergy === 8
    ? `${founderFirstName}, şirketin **${result.registrationEnergy}** enerjisiyle dünyaya geldi. Bu tarih, bolluk ve güç tarihidir. Kuruluş gününüz, şirketinizin kaderini şekillendirdi. Ama bilir misin? 8 enerjisi, kolay para demek değildir. 8, kazanılan her kuruşun bedelini ödetir.

Bu tarih, sana finansal başarı vaat ediyor. Ama aynı zamanda sorumluluk da yüklüyor. Çünkü 8, dengenin sayısıdır. Ne verirsen onu alırsın. Etiğe uygun çalışırsan, 8 seni zengin eder. Ama kısa yollara başvurursan, 8 o parayı elinden alır.

Bu tarihin enerjisi, şirketinin her yıl dönümünde tekrar aktive olur. O günlerde verdiğin kararlar, şirketinin kaderini belirler.`
    : result.registrationEnergy === 4
    ? `${founderFirstName}, şirketin **${result.registrationEnergy}** enerjisiyle dünyaya geldi. Bu tarih, stabilite ve temeller tarihidir. Kuruluş gününüz, şirketinize sağlam bir zemin sağladı. Ama bilir misin? 4 enerjisi, yavaş büyüme demektir. Aceleci değil, sabırlı olmayı gerektirir.

Bu tarih, sana güvenilirlik vaat ediyor. Ama aynı zamanda esnekliği de sınırlıyor. Çünkü 4, değişimden korkar. Yeni fikirlere, yeni pazarlara, yeni yöntemlere direnç gösterebilir. Bu direnç, büyümeyi yavaşlatır.

Bu tarihin enerjisi, şirketinin her yıl dönümünde tekrar aktive olur. O günlerde verdiğin kararlar, şirketinin istikrarını veya durağanlığını belirler.`
    : `${founderFirstName}, şirketin **${result.registrationEnergy}** enerjisiyle dünyaya geldi. Bu tarih, şirketinin kaderini şekillendiren bir dönüm noktası. Her kuruluş tarihi, o şirketin ruhunu belirler. Ve bu ruh, şirketin her kararında, her çalışanında, her müşterisinde hissedilir.

Bu tarihin enerjisi, seninle uyumlu mu? Yoksa bir çatışma mı var? Çünkü kurucu ile kuruluş tarihi arasındaki uyum, şirketin başarısının anahtarıdır. Uyum varsa, işler akar. Çatışma varsa, her adımda dirençle karşılaşırsın.

Bu tarihin enerjisi, şirketinin her yıl dönümünde tekrar aktive olur. O günlerde verdiğin kararlar, şirketinin geleceğini şekillendirir.`;

  return { companyText, compatibilityText, dateText };
}

export function WealthAnalysisResult({ 
  result, 
  founderName, 
  companyName, 
  onReset,
  hasPremiumAccess = false,
  onRevealLocked,
  onOpenChatbot
}: WealthAnalysisResultProps) {
  const [showPaywall, setShowPaywall] = useState(false);
  const [lockedRevealed, setLockedRevealed] = useState(hasPremiumAccess);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [unlockError, setUnlockError] = useState<string | null>(null);

  const founderFirstName = founderName.split(' ')[0];
  
  // Ücretsiz içerik metinleri
  const freeContent = generateFreeContent(result, founderName, companyName);

  // Premium erişimi değiştiğinde state'i güncelle
  useEffect(() => {
    if (hasPremiumAccess) {
      setLockedRevealed(true);
    }
  }, [hasPremiumAccess]);

  const statusColor = CompatibilityStatusColors[result.compatibilityStatus];
  const statusLabel = CompatibilityStatusLabels[result.compatibilityStatus];

  // Kilitli içerik verisi var mı kontrol et, yoksa fallback kullan
  const lockedContent = result.lockedContent || FALLBACK_LOCKED_CONTENT;

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
      onOpenChatbot('Gölgenin farkına vardım... Şirketimin gerçek potansiyeline ulaşmak için ne yapmalıyım?');
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto pb-20">
      {/* Header */}
      <div className="text-center mb-8 animate-fade-in-up">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 mb-4">
          <TrendingUp className="w-8 h-8 text-emerald-400" />
        </div>
        <h2 className="text-2xl font-bold gold-gradient mb-1">
          {companyName}
        </h2>
        <p className="text-[#D4AF37]/50 text-sm">
          Kurucu: {founderName}
        </p>
      </div>

      {/* Overall Score */}
      <div className="text-center mb-8 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        <div className="inline-block">
          <div 
            className="w-32 h-32 rounded-full flex items-center justify-center border-4 animate-glow"
            style={{ 
              borderColor: result.prosperityScore >= 70 ? '#22c55e' : result.prosperityScore >= 50 ? '#eab308' : '#ef4444',
              boxShadow: `0 0 30px ${result.prosperityScore >= 70 ? '#22c55e' : result.prosperityScore >= 50 ? '#eab308' : '#ef4444'}40`
            }}
          >
            <div className="text-center">
              <span className="text-[#D4AF37]/50 text-xs block mb-1">Bereket</span>
              <span 
                className="text-4xl font-bold block"
                style={{ color: result.prosperityScore >= 70 ? '#22c55e' : result.prosperityScore >= 50 ? '#eab308' : '#ef4444' }}
              >
                {result.prosperityScore}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Score Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        <ScoreCard 
          title="Para Çekme" 
          score={result.moneyAttraction} 
          avatar="/avatars/servet-isim.png"
        />
        <ScoreCard 
          title="Stabilite" 
          score={result.stabilityIndex} 
          avatar="/avatars/kader-matrisi-logo.png"
        />
        <ScoreCard 
          title="Büyüme" 
          score={result.growthPotential} 
          avatar="/avatars/kisisel-analiz.png"
        />
        <ScoreCard 
          title="Şirket No" 
          score={result.companyNumber} 
          avatar="/avatars/kader-matrisi-logo.png"
        />
      </div>

      {/* ÜCRETSİZ: Şirket İsmi Analizi */}
      <div className="mb-6 gold-border rounded-lg p-6 bg-black/40 backdrop-blur-sm animate-fade-in-up" style={{ animationDelay: '250ms' }}>
        <h3 className="text-[#D4AF37] font-cinzel text-lg mb-4 flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          İsmin Gizli Kodu: {result.companyNumber}
        </h3>
        <p className="text-[#D4AF37]/80 text-sm leading-relaxed whitespace-pre-line">
          {freeContent.companyText}
        </p>
      </div>

      {/* ÜCRETSİZ: Kurucu Uyumu */}
      <div 
        className="mb-6 p-6 rounded-lg border animate-fade-in-up" 
        style={{ 
          animationDelay: '300ms',
          backgroundColor: statusColor + '10',
          borderColor: statusColor + '40'
        }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: statusColor + '30' }}
          >
            <User className="w-5 h-5" style={{ color: statusColor }} />
          </div>
          <div>
            <h4 className="font-semibold text-sm" style={{ color: statusColor }}>
              {statusLabel}
            </h4>
          </div>
        </div>
        <p className="text-[#D4AF37]/80 text-sm leading-relaxed whitespace-pre-line">
          {freeContent.compatibilityText}
        </p>
      </div>

      {/* ÜCRETSİZ: Kuruluş Tarihi */}
      <div className="mb-6 gold-border rounded-lg p-6 bg-black/40 backdrop-blur-sm animate-fade-in-up" style={{ animationDelay: '350ms' }}>
        <h3 className="text-emerald-400 font-cinzel text-lg mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Kuruluş Gününün Enerjisi: {result.registrationEnergy}
        </h3>
        <p className="text-[#D4AF37]/80 text-sm leading-relaxed whitespace-pre-line">
          {freeContent.dateText}
        </p>
      </div>

      {/* ÜCRETSİZ: Risk Faktörleri */}
      <div className="mb-6 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
        <h3 className="text-[#D4AF37] font-cinzel text-lg mb-3 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Karanlık Gerçekler: Risk Analizi
        </h3>
        <div className="space-y-3">
          {result.riskFactors.map((risk, idx) => (
            <div 
              key={idx}
              className="p-4 rounded-lg bg-black/40 backdrop-blur-sm border"
              style={{ borderColor: risk.severity === 'critical' ? '#dc2626' : risk.severity === 'high' ? '#f97316' : risk.severity === 'medium' ? '#eab308' : '#22c55e' + '40' }}
            >
              <h4 
                className="font-semibold text-sm mb-1"
                style={{ color: risk.severity === 'critical' ? '#dc2626' : risk.severity === 'high' ? '#f97316' : risk.severity === 'medium' ? '#eab308' : '#22c55e' }}
              >
                {risk.title}
              </h4>
              <p className="text-[#D4AF37]/70 text-sm leading-relaxed">{risk.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ÜCRETSİZ: İsim Değişikliği */}
      {result.nameChangeSuggestion.recommended && (
        <div className="mb-6 p-6 rounded-lg bg-amber-500/10 border border-amber-500/30 animate-fade-in-up" style={{ animationDelay: '450ms' }}>
          <h4 className="text-amber-400 font-semibold text-sm mb-3 flex items-center gap-2">
            <AlertOctagon className="w-4 h-4" />
            İsim Değişikliği Önerisi
          </h4>
          <p className="text-amber-200/80 text-sm mb-3 leading-relaxed">{result.nameChangeSuggestion.reason}</p>
          {result.nameChangeSuggestion.alternativeNames && (
            <div className="flex flex-wrap gap-2">
              {result.nameChangeSuggestion.alternativeNames.map((name, idx) => (
                <span key={idx} className="px-3 py-1 bg-amber-500/20 rounded-full text-amber-300 text-xs">
                  {name}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* KADER KÖPRÜSÜ: Chatbot yönlendirmesi */}
      <div className="mb-8 p-8 rounded-xl bg-gradient-to-br from-emerald-900/30 via-amber-900/20 to-black/60 border border-emerald-500/40 backdrop-blur-sm animate-fade-in-up" style={{ animationDelay: '500ms' }}>
        <h3 className="text-emerald-400 font-cinzel text-xl mb-4 flex items-center gap-3">
          <Sparkles className="w-6 h-6" />
          Kaderin Gizli Kavşağı
        </h3>
        <p className="text-[#D4AF37]/90 text-sm leading-relaxed mb-4">
          {founderFirstName}, şimdiye kadar sana söylediklerim, buzdağının sadece görünen kısmı. 
          Şirketinin sayılarında, <strong>iflas riskini</strong> artıracak gizli kodlar var. 
          Bu bereketin önündeki <strong>o tek engel</strong>, senin farkında olmadığın bir enerji çatışması.
        </p>
        <p className="text-[#D4AF37]/80 text-sm leading-relaxed mb-6 italic">
          Bu gölgeyi dağıtmadan, şirketinin gerçek potansiyeline asla ulaşamazsın. 
          Bu karanlığı nasıl aydınlatacağını, zenginliğe giden o gizli kapıyı nasıl açacağını merak ediyorsan; 
          Karanlık Numerolog seni aşağıda, fısıltılarını dinlemek için bekliyor.
        </p>
        
        {/* Chatbot yönlendirme butonu */}
        <div className="flex justify-center">
          <Button
            onClick={handleChatbotRedirect}
            className="bg-gradient-to-r from-emerald-600 via-amber-600 to-emerald-600 hover:from-emerald-500 hover:via-amber-500 hover:to-emerald-500 text-white font-cinzel font-semibold px-8 py-6 text-base shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all duration-300"
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
      <div className="animate-fade-in-up" style={{ animationDelay: '550ms' }}>
        {!lockedRevealed ? (
          <div className="relative gold-border rounded-lg p-6 bg-gradient-to-b from-black/60 to-black/40 backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80 z-10" />
            
            <h3 className="text-[#D4AF37] font-cinzel text-xl mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Gizli Servet Kodları
            </h3>
            
            <div className="space-y-3">
              <div className="h-4 bg-white/5 rounded w-3/4" />
              <div className="h-4 bg-white/5 rounded w-full" />
              <div className="h-4 bg-white/5 rounded w-5/6" />
            </div>
            
            <div className="relative z-20 mt-6 text-center">
              <p className="text-[#D4AF37]/70 text-sm mb-2">
                İflas riski, kritik yatırım tarihleri ve bereket aktivasyonu için
              </p>
              <p className="text-emerald-400/80 text-xs mb-4 italic">
                "Belki de son şansın..."
              </p>
              <Button
                onClick={handleRevealLocked}
                disabled={isUnlocking}
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-semibold px-8"
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
              Gizli Servet Kodları
            </h3>
            
            {/* Bankruptcy Warning */}
            <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30">
              <h4 className="text-red-400 font-semibold text-sm mb-2 flex items-center gap-2">
                <AlertOctagon className="w-4 h-4" />
                İflas Riski Detayı
              </h4>
              <p className="text-red-200/80 text-sm whitespace-pre-line">{lockedContent.bankruptcyWarning}</p>
            </div>
            
            {/* Critical Investment Dates */}
            <div className="mb-6 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
              <h4 className="text-emerald-400 font-semibold text-sm mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Kritik Yatırım Tarihleri
              </h4>
              <div className="flex flex-wrap gap-2">
                {lockedContent.criticalInvestmentDates.map((date, idx) => (
                  <span key={idx} className="px-3 py-1 bg-emerald-500/20 rounded-full text-emerald-300 text-xs">
                    {date}
                  </span>
                ))}
              </div>
            </div>
            
            {/* Wealth Activation */}
            <div className="mb-6 p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
              <h4 className="text-amber-400 font-semibold text-sm mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Bereket Aktivasyonu
              </h4>
              <p className="text-amber-200/80 text-sm whitespace-pre-line">{lockedContent.wealthActivation}</p>
            </div>
          </div>
        )}
      </div>

      {/* Reset Button */}
      <div className="mt-10 text-center animate-fade-in-up" style={{ animationDelay: '600ms' }}>
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
        analysisType="wealth"
      />
    </div>
  );
}
