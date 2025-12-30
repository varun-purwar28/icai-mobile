import { useEffect, useState } from 'react';
import { Scale } from 'lucide-react';

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onFinish, 300); // Wait for fade out animation
    }, 2000); // Show splash for 2 seconds

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-50 hero-gradient flex flex-col items-center justify-center transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="flex flex-col items-center gap-4 animate-fade-in-up">
        <div className="icai-emblem animate-pulse-gold">
          <Scale className="w-12 h-12 text-accent-foreground" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-display font-bold text-primary-foreground mb-2">
            ICAI DTC & CITAX
          </h1>
          <p className="text-sm text-primary-foreground/70">
            Mobile Application
          </p>
        </div>
      </div>
    </div>
  );
}


