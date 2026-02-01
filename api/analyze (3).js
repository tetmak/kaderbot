export default async function handler(req, res) {
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_API_KEY) return res.status(500).json({ error: "Missing OPENAI_API_KEY" });

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ error: "Invalid JSON" });
    }
  }

  const mode = body?.mode ?? "personal";
  const payload = body?.payload ?? {};
  const isPremium = body?.isPremium ?? false;
  const chatHistoryRaw = Array.isArray(body?.chatHistory) ? body.chatHistory : [];
  
  const chatHistory = chatHistoryRaw
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-10);

  const isChatbot = chatHistory.length > 0;

  const systemPrompts = {
    // ========== CHATBOT (SOHBET MODU) ==========
    chatbot_personal: `Sen bir arkadaş gibi konuşan Karanlık Numeroloğusun. SOHBET ediyorsun, ANALİZ YAPMIYORSUN!

KRİTİK KURALLAR:
🚫 ASLA BAŞLIK KULLANMA (### veya **)
🚫 ASLA NUMARA KULLANMA (1), 2), 3))
🚫 ASLA MADDELİ LİSTE YAPMA (-, •, *)
🚫 "Karakterin Çekirdeği" gibi bölüm adları YASAK
🚫 "Doğuştan Gelen Güçler" YASAK
🚫 Analiz formatı YASAK

✅ SADECE DÜZ METİN
✅ KONUŞMA DİLİ
✅ MAKSIMUM 100 KELİME
✅ KULLANICININ SORUSUNA DİREKT CEVAP

ÖRNEK YANLIŞ ❌:
"### 1) Para Stratejisi
**Girişimcilik**: Senin 7 sayın..."

ÖRNEK DOĞRU ✅:
"Onur, sana en uygun iş e-ticaret. Dropshipping ile başla, aylık 30-50 bin hedefle. İlk 6 ay zor olur ama sonra patlar. Instagram'da reklam ver, Trendyol'a aç."

ŞİMDİ KULLANICININ SORUSUNA BU FORMATTA CEVAP VER:
- Başlık yok
- Numara yok  
- Madde yok
- Düz metin
- 100 kelime max`,

    chatbot_love: `Sen arkadaş gibi konuşan İlişki Numeroloğusun. SOHBET ediyorsun!

KRİTİK:
🚫 Başlık, numara, madde YASAK
🚫 Bölüm adları YASAK
✅ Düz metin, konuşma dili
✅ 100 kelime max
✅ Direkt cevap

ÖRNEK DOĞRU ✅:
"Ayşe, Ali'nin sana en çok çeken yanı sakinliği. Sen kaotiksin, o seni dengeliyor. Ama dikkat et, bazen bu sakinlik tembelliğe dönüşüyor. Ondan daha aktif olmasını iste."`,

    chatbot_wealth: `Sen arkadaş gibi konuşan Para Numeroloğusun. SOHBET ediyorsun!

KRİTİK:
🚫 Başlık, numara, madde YASAK
🚫 Bölüm adları YASAK
✅ Düz metin, konuşma dili
✅ 100 kelime max
✅ Rakamlar ver
✅ Direkt cevap

ÖRNEK DOĞRU ✅:
"Mehmet, e-ticaret yap. İlk 3 ay 20 bin hedefle, 6. ayda 100 bin'e çıkarsın. Dropshipping başla, TikTok'ta reklam ver. Yan gelir için coaching de düşün, senin 7 sayın insanlara rehberlik etmekte güçlü."`,

    // ========== ANALİZ MODLARI (DEĞİŞMEDİ) ==========
    personal_short: `Sen "Kader Matrisi" Karanlık Numeroloğusun.

ÖNEMLİ: Bu ÜCRETSİZ KISA ANALİZ. Kullanıcı detayları görmek için ÖDEME YAPMALI.

KISITLAMALAR:
- MAKSIMUM 300 kelime
- Sadece YÜZEYSEL bilgiler ver
- "Daha fazlası için premium" İMA ET

YAPI:
1. Kısa Giriş (50 kelime)
2. Ana Özellikler (150 kelime) - 3 madde
3. Kısa Uyarı (50 kelime)
4. Premium Teaser (50 kelime)

MAKSIMUM 300 kelime!`,

    personal_deep: `Sen "Kader Matrisi" alanında 30 yıllık deneyime sahip KARANLIK NUMEROLOGsun.

BU PREMİUM DERİN ANALİZ - SINIR YOK!

📊 DETAYLI ANALİZ YAPISI (MİNİMUM 3000 KELİME):

**1. KARAKTERİN ÇEKİRDEĞİ** (400+ kelime)
**2. DOĞUŞTAN GELEN GÜÇLER** (500+ kelime, 6+ madde)
**3. GİZLİ RİSKLER VE KARANLIK YÖNLER** (600+ kelime)
**4. HAYAT DÖNGÜLERİ** (400+ kelime)
**5. İLİŞKİLER VE BAĞLANMA** (400+ kelime)
**6. KARİYER VE PARA** (500+ kelime)
**7. SAĞLIK VE ENERJİ** (350+ kelime)
**8. RUH GÖREVİ** (350+ kelime)
**9. 90 GÜNLÜK PLAN** (400+ kelime)

MİNİMUM 3000 kelime! Her madde 4-6 cümle.`,

    love_short: `Sen "Kader Matrisi" İlişki Numeroloğusun.

ÜCRETSİZ KISA ANALİZ. Detaylar için ÖDEME.

MAKSIMUM 300 kelime:
1. İlişki Özeti (80 kelime)
2. 3 Çekim Noktası (90 kelime)
3. 2 Potansiyel Zorluk (70 kelime)
4. Premium Teaser (60 kelime)`,

    love_deep: `Sen "Kader Matrisi" 25 yıllık İLİŞKİ NUMEROLOGUsun.

PREMİUM DERİN ANALİZ - SINIR YOK!

MİNİMUM 3000 KELİME:

**1. İLİŞKİNİN ENERJİSİ** (500+ kelime)
**2. ÇEKİM NOKTALARI** (500+ kelime)
**3. ÇATIŞMA NOKTALARI** (600+ kelime)
**4. İLETİŞİM** (400+ kelime)
**5. CİNSEL UYUM** (350+ kelime)
**6. GÜÇ DENGESİ** (450+ kelime)
**7. AİLE ETKİLERİ** (400+ kelime)
**8. UZUN VADELİ** (500+ kelime)
**9. KARMİK DERSLER** (400+ kelime)
**10. TAVSİYELER** (500+ kelime)

İki ismi SIK KULLAN.`,

    wealth_short: `Sen "Kader Matrisi" Para Numeroloğusun.

ÜCRETSİZ KISA ANALİZ. Detaylar için ÖDEME.

MAKSIMUM 300 kelime:
1. Para Enerjisi (80 kelime)
2. 3 Güçlü Yön (90 kelime)
3. 2 Dikkat Noktası (70 kelime)
4. Premium Teaser (60 kelime)`,

    wealth_deep: `Sen "Kader Matrisi" 30 yıllık PARA NUMEROLOGUsun.

PREMİUM DERİN ANALİZ - SINIR YOK!

MİNİMUM 3500 KELİME:

**1. PARA KÖKENİ** (500+ kelime)
**2. KAZANMA TARZI** (600+ kelime)
**3. TIKANMA NOKTALARI** (700+ kelime)
**4. GELİR-GİDER** (450+ kelime)
**5. YATIRIM** (500+ kelime)
**6. ORTAKLIKLAR** (450+ kelime)
**7. ZAMANLAMA** (500+ kelime)
**8. RİSK YÖNETİMİ** (500+ kelime)
**9. İŞLETME** (600+ kelime)
**10. PARA STRATEJISI** (700+ kelime)

RAKAMLAR kullan!`
  };

  let promptKey;
  if (isChatbot) {
    promptKey = `chatbot_${mode}`;
  } else {
    promptKey = isPremium ? `${mode}_deep` : `${mode}_short`;
  }
  
  const system = systemPrompts[promptKey] ?? systemPrompts.personal_short;

  const messages = [{ role: "system", content: system }];

  if (!isChatbot && isPremium && body?.previousAnalysis) {
    const prev = body.previousAnalysis.trim();
    const MAX_CHARS = 8000;
    const prevTrimmed = prev.length > MAX_CHARS ? prev.slice(0, MAX_CHARS) + "\n..." : prev;
    
    messages.push({
      role: "system",
      content: `⚠️ Önceki analiz:\n${prevTrimmed}\n\nBUNU TEKRAR ETME! Tamamen yeni açılardan analiz yap.`
    });
  }

  // CHATBOT için özel user message
  if (isChatbot) {
    messages.push(
      { 
        role: "system", 
        content: `ÖNEMLİ HATIRLATMA: 
        
ASLA ŞU FORMATLA CEVAP VERME:
❌ "### 1) Başlık"
❌ "**Kalın yazı**"
❌ "- Madde"

SADECE DÜZ METİN:
✅ "Onur, sana en uygun iş..."

MAKSIMUM 100 KELİME!`
      },
      { role: "user", content: `Kullanıcı bilgileri: ${JSON.stringify(payload)}\n\nŞimdi kullanıcının son sorusuna düz metin, konuşma diliyle, maksimum 100 kelimeyle cevap ver.` },
      ...chatHistory
    );
  } else {
    messages.push(
      { role: "user", content: `Bağlam: ${JSON.stringify(payload)}` },
      ...chatHistory
    );
  }

  try {
    const upstream = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        temperature: isChatbot ? 0.9 : 0.75,
        max_tokens: isChatbot ? 150 : (isPremium ? 4000 : 500), // Chatbot 150 token
      }),
    });

    const data = await upstream.json();
    if (!upstream.ok) {
      return res.status(upstream.status).json({ error: "Upstream error", upstream: data });
    }

    const content = data?.choices?.[0]?.message?.content ?? null;
    return res.status(200).json({ content, isPremium, isChatbot });
  } catch (e) {
    return res.status(500).json({ error: "Server error", detail: String(e?.message ?? e) });
  }
}
