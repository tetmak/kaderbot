// Servet & İsim - Ticari Başarı Modülü Tip Tanımlamaları

export interface BusinessData {
  founderFirstName: string;
  founderLastName: string;
  founderBirthDate: string; // Kurucu doğum tarihi
  companyName: string;
  registrationDate: string; // Şirket kuruluş/tescil tarihi
}

export interface WealthAnalysisResult {
  // Bereket Skoru (%)
  prosperityScore: number;        // Genel bereket yüzdesi
  moneyAttraction: number;        // Para çekme gücü
  stabilityIndex: number;         // Finansal stabilite
  growthPotential: number;        // Büyüme potansiyeli
  
  // Şirket ismi analizi
  companyNumber: number;          // Şirket isminin numerolojik değeri
  companyInterpretation: string;  // Şirket ismi yorumu
  
  // Kurucu uyumu
  founderExpression: number;      // Kurucunun ifade sayısı
  compatibilityStatus: 'harmony' | 'neutral' | 'conflict' | 'danger';
  compatibilityMessage: string;   // Uyum mesajı
  
  // Kuruluş tarihi analizi
  registrationEnergy: number;     // Kuruluş tarihi enerjisi
  registrationInterpretation: string;
  
  // Risk analizi
  riskFactors: {
    type: 'bankruptcy' | 'cash_leak' | 'partnership_conflict' | 'timing';
    title: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }[];
  
  // İsim değişikliği önerisi
  nameChangeSuggestion: {
    recommended: boolean;
    reason: string;
    alternativeNames?: string[];
  };
  
  // Kilitli içerik (Paywall)
  lockedContent: {
    criticalInvestmentDates: string[];  // Kritik yatırım tarihleri
    bankruptcyWarning: string;          // İflas riski detayı
    wealthActivation: string;           // Bereket aktivasyonu
    didYouMean: string;                 // Derinleşme sorusu
  };
  
  // Hesaplama detayları
  calculations: {
    companyNameCalculation: string;
    founderExpressionCalculation: string;
    registrationDateCalculation: string;
  };
}

// Uyum durumları
export const CompatibilityStatusLabels = {
  harmony: 'Mükemmel Uyum',
  neutral: 'Nötr',
  conflict: 'Çatışma Var',
  danger: 'Para Kaçağı Riski!'
};

export const CompatibilityStatusColors = {
  harmony: '#22c55e',
  neutral: '#eab308',
  conflict: '#f97316',
  danger: '#dc2626'
};
