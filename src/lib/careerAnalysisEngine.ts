import type { UserData, LetterValue } from '@/types/numerology';
import { PythagoreanValues } from '@/types/numerology';

// ============================================
// SERVET & İŞ ANALİZ MOTORU - KARANLIK NUMEROLOG
// ============================================

function reduceToSingleDigit(num: number, allowMasterNumbers: boolean = true): number {
  if (num === 0) return 0;
  if (allowMasterNumbers && (num === 11 || num === 22 || num === 33)) return num;
  
  while (num > 9) {
    num = num.toString().split('').reduce((sum, digit) => sum + parseInt(digit), 0);
    if (allowMasterNumbers && (num === 11 || num === 22 || num === 33)) return num;
  }
  return num;
}

function getLetterValue(letter: string): number {
  return PythagoreanValues[letter] || 0;
}

function getLetterValues(name: string): LetterValue[] {
  return name.split('').map(letter => ({
    letter,
    value: getLetterValue(letter)
  })).filter(lv => lv.value > 0);
}

function getMonthName(month: number): string {
  const months = ['', 'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 
                  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
  return months[month] || '';
}

// İfade Sayısı hesapla
function calculateExpressionNumber(name: string): number {
  const letterValues = getLetterValues(name);
  const total = letterValues.reduce((sum, lv) => sum + lv.value, 0);
  return reduceToSingleDigit(total);
}

// Yaşam Yolu hesapla
function calculateLifePath(birthDate: string): number {
  const [day, month, year] = birthDate.split(/[./-]/).map(Number);
  const dayReduced = reduceToSingleDigit(day);
  const monthReduced = reduceToSingleDigit(month);
  const yearReduced = reduceToSingleDigit(year);
  const total = dayReduced + monthReduced + yearReduced;
  return reduceToSingleDigit(total);
}

// Şirket ismi analizi
function analyzeCompanyName(name: string): { number: number; vibration: string } {
  const letterValues = getLetterValues(name);
  const total = letterValues.reduce((sum, lv) => sum + lv.value, 0);
  const number = reduceToSingleDigit(total);
  
  const vibrations: Record<number, string> = {
    1: 'Liderlik ve öncülük',
    2: 'İşbirliği ve uyum',
    3: 'Yaratıcılık ve iletişim',
    4: 'Disiplin ve stabilite',
    5: 'Değişim ve adaptasyon',
    6: 'Sorumluluk ve hizmet',
    7: 'Analiz ve strateji',
    8: 'Güç ve başarı',
    9: 'İnsanlık ve vizyon',
    11: 'İlham ve vizyon',
    22: 'Usta inşaatçı',
    33: 'Usta şifacı'
  };
  
  return { number, vibration: vibrations[number] || 'Bilinmeyen' };
}

// ============================================
// İŞ ANALİZİ TİPLERİ
// ============================================

export interface CareerAnalysisResult {
  yourExpression: number;
  yourLifePath: number;
  companyNumber?: number;
  companyVibration?: string;
  wealthPotential: string;
  careerPath: string;
  challenges: string;
  opportunities: string;
  timing: string;
  futureShadow: string;
}

// ============================================
// EDEBİ İŞ ANALİZİ ÜRETİCİLERİ
// ============================================

function generateWealthPotential(
  firstName: string,
  lastName: string,
  expression: number,
  lifePath: number
): string {
  return `**Servet Potansiyelin: Para ve Sen**

${firstName} ${lastName}, servetin anahtarı sende. Ama bu anahtarı kullanmak için önce kilidin nerede olduğunu bulmalısın. Ve bu kilit, dışarıda değil. İçinde.

İfade sayın **${expression}**, paranla olan ilişkini şekillendiriyor. Bu sayı, paranın sana ne ifade ettiğini gösteriyor. Güvenlik mi? Özgürlük mü? Güç mü? Yoksa başka bir şey mi?

Yaşam yolun **${lifePath}**, servet yolculuğunu belirliyor. Bu yol, kolay değil. Ama bu yol, senin yolun. Ve bu yolda, belirli derslerle karşılaşacaksın. Bu dersleri öğrenmek, servetinin anahtarı.

${expression === 8 || lifePath === 8 
  ? `Sekiz sayısı, paranın ve gücün rakamı. Sen, maddi dünyada başarılı olmaya programlanmışsın. Ama bu başarı, bedelini ödüyor. Denge, sekiz sayısının anahtarıdır. Maddi ve manevi dengen.`
  : expression === 4 || lifePath === 4
  ? `Dört sayısı, stabilite ve güvenliğin rakamı. Sen, yavaş ama emin adımlarla servet inşa edersin. Sabırlısın. Disiplinlisin. Ama bazen, risk almayı öğrenmelisin. Çünkü risk, büyümenin anahtarıdır.`
  : expression === 6 || lifePath === 6
  ? `Altı sayısı, sorumluluk ve hizmetin rakamı. Sen, başkalarına hizmet ederek servet kazanırsın. Ama bu servet, senin değil, başkalarının olmamalı. Kendine de hizmet et. Kendine de değer ver.`
  : `Sayıların, paranla özel bir ilişki kurmanı gösteriyor. Bu ilişki, senin için öğretici olacak. Çünkü para, bir aynadır. Sana, kendini gösterir.`}

Paran şu anda nerede? Birikiminde mi? Harcamalarında mı? Yoksa kayıplarında mı? Bu dağılım, paranla olan ilişkini gösteriyor. Ve bu ilişkiyi anlamak, servetini artırmanın ilk adımı.`;
}

function generateCareerPath(
  firstName: string,
  expression: number,
  lifePath: number
): string {
  const careerPaths: Record<number, string> = {
    1: 'Liderlik rolleri, girişimcilik, yöneticilik',
    2: 'Diplomasi, danışmanlık, arabuluculuk',
    3: 'Yaratıcı endüstriler, iletişim, sanat',
    4: 'Mühendislik, inşaat, organizasyon',
    5: 'Satış, pazarlama, seyahat, medya',
    6: 'Eğitim, sağlık, sosyal hizmetler',
    7: 'Araştırma, analiz, teknoloji, felsefe',
    8: 'Finans, yönetim, gayrimenkul, işletme',
    9: 'İnsani yardım, sanat, spiritüel rehberlik',
    11: 'İlham verici liderlik, vizyon, rehberlik',
    22: 'Büyük projeler, inşaat, organizasyon',
    33: 'Şifa, eğitim, rehberlik, hizmet'
  };
  
  return `**Kariyer Yolun: İşin ve Sen**

${firstName}, kariyer yolun, yaşam yolunla **${lifePath}** örtüşüyor. Bu yol, senin doğal yeteneklerini kullanmanı sağlayacak. Ama bu yol, kolay değil. Çünkü bu yol, senin büyüme yolun.

İfade sayın **${expression}**, dışarıya nasıl göründüğünü belirliyor. Ve bu görünüm, kariyerinde bir avantaj. Çünkü insanlar, seni bu şekilde görüyor. Ve bu görünüm, kapıları açıyor.

**Doğal Yeteneklerin:**
${careerPaths[expression] || 'Kendini keşfetmeyi bekleyen gizli yetenekler'}

Ama yeteneklerin tek başına yeterli değil. Çünkü kariyer, yetenekten daha fazlasını gerektirir. Disiplin. Sabır. Strateji. Ve en önemlisi, tutku.

Şu anda hangi işi yapıyorsun? Bu iş, senin yeteneklerini kullanıyor mu? Yoksa yeteneklerini bastırıyor mu? Bu sorunun cevabı, kariyerinin geleceğini belirleyecek.`;
}

function generateChallenges(
  firstName: string,
  expression: number,
  _lifePath: number
): string {
  return `**Zorluklar: Servetinin Gölgesi**

${firstName}, servet yolculuğunda bazı zorluklarla karşılaşacaksın. Bu zorluklar, seni durdurmak için değil. Güçlendirmek için var.

**Zorluk 1: Para ile Duyguların Çatışması**

Para, senin için ne ifade ediyor? Güvenlik mi? Özgürlük mü? Güç mü? Bu anlam, paranla olan ilişkini şekillendiriyor. Ve bu ilişki, bazen duygularınla çatışıyor.

${expression === 2 || expression === 6 || expression === 9 
  ? `Sen, duygusal birisin. Ve para, duygusal kararlar almana yol açabilir. Ama para, duygu değil. Mantık. Bu dengeyi bulmalısın.`
  : expression === 1 || expression === 5 || expression === 8
  ? `Sen, bağımsızsın. Ve para, bağımsızlığının sembolü olabilir. Ama para, her şey değil. Bağlantılar da önemli. Bu dengeyi bulmalısın.`
  : `Sen, dengelisin. Ama para, bu dengeni sarsabilir. Çünkü para, güçtür. Ve güç, sorumluluk getirir.`}

**Zorluk 2: Başarı ve Yalnızlık**

Başarı, yalnızlık getirebilir. Çünkü zirvede, az insan vardır. Ve bu yalnızlık, bazen ağırdır. Ama bu yalnızlık, kaçınılmaz değil. Çünkü başarı, yalnızlık demek değil. Başarı, paylaşılacak bir şeydir.

**Zorluk 3: Risk ve Güvenlik**

Risk almak mı? Yoksa güvenlikte kalmak mı? Bu ikilem, servet yolculuğunun bir parçası. Ama unutma: Büyük risk, büyük ödül. Ama aynı zamanda, büyük kayıp. Bu dengeyi bulmak, senin sorumluluğun.`;
}

function generateOpportunities(
  firstName: string,
  _lifePath: number,
  currentYear: number = new Date().getFullYear()
): string {
  const personalYear = reduceToSingleDigit(
    parseInt(firstName.split('')[0]) + (currentYear % 9 || 9),
    false
  );
  
  const opportunities: Record<number, string> = {
    1: 'Yeni başlangıçlar, yeni projeler, liderlik fırsatları',
    2: 'İşbirlikleri, ortaklıklar, diplomatik çözümler',
    3: 'Yaratıcı projeler, iletişim fırsatları, sosyal ağlar',
    4: 'Yapılandırma, organizasyon, temel atma fırsatları',
    5: 'Değişim, yeni deneyimler, esneklik gerektiren fırsatlar',
    6: 'Sorumluluk alma, hizmet, ailevi fırsatlar',
    7: 'Analiz, araştırma, strateji geliştirme fırsatları',
    8: 'Finansal büyüme, kariyer yükselişi, güç fırsatları',
    9: 'Tamamlama, bırakma, yeni başlangıçlara hazırlık'
  };
  
  return `**Fırsatlar: Servetinin Kapıları**

${firstName}, önümüzdeki dönem senin için fırsatlarla dolu. Ama bu fırsatları görmek için gözlerini açmalısın. Çünkü fırsatlar, bazen kapı çalar gibi gelir. Ama bazen, fısıldar.

**Kişisel Yılın ${personalYear}:** ${opportunities[personalYear] || 'Keşfedilmeyi bekleyen fırsatlar'}

Bu yıl, kariyerinde önemli bir adım atabilirsin. Belki bir terfi. Belki bir iş değişikliği. Belki bir yeni proje. Ama bu adım, senin atman gereken bir adım.

**Fırsat Pencereleri:**

- **${getMonthName(new Date().getMonth() + 2)}:** Yeni bir teklif gelebilir. Bu teklifi değerlendir.
- **${getMonthName(new Date().getMonth() + 4)}:** Bir bağlantı, bir kapı açabilir. Bu bağlantıyı besle.
- **${getMonthName(new Date().getMonth() + 7)}:** Finansal bir fırsat belirebilir. Bu fırsatı kaçırma.

Ama unutma: Fırsatlar, hazırlıklı olanı bulur. Hazırlıklı mısın?`;
}

function generateTiming(
  firstName: string,
  lifePath: number
): string {
  const currentMonth = new Date().getMonth() + 1;
  const favorableMonths: Record<number, number[]> = {
    1: [1, 4, 7, 10],
    2: [2, 5, 8, 11],
    3: [3, 6, 9, 12],
    4: [1, 4, 7, 10],
    5: [2, 5, 8, 11],
    6: [3, 6, 9, 12],
    7: [1, 4, 7, 10],
    8: [2, 5, 8, 11],
    9: [3, 6, 9, 12],
    11: [2, 5, 8, 11],
    22: [1, 4, 7, 10],
    33: [3, 6, 9, 12]
  };
  
  const goodMonths = favorableMonths[lifePath] || [1, 4, 7, 10];
  const isGoodMonth = goodMonths.includes(currentMonth);
  
  return `**Zamanlama: Servetinin Ritmi**

${firstName}, zamanlama, her şeydir. Doğru şeyi, doğru zamanda yapmak. Bu, servetinin sırrı.

Yaşam yolun **${lifePath}**, senin için uygun zamanları belirliyor. Bu aylar: **${goodMonths.map(m => getMonthName(m)).join(', ')}**.

${isGoodMonth 
  ? `Şu anda **${getMonthName(currentMonth)}** içindeyiz. Bu, senin için uygun bir zaman. Bir şeyler başlatmak, bir adım atmak için. Enerjin yüksek. Şansın yanında.`
  : `Şu anda **${getMonthName(currentMonth)}** içindeyiz. Bu, senin için bir bekleme zamanı. Plan yapmak, hazırlık yapmak için. Acele etme. Doğru zaman gelecek.`}

**Kritik Tarihler:**

- **${getMonthName(goodMonths[0])} 15:** Önemli bir karar günü.
- **${getMonthName(goodMonths[1])} 8:** Finansal bir fırsat günü.
- **${getMonthName(goodMonths[2])} 22:** Kariyerle ilgili bir gelişme günü.

Ama unutma: Zamanlama önemli, ama tek şey değil. Hazırlık da önemli. Cesaret de önemli. Ve en önemlisi, eylem.`;
}

function generateFutureShadow(firstName: string): string {
  return `**Geleceğin Gölgesinden Bir Kesit: Servetinin Geleceği**

${firstName}, önümüzdeki dönem servetin için kritik olacak. Üç farklı senaryo, üç farklı yol. Hangisini seçeceksin?

**Senaryo 1: Büyüme**

Servetin bir üst seviyeye taşınıyor. Belki bir terfi. Belki bir yatırım. Belki bir iş fırsatı. Bu büyüme, seni heyecanlandırıyor. Ama aynı zamanda, korkutuyor. Çünkü büyüme, değişim demek. Ve değişim, bilinmeyen demek.

**Senaryo 2: Dönüşüm**

Servet yolculuğunda bir dönüşüm yaşıyorsun. Belki bir iş değişikliği. Belki bir sektör değişikliği. Belki bir zihniyet değişikliği. Bu dönüşüm, zorlayıcı. Ama aynı zamanda, özgürleştirici.

**Senaryo 3: Sabır**

Servetin şu anda bir duraklama döneminde. Bu, kötü bir şey değil. Bu, toplanma zamanı. Güç biriktirme zamanı. Ve bu sabır, karşılığını verecek. Çünkü sabır, bir erdemdir. Ve bu erdem, ödüllendirilir.

Ve şimdi sana soruyorum, ${firstName}: **Bu üç senaryodan hangisi senin için en korkutucu? Çünkü en korkutucu olan, muhtemelen en çok büyüme potansiyeli taşıyan.**

*Kader Matrisi, servetini izliyor. Sıradaki hamlen ne olacak?*`;
}

// ============================================
// ANA İŞ ANALİZİ FONKSİYONU
// ============================================

export function generateCareerAnalysis(
  userData: UserData,
  companyName?: string
): CareerAnalysisResult {
  const fullName = userData.firstName + userData.lastName;
  
  const yourExpression = calculateExpressionNumber(fullName);
  const yourLifePath = calculateLifePath(userData.birthDate);
  
  let companyInfo = undefined;
  if (companyName) {
    companyInfo = analyzeCompanyName(companyName);
  }
  
  return {
    yourExpression,
    yourLifePath,
    companyNumber: companyInfo?.number,
    companyVibration: companyInfo?.vibration,
    wealthPotential: generateWealthPotential(
      userData.firstName,
      userData.lastName,
      yourExpression,
      yourLifePath
    ),
    careerPath: generateCareerPath(userData.firstName, yourExpression, yourLifePath),
    challenges: generateChallenges(userData.firstName, yourExpression, yourLifePath),
    opportunities: generateOpportunities(userData.firstName, yourLifePath),
    timing: generateTiming(userData.firstName, yourLifePath),
    futureShadow: generateFutureShadow(userData.firstName)
  };
}
