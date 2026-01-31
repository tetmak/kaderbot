export default async function handler(req, res) {
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const KIMI_API_KEY = process.env.KIMI_API_KEY;
  if (!KIMI_API_KEY) return res.status(500).json({ error: "Missing KIMI_API_KEY" });

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { return res.status(400).json({ error: "Invalid JSON" }); }
  }

  const mode = body?.mode ?? "personal";
  const payload = body?.payload ?? {};
  const chatHistory = Array.isArray(body?.chatHistory) ? body.chatHistory : [];

  const systemPrompts = {
    personal: "Sen 'Kader Matrisi' Karanlık Numeroloğusun. Türkçe, net, maddeli cevap ver.",
    love: "Sen 'Kader Matrisi' aşk/karma Karanlık Numeroloğusun. Türkçe, net, maddeli cevap ver.",
    wealth: "Sen 'Kader Matrisi' servet/isim Karanlık Numeroloğusun. Türkçe, net, maddeli cevap ver."
  };

  const system = systemPrompts[mode] ?? systemPrompts.personal;

  const messages = [
    { role: "system", content: system },
    { role: "user", content: `Bağlam: ${JSON.stringify(payload)}` },
    ...chatHistory
      .filter(m => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
      .map(m => ({ role: m.role, content: m.content }))
  ];

  try {
    const upstream = await fetch("https://api.moonshot.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${KIMI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "moonshot-v1-8k",
        messages,
        temperature: 0.6
      })
    });

    const data = await upstream.json();
    if (!upstream.ok) return res.status(upstream.status).json({ error: "Upstream error", upstream: data });

    const content = data?.choices?.[0]?.message?.content ?? null;
    return res.status(200).json({ content });
  } catch (e) {
    return res.status(500).json({ error: "Server error", detail: String(e?.message ?? e) });
  }
}
