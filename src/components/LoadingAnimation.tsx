import { useEffect, useState } from 'react';

interface LoadingAnimationProps {
  onComplete: () => void;
}

const loadingMessages = [
  "Sayıların karanlık dehlizlerine iniliyor...",
  "Harflerin ruhları çözülüyor...",
  "Kader kodların okunuyor...",
  "Evrenin gizli frekansları taranıyor...",
  "Kişisel yıl döngün hesaplanıyor...",
  "Sayıların sana fısıldadıkları derleniyor...",
  "Karmik imzalar araştırılıyor...",
  "Geleceğin gölgesi inceleniyor...",
  "Ruhunun frekansı ölçülüyor...",
  "Kaderinin anahtarı dövülüyor..."
];

export function LoadingAnimation({ onComplete }: LoadingAnimationProps) {
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setTimeout(onComplete, 800);
          return 100;
        }
        return prev + 1.2;
      });
    }, 50);

    const messageInterval = setInterval(() => {
      setMessageIndex(prev => (prev + 1) % loadingMessages.length);
    }, 1200);

    return () => {
      clearInterval(progressInterval);
      clearInterval(messageInterval);
    };
  }, [onComplete]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a] relative overflow-hidden">
      {/* Falling Numbers Animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(25)].map((_, i) => (
          <div
            key={i}
            className="absolute text-[#D4AF37]/20 font-bold animate-fall"
            style={{
              top: `${-10 - Math.random() * 20}%`,
              left: `${Math.random() * 100}%`,
              fontSize: `${20 + Math.random() * 40}px`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${4 + Math.random() * 4}s`,
              animationIterationCount: 'infinite'
            }}
          >
            {Math.floor(Math.random() * 9) + 1}
          </div>
        ))}
      </div>

      {/* Central Logo with Glow */}
      <div className="relative mb-16">
        {/* Outer glow rings */}
        <div className="absolute inset-0 w-48 h-48 -m-6 rounded-full bg-gradient-to-r from-[#D4AF37]/30 via-purple-500/30 to-[#D4AF37]/30 blur-2xl animate-pulse" />
        <div className="absolute inset-0 w-48 h-48 -m-6 rounded-full border-2 border-[#D4AF37]/30 animate-spin" style={{ animationDuration: '15s' }} />
        
        {/* Logo */}
        <div className="relative w-36 h-36 rounded-full overflow-hidden border-2 border-[#D4AF37]/50 shadow-[0_0_50px_rgba(212,175,55,0.4)] animate-glow">
          <img 
            src="/avatars/kader-matrisi-logo.png" 
            alt="Kader Matrisi" 
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Orbiting particles */}
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="absolute inset-0 animate-spin"
            style={{ 
              animationDuration: `${4 + i * 2}s`,
              animationDelay: `${i * 0.5}s`
            }}
          >
            <div 
              className="absolute w-3 h-3 rounded-full bg-[#D4AF37]"
              style={{ 
                top: '0%',
                left: '50%',
                transform: 'translateX(-50%)',
                boxShadow: '0 0 15px #D4AF37'
              }}
            />
          </div>
        ))}
      </div>

      {/* Bold Loading Text */}
      <div className="text-center mb-12 relative z-10 px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-[#D4AF37] mb-4 tracking-wider drop-shadow-[0_0_10px_rgba(212,175,55,0.5)]">
          KADERİN ANALİZ EDİLİYOR
        </h2>
        <p className="text-[#D4AF37]/80 text-lg md:text-xl font-medium tracking-wide animate-pulse min-h-[2rem]">
          {loadingMessages[messageIndex]}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="w-80 md:w-96 h-4 bg-white/10 rounded-full overflow-hidden relative border border-[#D4AF37]/20">
        <div 
          className="h-full bg-gradient-to-r from-purple-600 via-[#D4AF37] to-purple-600 transition-all duration-100 ease-out relative"
          style={{ width: `${progress}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
        </div>
      </div>

      {/* Progress Percentage */}
      <p className="mt-6 text-[#D4AF37] text-2xl font-bold font-mono drop-shadow-[0_0_5px_rgba(212,175,55,0.5)]">
        {Math.floor(progress)}%
      </p>

      {/* Mystic Quote */}
      <p className="mt-10 text-white/40 text-base italic text-center max-w-md px-4">
        "Sayılar yalan söylemez. Sadece sen dinlemeyi unutmuş olabilirsin."
      </p>

      <style>{`
        @keyframes fall {
          0% { transform: translateY(-100vh) rotate(0deg); opacity: 0; }
          10% { opacity: 0.3; }
          90% { opacity: 0.3; }
          100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
        }
        .animate-fall {
          animation-name: fall;
          animation-timing-function: linear;
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 1.5s infinite;
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 30px rgba(212, 175, 55, 0.4); }
          50% { box-shadow: 0 0 50px rgba(212, 175, 55, 0.7); }
        }
        .animate-glow {
          animation: glow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
