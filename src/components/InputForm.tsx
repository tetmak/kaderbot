import { useState } from 'react';
import { Sparkles, User, Calendar, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface InputFormProps {
  onSubmit: (data: { firstName: string; lastName: string; birthDate: string }) => void;
}

export function InputForm({ onSubmit }: InputFormProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!firstName.trim()) {
      newErrors.firstName = 'İsminizi girin';
    }
    if (!lastName.trim()) {
      newErrors.lastName = 'Soyisminizi girin';
    }
    if (!birthDate) {
      newErrors.birthDate = 'Doğum tarihinizi seçin';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({ firstName, lastName, birthDate });
    }
  };

  // Format date as DD/MM/YYYY for display
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4">
      {/* Falling Numbers Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute text-[#D4AF37]/10 font-bold animate-fall"
            style={{
              top: `${-10 - Math.random() * 20}%`,
              left: `${Math.random() * 100}%`,
              fontSize: `${20 + Math.random() * 30}px`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${6 + Math.random() * 4}s`,
              animationIterationCount: 'infinite'
            }}
          >
            {Math.floor(Math.random() * 9) + 1}
          </div>
        ))}
      </div>

      {/* Main Card */}
      <div className="relative bg-gradient-to-br from-purple-900/40 via-black/80 to-indigo-900/40 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-[#D4AF37]/30 shadow-[0_0_60px_rgba(212,175,55,0.15)]">
        {/* Corner Decorations */}
        <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-[#D4AF37]/50 rounded-tl-3xl" />
        <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-[#D4AF37]/50 rounded-tr-3xl" />
        <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-[#D4AF37]/50 rounded-bl-3xl" />
        <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-[#D4AF37]/50 rounded-br-3xl" />

        {/* Header with Large Avatar */}
        <div className="text-center mb-10 relative z-10">
          {/* Animated Avatar */}
          <div className="relative inline-block mb-8">
            <div className="absolute inset-0 w-32 h-32 rounded-full bg-gradient-to-r from-[#D4AF37]/30 via-purple-500/30 to-[#D4AF37]/30 blur-2xl animate-pulse" />
            <div className="absolute inset-0 w-32 h-32 rounded-full border-2 border-[#D4AF37]/30 animate-spin" style={{ animationDuration: '15s' }} />
            <div className="relative w-28 h-28 rounded-full overflow-hidden border-2 border-[#D4AF37] shadow-[0_0_40px_rgba(212,175,55,0.4)] mx-auto">
              <img 
                src="/avatars/kisisel-analiz.png" 
                alt="Kişisel Analiz" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold gold-gradient mb-4 drop-shadow-[0_0_20px_rgba(212,175,55,0.3)]">
            Kişisel Analiz
          </h1>
          <p className="text-[#D4AF37]/70 text-lg tracking-wide max-w-md mx-auto">
            Kader kodlarını, ruh güdünü ve kişisel yılını keşfet
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          {/* First Name */}
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-[#D4AF37] text-sm font-medium flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#D4AF37]/20 flex items-center justify-center">
                <User className="w-3 h-3 text-[#D4AF37]" />
              </div>
              Adınız
            </Label>
            <div className="relative">
              <Input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="örn: Atilla"
                className="bg-white/5 border-[#D4AF37]/30 text-[#D4AF37] placeholder:text-[#D4AF37]/30 focus:border-[#D4AF37] focus:ring-[#D4AF37]/30 h-14 text-lg rounded-xl"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#D4AF37]/30">
                <Sparkles className="w-5 h-5" />
              </div>
            </div>
            {errors.firstName && (
              <p className="text-red-400 text-sm flex items-center gap-1">
                <span className="w-1 h-1 bg-red-400 rounded-full" />
                {errors.firstName}
              </p>
            )}
          </div>

          {/* Last Name */}
          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-[#D4AF37] text-sm font-medium flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#D4AF37]/20 flex items-center justify-center">
                <User className="w-3 h-3 text-[#D4AF37]" />
              </div>
              Soyadınız
            </Label>
            <div className="relative">
              <Input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="örn: Saltık"
                className="bg-white/5 border-[#D4AF37]/30 text-[#D4AF37] placeholder:text-[#D4AF37]/30 focus:border-[#D4AF37] focus:ring-[#D4AF37]/30 h-14 text-lg rounded-xl"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#D4AF37]/30">
                <Sparkles className="w-5 h-5" />
              </div>
            </div>
            {errors.lastName && (
              <p className="text-red-400 text-sm flex items-center gap-1">
                <span className="w-1 h-1 bg-red-400 rounded-full" />
                {errors.lastName}
              </p>
            )}
          </div>

          {/* Birth Date */}
          <div className="space-y-2">
            <Label htmlFor="birthDate" className="text-[#D4AF37] text-sm font-medium flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#D4AF37]/20 flex items-center justify-center">
                <Calendar className="w-3 h-3 text-[#D4AF37]" />
              </div>
              Doğum Tarihiniz
            </Label>
            <div className="relative">
              <Input
                id="birthDate"
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="bg-white/5 border-[#D4AF37]/30 text-[#D4AF37] focus:border-[#D4AF37] focus:ring-[#D4AF37]/30 h-14 text-lg rounded-xl [color-scheme:dark]"
              />
            </div>
            {birthDate && (
              <p className="text-[#D4AF37]/60 text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Seçilen: <span className="text-[#D4AF37] font-medium">{formatDate(birthDate)}</span>
              </p>
            )}
            {errors.birthDate && (
              <p className="text-red-400 text-sm flex items-center gap-1">
                <span className="w-1 h-1 bg-red-400 rounded-full" />
                {errors.birthDate}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-[#D4AF37] via-[#C4A030] to-[#B8960C] hover:from-[#E4C447] hover:via-[#D4B040] hover:to-[#C8A61C] text-black font-bold py-6 text-xl tracking-wide transition-all duration-500 rounded-xl shadow-[0_0_30px_rgba(212,175,55,0.3)] hover:shadow-[0_0_50px_rgba(212,175,55,0.5)] group relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center justify-center gap-3">
                <Sparkles className="w-6 h-6 group-hover:animate-spin" />
                Kaderini Çöz
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </Button>
          </div>

          {/* Disclaimer */}
          <div className="text-center pt-4">
            <p className="text-[#D4AF37]/40 text-sm italic">
              "Sayılar seni izliyor. Hazır olduğunda dokun."
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
