import { useState, useEffect } from 'react';
import { X, Crown, Zap, Lock, CheckCircle2, Sparkles } from 'lucide-react';
import { PurchaseService } from '@/services/purchaseService';
import type { AnalysisType } from '@/services/purchaseService';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  analysisType: AnalysisType;
}

interface PricingPlan {
  id: string;
  name: string;
  price: string;
  priceMonthly?: string;
  features: string[];
  popular?: boolean;
  revenueCatIdentifier: string;
}

export function PaywallModal({ isOpen, onClose, onSuccess, analysisType }: PaywallModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>('monthly');

  const plans: PricingPlan[] = [
    {
      id: 'single',
      name: 'Tek Analiz',
      price: '179₺',
      revenueCatIdentifier: 'single_analysis',
      features: [
        'Detaylı kişisel analiz',
        'Kilitli bölümlere tam erişim',
        'PDF indirme',
        'Tek kullanımlık'
      ]
    },
    {
      id: 'monthly',
      name: 'Aylık Premium',
      price: '299₺',
      priceMonthly: '299₺/ay',
      popular: true,
      revenueCatIdentifier: 'monthly_premium',
      features: [
        'Sınırsız analiz',
        'Karanlık Numerolog AI',
        'Tüm analiz türleri',
        'PDF indirme',
        'Öncelikli destek',
        'İlk ay %20 indirim'
      ]
    },
    {
      id: 'yearly',
      name: 'Yıllık Premium',
      price: '2.499₺',
      priceMonthly: '208₺/ay',
      revenueCatIdentifier: 'yearly_premium',
      features: [
        'Tüm aylık özellikler',
        '12 ay boyunca erişim',
        '%30 tasarruf',
        'Gelecek güncellemeler',
        'VIP destek',
        'Bonus raporlar'
      ]
    }
  ];

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handlePurchase = async () => {
    setIsLoading(true);

    try {
      // Demo mod kontrolü
      if (PurchaseService.isDemoMode()) {
        console.log('Demo mode - simulating purchase success');
        await new Promise(resolve => setTimeout(resolve, 1500));
        onSuccess();
        onClose();
        return;
      }

      // Gerçek satın alma
      const plan = plans.find(p => p.id === selectedPlan);
      if (!plan) {
        throw new Error('Plan not found');
      }

      const success = await PurchaseService.purchasePackage(plan.revenueCatIdentifier);
      
      if (success) {
        onSuccess();
        onClose();
      } else {
        alert('Satın alma başarısız oldu. Lütfen tekrar deneyin.');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      alert('Bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  const getAnalysisTitle = () => {
    const titles = {
      personal: 'Kişisel Analiz',
      love: 'Aşk Uyumu Analizi',
      wealth: 'Servet Analizi',
      chatbot: 'Karanlık Numerolog AI'
    };
    return titles[analysisType] || 'Premium İçerik';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-[#0f0f0f] to-[#1a1a1a] rounded-2xl border border-[#D4AF37]/30 shadow-2xl shadow-[#D4AF37]/10">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5 text-[#D4AF37]" />
        </button>

        {/* Header */}
        <div className="relative px-8 py-12 text-center border-b border-[#D4AF37]/20">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5">
            <Lock className="w-8 h-8 text-[#D4AF37]" />
          </div>
          <h2 className="text-3xl md:text-4xl font-cinzel font-bold text-[#D4AF37] mb-2">
            {getAnalysisTitle()}
          </h2>
          <p className="text-[#D4AF37]/60 max-w-2xl mx-auto">
            Kader'in derinliklerine inmek için premium erişim gerekiyor
          </p>
        </div>

        {/* Pricing Plans */}
        <div className="px-8 py-12">
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`relative p-6 rounded-xl border-2 transition-all cursor-pointer ${
                  selectedPlan === plan.id
                    ? 'border-[#D4AF37] bg-[#D4AF37]/5 shadow-lg shadow-[#D4AF37]/20'
                    : 'border-[#D4AF37]/20 hover:border-[#D4AF37]/40 bg-white/[0.02]'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-[#D4AF37] to-[#F4E4BC] rounded-full">
                    <span className="text-black text-xs font-bold">ÖNERİLEN</span>
                  </div>
                )}

                {/* Icon */}
                <div className="flex justify-center mb-4">
                  {plan.id === 'single' && <Zap className="w-10 h-10 text-[#D4AF37]" />}
                  {plan.id === 'monthly' && <Crown className="w-10 h-10 text-[#D4AF37]" />}
                  {plan.id === 'yearly' && <Sparkles className="w-10 h-10 text-[#D4AF37]" />}
                </div>

                {/* Name */}
                <h3 className="text-xl font-cinzel font-bold text-[#D4AF37] text-center mb-2">
                  {plan.name}
                </h3>

                {/* Price */}
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-white">{plan.price}</div>
                  {plan.priceMonthly && (
                    <div className="text-sm text-[#D4AF37]/60 mt-1">{plan.priceMonthly}</div>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#D4AF37] mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-[#D4AF37]/80">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Selected Indicator */}
                {selectedPlan === plan.id && (
                  <div className="absolute top-4 right-4">
                    <div className="w-6 h-6 rounded-full bg-[#D4AF37] flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-black" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <div className="mt-8 text-center">
            <button
              onClick={handlePurchase}
              disabled={isLoading}
              className="px-12 py-4 bg-gradient-to-r from-[#D4AF37] to-[#F4E4BC] text-black font-bold rounded-lg hover:shadow-lg hover:shadow-[#D4AF37]/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                  İşleniyor...
                </span>
              ) : (
                'Premium Erişimi Aç'
              )}
            </button>

            <p className="text-xs text-[#D4AF37]/40 mt-4">
              Güvenli ödeme RevenueCat ile işlenir
            </p>
          </div>

          {/* Demo Mode Notice */}
          {PurchaseService.isDemoMode() && (
            <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <p className="text-yellow-500 text-sm text-center">
                🧪 Demo Modu Aktif - Ödeme simüle edilecek
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-6 bg-black/20 border-t border-[#D4AF37]/20 text-center">
          <div className="flex justify-center gap-8 text-xs text-[#D4AF37]/60">
            <span>✓ Güvenli ödeme</span>
            <span>✓ Anında erişim</span>
            <span>✓ İstediğin zaman iptal</span>
          </div>
        </div>
      </div>
    </div>
  );
}
