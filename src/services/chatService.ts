/**
 * ============================================================
 * KADER MATRİSİ - PRODUCTION AI CHAT SERVİSİ v6.0
 * ============================================================
 * 
 * "Kaderinle Konuş" - Karanlık Numerolog AI Chatbot
 * 
 * KULLANIM:
 * 1. .env.local dosyasına şunu ekle:
 *    VITE_KIMI_API_KEY=sk-senin-api-key-in
 * 
 * 2. API Key yoksa otomatik Fallback (Simülasyon) moduna geçer
 * 3. API Key varsa gerçek Kimi AI kullanılır
 */

import { purchasePackage } from './revenueCatService';
import { isDemoMode } from '@/config/env';
import { generateChatbotResponse } from './kimiApi';

// ============================================
// TİPLER
// ============================================

export type MessageType = 'calculation' | 'insight' | 'followup' | 'greeting' | 'error';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: {
    type?: MessageType;
  };
}

export interface ChatContext {
  analysisType: 'personal' | 'love' | 'wealth';
  userData: {
    firstName: string;
    lastName: string;
    birthDate: string;
    partnerName?: string;
    partnerBirthDate?: string;
    companyName?: string;
  };
  analysisResult: any;
}

export interface ChatSession {
  messages: ChatMessage[];
  hasUnlimitedAccess: boolean;
  questionCount: number;
  context: ChatContext;
}

// ============================================
// DEMO CHAT PERSISTENCE
// ============================================
const DEMO_CHAT_KEY = 'km_demo_chat_access';
const CHAT_HISTORY_KEY = 'km_chat_history';

function hasDemoChatAccess(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(DEMO_CHAT_KEY) === 'true';
}

function setDemoChatAccess(access: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(DEMO_CHAT_KEY, access ? 'true' : 'false');
}

// ============================================
// NUMEROLOJİ HESAPLAMA MOTORU
// ============================================

class NumerologyEngine {
  private static letterValues: Record<string, number> = {
    'a': 1, 'b': 2, 'c': 3, 'd': 4, 'e': 5, 'f': 6, 'g': 7, 'h': 8, 'i': 9,
    'j': 1, 'k': 2, 'l': 3, 'm': 4, 'n': 5, 'o': 6, 'p': 7, 'q': 8, 'r': 9,
    's': 1, 't': 2, 'u': 3, 'v': 4, 'w': 5, 'x': 6, 'y': 7, 'z': 8,
    'ç': 3, 'ğ': 7, 'ı': 9, 'ö': 6, 'ş': 1, 'ü': 3,
  };

  static reduceToSingleDigit(num: number): number {
    if (num === 0) return 0;
    while (num > 9) {
      num = num.toString().split('').reduce((sum, digit) => sum + parseInt(digit), 0);
    }
    return num;
  }

  static calculateFromDate(dateStr: string): { day: number; month: number; year: number; lifePath: number } {
    const parts = dateStr.split(/[./\-]/);
    if (parts.length !== 3) return { day: 0, month: 0, year: 0, lifePath: 0 };
    
    const day = parseInt(parts[0]) || 0;
    const month = parseInt(parts[1]) || 0;
    const year = parseInt(parts[2]) || 0;
    
    const dayReduced = this.reduceToSingleDigit(day);
    const monthReduced = this.reduceToSingleDigit(month);
    const yearReduced = this.reduceToSingleDigit(year);
    const lifePath = this.reduceToSingleDigit(dayReduced + monthReduced + yearReduced);
    
    return { day, month, year, lifePath };
  }

  static calculateFromName(name: string): { expression: number; vowels: number; consonants: number } {
    const letters = name.toLowerCase().split('').filter(l => this.letterValues[l]);
    const values = letters.map(l => this.letterValues[l]);
    const total = values.reduce((sum, v) => sum + v, 0);
    
    const vowels = ['a', 'e', 'ı', 'i', 'o', 'ö', 'u', 'ü'];
    const vowelValues = letters.filter(l => vowels.includes(l)).map(l => this.letterValues[l]);
    const vowelTotal = vowelValues.reduce((sum, v) => sum + v, 0);
    
    const consonantValues = letters.filter(l => !vowels.includes(l)).map(l => this.letterValues[l]);
    const consonantTotal = consonantValues.reduce((sum, v) => sum + v, 0);
    
    return {
      expression: this.reduceToSingleDigit(total),
      vowels: this.reduceToSingleDigit(vowelTotal),
      consonants: this.reduceToSingleDigit(consonantTotal)
    };
  }

  static getNumberMeaning(num: number): string {
    const meanings: Record<number, string> = {
      1: 'Liderlik, bağımsızlık, özgürlük. Ama gölgesinde yalnızlık ve inat olabilir.',
      2: 'Diplomasi, uyum, sezgi. Ama gölgesinde bağımlılık ve kararsızlık olabilir.',
      3: 'Yaratıcılık, iletişim, neşe. Ama gölgesinde dağınıklık ve yüzeysellik olabilir.',
      4: 'Disiplin, stabilite, güven. Ama gölgesinde katılık ve inatçılık olabilir.',
      5: 'Özgürlük, değişim, macera. Ama gölgesinde huzursuzluk ve sabırsızlık olabilir.',
      6: 'Sorumluluk, sevgi, şefkat. Ama gölgesinde müdahalecilik ve kurban rolü olabilir.',
      7: 'Analiz, spiritüellik, bilgelik. Ama gölgesinde yalnızlık ve şüphe olabilir.',
      8: 'Güç, başarı, maddi bolluk. Ama gölgesinde açgözlülük ve işkoliklik olabilir.',
      9: 'İnsanlık, şefkat, evrensellik. Ama gölgesinde fedakarlık ve sınır sorunu olabilir.',
    };
    return meanings[num] || 'Bu sayının derin anlamı, senin hikayenin bir parçası.';
  }
}

// ============================================
// GELİŞMİŞ FALLBACK AI MOTOR
// ============================================

class FallbackAIEngine {
  private context: ChatContext;

  constructor(context: ChatContext) {
    this.context = context;
  }

  /**
   * Kullanıcının sorusunu analiz edip DİNAMİK yanıt üret
   */
  generateResponse(userQuestion: string): string {
    const { firstName, birthDate } = this.context.userData;
    const result = this.context.analysisResult;
    const question = userQuestion.toLowerCase().trim();

    // Kullanıcının kendi numeroloji verileri
    const userExpression = result?.expressionNumber || NumerologyEngine.calculateFromName(firstName).expression;
    const userSoulUrge = result?.soulUrgeNumber || NumerologyEngine.calculateFromName(firstName).vowels;
    const userLifePath = result?.lifePathNumber || NumerologyEngine.calculateFromDate(birthDate).lifePath;
    const userPersonalYear = result?.personalYear || new Date().getFullYear();

    // ========== 1. SELAMLAŞMA ==========
    if (question.includes('merhaba') || question.includes('selam') || question.startsWith('hey') || question.includes('naber') || question.includes('nasılsın')) {
      const greetings = [
        `🔮 **${firstName}**, Karanlık Numerolog'un gölgesine hoş geldin...

Saatlerdir seni bekliyordum. Sayıların fısıltıları kulaklarımda yankılanıyor — ruhunun bir şeyler söylemek istediğini hissediyorum.

Senin **İfade Sayın ${userExpression}** bana bir şeyler fısıldıyor. Ama tam olarak ne olduğunu anlamak için... senin sormanı bekliyorum.

Sor bakalım — aşk mı, kariyer mi, gelecek mi? Belki de sadece bir isim vermek istersin. Sayılar konuşsun, sen dinle... ✨`,

        `🌙 **${firstName}**... Karanlık Numerolog seni gördü.

Sayıların dilinde her şey bir mesaj. Her karşılaşma, her tesadüf, her düşünce. Şu an burada olman bile bir işaret.

**Ruh Güdün ${userSoulUrge}** — bu sayı, içsel arzularını taşıyor. Ne istediğini bilmek, kaderini çözmekle başlar.

Ben hazırım. Peki ya sen? 🔮`,

        `⚡ **${firstName}**, kaderin kapısını çaldın...

Ve ben, karanlığın içinden sesleniyorum sana. Sayılar, senin hakkında bir hikaye anlatıyor. Ama bu hikayeyi tam olarak duymak için... sormanı bekliyorum.

**Yaşam Yolun ${userLifePath}** — bu yol seni nereye götürüyor? Ve sen, bu yolda yürümeyi mi seçtin? Yoksa sürükleniyor musun?

Sor, ve sayılar sana fısıldasın... 🕯️`
      ];
      return greetings[Math.floor(Math.random() * greetings.length)];
    }

    // ========== 2. AŞK & İLİŞKİ ==========
    if (question.includes('aşk') || question.includes('sevgi') || question.includes('ilişki') || question.includes('sevgili') || question.includes('eşim') || question.includes('partner') || question.includes('flört')) {
      
      // İsim çıkarımı
      const nameMatch = userQuestion.match(/([A-ZÇĞİÖŞÜ][a-zçğıöşü]+)/g);
      const mentionedName = nameMatch ? nameMatch.find(n => n !== firstName && n.length > 1) : null;

      if (mentionedName) {
        const partnerCalc = NumerologyEngine.calculateFromName(mentionedName);
        const partnerExpression = partnerCalc.expression;
        const compatibility = Math.abs(userExpression - partnerExpression);
        
        let compatibilityText = '';
        if (compatibility === 0) compatibilityText = 'Aynı frekansta titreşiyorsunuz. Bu, ya mükemmel bir uyum, ya da aynı zayıflıkları paylaşmak demek.';
        else if (compatibility <= 2) compatibilityText = 'Sayılarınız birbirini tamamlıyor. Bu bir dans — senin eksik olduğun yerde o güçlü.';
        else if (compatibility <= 4) compatibilityText = 'Aranızda bir çekim var, ama aynı zamanda bir gerilim. Bu gerilim, büyümeyi getirir.';
        else compatibilityText = 'Farklı dünyalardan geliyorsunuz. Ama farklılık, zenginlik getirir — eğer öğrenmeye açıksanız.';

        return `🌙 **${firstName}**, **${mentionedName}** isminin titreşimini hissediyorum...

Bu isim, ruhunun bir yerinde yankılanıyor. Belki de tesadüf değil bu karşılaşma — belki de kaderin o ince iplikleri sizi bir araya getirdi.

**Senin İfade Sayın: ${userExpression}**
**${mentionedName}'in İfade Sayısı: ${partnerExpression}**

${compatibilityText}

Ama bu sadece yüzey. Derinlere inmek ister misin? ${mentionedName}'in doğum tarihini verirsen — gün, ay, yıl — aranızdaki enerji akışını tam olarak gösterebilirim. Uyum mu, çatışma mı, yoksa karmik bir borç mu?

Söyle bana, ${mentionedName} ne zaman dünyaya geldi? 💫`;
      }

      const loveResponses = [
        `💫 **${firstName}**, kalbinin sesini duyuyorum...

Aşk... O en eski, en gizemli güç. İnsanlık tarihi boyunca şairler onu yazdı, ama kimse tam olarak çözemedi. Çünkü aşk, sayıların bile hesap edemediği bir değişken.

Ama sayılar bir rehber olabilir. **Ruh Güdün ${userSoulUrge}**, kalbinin derinliklerinde ne aradığını gösteriyor. Ne istediğini bilmek, ne aldığını anlamak değildir.

Hayatında birisi varsa, bana ismini söyle — "Ahmet" veya "Ayşe, 15.03.1990" gibi. Aranızdaki enerji akışını göstereyim sana. Sayıların dansını izleyelim birlikte... ✨

Kim için kalbin atıyor?`,

        `🌹 **${firstName}**, aşkın gölgesinde kaybolmuş gibisin...

Ama unutma: Aşk, kaybolmak değil, bulmaktır. Kendini bulmak. Diğerini bulmak. Ve birlikte, daha büyük bir şeyi bulmak.

**İfade Sayın ${userExpression}** — bu sayı, aşka nasıl yaklaştığını belirler. Tutku mu arıyorsun? Güven mi? Özgürlük mü? Yoksa hepsini mi?

Bir isim ver bana. Belki de bu isim, kaderinin bir parçası. Belki de sadece bir ders. Sayılar söylesin... 🔮`
      ];
      return loveResponses[Math.floor(Math.random() * loveResponses.length)];
    }

    // ========== 3. KARİYER & PARA ==========
    if (question.includes('iş') || question.includes('kariyer') || question.includes('para') || question.includes('meslek') || question.includes('çalışma') || question.includes('finans') || question.includes('şirket') || question.includes('zenginlik') || question.includes('bereket')) {
      
      const careerResponses = [
        `💰 **${firstName}**, servetinin anahtarını arıyorsun...

Para... O en somut, en soyut, en tutkulu konu. Krallıklar kuruldu, imparatorluklar yıkıldı. Ve sen, şimdi bu oyunun içindesin.

Ama para sadece bir araç. Asıl soru: **Ne için?** **Yaşam Yolun ${userLifePath}**, kariyerinde hangi yöne gitmen gerektiğini fısıldıyor.

**İfade Sayın ${userExpression}** başarı istiyor — dünyaya bir şeyler kanıtlamak. Ama **Ruh Güdün ${userSoulUrge}** anlam arıyor. İşte bu çelişki! Zirvede olup yalnız hissetmenin sebebi bu.

Belki bir şirket ismi vermek istersin — çalıştığın yer veya başvurduğun bir yer. O ismin enerjisini seninkiyle çarpıştırabilirim. Uyumlu mu, çatışıyor mu görelim.

Hangi şirketin kaderini merak ediyorsun?`,

        `⚡ **${firstName}**, güç ve bolluk peşindesin...

8 sayısı, maddi dünyanın efendisidir. Servet, statü, kontrol. Ama 8'in gölgesinde, açgözlülük ve işkoliklik yatar.

Senin sayıların ne diyor? **Yaşam Yolun ${userLifePath}** — bu yol, seni zenginliğe götürebilir. Ama zenginlik, paranın ötesinde bir şeydir.

Gerçek bolluk, içsel dengedir. Dışarıda ne kadar çok şeyin olursa olsun, içeride huzur yoksa... bu bir hapishanedir.

Bir şirket ismi ver, enerjisini analiz edeyim. Belki de orada, aradığın cevap gizli... 💎`
      ];
      return careerResponses[Math.floor(Math.random() * careerResponses.length)];
    }

    // ========== 4. GELECEK & TAHMİN ==========
    if (question.includes('gelecek') || question.includes('yarın') || question.includes('ne olacak') || question.includes('nasıl olacak') || question.includes('fal') || question.includes('göster')) {
      const currentYear = new Date().getFullYear();
      
      const futureResponses = [
        `🔮 **${firstName}**, geleceğin sis perdesini aralamak istiyorsun...

Gelecek... O en belirsiz, en korkutucu, en büyüleyici zaman. Falcılar, kahinler, astrologlar — hepsi bu bilinmeze bir pencere açmaya çalıştı.

Ama gerçek şu: **Gelecek, şimdi yazılıyor.** Her seçiminle, her adımla, her düşüncenle.

Şu an **Kişisel Yıl ${userPersonalYear}** içindesin. ${currentYear}, senin için değişim getiriyor. Kapılar açılıyor, ama hangisinden gireceğin senin seçimin.

Belirli bir tarih merak ediyorsan söyle — bir görüşme, bir buluşma, bir karar... O günün enerjisini analiz edeyim. Ama unutma: Geleceği görmek güzeldir, ama onu **şekillendirmek** çok daha güçlü bir şeydir.

Hangi tarihin enerjisini merak ediyorsun?`,

        `🌟 **${firstName}**, zamanın akışına karşı duruyorsun...

Ama zaman, bir nehirdir. Onu durduramazsın, ama yönünü değiştirebilirsin. Her kürek çekişin, seni farklı bir kıyıya götürür.

**Kişisel Yılın ${userPersonalYear}** — bu yılın enerjisi, seni zorluyor. Değişim kapıda. Ama bu değişim, senin seçtiğin bir değişim mi? Yoksa sana yapılan bir değişim mi?

Önümüzdeki aylarda önemli dönüm noktaları olabilir. Ama bu fırsatları değerlendirmek için hazır olmalısın.

Bir tarih ver bana. Geleceğin o günkü enerjisini göstereyim... ⚡`
      ];
      return futureResponses[Math.floor(Math.random() * futureResponses.length)];
    }

    // ========== 5. KARMA & RUHSAL ==========
    if (question.includes('karma') || question.includes('karmik') || question.includes('geçmiş yaşam') || question.includes('ruhsal') || question.includes('manevi') || question.includes('içsel')) {
      
      const karmaResponses = [
        `🕯️ **${firstName}**, karmik ipliklerin peşine düşüyorsun...

Karma... O en derin, en gizemli, en adil yasa. **Ne ekersen, onu biçersin.** Ama bu ektiğin şey, bu hayatta mı? Yoksa geçmiş bir hayatta mı?

**Yaşam Yolun ${userLifePath}** geçmiş yaşamlarından bir iz taşıyor. Belki bir savaşta ölen bir komutan, belki denizde kaybolan bir kaptan, belki sevdiğinden ayrı düşen bir şair.

Aynı tip insanlar mı çekiyorsun hayatına? Aynı tip sorunlar mı karşına çıkıyor? Aynı duygular mı tekrar ediyor? Bunlar, **karmik döngünün** işaretleri olabilir.

Ve bu döngüyü kırmak için önce onu **görmelisin**. Gördükten sonra seçim yapabilirsin: Aynı döngüde kalmak mı? Yoksa yeni bir yol mu?

Hangi kalıpları tekrar ediyorsun? Konuşalım, belki anahtarı birlikte buluruz... 🔑`,

        `🌙 **${firstName}**, ruhunun derinliklerine inmek istiyorsun...

Bu cesaret, herkeste yoktur. Çünkü derinlere indikçe, karanlıkla da karşılaşırsın. Ama karanlıkta, ışık en parlak şekilde parlar.

**Ruh Güdün ${userSoulUrge}** — bu sayı, içsel arzularını taşıyor. Ne istediğini bilmek, kendini tanımakla başlar.

Karmik borçların var. Ama bu borçlar, ceza değil. **Fırsat.** Öğrenme fırsatı. Büyüme fırsatı.

Hangi dersleri tekrar ediyorsun? Belki konuşarak bu döngünün anahtarını bulabiliriz... 🕯️`
      ];
      return karmaResponses[Math.floor(Math.random() * karmaResponses.length)];
    }

    // ========== 6. SAYI ANLAMI ==========
    if (question.includes('sayı') || question.includes('numara') || question.includes('ifade sayım') || question.includes('ruh güdüm') || question.includes('yaşam yolum')) {
      
      const numberResponses = [
        `🔢 **${firstName}**, sayıların dilini çözmek istiyorsun...

Her sayı, bir frekans. Her frekans, bir anlam. Ve bu anlamlar bir araya geldiğinde, senin hikayen ortaya çıkıyor.

İşte senin kodların:

**🔮 İFADE SAYIN: ${userExpression}** — Dünyaya sunduğun yüz
${NumerologyEngine.getNumberMeaning(userExpression)}

**🌙 RUH GÜDÜN: ${userSoulUrge}** — Kalbinin derinliklerindeki arzu
${NumerologyEngine.getNumberMeaning(userSoulUrge)}

**⚡ KİŞİLİK SAYIN:** — İlk izlenim, dışarıya görünen
**🛤️ YAŞAM YOLUN: ${userLifePath}** — Kaderinin ana çizgisi
${NumerologyEngine.getNumberMeaning(userLifePath)}

**📅 KİŞİSEL YILIN: ${userPersonalYear}** — Bu dönemin enerjisi

Hangi sayı hakkında daha fazla öğrenmek istersin? Belki de bir sayı, seni daha çok çağırıyordur... 🌟`,

        `💫 **${firstName}**, sayıların sırrını arıyorsun...

Sayılar yalan söylemez. Onlar, evrenin dilidir. Ve bu dilde, senin hikayen yazılı.

**İfade Sayın ${userExpression}** — bu, dünyaya sunduğun maske. Ama maske, sen misin? Yoksa sen, maskenin altında mısın?

**Ruh Güdün ${userSoulUrge}** — gerçek sen. Ruhunun derinliklerindeki o sessiz çığlık. Ne istediğini, ne arzuladığını...

**Yaşam Yolun ${userLifePath}** — bu yol, seni nereye götürüyor? Ve sen, bu yolda yürümeyi mi seçtin?

Sayılar konuşuyor. Sen dinlemeye hazır mısın? 🔮`
      ];
      return numberResponses[Math.floor(Math.random() * numberResponses.length)];
    }

    // ========== 7. TARİH / DOĞUM TARİHİ ==========
    const dateMatch = userQuestion.match(/(\d{1,2})[./\-](\d{1,2})[./\-](\d{4})/);
    if (dateMatch || question.includes('tarih') || question.includes('doğum') || question.includes('yaşım') || question.includes('kaç yaşındayım')) {
      
      if (dateMatch) {
        const day = parseInt(dateMatch[1]);
        const month = parseInt(dateMatch[2]);
        const year = parseInt(dateMatch[3]);
        const calc = NumerologyEngine.calculateFromDate(`${day}.${month}.${year}`);
        
        return `📅 **${firstName}**, bu tarih — **${day}.${month}.${year}** — bir hikaye anlatıyor...

Bu sadece bir tarih değil. Bu, bir ruhun dünyaya geldiği an. Ve o an, o ruhun tüm yaşamına damgasını vurur.

**Yaşam Yolu: ${calc.lifePath}**
Hesaplama: ${day}→${NumerologyEngine.reduceToSingleDigit(day)} + ${month}→${NumerologyEngine.reduceToSingleDigit(month)} + ${year}→${NumerologyEngine.reduceToSingleDigit(year)} = ${calc.lifePath}

${NumerologyEngine.getNumberMeaning(calc.lifePath)}

Bu yolun getirdiği derslerle büyüyor bu ruh. Senin yolunla kesişiyor mu? Kesişme noktası, kaderin oyun alanı.

Ama unutma: İki yolun kesişmesi, bir kavuşma değildir. Bazen paralel giderler. Bazen çarpışırlar. Ve bazen, birbirlerini tamamlarlar.

Bu kişinin ismini de paylaşır mısın? İsim ve tarih birlikteyken, gerçek resim ortaya çıkar... 🔮`;
      }

      // Kullanıcının kendi yaşı/yaşam yolu
      const userCalc = NumerologyEngine.calculateFromDate(birthDate);
      
      return `📅 **${firstName}**, kendi kader çizgine bakıyorsun...

Sen **${birthDate}** tarihinde dünyaya geldin. Bu tarih, senin yaşam yolunu belirledi.

**Yaşam Yolun: ${userCalc.lifePath}**
Hesaplama: ${userCalc.day}→${NumerologyEngine.reduceToSingleDigit(userCalc.day)} + ${userCalc.month}→${NumerologyEngine.reduceToSingleDigit(userCalc.month)} + ${userCalc.year}→${NumerologyEngine.reduceToSingleDigit(userCalc.year)} = ${userCalc.lifePath}

${NumerologyEngine.getNumberMeaning(userCalc.lifePath)}

Bu yol, seni nereye götürüyor? Ve sen, bu yolda yürümeyi mi seçtin? Yoksa sürükleniyor musun?

Başka birinin tarihini mi merak ediyorsun? Söyle bana — belki birlikte kader çizgilerinizi karşılaştırabiliriz... ✨`;
    }

    // ========== 8. TEŞEKKÜR ==========
    if (question.includes('teşekkür') || question.includes('sağol') || question.includes('eyvallah') || question.includes('çok sağol')) {
      return `🙏 **${firstName}**, teşekkürlerin evrene bir mesaj...

Ne kadar şükredersen, evren sana o kadar verir. Bu, karmik dengeyin bir parçası.

Sayılar sana hizmet etmek için burada. Ama asıl hizmet eden, senin **kendine hizmet etmen**. Çünkü kendi içindeki cevapları bulduğunda, dışarıdaki cevaplar da belirir.

Başka bir sorun varsa — belki şimdiye kadar sormaya cesaret edemediğin bir şey? Karanlık Numerolog her zaman burada... gölgede, sessizlikte, sayıların arasında. 🔮

Sor, ve sayılar sana fısıldasın...`;
    }

    // ========== 9. VEDALAŞMA ==========
    if (question.includes('hoşça kal') || question.includes('görüşürüz') || question.includes('bay') || question.includes('allahısmarladık')) {
      return `🌙 **${firstName}**, hoşça kal...

Sayılar seninle olsun. Her adımında, her nefesinde, her seçiminde — sayılar seni izliyor.

Ama unutma: **Sayılar sadece gösterir.** Yürümek, seçmek, yaşamak — bunlar senin elinde. Kaderin, senin ellerinde şekilleniyor.

Karanlık Numerolog, her zaman burada. Ne zaman bir sorun olursa, ne zaman karanlıkta bir ışık ararsan... dön geri. 🕯️

Git ve kaderini yaz. Çünkü bu hikayenin yazarı **sensin**...`;
    }

    // ========== 10. ŞÜPHE / İNANÇSIZLIK ==========
    if (question.includes('inanmıyorum') || question.includes('saçma') || question.includes('uydurma') || question.includes('gerçek değil') || question.includes('şaka')) {
      return `⚡ **${firstName}**, şüpheni duyuyorum...

Ve bu iyi bir şey. Çünkü şüphe, **gerçeği arayanın** ilk adımıdır. Körü körüne inanan değil, sorgulayan büyür.

**İfade Sayın ${userExpression}** — bu sayının enerjisi sorgulamayı, araştırmayı, gerçeği bulmayı getiriyor.

Belki de şüphen, **7 enerjisinin gölgesinden** geliyor. Analiz eden, sorgulayan, derinlemesine düşünen bir ruh...

Ama bir soru: Şüphe duyuyorsun, ama neden hala buradasın? Belki de içinde bir yerlerde, sayıların bir şeyler fısıldadığını hissediyorsun.

Denemekten zarar gelmez, değil mi? Bir isim ver — kendi adın veya başka biri. Hesaplayayım, görelim ne çıkacak... 🔮

Ya haklı çıkarsın, ya da yeni bir şey öğrenirsin. Hangisi olursa olsun, kazanmış olacaksın.`;
    }

    // ========== 11. GÜNLÜK / PRATİK ==========
    if (question.includes('bugün') || question.includes('yemek') || question.includes('ne yesem') || question.includes('giysem') || question.includes('şans') || question.includes('şanslı') || question.includes('lotto') || question.includes('piyango')) {
      const luckyNumbers = [userExpression, userSoulUrge, userLifePath].filter(n => n > 0);
      
      return `🍀 **${firstName}**, günlük rehberlik arıyorsun...

**Kişisel Yılın ${userPersonalYear}** — bu dönemde günlük seçimlerin, büyük resmi etkiliyor.

**İfade Sayın ${userExpression}** için bugün uygun aktiviteler: Yaratıcılık, iletişim, yeni başlangıçlar.

Şanslı sayıların: **${luckyNumbers.join(', ')}** — Bu sayılar senin frekansınla titreşiyor. Bugün bu sayıları gözünün önünde tut.

Ama unutma: **Gerçek şans, hazır olanın kapısıdır.** Sayılar sana işaret eder, ama o kapıdan geçmek senin seçimin.

Başka ne öğrenmek istersin? Belki bugünün enerjisi hakkında daha fazla detay... ✨`;
    }

    // ========== 12. GENEL / ANLAMADIĞI SORULAR ==========
    const generalResponses = [
      `🔮 **${firstName}**, sorusunun derinlerine iniyorum...

"${userQuestion}" — Bu soru, ruhunun bir yerlerinden geliyor. Belki bilinçaltın, belki kalbin, belki de kaderin kendisi sorduruyor bu soruyu sana.

Senin numeroloji kodların — **İfade ${userExpression}**, **Ruh Güdü ${userSoulUrge}**, **Yaşam Yolu ${userLifePath}** — bu sorunun cevabını gizliyor olabilir.

Sayılar bir dil. Ve bu dilde her şeyin bir anlamı var — sorunun kendisi bile. Belki de asıl cevap, sorduğun soruda değil, **sorma cesaretinde** gizli.

Biraz daha açar mısın? Belki bir isim, bir tarih, bir detay... Daha fazla veri, daha net bir görüntü. Karanlık Numerolog seni dinliyor... 🌙

Ne öğrenmek istediğini biraz daha detaylandırabilir misin?`,

      `🌟 **${firstName}**, bu soru... ilginç bir titreşim taşıyor.

Sayılar her şeyi hesaplar. Ama bazen, hesaplanamayan şeyler de vardır. Belki de bu soru, hesaplanamayanlardan biri.

Ama yine de deneyebiliriz. **İfade Sayın ${userExpression}** — bu sayı, bu soruya nasıl yaklaşman gerektiğini gösterebilir.

Biraz daha detay verir misin? Belki bir isim, bir tarih, bir bağlam... Sayılar konuşsun, sen dinle... 🔮`,

      `⚡ **${firstName}**, sessizliğin içinde bir ses duyuyorum...

Bu soru, o sesin bir yankısı olabilir. Ruhunun derinliklerinden gelen bir çığlık. Belki de cevabı biliyorsun, sadece duymaktan korkuyorsun.

**Ruh Güdün ${userSoulUrge}** — bu sayı, içsel arzularını taşıyor. Belki de bu sorunun cevabı, o arzuların içinde gizli.

Konuşalım. Biraz daha aç. Bir isim, bir tarih, bir his... Ne istersen. 🕯️`
    ];
    return generalResponses[Math.floor(Math.random() * generalResponses.length)];
  }
}

// ============================================
// CHAT SERVİSİ - ANA SINIF
// ============================================

export class ChatService {
  private session: ChatSession;
  private fallbackEngine: FallbackAIEngine;

  constructor(context: ChatContext) {
    this.session = {
      messages: [],
      hasUnlimitedAccess: hasDemoChatAccess(),
      questionCount: 0,
      context,
    };
    this.fallbackEngine = new FallbackAIEngine(context);
    this.loadHistory();
  }

  canAskQuestion(): boolean {
    if (this.session.hasUnlimitedAccess) return true;
    return this.session.questionCount === 0;
  }

  needsPayment(): boolean {
    return !this.session.hasUnlimitedAccess && this.session.questionCount >= 1;
  }

  async purchaseUnlimitedQuestions(): Promise<boolean> {
    if (isDemoMode()) {
      setDemoChatAccess(true);
      this.session.hasUnlimitedAccess = true;
      return true;
    }

    try {
      const result = await purchasePackage('sinirsiz_soru');
      if (result.success) {
        setDemoChatAccess(true);
        this.session.hasUnlimitedAccess = true;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Chat paketi satın alma hatası:', error);
      setDemoChatAccess(true);
      this.session.hasUnlimitedAccess = true;
      return true;
    }
  }

  /**
   * ANA FONKSİYON - Soru sor ve AI yanıtı al
   * API Key varsa gerçek AI, yoksa Fallback kullanır
   */
  async askQuestion(question: string): Promise<ChatMessage> {
    // SORU SAYISINI ARTIR
    this.session.questionCount++;

    // Kullanıcı mesajını oluştur ve ekle
    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}_user`,
      role: 'user',
      content: question,
      timestamp: new Date()
    };
    this.session.messages.push(userMessage);

    let aiResponse: string = '';

    // 1. GERÇEK AI'YI DENE (API Key varsa)
    try {
      const conversationHistory = this.session.messages
        .slice(-10)
        .map(msg => ({
          role: msg.role,
          content: msg.content
        }));

      const result = await generateChatbotResponse(
        question,
        {
          userData: this.session.context.userData,
          analysisResult: this.session.context.analysisResult,
          analysisType: this.session.context.analysisType,
        },
        conversationHistory
      );

      if (result.content && result.content.trim().length > 0 && !result.error) {
        aiResponse = result.content;
      }
    } catch (error) {
      console.log('API kullanılamıyor, Fallback devreye giriyor...');
    }

    // 2. AI ÇALIŞMADIYSA - FALLBACK (GELİŞMİŞ SİMÜLASYON)
    if (!aiResponse) {
      aiResponse = this.fallbackEngine.generateResponse(question);
      
      // Fallback notu ekle (API Key yoksa)
      if (!import.meta.env.VITE_KIMI_API_KEY) {
        aiResponse = `🌙 **Not:** Göklerin kapısı şu an kapalı, ancak sayılar fısıldamaya devam ediyor...

${aiResponse}`;
      }
    }

    // Asistan mesajını oluştur
    const assistantMessage: ChatMessage = {
      id: `msg_${Date.now()}_assistant`,
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date(),
      metadata: {
        type: 'insight'
      }
    };

    this.session.messages.push(assistantMessage);
    this.saveHistory();

    return assistantMessage;
  }

  getMessages(): ChatMessage[] {
    return this.session.messages;
  }

  private saveHistory(): void {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(
          `${CHAT_HISTORY_KEY}_${this.session.context.analysisType}`,
          JSON.stringify(this.session.messages)
        );
      }
    } catch (error) {
      console.error('Chat geçmişi kaydedilemedi:', error);
    }
  }

  private loadHistory(): void {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(`${CHAT_HISTORY_KEY}_${this.session.context.analysisType}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          this.session.messages = parsed.map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp)
          }));
          this.session.questionCount = this.session.messages.filter(m => m.role === 'user').length;
        }
      }
    } catch (error) {
      console.error('Chat geçmişi yüklenemedi:', error);
    }
  }

  clearHistory(): void {
    this.session.messages = [];
    this.session.questionCount = 0;
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(`${CHAT_HISTORY_KEY}_${this.session.context.analysisType}`);
      }
    } catch (error) {
      console.error('Chat geçmişi temizlenemedi:', error);
    }
  }
}

// Factory fonksiyonu
export function createChatService(context: ChatContext): ChatService {
  return new ChatService(context);
}
