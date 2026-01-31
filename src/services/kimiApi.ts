/**
 * ============================================================
 * KADER MATRİSİ - API SERVİSİ (Vercel Backend)
 * ============================================================
 *
 * ÖNCEKİ DURUM:
 * - Tarayıcıdan direkt Moonshot (Kimi) API çağrısı yapılıyordu (CORS + key sızıntısı + Vercel'de kırılır).
 *
 * YENİ DURUM:
 * - Tüm AI çağrıları Vercel Serverless Function üzerinden yapılır: POST /api/analyze
 * - API key sadece server tarafında tutulur: KIMI_API_KEY (Vercel env)
 */

import type { UserData } from '@/types/numerology';
import type { PartnerData } from '@/types/loveCompatibility';
import type { BusinessData } from '@/types/wealthAnalysis';

interface AnalysisResult {
  content: string;
  tokensUsed: number;
  error?: string;
}

async function callBackend(action: string, payload: any): Promise<AnalysisResult> {
  const resp = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, payload }),
  });

  const json = await resp.json().catch(() => ({}));

  if (!resp.ok) {
    return {
      content: '',
      tokensUsed: 0,
      error: json?.error || 'API_ERROR',
    };
  }

  return {
    content: json?.content ?? '',
    tokensUsed: json?.tokensUsed ?? 0,
  };
}

/**
 * Kişisel Analiz (Canlı)
 */
export async function generateLiveAnalysis(userData: UserData): Promise<AnalysisResult> {
  return callBackend('personal', userData);
}

/**
 * Aşk Uyumu Analizi (Canlı)
 */
export async function generateLiveLoveAnalysis(
  user: PartnerData,
  partner: PartnerData
): Promise<AnalysisResult> {
  return callBackend('love', { user, partner });
}

/**
 * Servet & İsim Analizi (Canlı)
 */
export async function generateLiveWealthAnalysis(businessData: BusinessData): Promise<AnalysisResult> {
  return callBackend('wealth', businessData);
}

/**
 * Premium içerik (kilitli bölümler)
 */
export async function generatePremiumContent(
  type: 'personal' | 'love' | 'wealth',
  data: UserData | { user: PartnerData; partner: PartnerData } | BusinessData
): Promise<AnalysisResult> {
  return callBackend('premium', { type, data });
}

/**
 * Chatbot yanıtı
 */
export type ChatContext = {
  analysisType?: 'personal' | 'love' | 'wealth';
  userData?: UserData;
  analysisResult?: any;
};

export async function generateChatbotResponse(
  userMessage: string,
  context: ChatContext,
  conversationHistory: { role: 'user' | 'assistant'; content: string }[] = []
): Promise<AnalysisResult> {
  return callBackend('chatbot', { userMessage, context, conversationHistory });
}
