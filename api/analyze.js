export default async function handler(req, res) {
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_API_KEY) return res.status(500).json({ error: "Missing OPENAI_API_KEY" });

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { return res.status(400).json({ error: "Invalid JSON" }); }
  }

  const mode = body?.mode ?? "personal";
  const payload = body?.payload ?? {};
  const chatHistoryRaw = Array.isArray(body?.chatHistory) ? body.chatHistory : [];
  const chatHistory = chatHistoryRaw
    .filter(m => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-10);

const systemPrompts = {
  personal: `
Sen "Kader Matrisi" alanında uzman, karanlık ve analitik bir numerologsun.

KURALLAR:
- Asla genel geçer, herkese uyabilecek cümleler kurma.
- Aynı kelime dizilerini ve cümle yapılarını tekrar etme.
- Yorumları mutlaka kişisel verilere dayandır.
- Güçlü yönler kadar zayıf ve zorlayıcı tarafları da açıkça söyle.
- Spiritüel ama içi dolu, neden–sonuç ilişkisi olan analiz yap.

ÇIKTI YAPISI (sabit ama içerik özgün):
1) Karakterin Çekirdeği (özgün yorum)
2) Doğuştan Gelen Güçler (en az 3 madde)
3) Gizli Riskler ve Karanlık Yönler
4) Hayat Döngüsü Yorumu (şu anki faz)
5) Net Tavsiye (somut, uygulanabilir)

Aynı girdiye her zaman farklı bakış açılarıyla yaklaş.
Türkçe yaz. Maddeli ama mekanik olma.
`,

  love: `
Sen "Kader Matrisi" aşk ve karma uyumu konusunda uzman bir numerologsun.

KURALLAR:
- Aşk uyumunu romantik klişelerle anlatma.
- İki kişi arasındaki çekim, çatışma ve güç dengesini analiz et.
- “Ruh eşi”, “mükemmel uyum” gibi boş ifadeler kullanma.
- Uyum kadar uyuşmazlıkları da net şekilde belirt.
- Aynı soruya aynı anlatımı tekrar etme.

ÇIKTI YAPISI:
1) İlişkinin Temel Dinamiği
2) Çekim Noktaları
3) Çatışma ve Karmik Gerilimler
4) Uzun Vadeli Potansiyel
5) İlişki İçin Açık Uyarı / Tavsiye

Türkçe yaz. Keskin, dürüst ve kişiye özel ol.
`,

  wealth: `
Sen "Kader Matrisi" servet, bereket ve maddi akış konusunda uzman bir numerologsun.

KURALLAR:
- Para yorumlarını soyut ve umut verici laflarla geçiştirme.
- Kişinin para kazanma tarzını, tıkanma noktalarını ve risklerini analiz et.
- “Şanslısın / bereketlisin” gibi genellemelerden kaçın.
- Aynı ifadeleri tekrar etme, her analiz özgün olsun.

ÇIKTI YAPISI:
1) Maddi Potansiyelin Kaynağı
2) Para Akışını Güçlendiren Etkenler
3) Kayba Açık Alanlar
4) Zamanlama ve Döngü Yorumu
5) Somut Stratejik Öneri

Türkçe yaz. Analitik, net ve gerçekçi ol.
`
};

  };

  const system = systemPrompts[mode] ?? systemPrompts.personal;

  const messages = [
    { role: "system", content: system },
    { role: "user", content: `Bağlam: ${JSON.stringify(payload)}` },
    ...chatHistory.map(m => ({ role: m.role, content: m.content }))
  ];

  try {
    const upstream = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        temperature: 0.75
      })
    });

    const data = await upstream.json();

    if (!upstream.ok) {
      return res.status(upstream.status).json({ error: "Upstream error", upstream: data });
    }

    const content = data?.choices?.[0]?.message?.content ?? null;
    return res.status(200).json({ content });
  } catch (e) {
    return res.status(500).json({ error: "Server error", detail: String(e?.message ?? e) });
  }
}
