import { useState } from 'react';
import { Building2, User, Calendar, TrendingUp, Sparkles, ArrowRight, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { BusinessData } from '@/types/wealthAnalysis';

interface WealthAnalysisFormProps {
  onSubmit: (data: BusinessData) => void;
}

export function WealthAnalysisForm({ onSubmit }: WealthAnalysisFormProps) {
  const [data, setData] = useState<BusinessData>({
    founderFirstName: '',
    founderLastName: '',
    founderBirthDate: '',
    companyName: '',
    registrationDate: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!data.founderFirstName.trim()) newErrors.founderFirstName = 'Kurucu adını girin';
    if (!data.founderLastName.trim()) newErrors.founderLastName = 'Kurucu soyadını girin';
    if (!data.founderBirthDate) newErrors.founderBirthDate = 'Kurucu doğum tarihini seçin';
    if (!data.companyName.trim()) newErrors.companyName = 'Şirket/marka ismini girin';
    if (!data.registrationDate) newErrors.registrationDate = 'Kuruluş tarihini seçin';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(data);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4">
      {/* Falling Money Symbols Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute text-emerald-500/10 font-bold animate-fall"
            style={{
              top: `${-10 - Math.random() * 20}%`,
              left: `${Math.random() * 100}%`,
              fontSize: `${24 + Math.random() * 24}px`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${6 + Math.random() * 4}s`,
              animationIterationCount: 'infinite'
            }}
          >
            {['$', '€', '₺', '£'][Math.floor(Math.random() * 4)]}
          </div>
        ))}
      </div>

      {/* Main Card */}
      <div className="relative bg-gradient-to-br from-emerald-900/40 via-black/80 to-amber-900/40 backdrop-blur-xl rounded-3xl p-8 md:p-10 border border-emerald-500/30 shadow-[0_0_60px_rgba(16,185,129,0.15)]">
        {/* Corner Decorations */}
        <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-emerald-400/50 rounded-tl-3xl" />
        <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-emerald-400/50 rounded-tr-3xl" />
        <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-emerald-400/50 rounded-bl-3xl" />
        <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-emerald-400/50 rounded-br-3xl" />

        {/* Header with Large Avatar */}
        <div className="text-center mb-10 relative z-10">
          <div className="relative inline-block mb-8">
            <div className="absolute inset-0 w-32 h-32 rounded-full bg-gradient-to-r from-emerald-500/30 via-amber-500/30 to-emerald-500/30 blur-2xl animate-pulse" />
            <div className="absolute inset-0 w-32 h-32 rounded-full border-2 border-emerald-400/30 animate-spin" style={{ animationDuration: '15s' }} />
            <div className="relative w-28 h-28 rounded-full overflow-hidden border-2 border-emerald-400 shadow-[0_0_40px_rgba(16,185,129,0.4)] mx-auto">
              <img 
                src="/avatars/servet-isim.png" 
                alt="Servet & İsim" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-400 via-amber-400 to-emerald-400 bg-clip-text text-transparent mb-4 drop-shadow-[0_0_20px_rgba(16,185,129,0.3)]">
            Servet & İsim
          </h1>
          <p className="text-emerald-300/70 text-lg tracking-wide max-w-md mx-auto">
            Şirketinin bereket kodlarını çöz. Para sana akacak mı?
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
          {/* Founder Section */}
          <div className="bg-gradient-to-br from-[#D4AF37]/10 to-transparent rounded-2xl p-6 border border-[#D4AF37]/20">
            <h3 className="text-[#D4AF37] font-cinzel text-xl mb-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#D4AF37]/20 flex items-center justify-center">
                <User className="w-5 h-5 text-[#D4AF37]" />
              </div>
              Kurucu Bilgileri
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label className="text-[#D4AF37]/80 text-sm font-medium">Kurucu Adı</Label>
                <div className="relative">
                  <Input
                    value={data.founderFirstName}
                    onChange={(e) => setData({ ...data, founderFirstName: e.target.value })}
                    placeholder="örn: Ahmet"
                    className="bg-white/5 border-[#D4AF37]/30 text-[#D4AF37] placeholder:text-[#D4AF37]/30 focus:border-[#D4AF37] h-12 rounded-xl"
                  />
                  <Sparkles className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#D4AF37]/30" />
                </div>
                {errors.founderFirstName && <p className="text-red-400 text-xs flex items-center gap-1"><span className="w-1 h-1 bg-red-400 rounded-full" />{errors.founderFirstName}</p>}
              </div>
              <div className="space-y-2">
                <Label className="text-[#D4AF37]/80 text-sm font-medium">Kurucu Soyadı</Label>
                <div className="relative">
                  <Input
                    value={data.founderLastName}
                    onChange={(e) => setData({ ...data, founderLastName: e.target.value })}
                    placeholder="örn: Yılmaz"
                    className="bg-white/5 border-[#D4AF37]/30 text-[#D4AF37] placeholder:text-[#D4AF37]/30 focus:border-[#D4AF37] h-12 rounded-xl"
                  />
                  <Sparkles className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#D4AF37]/30" />
                </div>
                {errors.founderLastName && <p className="text-red-400 text-xs flex items-center gap-1"><span className="w-1 h-1 bg-red-400 rounded-full" />{errors.founderLastName}</p>}
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label className="text-[#D4AF37]/80 text-sm font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Kurucu Doğum Tarihi
                </Label>
                <Input
                  type="date"
                  value={data.founderBirthDate}
                  onChange={(e) => setData({ ...data, founderBirthDate: e.target.value })}
                  className="bg-white/5 border-[#D4AF37]/30 text-[#D4AF37] focus:border-[#D4AF37] h-12 rounded-xl [color-scheme:dark]"
                />
                {errors.founderBirthDate && <p className="text-red-400 text-xs flex items-center gap-1"><span className="w-1 h-1 bg-red-400 rounded-full" />{errors.founderBirthDate}</p>}
              </div>
            </div>
          </div>

          {/* Company Section */}
          <div className="bg-gradient-to-br from-emerald-500/10 to-transparent rounded-2xl p-6 border border-emerald-500/20">
            <h3 className="text-emerald-400 font-cinzel text-xl mb-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-emerald-400" />
              </div>
              Şirket/Marka Bilgileri
            </h3>
            <div className="space-y-5">
              <div className="space-y-2">
                <Label className="text-emerald-300/80 text-sm font-medium flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Şirket/Marka İsmi
                </Label>
                <div className="relative">
                  <Input
                    value={data.companyName}
                    onChange={(e) => setData({ ...data, companyName: e.target.value })}
                    placeholder="örn: Aegean Gourmet"
                    className="bg-white/5 border-emerald-500/30 text-emerald-300 placeholder:text-emerald-300/30 focus:border-emerald-400 h-12 rounded-xl"
                  />
                  <Sparkles className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400/30" />
                </div>
                {errors.companyName && <p className="text-red-400 text-xs flex items-center gap-1"><span className="w-1 h-1 bg-red-400 rounded-full" />{errors.companyName}</p>}
              </div>
              <div className="space-y-2">
                <Label className="text-emerald-300/80 text-sm font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Kuruluş/Tescil Tarihi
                </Label>
                <Input
                  type="date"
                  value={data.registrationDate}
                  onChange={(e) => setData({ ...data, registrationDate: e.target.value })}
                  className="bg-white/5 border-emerald-500/30 text-emerald-300 focus:border-emerald-400 h-12 rounded-xl [color-scheme:dark]"
                />
                {errors.registrationDate && <p className="text-red-400 text-xs flex items-center gap-1"><span className="w-1 h-1 bg-red-400 rounded-full" />{errors.registrationDate}</p>}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-emerald-500 via-amber-500 to-emerald-500 hover:from-emerald-400 hover:via-amber-400 hover:to-emerald-400 text-white font-bold py-6 text-xl tracking-wide transition-all duration-500 rounded-xl shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_50px_rgba(16,185,129,0.5)] group relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center justify-center gap-3">
                <TrendingUp className="w-6 h-6 group-hover:animate-bounce" />
                Bereket Analizi Yap
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </Button>
          </div>

          <div className="text-center pt-2">
            <p className="text-emerald-300/40 text-sm italic">
              "Şirketinin enerjisi taranıyor..."
            </p>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes fall {
          0% { transform: translateY(-100vh) rotate(0deg); opacity: 0; }
          10% { opacity: 0.15; }
          90% { opacity: 0.15; }
          100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
        }
        .animate-fall {
          animation-name: fall;
          animation-timing-function: linear;
        }
      `}</style>
    </div>
  );
}
