import { useState, useEffect } from 'react';
import { RefreshCw, Check, Heart, TrendingUp, User, Lock, Sparkles, Moon, X } from 'lucide-react';
import { PurchaseService } from '@/services/purchaseService';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  analysisType: 'personal' | 'love' | 'wealth' | 'chat';
}

interface PurchaseOption {
  id: string;
  title: string;
  description: string;
  price: string;
  isSubscription: boolean;
  period?: string;
  savings?: string;
  popular?: boolean;
}

export function PaywallModal({ isOpen, onClose, onSuccess, analysisType }: PaywallModalProps) {
  const [packages, setPackages] = useState<PurchaseOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [freeStatus, setFreeStatus] = useState({ remainingToday: 0, remainingMonth: 0 });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Analiz tipine göre içerik - Mistik ve Sarsıcı
  const contentConfig = {
    personal: {
      icon: User,
      title: 'Kaderinin Derinlikleri',
      subtitle: 'Sayıların sana fısıldadıklarını duy',
      description: 'Karmik döngüler, gelecek öngörüsü ve kişiselleştirilmiş tavsiyeler için kilidi aç. Bu gölgeyi dağıtmadan, gerçek potansiyeline asla ulaşamazsın.',
      color: 'from-purple-600 via-[#D4AF37] to-purple-600',
      bgGradient: 'from-purple-900/40 via-black/80 to-indigo-900/40',
      iconColor: 'text-purple-400',
      mysticalQuote: '"Karanlık, ışığın doğacağının işaretidir..."',
    },
    love: {
      icon: Heart,
      title: 'Kalbinin Anahtarı',
      subtitle: 'İlişkinizin gizli kodlarını çöz',
      description: 'Ayrılık riski, karmik borç analizi ve gelecek öngörüsü için kilidi aç. Bu bağın kopuş tarihini bilmek istiyorsan...',
      color: 'from-rose-600 via-pink-500 to-rose-600',
      bgGradient: 'from-rose-900/40 via-black/80 to-pink-900/40',
      iconColor: 'text-rose-400',
      mysticalQuote: '"Aşk, sayıların en gizemli dansıdır..."',
    },
    wealth: {
      icon: TrendingUp,
      title: 'Servetin Anahtarı',
      subtitle: 'Şirketinin bereket kodlarını öğren',
      description: 'İflas riski, kritik yatırım tarihleri ve bereket aktivasyonu için kilidi aç. Bu gölgeyi dağıtmadan, zenginliğe giden yolu göremezsin.',
      color: 'from-emerald-600 via-[#D4AF37] to-emerald-600',
      bgGradient: 'from-emerald-900/40 via-black/80 to-amber-900/40',
      iconColor: 'text-emerald-400',
      mysticalQuote: '"Para, enerjinin somut halidir..."',
    },
    chat: {
      icon: Sparkles,
      title: 'Karanlık Numerolog',
      subtitle: 'Kaderinle sınırsız konuş',
      description: 'Sınırsız soru hakkı ile Karanlık Numerologa danış. Aşk, kariyer, gelecek... Ne merak edersen sor, sayılar sana fısıldasın.',
      color: 'from-[#D4AF37] via-[#B8960C] to-[#D4AF37]',
      bgGradient: 'from-[#D4AF37]/20 via-black/80 to-[#B8960C]/20',
      iconColor: 'text-[#D4AF37]',
      mysticalQuote: '"Soruların cevapları, kaderinin gölgesinde gizli..."',
    },
  };

  const config = contentConfig[analysisType];
  const Icon = config.icon;

  useEffect(() => {
    if (isOpen) {
      loadPackages();
      const status = PurchaseService.getFreeUsageStatus();
      setFreeStatus(status);
      setError(null);
      setSuccessMessage(null);
    }
  }, [isOpen]);

  const loadPackages = async () => {
    try {
      const allPackages = await PurchaseService.getAllPackages();
      
      // Analiz tipine göre SADECE ilgili paketi göster
      let filteredPackages = allPackages;
      if (analysisType === 'personal') {
        filteredPackages = allPackages.filter(pkg => pkg.identifier === 'kisisel_analiz');
      } else if (analysisType === 'love') {
        filteredPackages = allPackages.filter(pkg => pkg.identifier === 'ask_karma_analizi');
      } else if (analysisType === 'wealth') {
        filteredPackages = allPackages.filter(pkg => pkg.identifier === 'servet_isim_analizi');
      } else if (analysisType === 'chat') {
        filteredPackages = allPackages.filter(pkg => pkg.identifier === 'sinirsiz_soru');
      }
      
      const mappedPackages: PurchaseOption[] = filteredPackages.map(pkg => ({
        id: pkg.identifier,
        title: getPackageTitle(pkg.identifier),
        description: getPackageDescription(pkg.identifier),
        price: pkg.product.priceString,
        isSubscription: false,
      }));
      
      setPackages(mappedPackages);
    } catch (error) {
      console.error('Paketler yüklenemedi:', error);
      const demoPackages: Record<string, PurchaseOption[]> = {
        personal: [
          { id: 'kisisel_analiz', title: 'Kişisel Analiz', description: 'Tek seferlik, kalıcı erişim', price: '₺179,00', isSubscription: false },
        ],
        love: [
          { id: 'ask_karma_analizi', title: 'Aşk & Karma Analizi', description: 'Tek seferlik, kalıcı erişim', price: '₺249,00', isSubscription: false },
        ],
        wealth: [
          { id: 'servet_isim_analizi', title: 'Servet & İsim Analizi', description: 'Tek seferlik, kalıcı erişim', price: '₺349,00', isSubscription: false },
        ],
        chat: [
          { id: 'sinirsiz_soru', title: 'Sınırsız Soru Paketi', description: 'Karanlık Numerolog ile sınırsız sohbet', price: '₺99,00', isSubscription: false },
        ],
      };
      setPackages(demoPackages[analysisType] || demoPackages.personal);
    }
  };

  const getPackageTitle = (id: string): string => {
    const titles: Record<string, string> = {
      'kisisel_analiz': 'Kişisel Analiz',
      'ask_karma_analizi': 'Aşk & Karma Analizi',
      'servet_isim_analizi': 'Servet & İsim Analizi',
      'sinirsiz_soru': 'Sınırsız Soru Paketi',
    };
    return titles[id] || id;
  };

  const getPackageDescription = (id: string): string => {
    const descriptions: Record<string, string> = {
      'kisisel_analiz': 'Tek seferlik, kalıcı erişim',
      'ask_karma_analizi': 'Tek seferlik, kalıcı erişim',
      'servet_isim_analizi': 'Tek seferlik, kalıcı erişim',
      'sinirsiz_soru': 'Karanlık Numerolog ile sınırsız sohbet',
    };
    return descriptions[id] || '';
  };

  const handlePurchase = async (packageId: string) => {
    setIsLoading(true);
    setError(null);
    setSelectedPackage(packageId);

    try {
      const result = await PurchaseService.purchase(packageId);
      
      if (result.success) {
        setSuccessMessage('Satın alma başarılı! Kaderinin kapıları açıldı.');
        onSuccess();
      } else {
        setError(result.error || 'Satın alma başarısız oldu');
      }
    } catch (err) {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
      setSelectedPackage(null);
    }
  };

  const handleRestore = async () => {
    setIsRestoring(true);
    setError(null);

    try {
      const result = await PurchaseService.restore();
      
      if (result.success) {
        const hasActive = Object.values(result.customerInfo?.entitlements || {})
          .some((e: any) => e.isActive);
        
        if (hasActive) {
          setSuccessMessage('Satın almalarınız geri yüklendi! Kaderin seni bekliyor.');
          onSuccess();
        } else {
          setError('Aktif bir satın alma bulunamadı');
        }
      } else {
        setError(result.error || 'Geri yükleme başarısız oldu');
      }
    } catch (err) {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsRestoring(false);
    }
  };

  const handleFreeClose = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={`bg-gradient-to-br ${config.bgGradient} border-purple-500/30 max-w-md max-h-[90vh] overflow-y-auto`}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4 text-white/60" />
        </button>

        <DialogHeader>
          <DialogTitle className="text-center pt-4">
            {/* Animated Icon */}
            <div className={`w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br ${config.color} flex items-center justify-center animate-glow relative`}>
              <div className="absolute inset-0 rounded-full bg-white/10 animate-pulse" />
              <Icon className="w-12 h-12 text-white relative z-10" />
              
              {/* Orbiting Sparkles */}
              <Sparkles className="absolute -top-1 -right-1 w-5 h-5 text-[#D4AF37] animate-pulse" />
              <Moon className="absolute -bottom-1 -left-1 w-5 h-5 text-purple-400 animate-pulse" style={{ animationDelay: '0.5s' }} />
            </div>
            
            {/* Title */}
            <h2 className={`text-3xl font-bold bg-gradient-to-r ${config.color} bg-clip-text text-transparent font-cinzel`}>
              {config.title}
            </h2>
            <p className="text-white/60 text-sm mt-2">{config.subtitle}</p>
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          {/* Mystical Quote */}
          <p className="text-center text-white/50 text-sm italic mb-6">
            {config.mysticalQuote}
          </p>

          {/* Description */}
          <p className="text-white/80 text-sm text-center mb-6 leading-relaxed">
            {config.description}
          </p>

          {/* Success Message */}
          {successMessage && (
            <div className="mb-4 p-4 bg-emerald-500/20 border border-emerald-500/50 rounded-xl">
              <p className="text-emerald-400 text-sm text-center flex items-center justify-center gap-2">
                <Check className="w-4 h-4" />
                {successMessage}
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
              <p className="text-red-400 text-sm text-center">{error}</p>
            </div>
          )}

          {/* Free Usage Info */}
          {freeStatus.remainingToday > 0 && (
            <div className="mb-4 p-4 bg-white/5 rounded-xl text-center border border-white/10">
              <p className="text-white/60 text-xs">
                Bugün <span className="text-[#D4AF37] font-bold">{freeStatus.remainingToday}</span> ücretsiz analiz hakkın daha var
              </p>
            </div>
          )}

          {/* Features */}
          <div className="mb-6">
            <p className="text-white/40 text-xs mb-3 uppercase tracking-wider text-center">Kilidi açarak şunlara erişeceksin:</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                'Genel Sentez',
                'Karmik Döngü',
                'Gelecek Öngörüsü',
                'Kişiselleştirilmiş Tavsiyeler',
                'Risk Analizi',
                'Reklamsız Deneyim',
              ].map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                  <Check className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                  <span className="text-white/70 text-xs">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Packages */}
          <div className="space-y-3 mb-6">
            {packages.map((pkg) => (
              <button
                key={pkg.id}
                onClick={() => handlePurchase(pkg.id)}
                disabled={isLoading || !!successMessage}
                className={`
                  w-full p-5 rounded-xl border transition-all duration-300 relative text-left
                  ${pkg.popular 
                    ? 'border-[#D4AF37]/50 bg-gradient-to-r from-[#D4AF37]/20 to-purple-500/20 hover:from-[#D4AF37]/30 hover:to-purple-500/30' 
                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                  }
                  ${(isLoading && selectedPackage === pkg.id) || !!successMessage ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                {/* Popular Badge */}
                {pkg.popular && (
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-[#D4AF37] to-purple-500 rounded-full">
                    <span className="text-xs font-medium text-black">En Popüler</span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium flex items-center gap-2">
                      <Lock className="w-4 h-4 text-[#D4AF37]" />
                      {pkg.title}
                    </h4>
                    <p className="text-white/50 text-xs mt-1">{pkg.description}</p>
                    {pkg.savings && (
                      <span className="inline-block mt-2 px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs rounded-full">
                        {pkg.savings}
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-[#D4AF37] font-bold text-xl">{pkg.price}</p>
                    {pkg.period && (
                      <p className="text-white/50 text-xs">/{pkg.period}</p>
                    )}
                  </div>
                </div>

                {/* Loading Overlay */}
                {isLoading && selectedPackage === pkg.id && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-xl">
                    <div className="w-6 h-6 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Restore Button */}
          <button
            onClick={handleRestore}
            disabled={isRestoring || !!successMessage}
            className="w-full flex items-center justify-center gap-2 text-white/50 hover:text-[#D4AF37] text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed py-3"
          >
            <RefreshCw className={`w-4 h-4 ${isRestoring ? 'animate-spin' : ''}`} />
            {isRestoring ? 'Kontrol ediliyor...' : 'Önceki Satın Almaları Geri Yükle'}
          </button>

          {/* Free Close Button */}
          <button
            onClick={handleFreeClose}
            disabled={!!successMessage}
            className="w-full mt-4 py-3 text-white/30 hover:text-white/50 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Şimdilik Kapat
          </button>

          {/* Security Note */}
          <p className="mt-6 text-center text-white/20 text-xs">
            App Store / Google Play güvenli ödeme altyapısı ile işlem yapılır
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
