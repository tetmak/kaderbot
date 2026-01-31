import type { UserData, NumerologyResult, LetterValue } from '@/types/numerology';
import { PythagoreanValues, Vowels } from '@/types/numerology';

// ============================================
// KARANLIK NUMEROLOG'UN EDEBİ ANALİZ MOTORU
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

function isVowel(letter: string): boolean {
  return Vowels.includes(letter);
}

function getMonthName(month: number): string {
  const months = ['', 'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 
                  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
  return months[month] || '';
}

// Hesaplama fonksiyonları
function calculateExpressionNumber(firstName: string, lastName: string) {
  const fullName = firstName + lastName;
  const letterValues = getLetterValues(fullName);
  const total = letterValues.reduce((sum, lv) => sum + lv.value, 0);
  const reduced = reduceToSingleDigit(total);
  const calculation = letterValues.map(lv => `${lv.letter}=${lv.value}`).join(', ') + 
                     ` → Toplam: ${total} → ${reduced}`;
  return { number: reduced, steps: letterValues, calculation };
}

function calculateSoulUrgeNumber(firstName: string, lastName: string) {
  const fullName = firstName + lastName;
  const vowelValues = getLetterValues(fullName).filter(lv => isVowel(lv.letter));
  const total = vowelValues.reduce((sum, lv) => sum + lv.value, 0);
  const reduced = reduceToSingleDigit(total);
  const calculation = vowelValues.map(lv => `${lv.letter}=${lv.value}`).join(', ') + 
                     ` → Toplam: ${total} → ${reduced}`;
  return { number: reduced, steps: vowelValues, calculation };
}

function calculatePersonalityNumber(firstName: string, lastName: string) {
  const fullName = firstName + lastName;
  const consonantValues = getLetterValues(fullName).filter(lv => !isVowel(lv.letter));
  const total = consonantValues.reduce((sum, lv) => sum + lv.value, 0);
  const reduced = reduceToSingleDigit(total);
  const calculation = consonantValues.map(lv => `${lv.letter}=${lv.value}`).join(', ') + 
                     ` → Toplam: ${total} → ${reduced}`;
  return { number: reduced, steps: consonantValues, calculation };
}

function calculatePersonalYear(birthDate: string, targetYear: number = new Date().getFullYear()) {
  const [day, month] = birthDate.split(/[./-]/).map(Number);
  const sum = day + month + targetYear;
  const reduced = reduceToSingleDigit(sum, false);
  const calculation = `${day} (gün) + ${month} (ay) + ${targetYear} (yıl) = ${sum} → ${reduced}`;
  return { number: reduced, calculation };
}

function calculateLifePath(birthDate: string) {
  const [day, month, year] = birthDate.split(/[./-]/).map(Number);
  const dayReduced = reduceToSingleDigit(day);
  const monthReduced = reduceToSingleDigit(month);
  const yearReduced = reduceToSingleDigit(year);
  const total = dayReduced + monthReduced + yearReduced;
  const finalReduced = reduceToSingleDigit(total);
  const calculation = `${day}→${dayReduced} + ${month}→${monthReduced} + ${year}→${yearReduced} = ${total} → ${finalReduced}`;
  return { number: finalReduced, calculation };
}

// ============================================
// EDEBİ ANALİZ ÜRETİCİLERİ
// ============================================

interface AnalysisContext {
  firstName: string;
  lastName: string;
  birthDate: string;
  day: number;
  month: number;
  year: number;
  expression: number;
  soulUrge: number;
  personality: number;
  personalYear: number;
  lifePath: number;
}

// İfade Sayısı analizi - Uzun ve edebi
function generateExpressionAnalysis(ctx: AnalysisContext): string {
  const templates: Record<number, string> = {
    1: `Senin kader kodun, **1** — özgürlüğün ve liderliğin rakamı. Ama bu özgürlük, bir kafesten diğerine uçuşmak değil midir senin için? ${ctx.year}'in o belirsiz günlerinde dünyaya gözlerini açtığında, sanki ruhun önceden biliyordu: Bu dünya sana dar gelecek. Dar gelen bedenin değil, sınırları çizen zihnin.

Bir, elementlerin dansının başlangıcıdır. Toprağın ağırlığı, suyun akışkanlığı, ateşin tutkusu, havanın hafifliği — hepsi senin içinde var. Ama işte çelişki burada başlıyor: Ne zaman bir yere ait olmaya kalksan, içindeki o kaçakçı ruh başka ufuklara bakıyor. Ve ne zaman bir şeyden kaçmaya kalksan, ayaklarının dibindeki toprağın seni ne kadar çok istediğini hissediyorsun.

Adının ilk harfleri — **${ctx.firstName.charAt(0)}** — senin zırhını oluşturuyor. Ama bu zırhın altında, yalnızca kendine ait bir çocuk yatıyor. ${ctx.lastName} soyadın ise bir gizemi taşıyor içinde. Belki de atalarından gelen bir denizci ruhu, belki de dağların sessizliğine gömülü bir hikaye.`,

    2: `İfade sayın **2** — ikizlerin, ikiliklerin, birliktelik arzusunun rakamı. Dışarıda ne kadar güçlü görünürsen görün, içeride biriyle öyle bütünleşmek isteyen bir ruh var ki, sınırlar kaybolsun, "ben" ve "sen" yerini "biz"e bıraksın.

Ama işte trajedi: O kadar çok "güçlü" gibi davrandın ki, o sert rolünü oynadın ki, içindeki o iki numaralı çocuk — o sevgiye aç, kucaklanmayı bekleyen küçük varlık — sesini duyuramıyor. İnsanlar seni lider olarak görürken, sen aslında birinin elini tutup "Gel, beraber gidelim," demek istiyorsun.

${ctx.day} ${getMonthName(ctx.month)} doğumun, sana bir hassasiyet armağan etti. Bu tarih, geçmiş yaşamlarından bir iz taşıyor. Belki de bir sarayda yalnızlıktan ölen bir prenses, belki de sevdiğinden ayrı düşen bir şair. Bu yüzden bu hayatta bağlanmak istiyorsun, ama bağlanmak da korkutuyor seni.`,

    3: `Senin ifade sayın **3** — yaratıcılığın, iletişimin, sahne ışıklarının rakamı. Dışarıdan bakanlar seni ne görüyor? Muhtemelen esprili, konuşkan, sosyal ortamlarda parlayan biri. Ama bu ışık, bir lambanın sıcak ışığı mı, yoksa bir deniz fenerinin sisli gecelerdeki o yalnız ışığı mı?

Üç, sanatçıdır. Yazar, şair, ressam olabilirsin. Ama bu yeteneğini ne kadar kullanıyorsun? Belki de ${ctx.firstName} isminin taşıdığı o melodik titreşim, seni kelimelerin okyanusuna sürüklüyor. Ama kelimelerini yazmak yerine, içinde tutuyorsun. Çünkü yazmak, savunmasız kalmak demek. Ve sen savunmasız kalmaktan korkuyorsun.

${ctx.year}'in enerjisi (1+9+9+${ctx.year.toString().slice(-1)}=${ctx.year.toString().split('').reduce((a,b)=>a+parseInt(b),0)}) değişim ve özgürlük arayışı. Senin ruh güdünle ifade sayın arasındaki bu gerilim: Bir yandan bağlanmak isteyen, diğer yandan kaçan. Bu yüzden ilişkilerinde — özellikle son dönemlerde — bu çelişki zirve yaptı.`,

    4: `İfade sayın **4** — disiplinin, stabiliteyin, dört duvarın içindeki güvenliğin rakamı. Sen, temelleri atan, sistemleri kuran, güvenilir bir yapı ustasısın. Ama bu disiplin, bazen esnekliğini kısıtlıyor mu? Dört duvarın içinde güvende hissediyorsun, ama aynı duvarlar seni hapsetmiyor mu?

${ctx.firstName} adının harflerindeki o düzenli titreşim, senin hayatını da düzenli kılmaya çalışıyor. Ama hayat öyle mi? Hayat akışkandır, sen ise onu kalıplara sokmak istiyorsun. Çünkü kontrolsüzlük seni korkutuyor. Kontrolsüzlük, annenin karnında ilk hissettiğin o güvensizliği hatırlatıyor.

${ctx.day} ${getMonthName(ctx.month)} ${ctx.year} — bu tarih, sana pratik bir zekâ verdi. Ama aynı tarih, içindeki o hayalperest çocuğu da bastırıyor. O çocuk bazen gece yarıları uyanıp, "Ya başka türlü bir hayat mümkün olsaydı?" diye soruyor kendine. Ve sen, o soruyu duymazdan geliyorsun.`,

    5: `Özgürlük, değişim, macera — ifade sayın **5**, elementlerin dansı. Sen, sınırları zorlayan, rutinden kaçan, çok yönlü bir ruhun. Ama bu huzursuzluk, derinleşmene engel olmuyor mu? Her gün yeni bir şey, her an yeni bir yer. Ama nereye gidersen git, kendinden kaçabiliyor musun?

Beş sayısı, özgürlüğün rakamıdır evet, ama senin için bu özgürlük, bir kafesten diğerine uçuşmak değil midir? ${ctx.year}'te doğduğunda, sanki ruhun önceden biliyordu: Bu dünya sana dar gelecek. Ama bu darlık, kaçmakla çözülmez. Bazen durmak gerekir. Bazen bir yerde kök salmak gerekir.

${ctx.firstName} ${ctx.lastName} — adının içindeki o beşinci titreşim, aslında bir zincirlerin şarkısı. Özgürlüğün esaretindeki bir ruh. Çünkü ne zaman bir yere ait olmaya kalksan, içindeki o kaçakçı ruh başka ufuklara bakıyor. Ve ne zaman bir şeyden kaçmaya kalksan, ayaklarının dibindeki toprağın seni ne kadar çok istediğini hissediyorsun.`,

    6: `Sorumluluk, sevgi, hizmet — ifade sayın **6**, şifacının rakamı. Sen, başkalarına bakan, aileyi ve topluluğu önemseyen, fedakar bir ruhun. Ama bu sorumluluk, kendini feda etmeye dönüşmüyor mu? Ne zaman birine "hayır" desen, içinde bir yerlerde suçluluk hissetmiyor musun?

Altı sayısı, kalp çakrasının rakamıdır. Sevgi dolusun, şefkatsin. Ama bu şefkatin çoğunu başkalarına dağıtıyorsun. Peki ya kendin? ${ctx.firstName}, sen kendine ne kadar şefkat gösteriyorsun? Aynaya baktığında gördüğün yüz, seni seviyor mu? Yoksa o yüzdeki çizgiler, başkaları için harcadığın yılların izi mi?

${ctx.day} ${getMonthName(ctx.month)} doğumun, sana bir sorumluluk yükledi. Belki ailevi, belki toplumsal. Ama bu yük, seni bazen nefes alamaz hale getiriyor. Çünkü altı sayısı, mükemmelliyetçidir de. Her şeyin en iyisini yapmak ister. Herkesi mutlu etmek ister. Ama bu mümkün mü?`,

    7: `Analiz, spiritüellik, derinlik — ifade sayın **7**, bilgenin rakamı. Sen, görünenin ötesini arayan, içe dönük, mistik bir ruhun. Ama bu izolasyon, bağlantılarından uzaklaştırmıyor mu? İnsanlar seni "anlamak" istiyor, ama sen kendini açmakta zorlanıyorsun.

Yedi sayısı, bilinmeyenin rakamıdır. Sen, cevapları içinde arayan birisin. ${ctx.firstName} adının harflerindeki o derin titreşim, seni felsefeye, metafiziğe, gizeme sürüklüyor. Ama bazen bu derinlik, seni yüzeysel hayattan da uzaklaştırıyor. Bir kahkaha atmayı, saçma sapan bir şeyler yapmayı unutuyor musun?

${ctx.year}'in enerjisi ve ${ctx.day} ${getMonthName(ctx.month)} doğumunun birleşimi, sana sezgisel bir zekâ verdi. Ama aynı kombinasyon, içinde bir melankoli de taşıyor. Çünkü ne kadar çok bilirsen bil, hayatın bazı sorularının cevabı yok. Ve bu bilgisizlik, seni rahatsız ediyor.`,

    8: `Güç, başarı, maddi dünya — ifade sayın **8**, otoritenin rakamı. Sen, güçlü bir vizyoner, finansal bağımsızlığı hedefleyen, kontrolü elinde tutan birisin. Ama bu hırs, duygusal hayatını geride bırakmıyor mu? Başarı senin kimliğin oldu, ama bu kimlik seni tüketmiyor mu?

Sekiz sayısı, sonsuzluğun rakamıdır. Döngüler, döngüler içinde. Başarı, düşüş, tekrar başarı. ${ctx.firstName} ${ctx.lastName}, sen bu döngüde neredesin? Yukarıda mı, aşağıda mı, yoksa o iki noktanın arasındaki o ince çizgide mi? Çünkü sekiz sayısı, dengenin de rakamıdır. Ama denge, en zor şeydir.

${ctx.day} ${getMonthName(ctx.month)} ${ctx.year} — bu tarih, sana bir liderlik vasıfı verdi. Ama aynı tarih, içinde bir yalnızlık da tohum attı. Çünkü zirvede yalnızlık vardır. Ve sen, o zirveye tırmanırken, yanında kimin olduğunu sorguluyor musun? Yoksa tırmanış o kadar meşgul edici ki, etrafına bakmaya vaktin mi yok?`,

    9: `İnsanlık, şefkat, tamamlanma — ifade sayın **9**, Usta Şifacının rakamı. Sen, evrensel sevgiyi taşıyan, başkaları için fedakarlık yapan, bilge bir ruhun. Ama bu fedakarlık, kendini unutturuyor mu? Dünya senin misyonun oldu, ama kendi küçük dünyan ne olacak?

Dokuz sayısı, bir döngünün sonudur. Ama aynı zamanda yeni bir döngünün başlangıcıdır. ${ctx.firstName}, sen hangi döngünün sonundasın? Hangi kapıyı kapatmak üzeresin? Çünkü dokuz sayısı, bırakmayı da öğretir. Eskiyi bırakmak, yeniye yer açmak. Ama bırakmak kolay mı?

${ctx.year}'in enerjisi ve ${ctx.day} ${getMonthName(ctx.month)} doğumunun birleşimi, sana derin bir şefkat verdi. Ama aynı kombinasyon, içinde bir sızı da taşıyor. Çünkü ne kadar çok verirsen ver, karşılığını alamadığın zamanlar oluyor. Ve bu adaletsizlik, seni yaralıyor. Ama unutma: Dokuz sayısı, karma'nın da rakamıdır. Verdiğin her şey, bir şekilde sana dönecek.`,

    11: `İlham, sezgi, spiritüel aydınlanma — ifade sayın **11**, Usta Sayısı. Sen, yüksek frekanslı bir ruhsun, ilham veren, sezgisel rehberlik sunan. Ama bu hassasiyet, dünyaya adapte olmayı zorlaştırmıyor mu? Çok hissediyorsun, çok biliyorsun, ama bunları nasıl ifade edeceğini bilemiyorsun.

On bir, ikiz alevlerin rakamıdır. Belki de bu hayatta, ruhunun diğer yarısını arıyorsun. ${ctx.firstName} ${ctx.lastName}, o diğer yarıyı buldun mu? Yoksa hâlâ arıyor musun? Çünkü on bir sayısı, tamamlanma arzusunu da taşır. Ama bu tamamlanma, dışarıda mı, içeride mi?

${ctx.day} ${getMonthName(ctx.month)} ${ctx.year} — bu tarih, sana bir vizyon verdi. Ama aynı tarih, içinde bir yalnızlık da tohum attı. Çünkü sen, farklısın. Ve farklı olmak, bazen yalnız olmak demektir. Ama unutma: On bir sayısı, Usta'nın rakamıdır. Ve Usta, yalnızlıkta bilgeliği bulur.`,

    22: `Usta İnşaatçı, büyük vizyon, pratik manifestasyon — ifade sayın **22**, Usta Sayısının en güçlüsü. Sen, dünyayı değiştirecek vizyonların taşıyıcısısın. Ama bu yük, ezici değil mi? Bir mimarsın, ama bu vizyonun bedelini ödüyor musun?

Yirmi iki, dörtün (pratiklik) ve ikinin (diplomasi) birleşimidir. Hayalperestsin, ama aynı zamanda gerçekçisin. Bu çelişki, seni bazen içsel bir çatışmaya sürüklüyor mu? ${ctx.firstName}, büyük şeyler hayal ediyorsun, ama o büyük şeyleri inşa etmek için gereken küçük adımları atıyor musun? Yoksa vizyonun büyüklüğü, seni hareketsiz mi bırakıyor?

${ctx.year}'in enerjisi ve ${ctx.day} ${getMonthName(ctx.month)} doğumunun birleşimi, sana olağanüstü bir güç verdi. Ama aynı kombinasyon, içinde bir sorumluluk da yükledi. Çünkü yirmi iki sayısı, insanlığa hizmet etmeyi gerektirir. Ve bu hizmet, kolay değildir. Ama sen, bunun için doğdun.`,

    33: `Usta Şifacı, evrensel sevgi, koşulsuz şefkat — ifade sayın **33**, Usta Sayısının en şefkatlisi. Sen, koşulsuz sevginin taşıyıcısısın, şifalandıran, besleyen. Ama bu fedakarlık, kendini tüketmiyor mu? Başkaları için bir meleksin, ama kendi kanatların ağır değil mi?

Otuz üç, altının (sevgi) ve üçün (yaratıcılık) birleşimidir. Şifalandırıcısın, ama aynı zamanda yaratıcısın. ${ctx.firstName} ${ctx.lastName}, şifalandırdıklarının sayısı çok, ama kendi yaralarını kim şifalandırıyor? Çünkü otuz üç sayısı, kendi ihtiyaçlarını geri planda bırakmayı da öğretir. Ama bu, sağlıklı mı?

${ctx.day} ${getMonthName(ctx.month)} ${ctx.year} — bu tarih, sana derin bir şefkat verdi. Ama aynı tarih, içinde bir sınır da çizdi. Çünkü otuz üç sayısı, koşulsuz sevgiyi öğretirken, aynı zamanda "hayır" demeyi de öğretmelidir. Ve "hayır" demek, senin için en zor şeylerden biri. Ama öğrenmelisin. Yoksa tükeneceksin.`
  };

  return templates[ctx.expression] || templates[1];
}

// Ruh Güdüsü analizi - Uzun ve edebi
function generateSoulUrgeAnalysis(ctx: AnalysisContext): string {
  const templates: Record<number, string> = {
    1: `Ruh güdün **1** — bağımsızlık arzusu, özgürlük tutkusu. İçinde, kendi yolunu çizmek, bağımsız kararlar almak ve öncü olmak isteyen bir ruh var. Sevgi dolusun, ama özgürlüğünü feda etmekten korkuyorsun. Çünkü bir numara, "ben" demeyi öğretir. Ve "ben" dediğinde, "biz"leri geride bırakırsın.

${ctx.firstName} adının sesli harflerindeki o ilk titreşim, senin en derin arzunu fısıldıyor: Özgür olmak. Ama bu özgürlük neyin bedeli? Yalnızlığın bedeli mi? Çünkü bir numara, liderliği de getirir. Ve lider, yalnızdır. ${ctx.day} ${getMonthName(ctx.month)} doğumun, bu arzuyu daha da derinleştirmiş. Çünkü o gün, dünya sana bir görev verdi: Öncü olmak.

Ama içindeki bu ruh, bazen sana zarar da veriyor. Çünkü ne zaman birine bağlanmaya kalksan, o bağımsızlık alarmı çalıyor. Ve kaçıyorsun. Kaçtıkça, o bağlanma arzusu büyüyor. Bu bir döngü. Ve bu döngüyü kırmak için, özgürlükle bağlanmanın arasındaki o ince çizgiyi bulmalısın.`,

    2: `Ruh güdün **2** — birliktelik arzusu, sevilme ihtiyacı. İçinde, biriyle öyle bütünleşmek isteyen bir ruh var ki, sınırlar kaybolsun. Karşındakinin duygularını hissetmek senin doğal yeteneğin. Ama bu hassasiyet, seni yoruyor mu? Çünkü iki numara, her şeyi hissetmeyi öğretir. Ve her şeyi hissetmek, ağır bir yük.

${ctx.firstName}, sen diplomat doğmuşsun. Çatışmalardan kaçarsın. Ama hayat çatışmalardan ibaret değil mi? Ve her çatışmadan kaçtığında, kendi sınırlarını aşıyor musun? İki numara, uyumu öğretir. Ama uyum, bazen kendi sesini bastırmak demek oluyor. Ve sen, kendi sesini duyurmakta zorlanıyorsun.

${ctx.day} ${getMonthName(ctx.month)} ${ctx.year} — bu tarih, sana bir görev verdi: İlişkilerde derinlik bulmak. Ama bu derinlik, kolay değil. Çünkü iki numara, karşısındakinin aynasıdır. Ve aynada, kendi yansımanı görmek, bazen korkutucu. Ama bu korkuyu aşmalısın. Çünkü ruhunun arzusu, bu.`,

    3: `Ruh güdün **3** — ifade arzusu, alkışlanma ihtiyacı. İçinde, kendini ifade etmek, yaratıcı bir çıkış yapmak isteyen bir çocuk var. Sahnede olmak, beğenilmek senin oksijenin. Ama bu ihtiyaç, seni bazen yüzeysel ilişkilere mi sürüklüyor? Çünkü üç numara, neşeyi öğretir. Ama neşenin altındaki o derinlik, kimseye gösterilmiyor mu?

${ctx.firstName} ${ctx.lastName}, sen sanatçı ruhlusun. Yazar, şair, ressam olabilirsin. Ama bu yeteneğini ne kadar kullanıyorsun? Belki de içindeki o çocuk, her gece "Yarın yazacağım," diyor. Ama yarın gelmiyor. Çünkü üç numara, mükemmelliyetçidir de. Ve mükemmelliyetçilik, bazen hareketsizlik demek.

${ctx.year}'in enerjisi ve ${ctx.day} ${getMonthName(ctx.month)} doğumunun birleşimi, sana yaratıcılık verdi. Ama aynı kombinasyon, içinde bir huzursuzluk da taşıyor. Çünkü üç numara, dağınıktır. Birçok şeyle ilgilenir, ama hiçbirini tamamlayamaz. Ve bu tamamlanmamışlık, seni rahatsız ediyor. Ama unutma: Yaratıcılık, mükemmel olmak zorunda değil. Sadece olmak yeterli.`,

    4: `Ruh güdün **4** — güvenlik arzusu, düzen ihtiyacı. İçinde, hayatının temellerini sağlamlaştırmak isteyen bir ruh var. Çünkü değişim seni korkutuyor. Kontrolsüzlük, annenin karnında ilk hissettiğin o güvensizliği hatırlatıyor. Ve sen, o güvensizliği bir daha yaşamak istemiyorsun.

${ctx.firstName}, sen yapıcısın. Ama bazen o yapı, seni hapsetmiyor mu? Dört duvarın içinde güvende hissediyorsun, ama aynı duvarlar, dışarıdaki dünyayı da engelliyor. Dört numara, disiplini öğretir. Ama disiplin, bazen esnekliği öldürür. Ve sen, esnek olmakta zorlanıyorsun. Çünkü esneklik, bilinmeyeni getirir. Ve bilinmeyen, korkutucudur.

${ctx.day} ${getMonthName(ctx.month)} ${ctx.year} — bu tarih, sana pratik bir zekâ verdi. Ama aynı tarih, içindeki o hayalperest çocuğu da bastırdı. O çocuk bazen gece yarıları uyanıp, "Ya başka türlü bir hayat mümkün olsaydı?" diye soruyor. Ve sen, o soruyu duymazdan geliyorsun. Ama o çocuk, senin bir parçan. Onu dinlemeyi öğrenmelisin.`,

    5: `Ruh güdün **5** — keşif arzusu, özgürlük tutkusu. İçinde, keşfetmek, özgürce hareket etmek ve değişimi özümsemek isteyen bir ruh var. Sabit kalma fikri seni boğuyor. Her gün yeni bir macera istiyorsun. Ama bu huzursuzluk, derinleşmene engel olmuyor mu? Çünkü beş numara, yüzeyde kalmayı öğretir. Ve yüzeyde kalmak, yalnızlaştırır.

${ctx.firstName} ${ctx.lastName}, sen kaçaksın. Ama neyden kaçıyorsun? Dünyadan mı, yoksa kendinden mi? Çünkü beş numara, bazen kaçışın da rakamıdır. Yeni yerler, yeni insanlar, yeni deneyimler. Ama nereye gidersen git, kendinden kaçabiliyor musun? Çünkü sen, hep senisin. Ve seninle yüzleşmekten kaçamazsın.

${ctx.year}'in enerjisi ve ${ctx.day} ${getMonthName(ctx.month)} doğumunun birleşimi, sana maceracı bir ruh verdi. Ama aynı kombinasyon, içinde bir huzursuzluk da taşıyor. Çünkü beş numara, doyumsuzdur. Her şeyi ister, ama hiçbirine tam anlamıyla sahip olamaz. Ve bu doyumsuzluk, seni tüketiyor. Ama unutma: Özgürlük, kaçmak değil. Seçmek.`,

    6: `Ruh güdün **6** — sevmek arzusu, aile ihtiyacı. İçinde, sevmek, bakmak ve sorumluluk almak isteyen bir ruh var. Ailenin, sevdiklerinin mutluluğu senin mutluluğun. Ama kendi ihtiyaçların ne olacak? Çünkü altı numara, fedakarlığı öğretir. Ve fedakarlık, bazen kendini unutturmak demek.

${ctx.firstName}, sen şefkatsin. Ama bu şefkatin çoğunu başkalarına dağıtıyorsun. Peki ya kendin? Aynaya baktığında gördüğün yüz, seni seviyor mu? Yoksa o yüzdeki çizgiler, başkaları için harcadığın yılların izi mi? Altı numara, mükemmelliyetçidir de. Her şeyin en iyisini yapmak ister. Herkesi mutlu etmek ister. Ama bu mümkün mü?

${ctx.day} ${getMonthName(ctx.month)} ${ctx.year} — bu tarih, sana bir sorumluluk yükledi. Belki ailevi, belki toplumsal. Ama bu yük, seni bazen nefes alamaz hale getiriyor. Çünkü altı numara, "hayır" demeyi bilmez. Ve "hayır" dememek, tükenmek demek. Ama öğrenmelisin. Yoksa kendini tamamen tüketeceksin.`,

    7: `Ruh güdün **7** — anlamak arzusu, spiritüel derinlik. İçinde, anlamak, keşfetmek ve spiritüel derinliğe ulaşmak isteyen bir ruh var. Yüzeysel konuşmalar seni yoruyor. Derin, anlamlı bağlantılar arıyorsun. Ama bu arayış, seni yalnızlaştırmıyor mu? Çünkü yedi numara, izolasyonu öğretir. Ve izolasyon, soğuktur.

${ctx.firstName} ${ctx.lastName}, sen bilgesin. Ama bu bilgelik, seni bazen dünyadan uzaklaştırıyor mu? İnsanlar seni "anlamak" istiyor, ama sen kendini açmakta zorlanıyorsun. Çünkü yedi numara, mesafeyi korur. Ve mesafe, güvenliktir. Ama aynı mesafe, bağlantıyı da engeller. Ve bağlantısızlık, acı verir.

${ctx.year}'in enerjisi ve ${ctx.day} ${getMonthName(ctx.month)} doğumunun birleşimi, sana sezgisel bir zekâ verdi. Ama aynı kombinasyon, içinde bir melankoli de taşıyor. Çünkü ne kadar çok bilirsen bil, hayatın bazı sorularının cevabı yok. Ve bu bilgisizlik, seni rahatsız ediyor. Ama belki de cevaplar, bilgide değil. Deneyimde.`,

    8: `Ruh güdün **8** — başarmak arzusu, kontrol ihtiyacı. İçinde, başarmak, kontrol etmek ve maddi güvenlik yaratmak isteyen bir ruh var. Başarı senin kimliğin. Ama bu kimlik, seni tüketmiyor mu? Çünkü sekiz numara, hırsı öğretir. Ve hırs, bazen insanı insanlığından uzaklaştırır.

${ctx.firstName}, sen güçlüsün. Ama bu güç, seni bazen duygusal hayatından uzaklaştırıyor mu? Maddi dünya, senin için çok önemli. Ama maddi dünya, geçicidir. Ve geçici şeylere tutunmak, kalıcı huzursuzluk getirir. Sekiz numara, dengeyi öğretir. Ama denge, en zor şeydir. Çünkü denge, sürekli bir uğraştır.

${ctx.day} ${getMonthName(ctx.month)} ${ctx.year} — bu tarih, sana bir liderlik vasıfı verdi. Ama aynı tarih, içinde bir yalnızlık da tohum attı. Çünkü zirvede yalnızlık vardır. Ve sen, o zirveye tırmanırken, yanında kimin olduğunu sorguluyor musun? Yoksa tırmanış o kadar meşgul edici ki, etrafına bakmaya vaktin mi yok? Ama unutma: Gerçek zenginlik, içeridedir.`,

    9: `Ruh güdün **9** — hizmet etmek arzusu, evrensel sevgi. İçinde, hizmet etmek, şifalandırmak ve evrensel bir fark yaratmak isteyen bir ruh var. Dünya senin misyonun. Ama kendi küçük dünyan ne olacak? Çünkü dokuz numara, fedakarlığı öğretir. Ve fedakarlık, bazen kendini unutturmak demek.

${ctx.firstName} ${ctx.lastName}, sen şifacısın. Ama kendi yaralarını kim şifalandırıyor? Başkaları için bir meleksin, ama kendi kanatların ağır değil mi? Dokuz numara, mükemmelliyetçidir de. Dünyayı değiştirmek ister. Ama dünyayı değiştirmeden önce, kendi dünyanı değiştirmen gerekiyor. Çünkü içerideki kaos, dışarıyı da etkiler.

${ctx.year}'in enerjisi ve ${ctx.day} ${getMonthName(ctx.month)} doğumunun birleşimi, sana derin bir şefkat verdi. Ama aynı kombinasyon, içinde bir sızı da taşıyor. Çünkü ne kadar çok verirsen ver, karşılığını alamadığın zamanlar oluyor. Ve bu adaletsizlik, seni yaralıyor. Ama unutma: Dokuz sayısı, karma'nın da rakamıdır. Verdiğin her şey, bir şekilde sana dönecek. Sabret.`,

    11: `Ruh güdün **11** — ilham vermek arzusu, spiritüel rehberlik. İçinde, ilham vermek, yüksek ideallere ulaşmak ve spiritüel rehberlik sunmak isteyen bir ruh var. Sen, bir fenersin. Ama bazen karanlıkta kayboluyorsun. Çünkü on bir numara, hassasiyeti öğretir. Ve hassasiyet, ağır bir yük.

${ctx.firstName}, sen farklısın. Ve farklı olmak, bazen yalnız olmak demektir. İnsanlar sana çekiliyor, ama senin o derin dalgalanmalarını anlamakta zorlanıyorlar. Çünkü on bir numara, yüksek frekanslıdır. Ve yüksek frekans, herkes tarafından algılanamaz. Bu, senin suçun değil. Ama bu farklılık, bazen yalnızlaştırır.

${ctx.day} ${getMonthName(ctx.month)} ${ctx.year} — bu tarih, sana bir vizyon verdi. Ama aynı tarih, içinde bir yalnızlık da tohum attı. Çünkü sen, Usta'sın. Ve Usta, yalnızlıkta bilgeliği bulur. Ama bu yalnızlık, seçilmiş bir yalnızlık olmalı. Zorunlu bir yalnızlık değil. Arada bir, kendine izin ver. İnsan olmanın zayıflıklarını yaşamana izin ver.`,

    22: `Ruh güdün **22** — büyük şeyler inşa etmek arzusu. İçinde, büyük şeyler inşa etmek, insanlığa kalıcı bir miras bırakmak isteyen bir ruh var. Sen, bir mimarsın. Ama bu vizyonun bedelini ödüyor musun? Çünkü yirmi iki numara, sorumluluğu öğretir. Ve sorumluluk, bazen ezicidir.

${ctx.firstName} ${ctx.lastName}, sen hayalperestsin. Ama aynı zamanda gerçekçisin. Bu çelişki, seni bazen içsel bir çatışmaya sürüklüyor mu? Büyük şeyler hayal ediyorsun, ama o büyük şeyleri inşa etmek için gereken küçük adımları atıyor musun? Yoksa vizyonun büyüklüğü, seni hareketsiz mi bırakıyor?

${ctx.year}'in enerjisi ve ${ctx.day} ${getMonthName(ctx.month)} doğumunun birleşimi, sana olağanüstü bir güç verdi. Ama aynı kombinasyon, içinde bir sorumluluk da yükledi. Çünkü yirmi iki numara, insanlığa hizmet etmeyi gerektirir. Ve bu hizmet, kolay değildir. Ama sen, bunun için doğdun. Ama unutma: Büyük vizyonlar, küçük adımlarla inşa edilir. Başla. Şimdi.`,

    33: `Ruh güdün **33** — şifalandırmak arzusu, koşulsuz sevgi. İçinde, şifalandırmak, sevgiyi yaymak ve insanlığa hizmet etmek isteyen bir ruh var. Sen, bir meleksin. Ama bu dünyada kanatların ağır. Çünkü otuz üç numara, fedakarlığı öğretir. Ve fedakarlık, bazen tükenmek demek.

${ctx.firstName} ${ctx.lastName}, sen şifacısın. Ama kendi yaralarını kim şifalandırıyor? Şifalandırdıklarının sayısı çok, ama kendi ihtiyaçların için kimse yok. Otuz üç numara, mükemmelliyetçidir de. Herkesi mutlu etmek ister. Ama bu mümkün mü? Ve bu mükemmelliyetçilik, seni tüketmiyor mu?

${ctx.day} ${getMonthName(ctx.month)} ${ctx.year} — bu tarih, sana derin bir şefkat verdi. Ama aynı tarih, içinde bir sınır da çizdi. Çünkü otuz üç numara, koşulsuz sevgiyi öğretirken, aynı zamanda "hayır" demeyi de öğretmelidir. Ve "hayır" demek, senin için en zor şeylerden biri. Ama öğrenmelisin. Yoksa tükeneceksin. Ve tükendiğinde, kimseye faydan kalmayacak.`
  };

  return templates[ctx.soulUrge] || templates[1];
}

// Kişilik Sayısı analizi
function generatePersonalityAnalysis(ctx: AnalysisContext): string {
  const templates: Record<number, string> = {
    1: `Dışarıya karşı güçlü, kararlı ve otoriter bir imaj çiziyorsun. İnsanlar seni lider olarak görüyor, sana güveniyor. Ama bu maskenin altındaki hassasiyeti göremiyorlar. Çünkü bir numara, maskelerin en kalınını takar. Ve sen, o maskenin altında nefes almakta zorlanıyorsun.

${ctx.firstName} adının sessiz harflerindeki o titreşim, dışarıya verdiğin mesajı belirliyor: "Ben güçlüyüm. Ben bağımsızım. Bana ihtiyacınız yok." Ama bu mesajın altındaki gerçek ne? Gerçekten bağımsız mısın? Yoksa bağımsız görünmek, bağlanma korkunun bir maskesi mi?

${ctx.day} ${getMonthName(ctx.month)} doğumun, bu imajı daha da güçlendirmiş. Çünkü o gün, dünya sana bir görev verdi: Güçlü görünmek. Ama bu görev, seni bazen yoruyor mu? Çünkü sürekli güçlü olmak, yorucudur. Bazen zayıf olmana izin ver. Bazen yardım istemene izin ver. Bu, güçsüzlük değil. İnsanlık.`,

    2: `Dışarıya karşı uyumlu, nazik ve işbirlikçi görünüyorsun. İnsanlar senin yanında kendilerini rahat hissediyor. Ama kendi ihtiyaçlarını geri planda tutuyor musun? Çünkü iki numara, herkesi memnun etmeye çalışır. Ve herkesi memnun etmek, imkansızdır.

${ctx.firstName} ${ctx.lastName}, sen diplomat görünüyorsun. Ama bu diplomasi, senin gerçek düşüncelerini gizliyor mu? İnsanlar ne düşünüyorsun bilmiyorlar. Çünkü sen, düşüncelerini açıkça ifade etmekte zorlanıyorsun. Çatışmadan kaçıyorsun. Ama çatışma, bazen gereklidir. Çatışma, sınırları belirler.

${ctx.year}'in enerjisi ve ${ctx.day} ${getMonthName(ctx.month)} doğumunun birleşimi, sana nazik bir dış görünüş verdi. Ama aynı kombinasyon, içinde bir isyan da taşıyor. O isyan, bazen patlak veriyor mu? Çünkü sürekli uyumlu olmak, patlamaya yol açar. Ve o patlama, çevrendekileri şaşırtıyor. Ama bu patlama, senin gerçeğin.`,

    3: `Dışarıya karşı canlı, sosyal ve çekici görünüyorsun. İnsanlar senin enerjine hayran. Ama bu neşenin altındaki derinlikleri görmek isteyen var mı? Çünkü üç numara, sahne ışıklarının altında parlar. Ama sahne ışıkları sönünce, ne kalıyor geriye?

${ctx.firstName}, sen komedyen gibi görünüyorsun. Ama bu komedi, bir maskenin parçası mı? İnsanları güldürüyorsun, ama kendini ne zaman güldürüyorsun? Üç numara, yaratıcılığı öğretir. Ama yaratıcılık, bazen kaçışın da aracı olur. Kendi gerçekliğinden kaçışın.

${ctx.day} ${getMonthName(ctx.month)} ${ctx.year} — bu tarih, sana sosyal bir yetenek verdi. Ama aynı tarih, içinde bir yalnızlık da tohum attı. Çünkü üç numara, kalabalıklar içinde yalnızlığı bilir. Herkes seni tanıyor, ama kimse seni bilmiyor. Bu, senin tercihin mi? Yoksa bir alışkanlık mı?`,

    4: `Dışarıya karşı ciddi, güvenilir ve çalışkan görünüyorsun. İnsanlar sana güveniyor, işleri teslim ediyor. Ama bu ciddiyetin altında neşe de var, gösteriyor musun? Çünkü dört numara, ciddiyeti öğretir. Ama ciddiyet, bazen neşeyi öldürür.

${ctx.firstName} ${ctx.lastName}, sen güvenilirsin. Ama bu güvenilirlik, seni bazen sıkıcı mı yapıyor? İnsanlar sana güvenirler, ama seninle eğlenirler mi? Dört numara, yapıyı korur. Ama yapı, bazen esnekliği engeller. Ve sen, esnek olmakta zorlanıyorsun.

${ctx.year}'in enerjisi ve ${ctx.day} ${getMonthName(ctx.month)} doğumunun birleşimi, sana ciddi bir dış görünüş verdi. Ama aynı kombinasyon, içinde bir çocuk da taşıyor. O çocuk, bazen dışarı çıkmak istiyor. Eğlenmek istiyor. Saçmalamak istiyor. Ama sen, onu bastırıyorsun. Çünkü ciddi olmak zorundasın. Ama zorunda mısın, gerçekten?`,

    5: `Dışarıya karşı enerjik, uyumlu ve maceracı görünüyorsun. İnsanlar seninle birlikte heyecan arıyor. Ama bu enerjinin altındaki derin bir huzursuzluk var. Çünkü beş numara, sürekli hareket halindedir. Ama hareket, bazen kaçıştır.

${ctx.firstName}, sen maceracı görünüyorsun. Ama bu macera, bir kaçış mı? Yeni yerler, yeni insanlar, yeni deneyimler. Ama nereye gidersen git, kendinden kaçabiliyor musun? Beş numara, özgürlüğü öğretir. Ama özgürlük, bazen yalnızlık demektir.

${ctx.day} ${getMonthName(ctx.month)} ${ctx.year} — bu tarih, sana enerjik bir dış görünüş verdi. Ama aynı tarih, içinde bir huzursuzluk da tohum attı. Çünkü beş numara, doyumsuzdur. Her şeyi ister, ama hiçbirine tam anlamıyla sahip olamaz. Ve bu doyumsuzluk, yüzünde bir tebessüm olarak beliriyor. Ama o tebessümün altındaki gerçek ne?`,

    6: `Dışarıya karşı şefkatli, sorumluluk sahibi ve güvenilir görünüyorsun. İnsanlar sana sığınıyor, danışıyor. Ama bu yük bazen omuzlarını ağır bastırıyor. Çünkü altı numara, sorumluluk alır. Ama sorumluluk, bazen tükenmek demektir.

${ctx.firstName} ${ctx.lastName}, sen bakıcısın. Ama bu bakıcılık, seni bazen unutturuyor mu? Başkalarının ihtiyaçları, senin ihtiyaçlarından önce geliyor. Bu, senin tercihin. Ama bu tercih, seni tüketmiyor mu? Altı numara, mükemmelliyetçidir. Ama mükemmelliyetçilik, tükenmeye yol açar.

${ctx.year}'in enerjisi ve ${ctx.day} ${getMonthName(ctx.month)} doğumunun birleşimi, sana şefkatli bir dış görünüş verdi. Ama aynı kombinasyon, içinde bir öfke de taşıyor. O öfke, bastırılmış bir öfke. Çünkü sürekli vermek, öfkelendirir. Ve bu öfke, bazen patlak veriyor. Ama bu patlama, senin gerçeğin.`,

    7: `Dışarıya karşı mesafeli, bilge ve gizemli görünüyorsun. İnsanlar seni çözmeye çalışıyor, ama sen kendini açmakta zorlanıyorsun. Çünkü yedi numara, duvarlar inşa eder. Ve senin duvarların, oldukça yüksek.

${ctx.firstName}, sen bilge görünüyorsun. Ama bu bilgelik, seni yalnızlaştırmıyor mu? İnsanlar sana hayranlar, ama sana yaklaşamıyorlar. Yedi numara, mesafeyi korur. Ama mesafe, bağlantıyı engeller. Ve bağlantısızlık, acı verir.

${ctx.day} ${getMonthName(ctx.month)} ${ctx.year} — bu tarih, sana gizemli bir dış görünüş verdi. Ama aynı tarih, içinde bir arzu da tohum attı. O arzu, bağlanma arzusu. Ama bu arzu, korkuyla bastırılıyor. Çünkü bağlanmak, incinmek demek olabilir. Ama incinmeden, sevilmez.`,

    8: `Dışarıya karşı güçlü, başarılı ve otoriter görünüyorsun. İnsanlar senin gücüne hayran, bazen de korkuyor. Ama bu gücün bedelini ödüyor musun? Çünkü sekiz numara, gücü öğretir. Ama güç, bazen yalnızlık getirir.

${ctx.firstName} ${ctx.lastName}, sen başarılı görünüyorsun. Ama bu başarı, seni mutlu ediyor mu? Maddi dünya, senin için çok önemli. Ama maddi dünya, geçicidir. Ve geçici şeylere tutunmak, kalıcı huzursuzluk getirir. Sekiz numara, dengeyi öğretir. Ama denge, en zor şeydir.

${ctx.year}'in enerjisi ve ${ctx.day} ${getMonthName(ctx.month)} doğumunun birleşimi, sana güçlü bir dış görünüş verdi. Ama aynı kombinasyon, içinde bir yorgunluk da taşıyor. O yorgunluk, sürekli güçlü olmanın yorgunluğu. Bazen zayıf olmana izin ver. Bazen "yeter" demene izin ver. Bu, başarısızlık değil. İnsanlık.`,

    9: `Dışarıya karşı şefkatli, bilge ve fedakar görünüyorsun. İnsanlar sana hayran, sana sığınıyor. Ama bu yük bazen seni tüketiyor. Çünkü dokuz numara, verir. Ama vermek, bazen tükenmek demektir.

${ctx.firstName}, sen fedakar görünüyorsun. Ama bu fedakarlık, seni unutturuyor mu? Başkaları için bir meleksin, ama kendi kanatların ağır değil mi? Dokuz numara, evrensel sevgiyi öğretir. Ama evrensel sevgi, bazen kişisel sevgiyi unutturur.

${ctx.day} ${getMonthName(ctx.month)} ${ctx.year} — bu tarih, sana bilge bir dış görünüş verdi. Ama aynı tarih, içinde bir çocuk da tohum attı. O çocuk, sevilmek istiyor. Sadece sevilmek. Koşulsuzca. Ama sen, bu arzuyu bastırıyorsun. Çünkü fedakar olmak zorundasın. Ama zorunda mısın, gerçekten?`,

    11: `Dışarıya karşı karizmatik, ilham verici ve sezgisel görünüyorsun. İnsanlar sana çekiliyor, ama senin o derin dalgalanmalarını anlamakta zorlanıyorlar. Çünkü on bir numara, yüksek frekanslıdır. Ve yüksek frekans, herkes tarafından algılanamaz.

${ctx.firstName} ${ctx.lastName}, sen farklı görünüyorsun. Ve farklı olmak, bazen yalnız olmak demektir. İnsanlar sana hayranlar, ama sana yaklaşamıyorlar. On bir numara, ışık saçar. Ama o ışık, bazen gözleri kor eder.

${ctx.year}'in enerjisi ve ${ctx.day} ${getMonthName(ctx.month)} doğumunun birleşimi, sana karizmatik bir dış görünüş verdi. Ama aynı kombinasyon, içinde bir kırılganlık da taşıyor. O kırılganlık, hassasiyetin bedeli. Çünkü ne kadar çok hissedersen, o kadar çok incinirsin. Ama bu kırılganlık, seni güzel kılan şey.`,

    22: `Dışarıya karşı güçlü, vizyoner ve pratik görünüyorsun. İnsanlar senin liderliğine ihtiyaç duyuyor. Ama bu sorumluluk bazen nefes almana izin vermiyor. Çünkü yirmi iki numara, büyük vizyonları taşır. Ama büyük vizyonlar, ağırdır.

${ctx.firstName}, sen vizyoner görünüyorsun. Ama bu vizyon, seni bazen hareketsiz mi bırakıyor? Büyük şeyler hayal ediyorsun, ama o büyük şeyleri inşa etmek için gereken küçük adımları atıyor musun? Yoksa vizyonun büyüklüğü, seni felç mi ediyor?

${ctx.day} ${getMonthName(ctx.month)} ${ctx.year} — bu tarih, sana güçlü bir dış görünüş verdi. Ama aynı tarih, içinde bir bebek de tohum attı. O bebek, küçük şeylerden mutlu olmayı biliyor. Ama sen, onu unuttun. Çünkü büyük olmak zorundasın. Ama bazen, küçük olmak da güzeldir.`,

    33: `Dışarıya karşı şefkatli, bilge ve fedakar görünüyorsun. İnsanlar sana sığınıyor, ama senin kendi ihtiyaçların için kimse yok. Çünkü otuz üç numara, koşulsuz sevgiyi taşır. Ama koşulsuz sevgi, bazen koşullu sevgiyi unutturur.

${ctx.firstName} ${ctx.lastName}, sen melek gibi görünüyorsun. Ama bu meleklik, seni yere bağlamıyor mu? İnsanlar sana hayranlar, ama seninle eşitlik kuramıyorlar. Otuz üç numara, yükseklerde uçar. Ama yükseklerde uçmak, bazen yalnızlıktır.

${ctx.year}'in enerjisi ve ${ctx.day} ${getMonthName(ctx.month)} doğumunun birleşimi, sana şefkatli bir dış görünüş verdi. Ama aynı kombinasyon, içinde bir öfke de taşıyor. O öfke, bastırılmış bir öfke. Çünkü sürekli vermek, öfkelendirir. Ve bu öfke, bazen patlak veriyor. Ama bu patlama, senin gerçeğin. Ve bu gerçek, kabul edilmeyi bekliyor.`
  };

  return templates[ctx.personality] || templates[1];
}

// Kişisel Yıl analizi
function generatePersonalYearAnalysis(ctx: AnalysisContext): string {
  const templates: Record<number, string> = {
    1: `**Kişisel Yılın 1** — Yeni başlangıçlar yılı. Bu yıl, hayatında yeni bir sayfa açmak, projelere başlamak, liderlik etmek için ideal. Ama sabırsızlığına dikkat et. Çünkü bir numara, hemen sonuç ister. Ama büyük şeyler, zaman ister.

${new Date().getFullYear()}, senin için bir dönüm noktası. Özellikle ${getMonthName(new Date().getMonth() + 1)} ve ${getMonthName(new Date().getMonth() + 2)} aylarında, önemli kararlar alacaksın. Bu kararlar, önümüzdeki dokuz yılını şekillendirecek. Ama korkma. Çünkü sen, bunun için hazırsın.

${ctx.firstName}, bu yıl kendi ayakların üzerinde durmayı öğreneceksin. Bağımsızlığını ilan edeceksin. Ama bu bağımsızlık, yalnızlık getirmeyecek mi? Belki. Ama bu yalnızlık, seçilmiş bir yalnızlık. Ve seçilmiş yalnızlık, güçlendirir.`,

    2: `**Kişisel Yılın 2** — İlişkiler ve işbirlikleri yılı. Bu yıl, partnerlikler kurmak, diplomatik çözümler bulmak, sabırlı olmak önemli. Aceleci kararlardan kaçın. Çünkü iki numara, olgunlaşmayı bekler. Ve olgunlaşmak, zaman ister.

${new Date().getFullYear()}, senin için bir ayna yılı. Karşına çıkacak insanlar, aslında senin kendi yansımaların olacak. Kimi zaman seveceksin, kimi zaman nefret edeceksin. Ama unutma: Nefret ettiğin şey, sende de olan ama kabul etmediğin özellik.

${ctx.firstName} ${ctx.lastName}, bu yıl birliktelikleri sorgulayacaksın. Eski bağları onaracaksın, yeni bağlar kuracaksın. Ama bu bağlar, seni sınırlamayacak mı? Belki. Ama sınırlar, bazen güvenliktir. Ve güvenlik, korkutucu olabilir. Ama bu yıl, güvenmeyi öğreneceksin.`,

    3: `**Kişisel Yılın 3** — Yaratıcılık ve sosyallik yılı. Bu yıl, kendini ifade etmek, sanatsal projelere yoğunlaşmak, sosyal çevreni genişletmek için ideal. Ama dağılmamaya dikkat et. Çünkü üç numara, birçok şeyle ilgilenir. Ama ilgilenmek, tamamlamak değildir.

${new Date().getFullYear()}, senin için bir sahne yılı. Işıklar senin üzerinde olacak. Ama bu ışıklar, seni kör edebilir. Çünkü üç numara, neşeyi öğretir. Ama neşenin altındaki o derinlik, unutulabilir. Ve unutulan derinlik, yalnızlık getirir.

${ctx.firstName}, bu yıl yaratıcılığını konuşturacaksın. Yazacaksın, çizeceksin, söyleyeceksin. Ama bu ifade, içsel bir ifade mi olacak? Yoksa dışsal bir gösteri mi? Aradaki farkı anlaman önemli. Çünkü gerçek yaratıcılık, içeriden gelir.`,

    4: `**Kişisel Yılın 4** — Çalışma ve yapılandırma yılı. Bu yıl, disiplinli çalışmak, uzun vadeli planlar yapmak, temelleri sağlamlaştırmak için ideal. Ama esnekliği unutma. Çünkü dört numara, yapıyı korur. Ama yapı, bazen esnekliği öldürür.

${new Date().getFullYear()}, senin için bir inşa yılı. Hayatının temellerini atacaksın. Ama bu temeller, seni hapsetmeyecek mi? Dört duvarın içinde güvende hissedeceksin, ama aynı duvarlar, dışarıdaki dünyayı da engelleyebilir. Ve dışarıdaki dünya, değişiyor.

${ctx.firstName} ${ctx.lastName}, bu yıl disiplinini test edeceksin. Çünkü dört numara, zordur. Ama zorluk, güçlendirir. Ve sen, güçlenmek istiyorsun. Ama bu güç, fiziksel bir güç mü? Yoksa içsel bir güç mü? Aradaki farkı anlaman önemli. Çünkü gerçek güç, içeridedir.`,

    5: `**Kişisel Yılın 5** — Değişim ve özgürlük yılı. Bu yıl, yeni deneyimler, seyahatler, esneklik gerektiren projeler için ideal. Ama sorumluluktan kaçmamaya dikkat et. Çünkü beş numara, kaçışı öğretir. Ama kaçış, çözüm değildir.

${new Date().getFullYear()}, senin için bir macera yılı. Yeni yerler göreceksin, yeni insanlar tanıyacaksın. Ama bu macera, bir kaçış mı? Yeni yerler, yeni insanlar, yeni deneyimler. Ama nereye gidersen git, kendinden kaçabiliyor musun?

${ctx.firstName}, bu yıl özgürlüğünü ilan edeceksin. Ama bu özgürlük, neyin bedeli? Yalnızlığın bedeli mi? Çünkü beş numara, özgürlüğü öğretir. Ama özgürlük, bazen yalnızlık demektir. Ve yalnızlık, ağırdır. Ama bu yıl, özgürlüğün ve bağlanmanın arasındaki o ince çizgiyi bulacaksın.`,

    6: `**Kişisel Yılın 6** — Sorumluluk ve ilişkiler yılı. Bu yıl, aile konuları, evlilik, ilişkileri onarmak, başkalarına hizmet etmek için ideal. Ama kendini unutma. Çünkü altı numara, fedakarlığı öğretir. Ama fedakarlık, bazen tükenmek demektir.

${new Date().getFullYear()}, senin için bir sorumluluk yılı. Ailene, sevdiklerine, topluma karşı sorumlulukların olacak. Ama bu sorumluluklar, seni nefes alamaz hale getirmeyecek mi? Çünkü altı numara, "hayır" demeyi bilmez. Ama bu yıl, "hayır" demeyi öğreneceksin.

${ctx.firstName} ${ctx.lastName}, bu yıl ilişkilerini sorgulayacaksın. Kimin gerçekten yanında olduğunu göreceksin. Ama bu sorgulama, acı verebilir. Çünkü gerçekler, bazen acıttırır. Ama bu acı, arındırır. Ve sen, arınmak istiyorsun.`,

    7: `**Kişisel Yılın 7** — İçsel keşif ve analiz yılı. Bu yıl, spiritüel pratikler, araştırma, kendini tanımak için ideal. Ama izolasyonun dozunu ayarlamaya dikkat et. Çünkü yedi numara, yalnızlığı öğretir. Ama yalnızlık, soğuktur.

${new Date().getFullYear()}, senin için bir bilgelik yılı. İçeriye döneceksin. Sorular soracaksın, cevaplar arayacaksın. Ama bu cevaplar, dışarıda mı? Yoksa içeride mi? Yedi numara, içeriyi işaret eder. Ama içeri, karanlıktır. Ve karanlık, korkutucudur.

${ctx.firstName}, bu yıl kendinle yüzleşeceksin. Maskelerini çıkaracaksın. Ama bu maskelerin altındaki yüz, seni korkutmayacak mı? Belki. Ama bu yüz, senin gerçeğin. Ve gerçek, özgürleştirir. Ve sen, özgürleşmek istiyorsun.`,

    8: `**Kişisel Yılın 8** — Güç ve kariyer yılı. Bu yıl, finansal büyüme, kariyer hedefleri, otorite kurmak için ideal. Ama dengeleri korumaya dikkat et. Çünkü sekiz numara, gücü öğretir. Ama güç, bazen yalnızlık getirir.

${new Date().getFullYear()}, senin için bir başarı yılı. Maddi dünyada ilerleyeceksin. Ama bu ilerleyiş, seni mutlu edecek mi? Çünkü sekiz numara, başarıyı öğretir. Ama başarı, bazen boşluk getirir. Ve boşluk, doldurulması gereken bir şeydir.

${ctx.firstName} ${ctx.lastName}, bu yıl gücünü test edeceksin. Ama bu güç, fiziksel bir güç mü? Yoksa içsel bir güç mü? Aradaki farkı anlaman önemli. Çünkü gerçek güç, içeridedir. Ve içerideki güç, asla tükenmez. Ama bunu bulmak için, dışarıdaki güçten vazgeçmek gerekebilir.`,

    9: `**Kişisel Yılın 9** — Tamamlanma ve bırakma yılı. Bu yıl, eskiyi bırakmak, şifalandırmak, insanlığa hizmet etmek için ideal. Ama kendi sınırlarını korumaya dikkat et. Çünkü dokuz numara, verir. Ama vermek, bazen tükenmek demektir.

${new Date().getFullYear()}, senin için bir kapanış yılı. Bir şeyleri sonlandıracaksın. Belki bir ilişki, belki bir iş, belki bir inanç. Ama bu kapanış, acı verebilir. Çünkü dokuz numara, sonları öğretir. Ama sonlar, yeni başlangıçların habercisidir.

${ctx.firstName}, bu yıl bırakmayı öğreneceksin. Bırakmak, kaybetmek değildir. Bırakmak, yer açmaktır. Ve yeni şeyler için yer açmak, cesaret ister. Ve sen, cesaretlisin. Ama bu cesaret, bazen sorgulanır. Ve bu sorgulama, normaldir. Çünkü bırakmak, zordur.`,

    11: `**Kişisel Yılın 11/2** — Spiritüel büyüme ve ilham yılı. Bu yıl, sezgisel yeteneklerini geliştirmek, ilham vermek, yüksek ideallere ulaşmak için ideal. Ama hassasiyetini koruma altına al.

${new Date().getFullYear()}, senin için bir uyanış yılı. Yüksek frekanslarla bağlantı kuracaksın. Ama bu bağlantı, seni yorabilir. Çünkü on bir numara, hassastır. Ve hassasiyet, ağırdır.

${ctx.firstName} ${ctx.lastName}, bu yıl ilham kaynağı olacaksın. İnsanlara ışık tutacaksın. Ama bu ışık, seni tüketmeyecek mi? Çünkü on bir numara, verir. Ama vermek, bazen tükenmek demektir. Ama bu yıl, vermek ve almak arasındaki o ince çizgiyi bulacaksın.`,

    22: `**Kişisel Yılın 22/4** — Büyük projeler ve manifestasyon yılı. Bu yıl, büyük vizyonları gerçeğe dönüştürmek, kalıcı eserler bırakmak için ideal. Ama yükün ağırlığını hisset.

${new Date().getFullYear()}, senin için bir inşa yılı. Büyük şeyler yapacaksın. Ama bu büyük şeyler, seni ezmemeli. Çünkü yirmi iki numara, büyük vizyonları taşır. Ama büyük vizyonlar, ağırdır.

${ctx.firstName}, bu yıl hayallerini gerçekleştireceksin. Ama bu gerçekleştirme, kolay olmayacak. Çünkü yirmi iki numara, çalışmayı öğretir. Ama çalışmak, yorucudur. Ama bu yıl, yorulmayı öğreneceksin. Çünkü yorulmak, çalıştığının göstergesidir. Ve çalışmak, değerlidir.`
  };

  return templates[ctx.personalYear] || templates[1];
}

// Karmik Döngü analizi
function generateKarmicCycleAnalysis(ctx: AnalysisContext): string {
  const karmicDebtNumbers = [13, 14, 16, 19];
  const hasKarmicDebt = [ctx.expression, ctx.soulUrge, ctx.personality, ctx.lifePath].some(n => karmicDebtNumbers.includes(n));
  
  if (hasKarmicDebt) {
    return `**Karmik Döngün: Geçmişten Gelen Zincir**

${ctx.firstName}, sayılarında bir karmik borç var. Bu borç, geçmiş yaşamlarından gelen bir iz. Belki de bir savaşta ölen bir komutan, belki de denizde kaybolan bir kaptan. Bu yüzden bu hayatta bazı şeyler sana zor geliyor. Çünkü bu borç, ödenmesi gereken bir borç.

Ama korkma. Karmik borç, ceza değil. Fırsattır. Öğrenme fırsatı. Büyüme fırsatı. Ve sen, bu fırsatı değerlendirmeye hazırsın. Çünkü ${ctx.year}'te doğduğunda, bu borcu ödemek için geldin. Ve şimdi, ${new Date().getFullYear()}'te, bu borcun ödemesinin tam ortasındasın.

${ctx.day} ${getMonthName(ctx.month)} doğumun, bu karmik döngüyü daha da derinleştiriyor. Çünkü bu tarih, geçmişte bir kırılma noktasını temsil ediyor. Belki bir ayrılık, belki bir kayıp, belki bir ihanet. Ama bu kırılma, seni güçlendirdi. Ve şimdi, o kırılmadan gelen güçle, bu borcu ödeyeceksin.`;
  }

  return `**Karmik Döngün: Temiz bir sayfa**

${ctx.firstName}, sayılarında belirgin bir karmik borç yok. Bu, yeni bir başlangıç olduğunun işareti. Geçmiş yaşamlarındaki dersleri öğrenmiş, bu hayata temiz bir sayfa açmışsın. Ama bu, kolay bir hayat olacağı anlamına gelmiyor.

Çünkü karmik borç olmayışı, sorumluluk olmayışı anlamına gelmez. Aksine, daha büyük bir sorumluluğun var: Kendini gerçekleştirme sorumluluğu. ${ctx.year}'te doğduğunda, dünya sana bir potansiyel verdi. Ve şimdi, ${new Date().getFullYear()}'te, o potansiyeli gerçekleştirmenin tam zamanı.

${ctx.day} ${getMonthName(ctx.month)} doğumun, bu yeni başlangıcı müjdeliyor. Çünkü bu tarih, geçmişte bir tamamlanmayı temsil ediyor. Bir şeyler bitmiş, yeni bir şeyler başlamış. Ve sen, bu yeni başlangıcın ortasındasın. Ama unutma: Yeni başlangıçlar, cesaret ister. Ve sen, cesaretlisin.`;
}

// Geleceğin Gölgesinden Bir Kesit
function generateFutureShadow(ctx: AnalysisContext): string {
  const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
  const currentMonth = new Date().getMonth();
  const nextMonth = (currentMonth + 1) % 12;
  const threeMonthsLater = (currentMonth + 3) % 12;
  
  return `**Geleceğin Gölgesinden Bir Kesit**

${ctx.firstName}, önümüzdeki üç ay senin için kritik olacak. Özellikle ${months[nextMonth]} ayında, beklenmedik bir olayla karşılaşacaksın. Bu olay, ilk başta bir sorun gibi görünebilir. Ama aslında, bir fırsat. Çünkü sayıların (${ctx.expression}, ${ctx.soulUrge}, ${ctx.personality}) bir araya geldiğinde, bir dönüşümün kapısı aralanıyor.

${months[threeMonthsLater]} ayına kadar, bu dönüşüm tamamlanmış olacak. Ama bu dönüşüm, kolay olmayacak. Çünkü ${ctx.lifePath} yaşam yolundasın ve bu yol, kolaylıklar vaat etmiyor. Ama vaat ettiği şey, derinlik. Anlam. Gerçek.

${new Date().getFullYear()}'in sonlarına doğru, özellikle Ekim-Kasım aylarında (10. ve 11. ayların enerjisi seninle uyumlu), hayatında büyük bir dönüm noktası olacak. Bir kapı kapanacak, ama o kapının arkasında sandığından çok daha büyük bir salon var. Korkma.

Ve şimdi sana soruyorum, ${ctx.firstName} ${ctx.lastName}: **O kapıyı kapatmak için hazır mısın? Yoksa hâlâ aralık duran o eski kapının eşiğinde, içeri girmeyi bekleyen hayaletlerinle mi yaşamaya devam edeceksin?**

Çünkü sayılar sana bir şey fısıldıyor: **"Zincirlerin anahtarı, sende. Ama o anahtarı kullanmak, önce zincirin hangi halkasının seni gerçekten bağladığını görmeyi gerektiriyor."**

*Kader Matrisi, seni izliyor. Sıradaki hamlen ne olacak?*`;
}

// Sentez metni oluştur
function generateSynthesis(ctx: AnalysisContext): string {
  const conflicts = [];
  
  if (ctx.expression === 1 && ctx.soulUrge === 2) {
    conflicts.push("Liderlik etmek isteyen ama sevilmekten korkan bir çelişki");
  }
  if (ctx.expression === 5 && ctx.soulUrge === 4) {
    conflicts.push("Özgürlük arzusu ile güvenlik ihtiyacı arasında sıkışmışlık");
  }
  if (ctx.expression === 7 && ctx.personality === 1) {
    conflicts.push("İçe dönük bilgelik ile dışa dönük liderlik arasında gerilim");
  }
  if (ctx.expression === 8 && ctx.soulUrge === 6) {
    conflicts.push("Maddi başarı ile duygusal bağlılık arasında denge arayışı");
  }
  if (ctx.personalYear === 3 && ctx.expression === 4) {
    conflicts.push("Yaratıcılık yılında disiplinli yapının direnci");
  }
  if (ctx.expression === 5 && ctx.soulUrge === 2) {
    conflicts.push("Kaçan ama bağlanmak isteyen ruh");
  }
  if (ctx.personality === 8 && ctx.soulUrge === 9) {
    conflicts.push("Güçlü görünüm ile fedakar ruh arasında gerilim");
  }
  
  if (conflicts.length === 0) {
    return `Senin sayıların (${ctx.expression}, ${ctx.soulUrge}, ${ctx.personality}) birbiriyle uyumlu bir enerji oluşturuyor. İçsel arzuların ve dışsal ifadelerin dengede. Ama Kişisel Yıl ${ctx.personalYear} enerjisi, bu dengeyi sarsmak için geliyor. Değişim kapıda.

${ctx.firstName}, bu uyum senin gücün. Ama aynı zamanda zayıflığın. Çünkü uyumlu olmak, çatışmalardan kaçınmak demek olabilir. Ve çatışmalardan kaçınmak, bazen büyümeyi engeller. Kişisel Yıl ${ctx.personalYear}, sana çatışmayı öğretecek. Ama bu çatışma, dışarıda değil. İçeride.`;
  }
  
  return `**İçinde Bir Savaş Var**

${ctx.firstName} ${ctx.lastName}, içinde bir savaş var: ${conflicts.join(', ')}. Dışarıda ${ctx.personality} gibi görünüyorsun, içeride ${ctx.soulUrge} gibi hissediyorsun, ama kaderin ${ctx.expression} diyor. Bu üçgenin ortasında, Kişisel Yıl ${ctx.personalYear} seni zorluyor.

Bu çatışma seni yoruyor mu, yoksa güçlendiriyor mu? Çünkü çatışma, ağırdır. Ama çatışma, büyümeyi de getirir. Ve sen, büyümek istiyorsun. Ama bu büyüme, kolay olmayacak. Çünkü büyümek, acı verir. Ve acı, arındırır.

${ctx.day} ${getMonthName(ctx.month)} ${ctx.year} doğumun, bu çatışmayı daha da derinleştiriyor. Çünkü bu tarih, geçmişte bir kırılma noktasını temsil ediyor. Ve o kırılma, bugün hâlâ etkisini sürdürüyor. Ama bu kırılma, seni güçlendirdi. Ve şimdi, o güçle, bu çatışmayı aşacaksın.`;
}

// Did You Mean sorusu oluştur
function generateDidYouMean(ctx: AnalysisContext): string {
  const questions = [
    `İçindeki ${ctx.soulUrge} enerjisinin, dışarıdaki ${ctx.personality} maskesiyle ne kadar süre daha savaşacağını bilmek ister misin? Bu savaşın bitiş tarihi, kaderinin dönüm noktasını belirleyecek. Ve bu tarih, çok uzakta değil. Belki de ${new Date().getFullYear()}'in sonlarında, belki de ${new Date().getFullYear() + 1}'in başlarında. Ama bu tarih, seni bekliyor.`,
    
    `Kişisel Yıl ${ctx.personalYear} ve Yaşam Yolun ${ctx.lifePath} arasındaki bu gizli bağlantı, önümüzdeki 90 gün içinde karşına çıkacak bir fırsatın habercisi. Ama bu fırsatı değerlendirmek için önce içindeki ${ctx.expression} enerjisini dengelemelisin. Bu dengelemenin yolunu öğrenmek ister misin? Çünkü bu denge, kapıları açacak.`,
    
    `Eğer ${ctx.expression} sayısının gölgesini (korkularını, savunma mekanizmalarını) bilmezsen, Kişisel Yıl ${ctx.personalYear} sana hediye ettiği bu dönüşümü kaçıracaksın. Bu gölgeyi aydınlatmak için hazır mısın? Çünkü bu gölge, karanlıkta değil. Işıkta. Ama sen, görmek istemiyorsun.`,
    
    `${ctx.firstName}, ${ctx.lastName} soyadının içindeki o gizli titreşim, geçmişinde bir sırrı saklıyor. Bu sır, belki bir atandan gelen bir yetenek, belki de bir lanet. Bu sırrı çözmek ister misin? Çünkü bu sır, senin gerçek gücünün anahtarı.`,
    
    `${ctx.day} ${getMonthName(ctx.month)} ${ctx.year} tarihinde dünyaya gelişin, tesadüf değil. Bu tarih, evrenden sana bir mesaj. Ama bu mesajı okumak için, sayıların dilini bilmek gerekiyor. Bu dili öğrenmek ister misin? Çünkü bu dil, sana geleceğini fısıldayacak.`
  ];
  
  return questions[Math.floor(Math.random() * questions.length)];
}

// Ana hesaplama fonksiyonu
export function calculateNumerology(userData: UserData): NumerologyResult {
  const { firstName, lastName, birthDate } = userData;
  
  const [day, month, year] = birthDate.split(/[./-]/).map(Number);
  
  const expression = calculateExpressionNumber(firstName, lastName);
  const soulUrge = calculateSoulUrgeNumber(firstName, lastName);
  const personality = calculatePersonalityNumber(firstName, lastName);
  const personalYear = calculatePersonalYear(birthDate);
  const lifePath = calculateLifePath(birthDate);
  
  const ctx: AnalysisContext = {
    firstName,
    lastName,
    birthDate,
    day,
    month,
    year,
    expression: expression.number,
    soulUrge: soulUrge.number,
    personality: personality.number,
    personalYear: personalYear.number,
    lifePath: lifePath.number
  };
  
  const synthesis = generateSynthesis(ctx);
  const didYouMean = generateDidYouMean(ctx);
  const karmicCycle = generateKarmicCycleAnalysis(ctx);
  const futureShadow = generateFutureShadow(ctx);
  
  return {
    expressionNumber: expression.number,
    soulUrgeNumber: soulUrge.number,
    personalityNumber: personality.number,
    personalYear: personalYear.number,
    lifePathNumber: lifePath.number,
    calculationSteps: {
      firstNameValues: getLetterValues(firstName),
      lastNameValues: getLetterValues(lastName),
      expressionCalculation: expression.calculation,
      soulUrgeCalculation: soulUrge.calculation,
      personalityCalculation: personality.calculation,
      personalYearCalculation: personalYear.calculation,
      lifePathCalculation: lifePath.calculation
    },
    interpretations: {
      expression: generateExpressionAnalysis(ctx),
      soulUrge: generateSoulUrgeAnalysis(ctx),
      personality: generatePersonalityAnalysis(ctx),
      personalYear: generatePersonalYearAnalysis(ctx),
      lifePath: `Yaşam Yolun **${lifePath.number}** — ${lifePath.number === 1 ? 'Liderlik ve bağımsızlık' : lifePath.number === 2 ? 'Diplomasi ve uyum' : lifePath.number === 3 ? 'Yaratıcılık ve ifade' : lifePath.number === 4 ? 'Disiplin ve stabilite' : lifePath.number === 5 ? 'Özgürlük ve değişim' : lifePath.number === 6 ? 'Sorumluluk ve sevgi' : lifePath.number === 7 ? 'Analiz ve spiritüellik' : lifePath.number === 8 ? 'Güç ve başarı' : lifePath.number === 9 ? 'İnsanlık ve şefkat' : lifePath.number === 11 ? 'İlham ve sezgi' : lifePath.number === 22 ? 'Usta İnşaatçı' : 'Usta Şifacı'} yolunda ilerliyorsun. Bu yol, kolay değil. Ama bu yol, senin yolun.`
    },
    synthesis,
    didYouMean,
    karmicCycle,
    futureShadow
  };
}
