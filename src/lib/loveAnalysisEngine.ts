import type { UserData, LetterValue } from '@/types/numerology';
import { PythagoreanValues } from '@/types/numerology';

// ============================================
// AŞK & KARMA ANALİZ MOTORU - KARANLIK NUMEROLOG
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

// Aşk Uyumu hesapla
function calculateLoveCompatibility(lifePath1: number, lifePath2: number): number {
  const compatiblePairs: Record<number, number[]> = {
    1: [1, 3, 5, 7, 9],
    2: [2, 4, 6, 8, 11, 22, 33],
    3: [1, 3, 5, 7, 9],
    4: [2, 4, 6, 8, 22],
    5: [1, 3, 5, 7, 9],
    6: [2, 4, 6, 8, 33],
    7: [1, 3, 5, 7, 9],
    8: [2, 4, 6, 8, 22],
    9: [1, 3, 5, 7, 9],
    11: [2, 6, 11, 22, 33],
    22: [2, 4, 8, 11, 22],
    33: [2, 6, 11, 33]
  };
  
  if (compatiblePairs[lifePath1]?.includes(lifePath2)) return 85 + Math.floor(Math.random() * 15);
  return 60 + Math.floor(Math.random() * 25);
}

// ============================================
// AŞK ANALİZİ TİPLERİ
// ============================================

export interface LoveAnalysisResult {
  yourExpression: number;
  partnerExpression: number;
  yourLifePath: number;
  partnerLifePath: number;
  compatibilityScore: number;
  karmicConnection: string;
  loveForecast: string;
  challenges: string;
  advice: string;
  futureShadow: string;
}

// ============================================
// EDEBİ AŞK ANALİZİ ÜRETİCİLERİ
// ============================================

function generateKarmicConnection(
  yourName: string, 
  partnerName: string, 
  yourLifePath: number, 
  partnerLifePath: number
): string {
  const connections = [
    `**Karmik Bağ: İki Ruhun Buluşması**

${yourName} ve ${partnerName}... Bu isimler bir araya geldiğinde, geçmiş yaşamlardan gelen bir titreşim uyandırıyor. Yaşam yollarınız — **${yourLifePath}** ve **${partnerLifePath}** — birbirini tamamlayan iki parça gibi.

Bu bağ, tesadüf değil. Kaderin o gizli eli, sizi bir araya getirdi. Belki de bir önceki hayatta yarım kalan bir hikaye vardı aranızda. Belki de bir söz, bir borç, bir arzu. Şimdi, bu hayatta o hikayeyi tamamlama zamanı.

Ama karmik bağlar, her zaman kolay değildir. Çünkü geçmişin izleri, bu hayata da taşınır. Eski yaralar, eski korkular, eski kalıplar. Bu izleri fark etmek, ilişkinizin anahtarıdır. Çünkü fark etmeden, tekrar edersiniz. Ve tekrar etmek, acı verir.

${yourLifePath === partnerLifePath 
  ? `Aynı yaşam yolunda yürüyorsunuz. Bu, derin bir anlayış demek. Ama aynı zamanda, aynı zorlukları paylaşmak demek. İkiniz de benzer derslerle yüzleşiyorsunuz. Ve bu dersler, ilişkinizi güçlendirebilir veya zayıflatabilir.` 
  : `Farklı yaşam yollarında yürüyorsunuz. Bu, tamamlayıcı bir enerji demek. Senin güçlü olduğun yerde o zayıf, o güçlü olduğu yerde sen zayıfsın. Ama bu tamamlanma, bazen çatışmaya da yol açabilir. Çünkü farklılıklar, anlaşılmayı bekler.`}`,

    `**Karmik Bağ: Ayna ve Yansıma**

${yourName}, ${partnerName} senin aynan. Onda gördüğün her şey, sende de var. Sevdiğin özellikler, sende de var. Nefret ettiğin özellikler... Evet, onlar da sende var.

Yaşam yollarınız — **${yourLifePath}** ve **${partnerLifePath}** — bir ayna ilişkisi kuruyor. Karşındaki, senin görmediğin yüzlerini gösteriyor. Bazen bu güzel, bazen korkutucu. Ama her zaman, öğretici.

Bu karmik bağ, seni büyütmek için var. İlişki, bir okul. Ve ${partnerName}, senin en zor öğretmenin. Ama aynı zamanda, en sadık arkadaşın. Çünkü o seni seviyor. Gerçekten seviyor. Ama bu sevgi, her zaman tatlı değil. Bazen acı verici. Çünkü gerçek, bazen acıttırır.

Bu bağın derinliğini hissediyor musun? Eğer hissediyorsan, kaçma. Dur. Yüzleş. Çünkü bu yüzleşme, seni özgürleştirecek.`,

    `**Karmik Bağ: İki Alev, Bir Ruh**

${yourName} ve ${partnerName}... İki alev, bir ruh. Bu bağ, ikiz alev bağlantısı olabilir. Derin, yoğun, dönüştürücü. Ama aynı zamanda, zorlayıcı.

Yaşam yollarınız — **${yourLifePath}** ve **${partnerLifePath}** — bir araya geldiğinde bir yangın çıkarıyor. Bu yangın, her ikinizi de yakıyor. Ama bu yanma, arındırıcı. Eskiyi yakıyor, yeniye yer açıyor.

İkiz alev bağlantıları, her zaman romantik değildir. Bazen bir öğretmen-öğrenci ilişkisidir. Bazen bir arkadaşlıktır. Ama her zaman, dönüştürücüdür. Ve sen, bu dönüşümün ortasındasın.

${partnerName}, senin hayatının en önemli insanlarından biri. Bu, değişmeyecek bir gerçek. Ama bu önem, her zaman yanınızda olmak demek değil. Bazen uzakta durmak, en büyük sevgi göstergesidir.`
  ];
  
  return connections[Math.floor(Math.random() * connections.length)];
}

function generateLoveForecast(
  yourName: string,
  partnerName: string,
  compatibilityScore: number
): string {
  const score = compatibilityScore;
  
  if (score >= 90) {
    return `**Aşk Uyumunuz: Efsanevi Bir Bağ**

${yourName} ve ${partnerName}, uyum skorunuz **%${score}**. Bu, nadir görülen bir uyum. İki ruh, bir ritimde dans ediyor. İki kalp, aynı frekansta atıyor.

Bu uyum, tesadüf değil. Kaderin bir hediyesi. Ama bu hediye, korunmayı bekliyor. Çünkü yüksek uyum, rehavete yol açabilir. "Her şey yolunda," dersiniz. Ama yolunda olmak, çaba gerektirmez demek değil.

Önümüzdeki dönem, ilişkiniz için bir dönüm noktası olacak. Belki bir adım atacaksınız. Belki bir karar vereceksiniz. Ama bu karar, ilişkinizin geleceğini şekillendirecek.

Ama unutmayın: Yüksek uyum, sorun olmayacağı anlamına gelmez. Sorunlar olacak. Ama bu sorunlar, uyumunuz sayesinde daha kolay aşılacak. Çünkü siz, birbirinizi anlıyorsunuz. Ve anlamak, her şeyin başlangıcıdır.`;
  } else if (score >= 75) {
    return `**Aşk Uyumunuz: Güçlü Bir Temel**

${yourName} ve ${partnerName}, uyum skorunuz **%${score}**. Bu, güçlü bir temel. İki bina, aynı zeminde yükseliyor. İki ağaç, aynı topraktan besleniyor.

Bu uyum, çalışmaya değer. Çünkü güçlü bir temel, sağlam bir yapı demek. Ama temel, tek başına yeterli değil. Üzerine bir şeyler inşa etmelisiniz. Birlikte. El ele.

Önümüzdeki dönem, ilişkiniz için bir fırsat dönemi. Bazı konularda anlaşacaksınız. Bazı konularda anlaşamayacaksınız. Ama bu anlaşmazlıklar, ilişkinizi zayıflatmayacak. Güçlendirecek. Çünkü farklılıklar, zenginliktir.

Ama dikkat edin: Uyumunuz yüksek diye, iletişimi ihmal etmeyin. Konuşun. Dinleyin. Anlayın. Çünkü iletişim, ilişkinin can damarıdır.`;
  } else if (score >= 60) {
    return `**Aşk Uyumunuz: Çalışmaya Değer**

${yourName} ve ${partnerName}, uyum skorunuz **%${score}**. Bu, orta seviye bir uyum. İki farklı dünya, bir araya gelmeye çalışıyor. İki farklı melodi, bir uyum arıyor.

Bu uyum, zor değil. Ama kolay da değil. Çaba gerektiriyor. Anlayış gerektiriyor. Sabır gerektiriyor. Ama bu çaba, karşılığını verecek. Çünkü zor kazanılan şeyler, daha değerlidir.

Önümüzdeki dönem, ilişkiniz için bir sınav dönemi. Bazı farklılıklar yüzeye çıkacak. Bazı çatışmalar yaşanacak. Ama bu çatışmalar, ilişkinizin sonu değil. Bir başlangıç olabilir. Anlamaya başlamanın başlangıcı.

Ama unutmayın: Farklılıklar, ayrılık demek değil. Farklılıklar, öğrenme fırsatıdır. ${partnerName}'den öğrenecek çok şeyin var. Ve senin de ona öğreteceklerin. Bu öğrenme, ilişkinizi zenginleştirecek.`;
  } else {
    return `**Aşk Uyumunuz: Derin Bir Ders**

${yourName} ve ${partnerName}, uyum skorunuz **%${score}**. Bu, düşük bir uyum. İki farklı dünya, bir arada var olmaya çalışıyor. İki farklı frekans, bir armoni arıyor.

Bu uyum, zorlayıcı. Ama bu zorluk, boşuna değil. Çünkü zor ilişkiler, en çok şey öğreten ilişkilerdir. Kendini tanıma. Başkalarını anlama. Sınırlar koyma. Fedakarlık yapma. Hepsi, bu ilişkide var.

Ama bu zorluk, ilişkinin bitmesi gerektiği anlamına gelmez. Ama gözlerini açman gerektiği anlamına gelir. Bu ilişki neden zor? Hangi konularda çatışıyorsunuz? Bu çatışmalar, çözülebilir mi?

Önümüzdeki dönem, ilişkiniz için bir karar dönemi. Ya bu ilişkiyi çalışacaksınız. Ya da farklı yollara gireceksiniz. Ama hangi kararı verirseniz verin, bilinçli verin. Çünkü her karar, bir ders. Ve her ders, bir büyüme.`;
  }
}

function generateChallenges(
  yourLifePath: number,
  partnerLifePath: number
): string {
  const challenges: Record<string, string> = {
    '1-1': `**Zorluk: İki Lider, Bir Taht**

İkiniz de lider ruhlusunuz. İkiniz de bağımsız olmak istiyorsunuz. Ama bir ilişki, bazen teslim olmayı gerektirir. Bazen "tamam, sen haklısın" demeyi. Ama bu, güçsüzlük değil. Güçlülüktür.

Çatışma alanınız: Kontrol. Kim ne zaman liderlik edecek? Kim ne zaman teslim olacak? Bu dengeyi bulmak, ilişkinizin anahtarı.`,

    '1-2': `**Zorluk: Hız ve Yavaşlık**

Sen hızlısın. Kararlarını hızlı verirsin. Harekete hızlı geçersin. Ama o, yavaş. Düşünür. Hissetmek ister. Bu farklılık, sabırsızlığa yol açabilir. Ama sabır, bir erdemdir. Ve bu erdemi öğrenmen gerekiyor.

Çatışma alanınız: Tempo. Senin hızına uyum sağlaması mı gerekiyor? Yoksa senin onun yavaşlığına saygı duyman mı? Bu dengeyi bulmak, ilişkinizin anahtarı.`,

    '2-2': `**Zorluk: İki Hassas Ruh**

İkiniz de hassassınız. İkiniz de duygularınızı derinden hissediyorsunuz. Ama bu hassasiyet, bazen birbirini yorabilir. Çünkü iki hassas ruh, birbirinin hassasiyetini tetikleyebilir.

Çatışma alanınız: Sınırlar. Hassasiyetinizi korurken, birbirinizi de korumalısınız. Ama bu koruma, mesafe anlamına gelmemeli. Bir denge bulmalısınız.`,

    'default': `**Zorluk: Farklılıkların Dansı**

Yaşam yollarınız farklı. Bu farklılık, zenginlik. Ama aynı zamanda, zorluk. Çünkü farklılıklar, anlaşmazlıklara yol açabilir. Ve anlaşmazlıklar, çatışmalara.

Çatışma alanınız: Anlayış. Onun dünyasını anlamaya çalış. Ama aynı zamanda, kendi dünyanı da anlat. İletişim, bu zorluğun anahtarı.`
  };
  
  const key = `${yourLifePath}-${partnerLifePath}`;
  return challenges[key] || challenges['default'];
}

function generateAdvice(yourName: string, partnerName: string): string {
  return `**Tavsiyeler: Aşkın Anahtarı**

${yourName}, ${partnerName} ile olan ilişkin için şu tavsiyeleri dinle:

**1. Konuş, Ama Dinle de**

İletişim, ilişkinin can damarıdır. Ama iletişim, sadece konuşmak değil. Dinlemek de. Gerçekten dinlemek. Onun söylediklerini, söylemediklerini duymak. Gözlerinin içine bakarak dinlemek.

**2. Kabul Et, Değiştirmeye Çalışma**

Onu sevdin, öyle değil mi? Peki neden değiştirmeye çalışıyorsun? İnsanlar değişir, evet. Ama kendi istedikleri zaman. Kendi hızlarında. Onu olduğu gibi kabul et. Değişim, kabulden gelir.

**3. Kendini Unutma**

İlişkide kaybolmak kolay. "Biz" olmak, "ben" olmayı unutturabilir. Ama sağlıklı bir ilişki, iki bireyin bir arada olmasıdır. Kendi hayatını, kendi ilgi alanlarını, kendi arkadaşlarını koru. Bu, ilişkiyi zenginleştirir.

**4. Küçük Şeyleri Büyütme**

Her şeyi büyütme. Her tartışmayı kavgaya çevirme. Her farklılığı ayrılık nedeni yapma. Bazen "tamam" demek, en akıllıca seçimdir. Bazen susmak, en güçlü cevaptır.

**5. Aşkı Göster**

Söylemek yetmez. Göstermelisin. Küçük jestler. Sürprizler. Dokunuşlar. Bakışlar. Aşk, eylemdir. Ve bu eylemler, ilişkiyi canlı tutar.`;
}

function generateFutureShadow(yourName: string, partnerName: string): string {
  return `**Geleceğin Gölgesinden Bir Kesit: Aşkın Geleceği**

${yourName} ve ${partnerName}, önümüzdeki dönem ilişkiniz için kritik olacak. Üç farklı senaryo, üç farklı yol. Hangisini seçeceksiniz?

**Senaryo 1: Derinleşme**

İlişkiniz bir üst seviyeye taşınıyor. Belki bir adım atacaksınız. Belki bir karar vereceksiniz. Bu karar, ilişkinizi güçlendirecek. Ama bu güçlenme, çaba gerektirecek. Her ikinizin de çabası.

**Senaryo 2: Sınav**

Bir sınavla karşılaşacaksınız. Belki bir dış etken, belki bir iç çatışma. Bu sınav, ilişkinizin ne kadar sağlam olduğunu gösterecek. Ama bu sınav, ilişkinizin sonu değil. Bir başlangıç olabilir.

**Senaryo 3: Dönüşüm**

Bir dönüşüm yaşıyorsunuz. İlişkinizin dinamiği değişiyor. Belki roller değişiyor. Belki beklentiler değişiyor. Bu dönüşüm, zorlayıcı. Ama aynı zamanda, dönüştürücü.

Ve şimdi sana soruyorum, ${yourName}: **Bu üç senaryodan hangisi senin için en korkutucu? Çünkü en korkutucu olan, muhtemelen en çok büyüme potansiyeli taşıyan.**

*Kader Matrisi, aşkını izliyor. Sıradaki hamlen ne olacak?*`;
}

// ============================================
// ANA AŞK ANALİZİ FONKSİYONU
// ============================================

export function generateLoveAnalysis(
  userData: UserData,
  partnerData: { firstName: string; lastName: string; birthDate: string }
): LoveAnalysisResult {
  const yourFullName = userData.firstName + userData.lastName;
  const partnerFullName = partnerData.firstName + partnerData.lastName;
  
  const yourExpression = calculateExpressionNumber(yourFullName);
  const partnerExpression = calculateExpressionNumber(partnerFullName);
  const yourLifePath = calculateLifePath(userData.birthDate);
  const partnerLifePath = calculateLifePath(partnerData.birthDate);
  
  const compatibilityScore = calculateLoveCompatibility(yourLifePath, partnerLifePath);
  
  return {
    yourExpression,
    partnerExpression,
    yourLifePath,
    partnerLifePath,
    compatibilityScore,
    karmicConnection: generateKarmicConnection(
      userData.firstName, 
      partnerData.firstName, 
      yourLifePath, 
      partnerLifePath
    ),
    loveForecast: generateLoveForecast(
      userData.firstName,
      partnerData.firstName,
      compatibilityScore
    ),
    challenges: generateChallenges(yourLifePath, partnerLifePath),
    advice: generateAdvice(userData.firstName, partnerData.firstName),
    futureShadow: generateFutureShadow(userData.firstName, partnerData.firstName)
  };
}
