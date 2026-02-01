import Purchases, { LOG_LEVEL, PurchasesPackage } from '@revenuecat/purchases-js';

export type AnalysisType = 'personal' | 'love' | 'wealth' | 'chatbot';

export interface FreeUsageStatus {
  remainingToday: number;
  remainingMonth: number;
  usedToday: number;
  usedMonth: number;
}

class PurchaseServiceClass {
  private isInitialized = false;
  private userId: string | null = null;
  private readonly REVENUECAT_API_KEY = import.meta.env.VITE_REVENUECAT_PUBLIC_KEY || 'your_key';
  private readonly FREE_DAILY_LIMIT = 3;
  private readonly FREE_MONTHLY_LIMIT = 10;
  
  async initialize(userId: string): Promise<void> {
    if (this.isInitialized) return;
    try {
      this.userId = userId;
      await Purchases.configure({ apiKey: this.REVENUECAT_API_KEY, appUserId: userId });
      if (import.meta.env.DEV) Purchases.setLogLevel(LOG_LEVEL.DEBUG);
      this.isInitialized = true;
    } catch (error) {
      console.error('PurchaseService init failed:', error);
    }
  }

  getOrCreateUserId(): string {
    let userId = localStorage.getItem('kader_matrisi_user_id');
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('kader_matrisi_user_id', userId);
    }
    return userId;
  }

  async getAvailablePackages(): Promise<PurchasesPackage[]> {
    try {
      const offerings = await Purchases.getOfferings();
      return offerings.current?.availablePackages || [];
    } catch { return []; }
  }

  async purchasePackage(packageIdentifier: string): Promise<boolean> {
    try {
      const packages = await this.getAvailablePackages();
      const pkg = packages.find(p => p.identifier === packageIdentifier);
      if (!pkg) return false;
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      return this.hasActiveSubscription(customerInfo);
    } catch { return false; }
  }

  async canAccessLockedContent(analysisType: AnalysisType): Promise<{ canAccess: boolean; reason?: string }> {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      if (this.hasActiveSubscription(customerInfo)) return { canAccess: true, reason: 'premium' };
      const free = this.getFreeUsageStatus();
      if (free.remainingToday > 0) return { canAccess: true, reason: 'free' };
      return { canAccess: false, reason: free.remainingMonth > 0 ? 'daily_limit_reached' : 'monthly_limit_reached' };
    } catch {
      const free = this.getFreeUsageStatus();
      return { canAccess: free.remainingToday > 0, reason: 'error_fallback' };
    }
  }

  private hasActiveSubscription(customerInfo: any): boolean {
    return Object.keys(customerInfo?.entitlements?.active || {}).length > 0;
  }

  getFreeUsageStatus(): FreeUsageStatus {
    const today = new Date().toISOString().split('T')[0];
    const month = today.substring(0, 7);
    const usedToday = parseInt(localStorage.getItem(`kader_free_daily_${today}`) || '0', 10);
    const usedMonth = parseInt(localStorage.getItem(`kader_free_monthly_${month}`) || '0', 10);
    return {
      usedToday, usedMonth,
      remainingToday: Math.max(0, this.FREE_DAILY_LIMIT - usedToday),
      remainingMonth: Math.max(0, this.FREE_MONTHLY_LIMIT - usedMonth),
    };
  }

  recordFreeUsage(): void {
    const today = new Date().toISOString().split('T')[0];
    const month = today.substring(0, 7);
    const usedToday = parseInt(localStorage.getItem(`kader_free_daily_${today}`) || '0', 10);
    const usedMonth = parseInt(localStorage.getItem(`kader_free_monthly_${month}`) || '0', 10);
    localStorage.setItem(`kader_free_daily_${today}`, String(usedToday + 1));
    localStorage.setItem(`kader_free_monthly_${month}`, String(usedMonth + 1));
  }

  enableDemoMode(): void { localStorage.setItem('kader_demo_mode', 'true'); }
  disableDemoMode(): void { localStorage.removeItem('kader_demo_mode'); }
  isDemoMode(): boolean { return localStorage.getItem('kader_demo_mode') === 'true'; }
}

export const PurchaseService = new PurchaseServiceClass();
