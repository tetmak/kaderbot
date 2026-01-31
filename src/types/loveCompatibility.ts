// Aşk & Karma - İlişki Uyumu Modülü Tip Tanımlamaları

export interface PartnerData {
  firstName: string;
  lastName: string;
  birthDate: string;
}

export interface LoveCompatibilityResult {
  // Temel uyum skorları (%)
  overallScore: number;           // Genel uyum yüzdesi
  soulConnection: number;         // Ruh bağlantısı (Soul Urge uyumu)
  destinyAlignment: number;       // Kader uyumu (Expression uyumu)
  physicalChemistry: number;      // Fiziksel/duygusal rezonans
  
  // Kişisel Yıl analizi
  userPersonalYear: number;
  partnerPersonalYear: number;
  yearCycleWarning: string | null; // Ayrılık riski uyarısı
  
  // Çatışma analizi
  conflictAnalysis: {
    title: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }[];
  
  // Cinsel ve duygusal rezonans
  sexualResonance: string;
  emotionalResonance: string;
  
  // Kilitli içerik (Paywall)
  lockedContent: {
    breakupRisk: string;           // Ayrılık riski detayı
    karmicDebt: string;            // Karmik borç analizi
    futurePrediction: string;      // Gelecek öngörüsü
    didYouMean: string;            // Derinleşme sorusu
  };
  
  // Hesaplama detayları
  calculations: {
    userSoulUrge: number;
    partnerSoulUrge: number;
    userExpression: number;
    partnerExpression: number;
    userLifePath: number;
    partnerLifePath: number;
  };
}

// Risk seviyeleri için renkler
export const RiskLevelColors = {
  low: '#4ade80',      // yeşil
  medium: '#fbbf24',   // sarı
  high: '#f97316',     // turuncu
  critical: '#ef4444'  // kırmızı
};
