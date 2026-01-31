import type { BusinessData, WealthAnalysisResult } from '@/types/wealthAnalysis';
import { PythagoreanValues } from '@/types/numerology';

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

function calculateExpression(firstName: string, lastName: string): number {
  const fullName = firstName + lastName;
  const letters = fullName.split('').filter(l => getLetterValue(l) > 0);
  const total = letters.reduce((sum, letter) => sum + getLetterValue(letter), 0);
  return reduceToSingleDigit(total);
}

// ============ ŞİRKET İSMİ ANALİZİ ============

function calculateCompanyNumber(companyName: string): {
  number: number;
  calculation: string;
} {
  const letters = companyName.split('').filter(l => getLetterValue(l) > 0);
  const values = letters.map(l => ({ letter: l, value: getLetterValue(l) }));
  const total = values.reduce((sum, v) => sum + v.value, 0);
  const reduced = reduceToSingleDigit(total);
  
  const calculation = values.map(v => `${v.letter}=${v.value}`).join(' + ') + 
                     ` = ${total} → ${reduced}`;
  
  return { number: reduced, calculation };
}

function getCompanyInterpretation(companyNumber: number): string {
  const interpretations: Record<number, string> = {
    1: "Liderlik ve özgünlük enerjisi. Bu isim, sektöründe öncü olmayı, fark yaratmayı vaat ediyor. Ama rekabetçi bir ortamda başarılı olabilir.",
    2: "İşbirliği ve uyum enerjisi. Ortaklıklar, partnerlikler için ideal. Ama tek başına liderlik etmek zor olabilir.",
    3: "Yaratıcılık ve iletişim enerjisi. Medya, sanat, pazarlama alanlarında parlak. Ama dağınıklık ve tutarsızlık riski var.",
    4: "Stabilite ve güvenilirlik enerjisi. İnşaat, finans, danışmanlık için mükemmel. Ama değişim ve inovasyonda yavaş kalabilir.",
    5: "Değişim ve esneklik enerjisi. Turizm, e-ticaret, dinamik sektörler için ideal. Ama istikrar ve uzun vadeli planlama zor.",
    6: "Şefkat ve hizmet enerjisi. Sağlık, eğitim, perakende için uygun. Ama müşteri odaklılık, bazen karlılıktan önce gelir.",
    7: "Analiz ve derinlik enerjisi. Teknoloji, araştırma, danışmanlık için mükemmel. Ama kitlesel pazarlama ve geniş kitlelere ulaşmak zor.",
    8: "Güç ve bolluk enerjisi. Finans, gayrimenkul, büyük ölçekli işler için ALTIN DEĞERİNDE. Para çekme gücü yüksek.",
    9: "İnsanlık ve tamamlanma enerjisi. Sosyal girişimcilik, hayır işleri, evrensel hizmetler için ideal. Ama kar odaklılık düşük olabilir.",
    11: "İlham ve vizyon enerjisi (Usta Sayı). Yüksek idealler, spiritüel işler, ilham veren markalar için mükemmel.",
    22: "Usta İnşaatçı enerjisi. Büyük projeler, uluslararası işler, kalıcı eserler bırakmak için en güçlü sayı.",
    33: "Usta Şifacı enerjisi. İnsanlığa hizmet eden, şifalandıran, büyük ölçekli sosyal etki yaratan işler için."
  };
  
  return interpretations[companyNumber] || 
    `Sayı ${companyNumber}, bu işe özgü bir enerji getiriyor. Potansiyel yüksek ama doğru sektör ve doğru kurucu enerjisiyle birleşmeli.`;
}

// ============ KURUCU UYUMU ANALİZİ ============

function analyzeFounderCompatibility(
  founderExpression: number, 
  companyNumber: number
): { status: WealthAnalysisResult['compatibilityStatus']; message: string } {
  
  // Aynı sayı = mükemmel uyum
  if (founderExpression === companyNumber) {
    return {
      status: 'harmony',
      message: "Mükemmel Uyum! Kurucunun enerjisi, şirket ismiyle aynı frekansta. Bu, doğal bir akış ve başarı demek."
    };
  }
  
  // Tamamlayıcı çiftler
  const complementaryPairs = [
    [1, 8], [8, 1], [3, 6], [6, 3], [2, 4], [4, 2], [5, 9], [9, 5], [7, 11], [11, 7]
  ];
  
  if (complementaryPairs.some(pair => 
    pair[0] === founderExpression && pair[1] === companyNumber
  )) {
    return {
      status: 'harmony',
      message: "Güçlü Uyum! Kurucu ve şirket, birbirini tamamlayan enerjiler taşıyor. Birlikte büyüme potansiyeli yüksek."
    };
  }
  
  // Nötr çiftler (fark çok büyük değil)
  const diff = Math.abs(founderExpression - companyNumber);
  if (diff <= 2) {
    return {
      status: 'neutral',
      message: "Nötr Uyum. Önemli bir çatışma yok ama özel bir sinerji de yok. Çalışarak başarılabilir."
    };
  }
  
  // Zorlayıcı çiftler - Para Kaçağı riski!
  const dangerousPairs = [
    [4, 5], [5, 4], [1, 9], [9, 1], [2, 8], [8, 2], [3, 7], [7, 3]
  ];
  
  if (dangerousPairs.some(pair => 
    pair[0] === founderExpression && pair[1] === companyNumber
  )) {
    return {
      status: 'danger',
      message: "⚠️ PARA KAÇAĞI RİSKİ! Kurucunun enerjisi (${founderExpression}) ile şirket ismi (${companyNumber}) çatışıyor. Kazanılan para, beklenmedik şekillerde kaybolabilir. Israr ederseniz, finansal danışman şart."
    };
  };
  
  // Çatışma durumu
  return {
    status: 'conflict',
    message: `Çatışma Var. Kurucu (${founderExpression}) ve şirket (${companyNumber}) farklı frekanslarda. Bu, içsel bir direnç ve yavaş büyüme demek.`
  };
}

// ============ KURULUŞ TARİHİ ANALİZİ ============

function analyzeRegistrationDate(dateString: string): {
  energy: number;
  interpretation: string;
  calculation: string;
} {
  const [day, month, year] = dateString.split(/[./-]/).map(Number);
  
  const dayReduced = reduceToSingleDigit(day);
  const monthReduced = reduceToSingleDigit(month);
  const yearReduced = reduceToSingleDigit(year);
  
  const total = dayReduced + monthReduced + yearReduced;
  const energy = reduceToSingleDigit(total);
  
  const calculation = `${day}→${dayReduced} + ${month}→${monthReduced} + ${year}→${yearReduced} = ${total} → ${energy}`;
  
  const interpretations: Record<number, string> = {
    1: "Bağımsızlık ve öncülük enerjisi. Şirket, sektöründe fark yaratacak, kendi yolunu çizecek.",
    2: "İşbirliği ve uyum enerjisi. Ortaklıklar, ittifaklar bu şirketin kaderinde.",
    3: "Yaratıcılık ve büyüme enerjisi. Hızlı büyüme potansiyeli ama tutarsızlık riski.",
    4: "Stabilite ve temel enerjisi. Yavaş ama sağlam büyüme. Güvenilirlik kazanılacak.",
    5: "Değişim ve esneklik enerjisi. Sektör değişikliği, pivotlar, adaptasyon bu şirkette sık görülür.",
    6: "Sorumluluk ve hizmet enerjisi. Müşteri memnuniyeti, uzun vadeli ilişkiler ön planda.",
    7: "Analiz ve derinlik enerjisi. Ar-Ge, inovasyon, uzmanlık alanında güçlü.",
    8: "Güç ve bolluk enerjisi. Finansal başarı, büyüme, otorite kurma potansiyeli en yüksek.",
    9: "Tamamlanma ve evrensel enerjisi. Sosyal etki, büyük vizyon, insanlığa hizmet."
  };
  
  return {
    energy,
    interpretation: interpretations[energy] || `Enerji ${energy}, bu şirkete özgü bir yol çiziyor.`,
    calculation
  };
}

// ============ RİSK FAKTÖRLERİ ============

function generateRiskFactors(
  companyNumber: number,
  founderExpression: number,
  registrationEnergy: number,
  compatibilityStatus: WealthAnalysisResult['compatibilityStatus']
): WealthAnalysisResult['riskFactors'] {
  const risks = [];
  
  // Para Kaçağı Riski
  if (compatibilityStatus === 'danger') {
    risks.push({
      type: 'cash_leak' as const,
      title: "🚨 PARA KAÇAĞI RİSKİ",
      description: "Kurucu enerjisi ile şirket ismi çatışıyor. Bu, beklenmedik giderler, kayıplar, verimsiz yatırımlar demek. Kazandığınız para, 'nereye gitti?' sorusunu sıkça sorduracak. ACİLEN isim değişikliği veya enerji dengeleme çalışması yapılmalı.",
      severity: 'critical' as const
    });
  }
  
  // İflas Riski
  if (companyNumber === 4 && registrationEnergy === 5) {
    risks.push({
      type: 'bankruptcy' as const,
      title: "⚠️ İFLAS RİSKİ",
      description: "Şirket ismi (4) stabilite isterken, kuruluş tarihi (5) değişim getiriyor. Bu çatışma, finansal istikrarsızlığa yol açabilir. Özellikle 5. ve 9. yıllarda dikkat!",
      severity: 'high' as const
    });
  }
  
  if (companyNumber === 8 && registrationEnergy === 9) {
    risks.push({
      type: 'bankruptcy' as const,
      title: "⚠️ AŞIRI BÜYÜME RİSKİ",
      description: "Şirket (8) hızlı büyümek, kuruluş tarihi (9) ise bitiş/tamamlanma enerjisi taşıyor. Aşırı hızlı büyüme, kontrolsüz genişleme riski. 3-5 yıl içinde çöküş yaşanabilir.",
      severity: 'high' as const
    });
  }
  
  // Ortaklık Çatışması
  if (companyNumber === 1 && founderExpression === 2) {
    risks.push({
      type: 'partnership_conflict' as const,
      title: "⚡ ORTAKLIK ÇATIŞMASI",
      description: "Şirket liderlik (1) isterken kurucu uyum (2) peşinde. Eğer ortaklık yapacaksanız, güç savaşları kaçınılmaz. Tek başına mı, ortaklık mı kararını iyi verin.",
      severity: 'medium' as const
    });
  }
  
  // Zamanlama Riski
  if (registrationEnergy === 7 && companyNumber === 3) {
    risks.push({
      type: 'timing' as const,
      title: "⏰ ZAMANLAMA RİSKİ",
      description: "Kuruluş tarihi analiz (7) enerjisi, şirket ismi (3) yaratıcılık istiyor. Araştırma fazına çok zaman harcayıp, pazara geç girebilirsiniz. 'Analiz felci' riski.",
      severity: 'medium' as const
    });
  }
  
  // 5 sayısı riskleri
  if (companyNumber === 5) {
    risks.push({
      type: 'cash_leak' as const,
      title: "💸 DAĞINIKLIK RİSKİ",
      description: "5 sayısı esneklik getirir ama odaklanma sorunu da. Çok fazla projeye girme, dikkat dağıtma, para kaçırma riski. Disiplin şart.",
      severity: 'medium' as const
    });
  }
  
  // Eğer risk yoksa
  if (risks.length === 0) {
    risks.push({
      type: 'timing' as const,
      title: "✓ DÜŞÜK RİSK",
      description: "Sayılarınız önemli bir risk göstermiyor. Ama unutma: Risk yok demek, başarı garanti değil. Çalışmak, strateji ve şans hala gerekli.",
      severity: 'low' as const
    });
  }
  
  return risks;
}

// ============ İSİM DEĞİŞİKLİĞİ ÖNERİSİ ============

function generateNameChangeSuggestion(
  companyName: string,
  companyNumber: number,
  founderExpression: number,
  compatibilityStatus: WealthAnalysisResult['compatibilityStatus']
): WealthAnalysisResult['nameChangeSuggestion'] {
  
  // İsim değişikliği öner
  if (compatibilityStatus === 'danger' || compatibilityStatus === 'conflict') {
    const targetNumbers = [8, 6, 1, 3]; // Başarılı sayılar
    const targetNumber = targetNumbers.find(n => n !== companyNumber && n !== founderExpression) || 8;
    
    // Basit alternatif isim önerileri
    const alternatives = [
      `${companyName} Group`,
      `${companyName} International`,
      `${companyName} Plus`,
      `New ${companyName}`
    ];
    
    return {
      recommended: true,
      reason: `Mevcut isim (${companyNumber}) ile kurucu enerjisi (${founderExpression}) çatışıyor. Bu çatışma, finansal kayıplara, içsel dirence ve yavaş büyümeye yol açıyor. İsim değişikliği, özellikle ${targetNumber} enerjisine yönelik bir değişiklik, bereketi artırabilir.`,
      alternativeNames: alternatives
    };
  }
  
  return {
    recommended: false,
    reason: "Mevcut isminiz kurucu enerjinizle uyumlu. İsim değişikliği şart değil, mevcut isminizi güçlendirmeye odaklanın."
  };
}

// ============ BEREKET SKORU HESAPLAMA ============

function calculateProsperityScore(
  companyNumber: number,
  _founderExpression: number,
  registrationEnergy: number,
  compatibilityStatus: WealthAnalysisResult['compatibilityStatus']
): {
  prosperityScore: number;
  moneyAttraction: number;
  stabilityIndex: number;
  growthPotential: number;
} {
  // Temel skorlar
  let prosperityScore = 50;
  let moneyAttraction = 50;
  let stabilityIndex = 50;
  let growthPotential = 50;
  
  // Şirket sayısının etkisi
  const companyScores: Record<number, { prosperity: number; money: number; stability: number; growth: number }> = {
    1: { prosperity: 75, money: 70, stability: 60, growth: 85 },
    2: { prosperity: 65, money: 60, stability: 70, growth: 60 },
    3: { prosperity: 70, money: 65, stability: 50, growth: 80 },
    4: { prosperity: 70, money: 65, stability: 90, growth: 55 },
    5: { prosperity: 65, money: 60, stability: 45, growth: 85 },
    6: { prosperity: 75, money: 70, stability: 75, growth: 65 },
    7: { prosperity: 60, money: 55, stability: 70, growth: 60 },
    8: { prosperity: 95, money: 95, stability: 80, growth: 90 },
    9: { prosperity: 70, money: 60, stability: 65, growth: 70 },
    11: { prosperity: 80, money: 70, stability: 60, growth: 85 },
    22: { prosperity: 95, money: 90, stability: 85, growth: 95 },
    33: { prosperity: 85, money: 70, stability: 70, growth: 80 }
  };
  
  const scores = companyScores[companyNumber] || companyScores[1];
  prosperityScore = scores.prosperity;
  moneyAttraction = scores.money;
  stabilityIndex = scores.stability;
  growthPotential = scores.growth;
  
  // Kurucu uyumunun etkisi
  if (compatibilityStatus === 'harmony') {
    prosperityScore += 10;
    moneyAttraction += 10;
    stabilityIndex += 5;
    growthPotential += 10;
  } else if (compatibilityStatus === 'danger') {
    prosperityScore -= 25;
    moneyAttraction -= 30;
    stabilityIndex -= 15;
    growthPotential -= 20;
  } else if (compatibilityStatus === 'conflict') {
    prosperityScore -= 15;
    moneyAttraction -= 15;
    stabilityIndex -= 10;
    growthPotential -= 10;
  }
  
  // Kuruluş tarihi etkisi
  if (registrationEnergy === 8) {
    prosperityScore += 5;
    moneyAttraction += 10;
  } else if (registrationEnergy === 4) {
    stabilityIndex += 10;
  } else if (registrationEnergy === 3) {
    growthPotential += 10;
  }
  
  // Sınırlar
  return {
    prosperityScore: Math.max(0, Math.min(100, prosperityScore)),
    moneyAttraction: Math.max(0, Math.min(100, moneyAttraction)),
    stabilityIndex: Math.max(0, Math.min(100, stabilityIndex)),
    growthPotential: Math.max(0, Math.min(100, growthPotential))
  };
}

// ============ KİLİTLİ İÇERİK (PAYWALL) ============

function generateLockedContent(
  companyName: string,
  companyNumber: number,
  founderExpression: number,
  registrationEnergy: number,
  compatibilityStatus: WealthAnalysisResult['compatibilityStatus']
): WealthAnalysisResult['lockedContent'] {
  
  // Kritik yatırım tarihleri
  const currentYear = new Date().getFullYear();
  const criticalDates = [
    `${currentYear}-03-15`,
    `${currentYear}-06-21`,
    `${currentYear}-09-08`,
    `${currentYear + 1}-01-11`
  ];
  
  // İflas riski detayı
  let bankruptcyWarning = "";
  if (compatibilityStatus === 'danger') {
    bankruptcyWarning = `🚨 YÜKSEK İFLAS RİSKİ: Kurucu enerjisi (${founderExpression}) ile şirket ismi (${companyNumber}) arasındaki çatışma, finansal bir kara deliğe dönüşebilir. Özellikle ${currentYear + 1} yılında, beklenmedik giderler, ödeme güçlükleri, nakit akışı sorunları yaşanabilir. Eğer şirket 3-5 yıllıksa, bu risk katlanarak artar. ACİLEN önlem alınmalı: İsim değişikliği veya enerji dengeleme çalışması. Aksi halde, 18 ay içinde ciddi finansal kriz kaçınılmaz.`;
  } else if (companyNumber === 5 && registrationEnergy === 4) {
    bankruptcyWarning = `⚠️ ORTA SEVİYE İFLAS RİSKİ: Şirket ismi (5) değişim, kuruluş tarihi (4) stabilite istiyor. Bu içsel çatışma, kararsızlığa, dalgalanmalara yol açıyor. Özellikle ekonomik kriz dönemlerinde, bu şirketler ilk sarsıntıyı hissediyor. 6-12 aylık nakit rezervi şart.`;
  } else if (companyNumber === 8) {
    bankruptcyWarning = `✓ DÜŞÜK İFLAS RİSKİ: 8 sayısı, finansal başarı ve bolluk demek. Ama unutma: 8 aynı zamanda 'karmik denge' sayısıdır. Eğer etik olmayan yöntemlerle para kazanmaya çalışırsanız, 8 size iadeyi yapar. Dürüstlük, 8'in anahtarıdır.`;
  } else {
    bankruptcyWarning = `✓ KONTROLLÜ RİSK: Sayılarınız önemli bir iflas riski göstermiyor. Ama unutma: İflas, sadece sayılardan kaynaklanmaz. Pazar koşulları, rekabet, yönetim hataları da etkili. Sayılarınız uyumlu olsa bile, profesyonel finansal yönetim şart.`;
  }
  
  // Bereket aktivasyonu
  const wealthActivation = `💰 BEREKET AKTİVASYONU RİTÜELİ:

Şirketinizin (${companyName}) enerjisini maksimize etmek için:

1. OFİS KONUMU: ${companyNumber === 8 || companyNumber === 6 ? 'Güneydoğu (bolluk) veya Kuzey (kariyer) yönü ideal.' : companyNumber === 4 || companyNumber === 7 ? 'Batı (yaratıcılık) veya Kuzeydoğu (bilgelik) uygundur.' : 'Doğu (yeni başlangıçlar) veya Güney (tanınırlık) tercih edilebilir.'}

2. LOGO RENGİ: ${companyNumber === 8 || companyNumber === 1 ? 'Altın, sarı, turuncu (bolluk ve güç)' : companyNumber === 4 || companyNumber === 7 ? 'Mavi, mor (bilgelik ve derinlik)' : companyNumber === 3 || companyNumber === 5 ? 'Yeşil, turkuaz (büyüme ve değişim)' : 'Kırmızı, pembe (tutku ve şefkat)'} enerjisi uyumludur.

3. KRİTİK TOPLANTILAR: Her ayın ${companyNumber}.'si (şirket sayınla uyumlu) veya ${founderExpression}.'si (kurucu enerjinle uyumlu) önemli kararlar için ideal.

4. BEREKET MANTRASI: Her sabir ofise girerken '${companyNumber === 8 ? 'Bolluk ve bereket bana akıyor' : companyNumber === 1 ? 'Ben liderim, başarı benimle' : companyNumber === 6 ? 'Hizmet ettiğim herkes bana bereket getiriyor' : 'Ben ve işim birlikte büyüyoruz'}' de.

5. KİTLESEL LANSMAN: ${criticalDates[0]} ve ${criticalDates[2]} tarihleri, şirketinizin enerjisiyle uyumlu.`;
  
  // Did You Mean sorusu
  const didYouMean = `Did You Mean?

${companyName} isminin sayısı ${companyNumber}. Ama biliyor musun, bu sayının GÖLGESİ (bilinçaltı enerjisi) şirketinin asıl potansiyelini bloke ediyor?

${companyNumber === 1 ? 'Gölge: Aşırı ego, tek başına çalışma isteği, başkalarını dinlememe. Bu, büyümeyi sınırlıyor.' : companyNumber === 2 ? 'Gölge: Kararsızlık, bağımsız hareket edememe, çok fazla danışma. Fırsatları kaçırıyorsun.' : companyNumber === 3 ? 'Gölge: Dağınıklık, projeleri bitirememe, yüzeysellik. Potansiyel dağılıyor.' : companyNumber === 4 ? 'Gölge: Katılık, değişim korkusu, inovasyona direnç. Rakipler seni geçiyor.' : companyNumber === 5 ? 'Gölge: Bağlanma korkusu, sabırsızlık, disiplinsizlik. Para elde tutulamıyor.' : companyNumber === 6 ? 'Gölge: Aşırı fedakarlık, kendini feda etme, karlılıktan ödün verme.' : companyNumber === 7 ? 'Gölge: İzolasyon, pazardan kopma, fazla teorik kalma. Müşteriyi anlamıyorsun.' : companyNumber === 8 ? 'Gölge: Açgözlülük, etik dışı yöntemler, çalışanları sömürme. Karma geri döner.' : 'Gölge: Bitirme korkusu, yeni projelere atlamama, eskiye tutunma. Büyüme duruyor.'}

Bu gölgeyi aydınlatmadan, şirketinin gerçek potansiyeline ulaşamazsın. Şirketinin gölgesini ve onu nasıl dönüştüreceğini öğrenmek ister misin? (Detaylı İşletme Numerolojisi Raporu - 349₺)`;
  
  return {
    criticalInvestmentDates: criticalDates,
    bankruptcyWarning,
    wealthActivation,
    didYouMean
  };
}

// ============ ANA FONKSİYON ============

export function calculateWealthAnalysis(businessData: BusinessData): WealthAnalysisResult {
  const { founderFirstName, founderLastName, companyName, registrationDate } = businessData;
  
  // Şirket ismi analizi
  const companyResult = calculateCompanyNumber(companyName);
  const companyNumber = companyResult.number;
  const companyInterpretation = getCompanyInterpretation(companyNumber);
  
  // Kurucu analizi
  const founderExpression = calculateExpression(founderFirstName, founderLastName);
  
  // Kurucu uyumu
  const compatibility = analyzeFounderCompatibility(founderExpression, companyNumber);
  
  // Kuruluş tarihi analizi
  const registrationAnalysis = analyzeRegistrationDate(registrationDate);
  
  // Risk faktörleri
  const riskFactors = generateRiskFactors(
    companyNumber, 
    founderExpression, 
    registrationAnalysis.energy,
    compatibility.status
  );
  
  // İsim değişikliği önerisi
  const nameChangeSuggestion = generateNameChangeSuggestion(
    companyName,
    companyNumber,
    founderExpression,
    compatibility.status
  );
  
  // Bereket skoru
  const prosperityScores = calculateProsperityScore(
    companyNumber,
    founderExpression,
    registrationAnalysis.energy,
    compatibility.status
  );
  
  // Kilitli içerik
  const lockedContent = generateLockedContent(
    companyName,
    companyNumber,
    founderExpression,
    registrationAnalysis.energy,
    compatibility.status
  );
  
  return {
    ...prosperityScores,
    companyNumber,
    companyInterpretation,
    founderExpression,
    compatibilityStatus: compatibility.status,
    compatibilityMessage: compatibility.message,
    registrationEnergy: registrationAnalysis.energy,
    registrationInterpretation: registrationAnalysis.interpretation,
    riskFactors,
    nameChangeSuggestion,
    lockedContent,
    calculations: {
      companyNameCalculation: companyResult.calculation,
      founderExpressionCalculation: `${founderFirstName} ${founderLastName} = ${founderExpression}`,
      registrationDateCalculation: registrationAnalysis.calculation
    }
  };
}
