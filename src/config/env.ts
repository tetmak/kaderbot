/**
 * ============================================================
 * KADER MATRİSİ - ENVIRONMENT CONFIGURATION
 * ============================================================
 * 
 * BU DOSYAYI .env.local DOSYASI İLE DEĞİŞTİRİN!
 * .env.local .gitignore'a eklenmelidir (güvenlik için)
 * 
 * Mobil uygulamaya dönüştürme için:
 * 1. React Native: react-native-config kullanın
 * 2. Ionic/Capacitor: .env dosyasını kullanın
 * 3. PWA: Bu dosya aynen kullanılabilir
 */

// ============================================
// KİMİ API YAPILANDIRMASI
// ============================================
export const KIMI_CONFIG = {
  // Kimi API Anahtarı (Moonshot AI'dan alınmalı)
  // https://platform.moonshot.cn/ adresinden API key oluşturun
  API_KEY: import.meta.env.VITE_KIMI_API_KEY || 'sk-your-kimi-api-key-here',
  
  // API Base URL
  BASE_URL: import.meta.env.VITE_KIMI_BASE_URL || 'https://api.moonshot.cn/v1',
  
  // Model seçimi
  MODEL: import.meta.env.VITE_KIMI_MODEL || 'kimi-latest',
  
  // Timeout süresi (ms)
  TIMEOUT: 30000,
  
  // Maksimum token sayısı
  MAX_TOKENS: 4000,
  
  // Sıcaklık (0.0 - 1.0) - Yaratıcılık seviyesi
  TEMPERATURE: 0.8,
};

// ============================================
// REVENUECAT YAPILANDIRMASI (iOS & Android)
// ============================================
export const REVENUECAT_CONFIG = {
  // RevenueCat API Key (App Settings > API Keys)
  // https://app.revenuecat.com/settings/api-keys
  // Test anahtarı: test_... | Production anahtarı: your_actual_key
  API_KEY: import.meta.env.VITE_REVENUECAT_API_KEY || 'test_DDsJVITNaPoyPpZvYHCLjmgRVMf',
  
  // Apple App Shared Secret (App Store Connect > App Information)
  APPLE_SHARED_SECRET: import.meta.env.VITE_REVENUECAT_APPLE_SECRET || '',
  
  // Google Service Account Credentials (Google Play Console)
  GOOGLE_SERVICE_ACCOUNT: import.meta.env.VITE_REVENUECAT_GOOGLE_SA || '',
  
  // Entitlement ID'leri (RevenueCat Dashboard > Entitlements)
  ENTITLEMENTS: {
    // Premium Analiz Erişimi
    PREMIUM_ANALYSIS: 'premium_analysis',
    
    // Tüm Analizler Paketi
    COMPLETE_PACKAGE: 'complete_package',
    
    // Aylık Abonelik
    MONTHLY_SUBSCRIPTION: 'monthly_subscription',
    
    // Yıllık Abonelik
    YEARLY_SUBSCRIPTION: 'yearly_subscription',
  },
  
  // Offering ID'leri (RevenueCat Dashboard > Offerings)
  OFFERINGS: {
    DEFAULT: 'default',
    PAYWALL: 'paywall_offering',
    PROMOTIONAL: 'promotional_offering',
  },
  
  // Paket ID'leri (RevenueCat Dashboard > Products)
  PRODUCTS: {
    // iOS Product ID'leri
    IOS: {
      PERSONAL_DETAILED: 'com.kadermatrisi.personal_detailed',
      LOVE_KARMIC: 'com.kadermatrisi.love_karmic',
      WEALTH_BUSINESS: 'com.kadermatrisi.wealth_business',
      MONTHLY_SUB: 'com.kadermatrisi.sub.monthly',
      YEARLY_SUB: 'com.kadermatrisi.sub.yearly',
    },
    
    // Android Product ID'leri
    ANDROID: {
      PERSONAL_DETAILED: 'com.kadermatrisi.personal_detailed',
      LOVE_KARMIC: 'com.kadermatrisi.love_karmic',
      WEALTH_BUSINESS: 'com.kadermatrisi.wealth_business',
      MONTHLY_SUB: 'com.kadermatrisi.sub.monthly',
      YEARLY_SUB: 'com.kadermatrisi.sub.yearly',
    },
  },
  
  // Fiyatlar (görüntüleme için)
  PRICES: {
    PERSONAL_DETAILED: 179,
    LOVE_KARMIC: 249,
    WEALTH_BUSINESS: 349,
    MONTHLY_SUB: 99,
    YEARLY_SUB: 799,
    COMPLETE_PACKAGE: 599,
  },
  
  // Para birimi
  CURRENCY: 'TRY',
};

// ============================================
// UYGULAMA GENEL AYARLARI
// ============================================
export const APP_CONFIG = {
  // Uygulama adı
  NAME: 'Kader Matrisi',
  
  // Versiyon
  VERSION: '1.0.0',
  
  // Ortam (development | production)
  ENV: import.meta.env.MODE || 'development',
  
  // API Base URL (kendi backend'iniz)
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://api.kadermatrisi.com',
  
  // WebSocket URL (gerçek zamanlı bildirimler için)
  WS_URL: import.meta.env.VITE_WS_URL || 'wss://api.kadermatrisi.com/ws',
  
  // Firebase yapılandırması (opsiyonel - auth ve database için)
  FIREBASE: {
    API_KEY: import.meta.env.VITE_FIREBASE_API_KEY || '',
    AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
    PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
    STORAGE_BUCKET: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
    MESSAGING_SENDER_ID: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    APP_ID: import.meta.env.VITE_FIREBASE_APP_ID || '',
  },
  
  // Platform
  PLATFORM: import.meta.env.VITE_PLATFORM || 'web', // 'web' | 'ios' | 'android'
};

// ============================================
// ÖDEME DUVARI (PAYWALL) AYARLARI
// ============================================
export const PAYWALL_CONFIG = {
  // Demo modu (gerçek ödeme almadan test için)
  // .env.local'de VITE_PAYWALL_DEMO_MODE=false yaparak gerçek moda geç
  DEMO_MODE: import.meta.env.VITE_PAYWALL_DEMO_MODE !== 'false',
  
  // Ücretsiz analiz limiti (günlük)
  FREE_DAILY_LIMIT: 3,
  
  // Ücretsiz analiz limiti (aylık)
  FREE_MONTHLY_LIMIT: 10,
  
  // Kilitli içerik gösterim oranı (%)
  LOCKED_CONTENT_PREVIEW: 30,
  
  // Restore purchases göster
  SHOW_RESTORE: true,
};

// ============================================
// ANALİTİK AYARLARI
// ============================================
export const ANALYTICS_CONFIG = {
  // Google Analytics ID
  GA_ID: import.meta.env.VITE_GA_ID || '',
  
  // Facebook Pixel ID
  FB_PIXEL_ID: import.meta.env.VITE_FB_PIXEL_ID || '',
  
  // Hotjar ID
  HOTJAR_ID: import.meta.env.VITE_HOTJAR_ID || '',
  
  // RevenueCat Analytics
  REVENUECAT_ANALYTICS: true,
};

// ============================================
// YARDIMCI FONKSİYONLAR
// ============================================

/**
 * API Key'in geçerli olup olmadığını kontrol et
 */
export function isKimiApiKeyValid(): boolean {
  const key = KIMI_CONFIG.API_KEY;
  return key.startsWith('sk-') && key.length > 20;
}

/**
 * RevenueCat key'in geçerli olup olmadığını kontrol et
 */
export function isRevenueCatKeyValid(): boolean {
  const key = REVENUECAT_CONFIG.API_KEY;
  return key.length > 10 && key !== 'your_revenuecat_api_key';
}

/**
 * Production ortamında mı?
 */
export function isProduction(): boolean {
  return APP_CONFIG.ENV === 'production';
}

/**
 * Demo modunda mı?
 */
export function isDemoMode(): boolean {
  return PAYWALL_CONFIG.DEMO_MODE;
}

/**
 * iOS platformunda mı?
 */
export function isIOS(): boolean {
  return APP_CONFIG.PLATFORM === 'ios';
}

/**
 * Android platformunda mı?
 */
export function isAndroid(): boolean {
  return APP_CONFIG.PLATFORM === 'android';
}

/**
 * Mobil platformda mı?
 */
export function isMobile(): boolean {
  return isIOS() || isAndroid();
}
