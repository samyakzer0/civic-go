import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface FloatingParticlesProps {
  count?: number;
  colors?: string[];
  size?: 'small' | 'medium' | 'large';
}

export const FloatingParticles: React.FC<FloatingParticlesProps> = ({
  count = 12,
  colors = ['blue', 'green', 'purple', 'pink'],
  size = 'medium'
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const getSize = () => {
    switch (size) {
      case 'small': return { min: 2, max: 4 };
      case 'medium': return { min: 3, max: 6 };
      case 'large': return { min: 4, max: 8 };
      default: return { min: 3, max: 6 };
    }
  };

  const sizeRange = getSize();

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes particle-float-0 {
            0%, 100% { transform: translateY(0px) translateX(0px) scale(1); }
            25% { transform: translateY(-15px) translateX(8px) scale(1.1); }
            50% { transform: translateY(-8px) translateX(-6px) scale(0.9); }
            75% { transform: translateY(-20px) translateX(4px) scale(1.05); }
          }

          @keyframes particle-float-1 {
            0%, 100% { transform: translateY(0px) translateX(0px) scale(1); }
            25% { transform: translateY(-12px) translateX(-5px) scale(1.1); }
            50% { transform: translateY(-18px) translateX(7px) scale(0.9); }
            75% { transform: translateY(-10px) translateX(-3px) scale(1.05); }
          }

          @keyframes particle-float-2 {
            0%, 100% { transform: translateY(0px) translateX(0px) scale(1); }
            25% { transform: translateY(-16px) translateX(6px) scale(1.1); }
            50% { transform: translateY(-12px) translateX(-8px) scale(0.9); }
            75% { transform: translateY(-22px) translateX(2px) scale(1.05); }
          }

          @keyframes particle-float-3 {
            0%, 100% { transform: translateY(0px) translateX(0px) scale(1); }
            25% { transform: translateY(-14px) translateX(-7px) scale(1.1); }
            50% { transform: translateY(-20px) translateX(5px) scale(0.9); }
            75% { transform: translateY(-16px) translateX(-4px) scale(1.05); }
          }
        `
      }} />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: count }).map((_, i) => {
          const particleSize = Math.random() * (sizeRange.max - sizeRange.min) + sizeRange.min;
          const colorIndex = i % colors.length;
          const delay = Math.random() * 3;
          const duration = Math.random() * 4 + 3;
          const x = Math.random() * 100;
          const y = Math.random() * 100;

          const colorClasses = {
            blue: isDark ? 'bg-blue-400/30' : 'bg-blue-500/40',
            green: isDark ? 'bg-green-400/30' : 'bg-green-500/40',
            purple: isDark ? 'bg-purple-400/30' : 'bg-purple-500/40',
            pink: isDark ? 'bg-pink-400/30' : 'bg-pink-500/40'
          };

          return (
            <div
              key={i}
              className={`absolute rounded-full ${colorClasses[colors[colorIndex] as keyof typeof colorClasses]} animate-pulse`}
              style={{
                width: `${particleSize}px`,
                height: `${particleSize}px`,
                left: `${x}%`,
                top: `${y}%`,
                animationDelay: `${delay}s`,
                animationDuration: `${duration}s`,
                animation: `particle-float-${i % 4} ${duration}s ease-in-out infinite`
              }}
            />
          );
        })}
      </div>
    </>
  );
};
