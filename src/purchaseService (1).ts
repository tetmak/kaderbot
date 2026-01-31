import Purchases, { LOG_LEVEL, PurchasesPackage } from '@revenuecat/purchases-js';

/**
 * Satın alma türleri
 */
export type AnalysisType = 'personal' | 'love' | 'wealth' | 'chatbot';

/**
 * Paket bilgileri
 */
export interface PackageInfo {
  identifier: string;
  price: string;
  priceString: string;
  title: string;
  description: string;
}

/**
 * Ücretsiz kullanım durumu
 */
export interface FreeUsageStatus {
  remainingToday: number;
  remainingMonth: number;
  usedToday: number;
  usedMonth: number;
}

/**
 * PurchaseService - RevenueCat entegrasyonu
 */
class PurchaseServiceClass {
  private isInitialized = false;
  private userId: string | null = null;
  
  // RevenueCat API anahtarınız (public key)
  private readonly REVENUECAT_API_KEY = import.meta.env.VITE_REVENUECAT_PUBLIC_KEY || 'your_revenuecat_public_key';
  
  // Ücretsiz kullanım limitleri
  private readonly FREE_DAILY_LIMIT = 3;
  private readonly FREE_MONTHLY_LIMIT = 10;
  
  /**
   * RevenueCat'i başlat
   */
  async initialize(userId: string): Promise<void> {
    if (this.isInitialized) {
      console.log('PurchaseService already initialized');
      return;
    }

    try {
      this.userId = userId;
      
      await Purchases.configure({
        apiKey: this.REVENUECAT_API_KEY,
        appUserId: userId,
      });

      // Debug modda loglama
      if (import.meta.env.DEV) {
        Purchases.setLogLevel(LOG_LEVEL.DEBUG);
      }

      this.isInitialized = true;
      console.log('PurchaseService initialized for user:', userId);
    } catch (error) {
      console.error('Failed to initialize PurchaseService:', error);
      this.isInitialized = false;
    }
  }

  /**
   * Kullanıcı ID'si oluştur veya getir
   */
  getOrCreateUserId(): string {
    const STORAGE_KEY = 'kader_matrisi_user_id';
    let userId = localStorage.getItem(STORAGE_KEY);
    
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem(STORAGE_KEY, userId);
    }
    
    return userId;
  }

  /**
   * Mevcut paketleri getir
   */
  async getAvailablePackages(): Promise<PurchasesPackage[]> {
    try {
      const offerings = await Purchases.getOfferings();
      
      if (!offerings.current) {
        console.warn('No current offering found');
        return [];
      }

      return offerings.current.availablePackages;
    } catch (error) {
      console.error('Failed to get packages:', error);
      return [];
    }
  }

  /**
   * Paket satın al
   */
  async purchasePackage(packageIdentifier: string): Promise<boolean> {
    try {
      const packages = await this.getAvailablePackages();
      const packageToPurchase = packages.find(p => p.identifier === packageIdentifier);
      
      if (!packageToPurchase) {
        console.error('Package not found:', packageIdentifier);
        return false;
      }

      const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
      
      console.log('Purchase successful:', customerInfo);
      return this.hasActiveSubscription(customerInfo);
    } catch (error: any) {
      if (error?.userCancelled) {
        console.log('User cancelled the purchase');
        return false;
      }
      
      console.error('Purchase failed:', error);
      return false;
    }
  }

  /**
   * Entitlements kontrolü - kilitli içeriğe erişim var mı?
   */
  async canAccessLockedContent(analysisType: AnalysisType): Promise<{ canAccess: boolean; reason?: string }> {
    try {
      // 1. Premium abonelik kontrolü
      const customerInfo = await Purchases.getCustomerInfo();
      
      if (this.hasActiveSubscription(customerInfo)) {
        return { canAccess: true, reason: 'premium' };
      }

      // 2. Ücretsiz kullanım kontrolü
      const freeUsage = this.getFreeUsageStatus();
      
      if (freeUsage.remainingToday > 0) {
        return { canAccess: true, reason: 'free' };
      }

      // 3. Erişim yok
      return { 
        canAccess: false, 
        reason: freeUsage.remainingMonth > 0 
          ? 'daily_limit_reached' 
          : 'monthly_limit_reached' 
      };
    } catch (error) {
      console.error('Failed to check access:', error);
      
      // Hata durumunda ücretsiz kullanıma izin ver
      const freeUsage = this.getFreeUsageStatus();
      return { 
        canAccess: freeUsage.remainingToday > 0, 
        reason: 'error_fallback' 
      };
    }
  }

  /**
   * Premium abonelik var mı?
   */
  private hasActiveSubscription(customerInfo: any): boolean {
    const entitlements = customerInfo?.entitlements?.active || {};
    return Object.keys(entitlements).length > 0;
  }

  /**
   * Ücretsiz kullanım durumunu getir
   */
  getFreeUsageStatus(): FreeUsageStatus {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const currentMonth = today.substring(0, 7); // YYYY-MM

    // LocalStorage'dan oku
    const dailyKey = `kader_free_daily_${today}`;
    const monthlyKey = `kader_free_monthly_${currentMonth}`;
    
    const usedToday = parseInt(localStorage.getItem(dailyKey) || '0', 10);
    const usedMonth = parseInt(localStorage.getItem(monthlyKey) || '0', 10);

    return {
      usedToday,
      usedMonth,
      remainingToday: Math.max(0, this.FREE_DAILY_LIMIT - usedToday),
      remainingMonth: Math.max(0, this.FREE_MONTHLY_LIMIT - usedMonth),
    };
  }

  /**
   * Ücretsiz kullanımı kaydet
   */
  recordFreeUsage(): void {
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = today.substring(0, 7);

    const dailyKey = `kader_free_daily_${today}`;
    const monthlyKey = `kader_free_monthly_${currentMonth}`;
    
    const usedToday = parseInt(localStorage.getItem(dailyKey) || '0', 10);
    const usedMonth = parseInt(localStorage.getItem(monthlyKey) || '0', 10);

    localStorage.setItem(dailyKey, String(usedToday + 1));
    localStorage.setItem(monthlyKey, String(usedMonth + 1));
  }

  /**
   * Demo mod - test için premium erişim
   */
  enableDemoMode(): void {
    localStorage.setItem('kader_demo_mode', 'true');
    console.log('Demo mode enabled - premium access granted');
  }

  disableDemoMode(): void {
    localStorage.removeItem('kader_demo_mode');
    console.log('Demo mode disabled');
  }

  isDemoMode(): boolean {
    return localStorage.getItem('kader_demo_mode') === 'true';
  }
}

export const PurchaseService = new PurchaseServiceClass();
