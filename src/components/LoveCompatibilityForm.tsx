import { useState } from 'react';
import { Heart, User, Calendar, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { PartnerData } from '@/types/loveCompatibility';

interface LoveCompatibilityFormProps {
  onSubmit: (user: PartnerData, partner: PartnerData) => void;
}

export function LoveCompatibilityForm({ onSubmit }: LoveCompatibilityFormProps) {
  const [user, setUser] = useState<PartnerData>({ firstName: '', lastName: '', birthDate: '' });
  const [partner, setPartner] = useState<PartnerData>({ firstName: '', lastName: '', birthDate: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!user.firstName.trim()) newErrors.userFirstName = 'Adınızı girin';
    if (!user.lastName.trim()) newErrors.userLastName = 'Soyadınızı girin';
    if (!user.birthDate) newErrors.userBirthDate = 'Doğum tarihinizi seçin';
    
    if (!partner.firstName.trim()) newErrors.partnerFirstName = 'Partner adını girin';
    if (!partner.lastName.trim()) newErrors.partnerLastName = 'Partner soyadını girin';
    if (!partner.birthDate) newErrors.partnerBirthDate = 'Partner doğum tarihini seçin';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(user, partner);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4">
      {/* Falling Hearts Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute text-rose-500/10 animate-fall"
            style={{
              top: `${-10 - Math.random() * 20}%`,
              left: `${Math.random() * 100}%`,
              fontSize: `${24 + Math.random() * 24}px`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${6 + Math.random() * 4}s`,
              animationIterationCount: 'infinite'
            }}
          >
            ♥
          </div>
        ))}
      </div>

      {/* Main Card */}
      <div className="relative bg-gradient-to-br from-rose-900/40 via-black/80 to-pink-900/40 backdrop-blur-xl rounded-3xl p-8 md:p-10 border border-rose-500/30 shadow-[0_0_60px_rgba(244,63,94,0.15)]">
        {/* Corner Decorations */}
        <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-rose-400/50 rounded-tl-3xl" />
        <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-rose-400/50 rounded-tr-3xl" />
        <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-rose-400/50 rounded-bl-3xl" />
        <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-rose-400/50 rounded-br-3xl" />

        {/* Header with Large Avatar */}
        <div className="text-center mb-10 relative z-10">
          <div className="relative inline-block mb-8">
            <div className="absolute inset-0 w-32 h-32 rounded-full bg-gradient-to-r from-rose-500/30 via-pink-500/30 to-rose-500/30 blur-2xl animate-pulse" />
            <div className="absolute inset-0 w-32 h-32 rounded-full border-2 border-rose-400/30 animate-spin" style={{ animationDuration: '15s' }} />
            <div className="relative w-28 h-28 rounded-full overflow-hidden border-2 border-rose-400 shadow-[0_0_40px_rgba(244,63,94,0.4)] mx-auto">
              <img 
                src="/avatars/ask-karma.png" 
                alt="Aşk & Karma" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-rose-400 via-pink-400 to-rose-400 bg-clip-text text-transparent mb-4 drop-shadow-[0_0_20px_rgba(244,63,94,0.3)]">
            Aşk & Karma
          </h1>
          <p className="text-rose-300/70 text-lg tracking-wide max-w-md mx-auto">
            İlişkinizin gizli kodlarını çöz. Ruhlarınız anlaşıyor mu?
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
          {/* User Section */}
          <div className="bg-gradient-to-br from-[#D4AF37]/10 to-transparent rounded-2xl p-6 border border-[#D4AF37]/20">
            <h3 className="text-[#D4AF37] font-cinzel text-xl mb-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#D4AF37]/20 flex items-center justify-center">
                <User className="w-5 h-5 text-[#D4AF37]" />
              </div>
              Siz
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label className="text-[#D4AF37]/80 text-sm font-medium">Adınız</Label>
                <div className="relative">
                  <Input
                    value={user.firstName}
                    onChange={(e) => setUser({ ...user, firstName: e.target.value })}
                    placeholder="örn: Ayşe"
                    className="bg-white/5 border-[#D4AF37]/30 text-[#D4AF37] placeholder:text-[#D4AF37]/30 focus:border-[#D4AF37] h-12 rounded-xl"
                  />
                  <Sparkles className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#D4AF37]/30" />
                </div>
                {errors.userFirstName && <p className="text-red-400 text-xs flex items-center gap-1"><span className="w-1 h-1 bg-red-400 rounded-full" />{errors.userFirstName}</p>}
              </div>
              <div className="space-y-2">
                <Label className="text-[#D4AF37]/80 text-sm font-medium">Soyadınız</Label>
                <div className="relative">
                  <Input
                    value={user.lastName}
                    onChange={(e) => setUser({ ...user, lastName: e.target.value })}
                    placeholder="örn: Yılmaz"
                    className="bg-white/5 border-[#D4AF37]/30 text-[#D4AF37] placeholder:text-[#D4AF37]/30 focus:border-[#D4AF37] h-12 rounded-xl"
                  />
                  <Sparkles className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#D4AF37]/30" />
                </div>
                {errors.userLastName && <p className="text-red-400 text-xs flex items-center gap-1"><span className="w-1 h-1 bg-red-400 rounded-full" />{errors.userLastName}</p>}
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label className="text-[#D4AF37]/80 text-sm font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Doğum Tarihiniz
                </Label>
                <Input
                  type="date"
                  value={user.birthDate}
                  onChange={(e) => setUser({ ...user, birthDate: e.target.value })}
                  className="bg-white/5 border-[#D4AF37]/30 text-[#D4AF37] focus:border-[#D4AF37] h-12 rounded-xl [color-scheme:dark]"
                />
                {errors.userBirthDate && <p className="text-red-400 text-xs flex items-center gap-1"><span className="w-1 h-1 bg-red-400 rounded-full" />{errors.userBirthDate}</p>}
              </div>
            </div>
          </div>

          {/* Arrow */}
          <div className="flex justify-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-500/30 to-pink-500/30 flex items-center justify-center animate-pulse border border-rose-400/30">
              <ArrowRight className="w-6 h-6 text-rose-400 rotate-90 md:rotate-0" />
            </div>
          </div>

          {/* Partner Section */}
          <div className="bg-gradient-to-br from-rose-500/10 to-transparent rounded-2xl p-6 border border-rose-500/20">
            <h3 className="text-rose-400 font-cinzel text-xl mb-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center">
                <Heart className="w-5 h-5 text-rose-400" />
              </div>
              Partneriniz
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label className="text-rose-300/80 text-sm font-medium">Partner Adı</Label>
                <div className="relative">
                  <Input
                    value={partner.firstName}
                    onChange={(e) => setPartner({ ...partner, firstName: e.target.value })}
                    placeholder="örn: Mehmet"
                    className="bg-white/5 border-rose-500/30 text-rose-300 placeholder:text-rose-300/30 focus:border-rose-400 h-12 rounded-xl"
                  />
                  <Sparkles className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-400/30" />
                </div>
                {errors.partnerFirstName && <p className="text-red-400 text-xs flex items-center gap-1"><span className="w-1 h-1 bg-red-400 rounded-full" />{errors.partnerFirstName}</p>}
              </div>
              <div className="space-y-2">
                <Label className="text-rose-300/80 text-sm font-medium">Partner Soyadı</Label>
                <div className="relative">
                  <Input
                    value={partner.lastName}
                    onChange={(e) => setPartner({ ...partner, lastName: e.target.value })}
                    placeholder="örn: Kaya"
                    className="bg-white/5 border-rose-500/30 text-rose-300 placeholder:text-rose-300/30 focus:border-rose-400 h-12 rounded-xl"
                  />
                  <Sparkles className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-400/30" />
                </div>
                {errors.partnerLastName && <p className="text-red-400 text-xs flex items-center gap-1"><span className="w-1 h-1 bg-red-400 rounded-full" />{errors.partnerLastName}</p>}
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label className="text-rose-300/80 text-sm font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Partner Doğum Tarihi
                </Label>
                <Input
                  type="date"
                  value={partner.birthDate}
                  onChange={(e) => setPartner({ ...partner, birthDate: e.target.value })}
                  className="bg-white/5 border-rose-500/30 text-rose-300 focus:border-rose-400 h-12 rounded-xl [color-scheme:dark]"
                />
                {errors.partnerBirthDate && <p className="text-red-400 text-xs flex items-center gap-1"><span className="w-1 h-1 bg-red-400 rounded-full" />{errors.partnerBirthDate}</p>}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-rose-500 via-pink-500 to-rose-500 hover:from-rose-400 hover:via-pink-400 hover:to-rose-400 text-white font-bold py-6 text-xl tracking-wide transition-all duration-500 rounded-xl shadow-[0_0_30px_rgba(244,63,94,0.3)] hover:shadow-[0_0_50px_rgba(244,63,94,0.5)] group relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center justify-center gap-3">
                <Heart className="w-6 h-6 group-hover:animate-pulse" />
                Uyumumuzu Analiz Et
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </Button>
          </div>

          <div className="text-center pt-2">
            <p className="text-rose-300/40 text-sm italic">
              "Kalplerinizin frekansı ölçülüyor..."
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
