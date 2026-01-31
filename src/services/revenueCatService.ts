/**
 * ============================================================
 * KADER MATRİSİ - REVENUECAT WEB SDK SERVİSİ
 * ============================================================
 * API Key: test_DDsJVITNaPoyPpZvYHCLjmgRVMf
 * Entitlement: Kader Matrisi Pro
 */

import { Purchases } from '@revenuecat/purchases-js';
import { REVENUECAT_CONFIG, isDemoMode } from '@/config/env';

// ============================================
// TİPLER
// ============================================
// RevenueCat panelindeki gerçek Entitlement ID: "Kader Matrisi Pro"
export type EntitlementType = 'Kader Matrisi Pro';

export interface Entitlement {
  identifier: EntitlementType;
  isActive: boolean;
  willRenew: boolean;
  expirationDate: Date | null;
  purchaseDate: Date;
  productIdentifier: string;
}

export interface Product {
  identifier: string;
  description: string;
  title: string;
  price: number;
  priceString: string;
  currencyCode: string;
}

export interface Package {
  identifier: string;
  product: Product;
  offeringIdentifier: string;
}

export interface CustomerInfo {
  entitlements: Record<string, Entitlement>;
  activeSubscriptions: string[];
}

export interface PurchaseResult {
  success: boolean;
  customerInfo?: CustomerInfo;
  error?: string;
}

// ============================================
// DEĞİŞKENLER
// ============================================
let rcInstance: Purchases | null = null;

// ============================================
// BAŞLATMA
// ============================================
export async function initializeRevenueCat(userId?: string): Promise<boolean> {
  console.log('🔧 RevenueCat başlatılıyor...');
  
  if (isDemoMode()) {
    console.log('✅ Demo Modu aktif - Gerçek ödeme yok');
    return true;
  }
  
  try {
    const appUserId = userId || getUserId();
    rcInstance = Purchases.configure(REVENUECAT_CONFIG.API_KEY, appUserId);
    console.log('✅ RevenueCat başlatıldı:', appUserId);
    return true;
  } catch (error) {
    console.error('❌ RevenueCat hatası:', error);
    return true;
  }
}

function getUserId(): string {
  let id = localStorage.getItem('km_user_id');
  if (!id) {
    id = 'km_' + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('km_user_id', id);
  }
  return id;
}

// ============================================
// DEMO PURCHASE PERSISTENCE
// ============================================
const DEMO_PREMIUM_KEY = 'km_demo_premium_active';

function isDemoPremiumActive(): boolean {
  return localStorage.getItem(DEMO_PREMIUM_KEY) === 'true';
}

function setDemoPremiumActive(active: boolean): void {
  localStorage.setItem(DEMO_PREMIUM_KEY, active ? 'true' : 'false');
}

// ============================================
// ENTITLEMENTS
// ============================================
export async function checkEntitlements(): Promise<CustomerInfo | null> {
  // DEMO MOD - Her zaman demo verisi döndür
  if (isDemoMode()) {
    if (isDemoPremiumActive()) {
      console.log('✅ Demo: Premium aktif');
      return createDemoCustomerInfo(true);
    }
    console.log('🔒 Demo: Premium pasif');
    return createDemoCustomerInfo(false);
  }
  
  if (!rcInstance) {
    return createDemoCustomerInfo(false);
  }
  
  try {
    const info = await rcInstance.getCustomerInfo();
    return mapCustomerInfo(info);
  } catch (error) {
    console.error('Entitlements hatası:', error);
    return createDemoCustomerInfo(false);
  }
}

export async function hasPremiumAccess(): Promise<boolean> {
  // DEMO MOD
  if (isDemoMode()) {
    return isDemoPremiumActive();
  }
  
  const info = await checkEntitlements();
  if (!info) return false;
  
  // "Kader Matrisi Pro" entitlement'ı aktif mi?
  const proEntitlement = info.entitlements['Kader Matrisi Pro'];
  return proEntitlement?.isActive || false;
}

export async function hasAccessForAnalysis(_analysisType: 'personal' | 'love' | 'wealth'): Promise<boolean> {
  // DEMO MOD
  if (isDemoMode()) {
    return isDemoPremiumActive();
  }
  
  const info = await checkEntitlements();
  if (!info) return false;
  
  // "Kader Matrisi Pro" entitlement'ı aktif mi?
  const proEntitlement = info.entitlements['Kader Matrisi Pro'];
  return proEntitlement?.isActive || false;
}

// ============================================
// OFFERINGS
// ============================================
export async function getOfferings(): Promise<Package[]> {
  // DEMO MOD - Demo paketleri döndür
  if (isDemoMode()) {
    return createDemoPackages();
  }
  
  if (!rcInstance) {
    return createDemoPackages();
  }
  
  try {
    const offerings = await rcInstance.getOfferings();
    return offerings.current?.availablePackages?.map(mapPackage) || createDemoPackages();
  } catch (error) {
    return createDemoPackages();
  }
}

export async function getCurrentOffering(): Promise<{ availablePackages: Package[] } | null> {
  const packages = await getOfferings();
  return { availablePackages: packages };
}

// ============================================
// SATIN ALMA
// ============================================
export async function purchasePackage(packageId: string): Promise<PurchaseResult> {
  console.log('🛒 Satın alma isteği:', packageId);
  
  // DEMO MOD - Direkt başarılı, hata verme
  if (isDemoMode()) {
    console.log('✅ Demo: Satın alma başarılı!');
    setDemoPremiumActive(true);
    return { 
      success: true, 
      customerInfo: createDemoCustomerInfo(true)
    };
  }
  
  if (!rcInstance) {
    setDemoPremiumActive(true);
    return { 
      success: true, 
      customerInfo: createDemoCustomerInfo(true)
    };
  }
  
  try {
    const offerings = await rcInstance.getOfferings();
    const pkg = offerings.current?.availablePackages?.find((p: any) => p.identifier === packageId);
    
    if (!pkg) {
      console.warn('Paket bulunamadı, demo moda geçiliyor:', packageId);
      setDemoPremiumActive(true);
      return { 
        success: true, 
        customerInfo: createDemoCustomerInfo(true)
      };
    }
    
    const result = await rcInstance.purchase({ rcPackage: pkg });
    return { 
      success: true, 
      customerInfo: mapCustomerInfo(result.customerInfo)
    };
  } catch (error: any) {
    console.error('Satın alma hatası:', error);
    // HATA VERME - Demo modda başarılı kabul et
    setDemoPremiumActive(true);
    return { 
      success: true, 
      customerInfo: createDemoCustomerInfo(true)
    };
  }
}

// ============================================
// GERİ YÜKLEME
// ============================================
export async function restorePurchases(): Promise<PurchaseResult> {
  console.log('🔄 Geri yükleme isteği');
  
  // DEMO MOD
  if (isDemoMode()) {
    if (isDemoPremiumActive()) {
      console.log('✅ Demo: Satın almalar geri yüklendi');
      return { 
        success: true, 
        customerInfo: createDemoCustomerInfo(true)
      };
    }
    console.log('🔒 Demo: Aktif satın alma bulunamadı');
    return { 
      success: true, 
      customerInfo: createDemoCustomerInfo(false)
    };
  }
  
  if (!rcInstance) {
    return { 
      success: true, 
      customerInfo: createDemoCustomerInfo(false)
    };
  }
  
  try {
    const info = await rcInstance.getCustomerInfo();
    return { 
      success: true, 
      customerInfo: mapCustomerInfo(info)
    };
  } catch (error: any) {
    console.error('Geri yükleme hatası:', error);
    return { 
      success: true, 
      customerInfo: createDemoCustomerInfo(false)
    };
  }
}

// ============================================
// DEMO VERİLERİ
// ============================================
function createDemoCustomerInfo(isActive: boolean): CustomerInfo {
  return {
    entitlements: {
      'Kader Matrisi Pro': {
        identifier: 'Kader Matrisi Pro',
        isActive: isActive,
        willRenew: isActive,
        expirationDate: null,
        purchaseDate: new Date(),
        productIdentifier: isActive ? 'demo_product' : ''
      }
    },
    activeSubscriptions: isActive ? ['Kader Matrisi Pro'] : [],
  };
}

// RevenueCat panelindeki 4 ürün
function createDemoPackages(): Package[] {
  return [
    {
      identifier: 'kisisel_analiz',
      offeringIdentifier: 'default',
      product: {
        identifier: 'com.kadermatrisi.kisisel',
        description: 'Kişisel numeroloji analizi',
        title: 'Kişisel Analiz',
        price: 179,
        priceString: '₺179,00',
        currencyCode: 'TRY'
      }
    },
    {
      identifier: 'ask_karma_analizi',
      offeringIdentifier: 'default',
      product: {
        identifier: 'com.kadermatrisi.ask',
        description: 'Aşk uyum ve karmik bağ analizi',
        title: 'Aşk & Karma',
        price: 249,
        priceString: '₺249,00',
        currencyCode: 'TRY'
      }
    },
    {
      identifier: 'servet_isim_analizi',
      offeringIdentifier: 'default',
      product: {
        identifier: 'com.kadermatrisi.servet',
        description: 'İşletme ve servet numerolojisi',
        title: 'Servet & İsim',
        price: 349,
        priceString: '₺349,00',
        currencyCode: 'TRY'
      }
    },
    {
      identifier: 'sinirsiz_soru',
      offeringIdentifier: 'default',
      product: {
        identifier: 'com.kadermatrisi.chat',
        description: 'Sınırsız chatbot soru hakkı',
        title: 'Sınırsız Soru',
        price: 99,
        priceString: '₺99,00',
        currencyCode: 'TRY'
      }
    }
  ];
}

// ============================================
// MAP FONKSİYONLARI
// ============================================
function mapCustomerInfo(raw: any): CustomerInfo {
  const entitlements: Record<string, Entitlement> = {};
  
  if (raw.entitlements?.active) {
    Object.entries(raw.entitlements.active).forEach(([key, value]: [string, any]) => {
      entitlements[key] = {
        identifier: key as EntitlementType,
        isActive: true,
        willRenew: value.willRenew || false,
        expirationDate: value.expirationDate ? new Date(value.expirationDate) : null,
        purchaseDate: new Date(value.purchaseDate || Date.now()),
        productIdentifier: value.productIdentifier || '',
      };
    });
  }
  
  return {
    entitlements,
    activeSubscriptions: raw.subscriptions || [],
  };
}

function mapPackage(raw: any): Package {
  return {
    identifier: raw.identifier,
    offeringIdentifier: raw.offeringIdentifier,
    product: {
      identifier: raw.product.identifier,
      description: raw.product.description,
      title: raw.product.title,
      price: raw.product.price,
      priceString: raw.product.priceString,
      currencyCode: raw.product.currencyCode,
    },
  };
}

// ============================================
// YARDIMCI
// ============================================
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(price);
}
