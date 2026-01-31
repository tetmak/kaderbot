import type { PartnerData, LoveCompatibilityResult } from '@/types/loveCompatibility';
import { PythagoreanValues, Vowels } from '@/types/numerology';

// ============ YARDIMCI FONKSİYONLAR ============

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

function isVowel(letter: string): boolean {
  return Vowels.includes(letter);
}

function calculateSoulUrge(firstName: string, lastName: string): number {
  const fullName = firstName + lastName;
  const vowels = fullName.split('').filter(isVowel);
  const total = vowels.reduce((sum, letter) => sum + getLetterValue(letter), 0);
  return reduceToSingleDigit(total);
}

function calculateExpression(firstName: string, lastName: string): number {
  const fullName = firstName + lastName;
  const letters = fullName.split('').filter(l => getLetterValue(l) > 0);
  const total = letters.reduce((sum, letter) => sum + getLetterValue(letter), 0);
  return reduceToSingleDigit(total);
}

function calculateLifePath(birthDate: string): number {
  const [day, month, year] = birthDate.split(/[./-]/).map(Number);
  const dayReduced = reduceToSingleDigit(day);
  const monthReduced = reduceToSingleDigit(month);
  const yearReduced = reduceToSingleDigit(year);
  return reduceToSingleDigit(dayReduced + monthReduced + yearReduced);
}

function calculatePersonalYear(birthDate: string, targetYear: number = new Date().getFullYear()): number {
  const [day, month] = birthDate.split(/[./-]/).map(Number);
  return reduceToSingleDigit(day + month + targetYear, false);
}

// ============ UYUM HESAPLAMA ============

function calculateSoulCompatibility(userSoul: number, partnerSoul: number): number {
  // Ruh güdüsü uyumu - sesli harflerin uyumu
  const diff = Math.abs(userSoul - partnerSoul);
  
  // Aynı sayı = mükemmel uyum
  if (userSoul === partnerSoul) return 95;
  
  // Tamamlayıcı sayılar (örn: 1-2, 3-6, 4-8)
  const complementaryPairs = [[1, 2], [2, 1], [3, 6], [6, 3], [4, 8], [8, 4], [5, 9], [9, 5]];
  if (complementaryPairs.some(pair => pair[0] === userSoul && pair[1] === partnerSoul)) {
    return 90;
  }
  
  // Zorlayıcı çiftler (örn: 1-8, 4-5)
  const challengingPairs = [[1, 8], [8, 1], [4, 5], [5, 4], [2, 7], [7, 2]];
  if (challengingPairs.some(pair => pair[0] === userSoul && pair[1] === partnerSoul)) {
    return 45;
  }
  
  // Genel formül
  if (diff === 1) return 85;
  if (diff === 2) return 75;
  if (diff === 3) return 65;
  if (diff >= 4) return 55;
  
  return 70;
}

function calculateDestinyCompatibility(userExpr: number, partnerExpr: number): number {
  // Kader (ifade) uyumu - dünyevi hedeflerin uyumu
  const diff = Math.abs(userExpr - partnerExpr);
  
  // Aynı kader sayısı = ortak hedefler
  if (userExpr === partnerExpr) return 92;
  
  // Güçlü işbirliği çiftleri
  const powerPairs = [[1, 8], [8, 1], [3, 5], [5, 3], [2, 6], [6, 2], [4, 9], [9, 4]];
  if (powerPairs.some(pair => pair[0] === userExpr && pair[1] === partnerExpr)) {
    return 88;
  }
  
  // Zorlayıcı çiftler
  const challengingPairs = [[1, 4], [4, 1], [7, 5], [5, 7], [3, 8], [8, 3]];
  if (challengingPairs.some(pair => pair[0] === userExpr && pair[1] === partnerExpr)) {
    return 50;
  }
  
  if (diff === 1) return 82;
  if (diff === 2) return 72;
  if (diff === 3) return 62;
  if (diff >= 4) return 52;
  
  return 68;
}

function calculatePhysicalChemistry(userLifePath: number, partnerLifePath: number): number {
  // Yaşam yolu uyumu - fiziksel/duygusal çekim
  const diff = Math.abs(userLifePath - partnerLifePath);
  
  // Aynı yaşam yolu = derin anlayış
  if (userLifePath === partnerLifePath) return 90;
  
  // Manyetik çekim çiftleri
  const magneticPairs = [[1, 5], [5, 1], [2, 6], [6, 2], [3, 9], [9, 3], [4, 7], [7, 4]];
  if (magneticPairs.some(pair => pair[0] === userLifePath && pair[1] === partnerLifePath)) {
    return 95;
  }
  
  // Tutkulu ama zorlayıcı
  const passionateChallenging = [[1, 9], [9, 1], [5, 8], [8, 5], [3, 7], [7, 3]];
  if (passionateChallenging.some(pair => pair[0] === userLifePath && pair[1] === partnerLifePath)) {
    return 75; // Yüksek tutku ama zorluk
  }
  
  if (diff === 1) return 88;
  if (diff === 2) return 78;
  if (diff === 3) return 68;
  if (diff >= 4) return 58;
  
  return 70;
}

// ============ KİŞİSEL YIL ÇAKIŞMA ANALİZİ ============

function analyzeYearCycleConflict(userYear: number, partnerYear: number): string | null {
  // Kritik çakışmalar
  
  // 9 (Bitiş) + 1 (Başlangıç) = Ayrılık riski
  if ((userYear === 9 && partnerYear === 1) || (userYear === 1 && partnerYear === 9)) {
    return "⚠️ KRİTİK UYARI: Biri bitiş (9), diğeri başlangıç (1) döngüsünde. Bu enerji farkı ayrılık riskini yüksek oranda artırıyor. Biri kapatırken diğeri yeni sayfa açmak istiyor.";
  }
  
  // 4 (Stabilite) + 5 (Değişim) = Çatışma
  if ((userYear === 4 && partnerYear === 5) || (userYear === 5 && partnerYear === 4)) {
    return "⚠️ Yüksek Çatışma Riski: Biri sabitlik (4), diğeri değişim (5) istiyor. Rutin mi, macera mı savaşı.";
  }
  
  // 2 (İlişki) + 7 (İzolasyon) = Mesafe
  if ((userYear === 2 && partnerYear === 7) || (userYear === 7 && partnerYear === 2)) {
    return "⚠️ Duygusal Mesafe Riski: Biri yakınlık (2), diğeri yalnızlık (7) arıyor. Biriniz çok verirken diğeri uzaklaşıyor.";
  }
  
  // 3 (Eğlence) + 8 (Ciddiyet) = Farklı öncelikler
  if ((userYear === 3 && partnerYear === 8) || (userYear === 8 && partnerYear === 3)) {
    return "⚠️ Öncelik Çatışması: Biri eğlence (3), diğeri kariyer/ciddiyet (8) peşinde. Hayat tarzı farklılıkları artabilir.";
  }
  
  return null;
}

// ============ ÇATIŞMA ANALİZİ ============

function generateConflictAnalysis(
  userSoul: number, partnerSoul: number,
  userExpr: number, partnerExpr: number,
  userLifePath: number, partnerLifePath: number
): LoveCompatibilityResult['conflictAnalysis'] {
  const conflicts = [];
  
  // 1 vs 8: Güç savaşı
  if ((userSoul === 1 && partnerSoul === 8) || (userSoul === 8 && partnerSoul === 1) ||
      (userExpr === 1 && partnerExpr === 8) || (userExpr === 8 && partnerExpr === 1)) {
    conflicts.push({
      title: "Güç Savaşı",
      description: "İkiniz de liderlik etmek, kontrolü elde tutmak istiyorsunuz. Bu ilişkide 'kim haklı' savaşından 'nasıl birlikte büyürüz'a geçmelisiniz. Aksi halde sürekli çekişme...",
      severity: 'high' as const
    });
  }
  
  // 4 vs 5: Rutin vs Macera
  if ((userSoul === 4 && partnerSoul === 5) || (userSoul === 5 && partnerSoul === 4) ||
      (userExpr === 4 && partnerExpr === 5) || (userExpr === 5 && partnerExpr === 4)) {
    conflicts.push({
      title: "Rutin vs Macera",
      description: "Biriz güvenlik, istikrar, plan peşinde. Diğeri özgürlük, spontanlık, değişim. Biri 'Cumartesi evde film' derken diğeri 'Birlikte Bangkok'a gidelim' diyor. Orta yol bulunamazsa biri sıkılır, diğeri endişelenir.",
      severity: 'medium' as const
    });
  }
  
  // 2 vs 7: Duygusal İhtiyaç vs Mesafe
  if ((userSoul === 2 && partnerSoul === 7) || (userSoul === 7 && partnerSoul === 2)) {
    conflicts.push({
      title: "Duygusal Açlık vs İçe Dönüklük",
      description: "Biri sürekli iletişim, yakınlık, 'seni seviyorum' duymak istiyor. Diğeri kendi dünyasında, derin düşüncelerle meşgul. Duygusal olarak açlık çeken taraf, zamanla başka limanlara yelken açabilir.",
      severity: 'high' as const
    });
  }
  
  // 3 vs 8: Eğlence vs Ciddiyet
  if ((userExpr === 3 && partnerExpr === 8) || (userExpr === 8 && partnerExpr === 3)) {
    conflicts.push({
      title: "Hayat Tarzı Çatışması",
      description: "Biriz neşeli, sosyal, hafif. Diğeri ciddi, hırslı, odaklı. Biri 'hayatı yaşayalım' derken diğeri 'imparatorluk kuruyoruz' diyor. Uzun vadede biriniz diğerini 'ağırlaştırıcı', diğeri birinizi 'ciddiyetsiz' bulabilir.",
      severity: 'medium' as const
    });
  }
  
  // 6 vs 5: Bağlılık vs Özgürlük
  if ((userLifePath === 6 && partnerLifePath === 5) || (userLifePath === 5 && partnerLifePath === 6)) {
    conflicts.push({
      title: "Bağlanma vs Kaçış",
      description: "Biriz aile kurmak, bağlanmak, evde olmak istiyor. Diğeri sürekli hareket, yeni deneyimler, bağımsızlık peşinde. Evlilik/sabit ilişki düşünüyorsanız, bu farklılık çok acıtabilir.",
      severity: 'critical' as const
    });
  }
  
  // 9 vs 1: Bitiş vs Başlangıç (yaşam yolunda)
  if ((userLifePath === 9 && partnerLifePath === 1) || (userLifePath === 1 && partnerLifePath === 9)) {
    conflicts.push({
      title: "Karmik Döngü Farkı",
      description: "Biriz hayatının sonbaharında (9), diğeri baharında (1). Biri geçmişi tamamlamaya çalışırken diğeri yeni şeyler keşfediyor. Bu fark, zamanla büyüyebilir. Biri 'yavaşlayalım' derken diğeri 'hızlanalım' diyor.",
      severity: 'high' as const
    });
  }
  
  // Eğer çatışma yoksa, genel uyarı
  if (conflicts.length === 0) {
    conflicts.push({
      title: "Gizli Çatışma",
      description: "Sayılarınız uyumlu görünüyor ama unutma: Uyum, çatışmayı gizleyebilir. İlişkideki sessiz sorunları gözden kaçırma. Bazen 'çok iyi anlaşıyoruz' demek, gerçek ihtiyaçları konuşmamak demektir.",
      severity: 'low' as const
    });
  }
  
  return conflicts;
}

// ============ CİNSEL & DUYGUSAL REZONANS ============

function generateSexualResonance(userLifePath: number, partnerLifePath: number): string {
  const combinations: Record<string, string> = {
    '1-1': "Tutku dolu ama rekabetçi. İkiniz de liderlik etmek isteyince yatak odasında bile 'kim kime' savaşı yaşanabilir. Ateşli ama yorucu.",
    '1-2': "Güçlü çekim. 1'in dominant enerjisi, 2'nin teslimiyetçi yönüyle buluşuyor. Dengeli ve tatmin edici.",
    '1-5': "⚡ MANYETİK! Bu kombinasyon fiziksel çekim açısından altın değerinde. Tutku, macera, spontanlık. Ama uzun vadeli bağlılık sorgulanmalı.",
    '2-6': "Duygusal derinlik ve şefkat. Fiziksel yakınlık, duygusal güvenle birlikte büyür. Yavaş ama derin.",
    '3-5': "Eğlenceli, oyunbaz, deneyimci. Rutin öldürür, yenilik canlandırır. Ama derinlik arayan için yetersiz kalabilir.",
    '4-8': "Güçlü ve kararlı. Fiziksel bağlılık yüksek ama romantizim düşük olabilir. 'İş gibi' hissettirmemeye dikkat.",
    '5-9': "Evrensel çekim. 5'in maceracılığı, 9'nun derinliğiyle buluşuyor. Hem bedensel hem ruhsal.",
    '6-9': "Şefkat ve fedakarlık. Duygusal bağlılık çok yüksek ama tutku zamanla alışkanlığa dönüşebilir.",
    '7-7': "Derin ama mesafeli. İkiniz de içe dönüksünüz. Fiziksel yakınlık, ruhsal bağdan sonra gelir. Sabır gerekir.",
    '8-8': "Güçlü ve yoğun. İki otoriter enerji. Ya mükemmel uyum ya da sürekli güç savaşı. Orta yol yok.",
  };
  
  const key1 = `${userLifePath}-${partnerLifePath}`;
  const key2 = `${partnerLifePath}-${userLifePath}`;
  
  return combinations[key1] || combinations[key2] || 
    `Yaşam yollarınız (${userLifePath} ve ${partnerLifePath}) benzersiz bir rezonans yaratıyor. Fiziksel çekiminiz, duygusal bağınızla doğru orantılı. Ama unutma: Sayılar potansiyel gösterir, siz o potansiyeli gerçekleştirirsiniz.`;
}

function generateEmotionalResonance(userSoul: number, partnerSoul: number): string {
  const combinations: Record<string, string> = {
    '1-1': "İkiniz de bağımsızlığa düşkünsünüz. Duygusal olarak birbirinize çok muhtaç görünmeyebilirsiniz. Ama bu, sevgisizlik değil, farklı bir sevgi dili.",
    '1-2': "Mükemmel tamamlanma. 1'in güçlü duruşu, 2'nin ihtiyaç duyduğu güveni veriyor. 2'nin şefkati, 1'in yumuşamasını sağlıyor.",
    '2-2': "Derin duygusal bağ. İkiniz de sevmek, sevilmek, yakınlık istiyorsunuz. Ama birbirinizin duygusal dalgalanmalarını da besleyebilirsiniz.",
    '2-6': "Duygusal cennet. İki şefkatli ruh. Birbirinizin ihtiyaçlarını hissetme konusunda doğal yeteneklisiniz. Ama sınırları unutmayın.",
    '3-6': "Neşe ve şefkat. 3'ün neşesi, 6'nın bakımıyla buluşuyor. Duygusal olarak besleyici bir ilişki.",
    '4-8': "Pratik ama derin. Duygularınızı sözlerle değil, eylemlerle gösteriyorsunuz. Güvenilirlik, size en büyük hediye.",
    '5-9': "Özgür ruhlar. Duygusal olarak birbirinize çok bağımlı değilsiniz. Bu özgürlük, ilişkiyi canlı tutar ama derinlik sorgulanmalı.",
    '7-7': "Ruhsal ikizler. Sözlerden öte, sessiz anlayış. Duygusal bağınız, derin konuşmalarda, ortak sessizliklerde büyür.",
  };
  
  const key1 = `${userSoul}-${partnerSoul}`;
  const key2 = `${partnerSoul}-${userSoul}`;
  
  return combinations[key1] || combinations[key2] || 
    `Ruh güdüleriniz (${userSoul} ve ${partnerSoul}) özel bir duygusal dans yaratıyor. İkiniz de farklı duygusal diller konuşuyor olabilirsiniz. Önemli olan, birbirinizin dilini öğrenmeye açık olmanız.`;
}

// ============ KİLİTLİ İÇERİK (PAYWALL) ============

function generateLockedContent(
  user: PartnerData, partner: PartnerData,
  _userSoul: number, partnerSoul: number,
  _userExpr: number, _partnerExpr: number,
  _userLifePath: number, _partnerLifePath: number,
  userYear: number, partnerYear: number,
  overallScore: number
): LoveCompatibilityResult['lockedContent'] {
  
  // Ayrılık riski analizi
  let breakupRisk = "";
  if (overallScore < 50) {
    breakupRisk = `⚠️ KRİTİK AYRILIK RİSKİ: Sayılarınız %${overallScore} uyum gösteriyor. Bu, ilişkinizin doğal olarak zorlayıcı olduğunu gösteriyor. Ama unutma: Zorlayıcı ilişkiler, en büyük büyüme fırsatlarını sunar. Eğer bu ilişkiyi sürdürmek istiyorsan, her gün bilinçli çaba göstermelisin. Aksi halde, 6 ay içinde ayrılık kaçınılmaz.`;
  } else if (overallScore < 70) {
    breakupRisk = `⚡ ORTA SEVİYE RİSK: %${overallScore} uyum, ilişkinizin potansiyeli olduğunu ama çalışma gerektiğini gösteriyor. Temel sorun: Biriz 'verirken' diğeri 'alıyor' gibi hissediyor olabilir. Bu dengeyi bulamazsanız, 1 yıl içinde duygusal mesafe büyür.`;
  } else {
    breakupRisk = `✓ DÜŞÜK RİSK: %${overallScore} uyum, güçlü bir temel olduğunu gösteriyor. Ama unutma: İyi ilişkiler de bozulabilir. Temel sorununuz: 'Çok iyi anlaşıyoruz' diyerek gerçek sorunları görmezden gelebilirsiniz. Konuşmayan çiftler, zamanla yabancılaşır.`;
  }
  
  // Karmik borç analizi
  const karmicNumbers = [11, 22, 33, 13, 14, 16, 19];
  const hasKarmicUser = karmicNumbers.includes(_userLifePath);
  const hasKarmicPartner = karmicNumbers.includes(_partnerLifePath);
  
  let karmicDebt = "";
  if (hasKarmicUser && hasKarmicPartner) {
    karmicDebt = `🔮 KARMİK İKİZLER: İkinizin de yaşam yolunda Usta Sayılar var. Bu, geçmiş hayatlardan gelen bir bağ olduğunu gösteriyor. Birbirinize BORÇLUSUNUZ. Bu borç, ya bu hayatta ödenir, ya da bir sonrakine ertelenir. Eğer bu ilişki zorlayıcıysa, bu borcu ödeme zamanındasınız demektir.`;
  } else if (hasKarmicUser || hasKarmicPartner) {
    const karmicPerson = hasKarmicUser ? user.firstName : partner.firstName;
    karmicDebt = `🌙 KARMİK DERS: ${karmicPerson}, bu ilişkiye geçmiş hayatlarından bir dersle geliyor. Bu kişi, bu ilişkide belirli bir şeyi ÖĞRENMEK veya ÖĞRETMEK zorunda. Eğer bu ders tamamlanmazsa, benzer desenler tekrarlanacak.`;
  } else {
    karmicDebt = `🌿 YENİ RUH BAĞI: İkinizin de yaşam yolunda karmik sayılar yok. Bu, bu ilişkinin yeni bir ruh bağının başlangıcı olduğunu gösteriyor. Geçmiş hayat yükleri yok, ama gelecek hayatlara miras bırakacak kalıplar yaratıyorsunuz. Nelere imza atıyorsunuz?`;
  }
  
  // Gelecek öngörüsü
  const futurePrediction = `📅 2026-2027 ÖNGÖRÜSÜ: 
  
Sen (${user.firstName}): Kişisel Yıl ${userYear} enerjisindesin. Bu, ${userYear === 9 ? 'bitişler ve bırakışlar' : userYear === 1 ? 'yeni başlangıçlar' : userYear === 2 ? 'ilişkiler ve işbirlikleri' : userYear === 3 ? 'yaratıcılık ve sosyallik' : userYear === 4 ? 'çalışma ve yapılanma' : userYear === 5 ? 'değişim ve macera' : userYear === 6 ? 'sorumluluk ve aile' : userYear === 7 ? 'içsel keşif' : 'güç ve başarı'} yılı.

Partner (${partner.firstName}): Kişisel Yıl ${partnerYear} enerjisinde. Bu, ${partnerYear === 9 ? 'bitişler' : partnerYear === 1 ? 'başlangıçlar' : partnerYear === 2 ? 'ilişkiler' : partnerYear === 3 ? 'yaratıcılık' : partnerYear === 4 ? 'stabilite' : partnerYear === 5 ? 'değişim' : partnerYear === 6 ? 'aile' : partnerYear === 7 ? 'içe dönüklük' : 'güç'} yılı.

${userYear === partnerYear ? 'Aynı döngüdesiniz! Bu, harika bir senkronizasyon. Aynı enerjiyi hissediyorsunuz.' : 'Farklı döngülerdesiniz. Bu, birbirinizin ihtiyaçlarını anlamakta zorlanabileceğiniz anlamına geliyor.'}

Kritik tarihler: ${new Date().getFullYear()} Mart, Haziran ve Eylül aylarında ilişkiniz dönüm noktaları yaşayacak.`;
  
  // Did You Mean sorusu
  const didYouMean = `Did You Mean? 

${user.firstName}, partnerinin (${partner.firstName}) Ruh Güdüsü ${partnerSoul} olduğunu biliyorsun. Ama biliyor musun, bu sayının GÖLGESİ (korkuları, savunma mekanizmaları) ilişkinizdeki asıl sorunu oluşturuyor? 

${partnerSoul === 1 ? 'Partnerin bağımsızlık korkusu yaşıyor. Yakınlaştıkça kaçıyor.' : partnerSoul === 2 ? 'Partnerin reddedilme korkusu var. Sürekli onay arıyor.' : partnerSoul === 3 ? 'Partnerin dikkat dağınıklığı, derinleşmekten kaçma.' : partnerSoul === 4 ? 'Partnerin değişim korkusu, rutine sıkı sıkıya sarılma.' : partnerSoul === 5 ? 'Partnerin bağlanma korkusu, özgürlüğüne düşkünlük.' : partnerSoul === 6 ? 'Partnerin mükemmeliyetçilik, kendini feda etme eğilimi.' : partnerSoul === 7 ? 'Partnerin duygusal mesafe, kendini açamama.' : partnerSoul === 8 ? 'Partnerin kontrol ihtiyacı, güçsüzlük korkusu.' : 'Partnerin bitirme/bırakma korkusu, sona erteleme.'}

Bu gölgeyi aydınlatmadan, ilişkinizin gerçek potansiyeline ulaşamazsınız. Partnerinin gölgesini ve senin ona nasıl destek olacağını öğrenmek ister misin? (Ayrıntılı Karmik İlişki Raporu - 249₺)`;
  
  return { breakupRisk, karmicDebt, futurePrediction, didYouMean };
}

// ============ ANA FONKSİYON ============

export function calculateLoveCompatibility(
  user: PartnerData, 
  partner: PartnerData
): LoveCompatibilityResult {
  
  // Temel sayıları hesapla
  const userSoul = calculateSoulUrge(user.firstName, user.lastName);
  const partnerSoul = calculateSoulUrge(partner.firstName, partner.lastName);
  
  const userExpr = calculateExpression(user.firstName, user.lastName);
  const partnerExpr = calculateExpression(partner.firstName, partner.lastName);
  
  const userLifePath = calculateLifePath(user.birthDate);
  const partnerLifePath = calculateLifePath(partner.birthDate);
  
  const userYear = calculatePersonalYear(user.birthDate);
  const partnerYear = calculatePersonalYear(partner.birthDate);
  
  // Uyum skorlarını hesapla
  const soulConnection = calculateSoulCompatibility(userSoul, partnerSoul);
  const destinyAlignment = calculateDestinyCompatibility(userExpr, partnerExpr);
  const physicalChemistry = calculatePhysicalChemistry(userLifePath, partnerLifePath);
  
  // Genel skor (ağırlıklı ortalama)
  const overallScore = Math.round(
    soulConnection * 0.35 +      // Ruh bağlantısı en önemli
    destinyAlignment * 0.30 +    // Kader uyumu
    physicalChemistry * 0.35     // Fiziksel çekim
  );
  
  // Yıl çakışması analizi
  const yearCycleWarning = analyzeYearCycleConflict(userYear, partnerYear);
  
  // Çatışma analizi
  const conflictAnalysis = generateConflictAnalysis(
    userSoul, partnerSoul, userExpr, partnerExpr, userLifePath, partnerLifePath
  );
  
  // Cinsel ve duygusal rezonans
  const sexualResonance = generateSexualResonance(userLifePath, partnerLifePath);
  const emotionalResonance = generateEmotionalResonance(userSoul, partnerSoul);
  
  // Kilitli içerik
  const lockedContent = generateLockedContent(
    user, partner, userSoul, partnerSoul, userExpr, partnerExpr,
    userLifePath, partnerLifePath, userYear, partnerYear, overallScore
  );
  
  return {
    overallScore,
    soulConnection,
    destinyAlignment,
    physicalChemistry,
    userPersonalYear: userYear,
    partnerPersonalYear: partnerYear,
    yearCycleWarning,
    conflictAnalysis,
    sexualResonance,
    emotionalResonance,
    lockedContent,
    calculations: {
      userSoulUrge: userSoul,
      partnerSoulUrge: partnerSoul,
      userExpression: userExpr,
      partnerExpression: partnerExpr,
      userLifePath,
      partnerLifePath
    }
  };
}
