import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface WaveAnimationProps {
  waveCount?: number;
  amplitude?: number;
  speed?: 'slow' | 'medium' | 'fast';
  color?: string;
}

export const WaveAnimation: React.FC<WaveAnimationProps> = ({
  waveCount = 3,
  amplitude = 20,
  speed = 'medium',
  color
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const getSpeed = () => {
    switch (speed) {
      case 'slow': return 8;
      case 'medium': return 6;
      case 'fast': return 4;
      default: return 6;
    }
  };

  const waveSpeed = getSpeed();
  const defaultColor = isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.15)';

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes wave-flow {
            0%, 100% {
              transform: translateX(0px);
            }
            50% {
              transform: translateX(-25px);
            }
          }
        `
      }} />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <svg
          className="absolute bottom-0 w-full h-full"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          {Array.from({ length: waveCount }).map((_, i) => {
            const offset = i * 20;
            const waveAmplitude = amplitude + (i * 5);
            const animationDelay = i * 0.5;

            return (
              <path
                key={i}
                d={`M0,${60 + offset} Q300,${60 + offset - waveAmplitude} 600,${60 + offset} T1200,${60 + offset} V120 H0 Z`}
                fill={color || defaultColor}
                style={{
                  animation: `wave-flow ${waveSpeed}s ease-in-out infinite`,
                  animationDelay: `${animationDelay}s`
                }}
              />
            );
          })}
        </svg>
      </div>
    </>
  );
};
