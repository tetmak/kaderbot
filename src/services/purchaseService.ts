/**
 * ============================================================
 * KADER MATRİSİ - PURCHASE SERVİSİ
 * ============================================================
 * 
 * RevenueCat entegrasyonu - "Kader Matrisi Pro" Entitlement
 * API Key: test_DDsJVITNaPoyPpZvYHCLjmgRVMf
 */

import {
  initializeRevenueCat,
  checkEntitlements,
  hasPremiumAccess,
  hasAccessForAnalysis,
  getCurrentOffering,
  purchasePackage,
  restorePurchases,
  formatPrice,
  type Package,
} from './revenueCatService';

import { isDemoMode } from '@/config/env';

// ============================================
// TİP TANIMLAMALARI
// ============================================

export type AnalysisType = 'personal' | 'love' | 'wealth';

export interface AccessCheckResult {
  canAccess: boolean;
  reason: 'entitled' | 'free_limit' | 'payment_required' | 'error';
  message: string;
  remainingFree?: number;
  suggestedPackage?: Package;
}

export interface PurchaseOption {
  id: string;
  title: string;
  description: string;
  price: string;
  isSubscription: boolean;
  period?: string;
  savings?: string;
}

export interface PaywallData {
  title: string;
  subtitle: string;
  description: string;
  packages: PurchaseOption[];
  features: string[];
  showRestore: boolean;
}

// ============================================
// LOCAL STORAGE ANAHTARLARI
// ============================================

const STORAGE_KEYS = {
  FREE_ANALYSES_TODAY: 'km_free_analyses_today',
  FREE_ANALYSES_DATE: 'km_free_analyses_date',
  FREE_ANALYSES_MONTH: 'km_free_analyses_month',
  FREE_ANALYSES_MONTH_DATE: 'km_free_analyses_month_date',
  PURCHASE_HISTORY: 'km_purchase_history',
  USER_ID: 'km_user_id',
};

// ============================================
// ÜCRETSİZ LİMİTLER
// ============================================
const FREE_DAILY_LIMIT = 3;
const FREE_MONTHLY_LIMIT = 10;

// ============================================
// PURCHASE SERVİSİ
// ============================================

export class PurchaseService {
  
  // ==========================================
  // BAŞLATMA
  // ==========================================
  
  static async initialize(userId?: string): Promise<boolean> {
    return initializeRevenueCat(userId);
  }
  
  // ==========================================
  // ERİŞİM KONTROLÜ
  // ==========================================
  
  static async canAccessLockedContent(analysisType: AnalysisType): Promise<AccessCheckResult> {
    // Demo mod - her zaman erişim var (satın alma yapıldıysa)
    if (isDemoMode()) {
      const hasAccess = await hasPremiumAccess();
      if (hasAccess) {
        return {
          canAccess: true,
          reason: 'entitled',
          message: 'Premium erişiminiz var',
        };
      }
      return {
        canAccess: false,
        reason: 'payment_required',
        message: 'Premium erişim satın almalısınız',
      };
    }
    
    try {
      // Premium entitlement kontrolü
      const hasPremium = await hasPremiumAccess();
      if (hasPremium) {
        return {
          canAccess: true,
          reason: 'entitled',
          message: 'Premium erişiminiz var',
        };
      }
      
      // Analiz tipine özel kontrol
      const hasSpecificAccess = await hasAccessForAnalysis(analysisType);
      if (hasSpecificAccess) {
        return {
          canAccess: true,
          reason: 'entitled',
          message: 'Bu analiz için erişiminiz var',
        };
      }
      
      // Ücretsiz limit kontrolü
      const freeStatus = this.getFreeUsageStatus();
      if (freeStatus.remainingToday > 0 && freeStatus.remainingMonth > 0) {
        return {
          canAccess: false,
          reason: 'free_limit',
          message: `Bugün ${freeStatus.remainingToday} ücretsiz analiz hakkınız kaldı`,
          remainingFree: freeStatus.remainingToday,
        };
      }
      
      // Ödeme gerekli
      const offering = await getCurrentOffering();
      const suggestedPackage = offering?.availablePackages[0];
      
      return {
        canAccess: false,
        reason: 'payment_required',
        message: 'Premium erişim satın almalısınız',
        suggestedPackage,
      };
      
    } catch (error) {
      console.error('Erişim kontrolü hatası:', error);
      return {
        canAccess: false,
        reason: 'error',
        message: 'Bir hata oluştu, lütfen tekrar deneyin',
      };
    }
  }
  
  static hasFreeUsage(): boolean {
    const status = this.getFreeUsageStatus();
    return status.remainingToday > 0 && status.remainingMonth > 0;
  }
  
  static getFreeUsageStatus(): {
    remainingToday: number;
    remainingMonth: number;
    usedToday: number;
    usedMonth: number;
  } {
    const today = new Date().toDateString();
    const month = new Date().toISOString().slice(0, 7);
    
    // Günlük kullanım
    const storedDate = localStorage.getItem(STORAGE_KEYS.FREE_ANALYSES_DATE);
    let usedToday = 0;
    
    if (storedDate === today) {
      usedToday = parseInt(localStorage.getItem(STORAGE_KEYS.FREE_ANALYSES_TODAY) || '0');
    } else {
      localStorage.setItem(STORAGE_KEYS.FREE_ANALYSES_DATE, today);
      localStorage.setItem(STORAGE_KEYS.FREE_ANALYSES_TODAY, '0');
    }
    
    // Aylık kullanım
    const storedMonth = localStorage.getItem(STORAGE_KEYS.FREE_ANALYSES_MONTH_DATE);
    let usedMonth = 0;
    
    if (storedMonth === month) {
      usedMonth = parseInt(localStorage.getItem(STORAGE_KEYS.FREE_ANALYSES_MONTH) || '0');
    } else {
      localStorage.setItem(STORAGE_KEYS.FREE_ANALYSES_MONTH_DATE, month);
      localStorage.setItem(STORAGE_KEYS.FREE_ANALYSES_MONTH, '0');
    }
    
    return {
      remainingToday: Math.max(0, FREE_DAILY_LIMIT - usedToday),
      remainingMonth: Math.max(0, FREE_MONTHLY_LIMIT - usedMonth),
      usedToday,
      usedMonth,
    };
  }
  
  static recordFreeUsage(): void {
    const status = this.getFreeUsageStatus();
    
    const today = new Date().toDateString();
    const month = new Date().toISOString().slice(0, 7);
    
    localStorage.setItem(STORAGE_KEYS.FREE_ANALYSES_DATE, today);
    localStorage.setItem(STORAGE_KEYS.FREE_ANALYSES_TODAY, String(status.usedToday + 1));
    
    localStorage.setItem(STORAGE_KEYS.FREE_ANALYSES_MONTH_DATE, month);
    localStorage.setItem(STORAGE_KEYS.FREE_ANALYSES_MONTH, String(status.usedMonth + 1));
  }
  
  // ==========================================
  // PAYWALL VERİLERİ
  // ==========================================
  
  static async getPaywallData(analysisType: AnalysisType): Promise<PaywallData> {
    const packages = await this.getAllPackages();
    
    const paywallConfigs: Record<AnalysisType, Partial<PaywallData>> = {
      personal: {
        title: 'Kaderinin Derinlikleri',
        subtitle: 'Sayıların sana fısıldadıklarını duy',
        description: 'Karmik döngüler, gelecek öngörüsü ve kişiselleştirilmiş tavsiyeler için premium erişim gerekli.',
      },
      love: {
        title: 'Kalbinin Anahtarı',
        subtitle: 'İlişkinizin gizli kodlarını çöz',
        description: 'Ayrılık riski, karmik borç analizi ve gelecek öngörüsü için kilidi aç.',
      },
      wealth: {
        title: 'Servetin Anahtarı',
        subtitle: 'Şirketinin bereket kodlarını öğren',
        description: 'İflas riski, kritik yatırım tarihleri ve bereket aktivasyonu için premium erişim.',
      },
    };
    
    const config = paywallConfigs[analysisType];
    
    return {
      title: config.title || 'Premium Erişim',
      subtitle: config.subtitle || 'Tüm özellikleri aç',
      description: config.description || 'Premium erişim satın alarak tüm analizlere ulaşın.',
      packages: packages.map(pkg => this.mapPackageToOption(pkg)),
      features: [
        'Sınırsız detaylı analiz',
        'Karmik döngü raporları',
        'Gelecek öngörüleri',
        'Kişiselleştirilmiş tavsiyeler',
        'Reklamsız deneyim',
      ],
      showRestore: true,
    };
  }
  
  private static mapPackageToOption(pkg: Package): PurchaseOption {
    const titles: Record<string, string> = {
      'kisisel_analiz': 'Kişisel Analiz',
      'ask_karma_analizi': 'Aşk & Karma Analizi',
      'servet_isim_analizi': 'Servet & İsim Analizi',
    };
    
    const descriptions: Record<string, string> = {
      'kisisel_analiz': 'Tek seferlik, kalıcı erişim',
      'ask_karma_analizi': 'Tek seferlik, kalıcı erişim',
      'servet_isim_analizi': 'Tek seferlik, kalıcı erişim',
    };
    
    return {
      id: pkg.identifier,
      title: titles[pkg.identifier] || pkg.product.title,
      description: descriptions[pkg.identifier] || pkg.product.description,
      price: pkg.product.priceString,
      isSubscription: false,
    };
  }
  
  // ==========================================
  // SATIN ALMA İŞLEMLERİ
  // ==========================================
  
  static async purchase(packageId: string) {
    const result = await purchasePackage(packageId);
    
    if (result.success) {
      this.recordPurchase(packageId, result.customerInfo);
    }
    
    return result;
  }
  
  static async purchaseForAnalysis(analysisType: AnalysisType) {
    const packageMap: Record<AnalysisType, string> = {
      personal: 'kisisel_analiz',
      love: 'ask_karma_analizi',
      wealth: 'servet_isim_analizi',
    };
    
    return this.purchase(packageMap[analysisType]);
  }
  
  static async restore() {
    return restorePurchases();
  }
  
  private static recordPurchase(packageId: string, customerInfo?: any): void {
    try {
      const history = this.getPurchaseHistory();
      history.push({
        packageId,
        date: new Date().toISOString(),
        customerInfo,
      });
      localStorage.setItem(STORAGE_KEYS.PURCHASE_HISTORY, JSON.stringify(history));
    } catch (error) {
      console.error('Satın alma kaydedilemedi:', error);
    }
  }
  
  static getPurchaseHistory(): any[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PURCHASE_HISTORY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }
  
  // ==========================================
  // ABONELİK BİLGİLERİ
  // ==========================================
  
  static async getSubscriptionInfo(): Promise<{
    hasActiveSubscription: boolean;
    subscriptionType?: string;
    expirationDate?: Date;
    willRenew?: boolean;
  } | null> {
    const customerInfo = await checkEntitlements();
    if (!customerInfo) return null;
    
    const entitlement = customerInfo.entitlements['Kader Matrisi Pro'];
    
    if (entitlement?.isActive) {
      return {
        hasActiveSubscription: true,
        subscriptionType: 'Kader Matrisi Pro',
        expirationDate: entitlement.expirationDate || undefined,
        willRenew: entitlement.willRenew,
      };
    }
    
    return {
      hasActiveSubscription: false,
    };
  }
  
  // ==========================================
  // YARDIMCI METODLAR
  // ==========================================
  
  static formatPrice(price: number): string {
    return formatPrice(price);
  }
  
  static async getAllPackages(): Promise<Package[]> {
    const offering = await getCurrentOffering();
    return offering?.availablePackages || [];
  }
  
  static getOrCreateUserId(): string {
    let userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
    if (!userId) {
      userId = 'km_' + Math.random().toString(36).substring(2, 15);
      localStorage.setItem(STORAGE_KEYS.USER_ID, userId);
    }
    return userId;
  }
}

// ============================================
// HOOK (React için)
// ============================================

export function usePurchaseService() {
  return {
    initialize: PurchaseService.initialize,
    canAccess: PurchaseService.canAccessLockedContent,
    hasFreeUsage: PurchaseService.hasFreeUsage,
    getFreeStatus: PurchaseService.getFreeUsageStatus,
    recordFreeUsage: PurchaseService.recordFreeUsage,
    getPaywallData: PurchaseService.getPaywallData,
    purchase: PurchaseService.purchase,
    purchaseForAnalysis: PurchaseService.purchaseForAnalysis,
    restore: PurchaseService.restore,
    getSubscriptionInfo: PurchaseService.getSubscriptionInfo,
    formatPrice: PurchaseService.formatPrice,
  };
}
