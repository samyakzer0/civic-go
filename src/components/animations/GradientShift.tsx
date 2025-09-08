import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface GradientShiftProps {
  colors?: string[];
  speed?: 'slow' | 'medium' | 'fast';
  direction?: 'horizontal' | 'vertical' | 'diagonal';
}

export const GradientShift: React.FC<GradientShiftProps> = ({
  colors = ['blue', 'purple', 'pink', 'green'],
  speed = 'medium',
  direction = 'diagonal'
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

  const getGradientColors = () => {
    const colorMap = {
      blue: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(37, 99, 235, 0.15)',
      purple: isDark ? 'rgba(147, 51, 234, 0.1)' : 'rgba(124, 58, 237, 0.15)',
      pink: isDark ? 'rgba(236, 72, 153, 0.1)' : 'rgba(219, 39, 119, 0.15)',
      green: isDark ? 'rgba(34, 197, 94, 0.1)' : 'rgba(22, 163, 74, 0.15)',
      cyan: isDark ? 'rgba(6, 182, 212, 0.1)' : 'rgba(8, 145, 178, 0.15)',
      orange: isDark ? 'rgba(249, 115, 22, 0.1)' : 'rgba(234, 88, 12, 0.15)'
    };

    return colors.map(color => colorMap[color as keyof typeof colorMap] || colorMap.blue);
  };

  const getGradientDirection = () => {
    switch (direction) {
      case 'horizontal':
        return 'linear-gradient(90deg, ';
      case 'vertical':
        return 'linear-gradient(180deg, ';
      case 'diagonal':
        return 'linear-gradient(135deg, ';
      default:
        return 'linear-gradient(135deg, ';
    }
  };

  const gradientColors = getGradientColors();
  const gradientDirection = getGradientDirection();
  const animationSpeed = getSpeed();

  const gradientStops = gradientColors.map((color, index) => {
    const position = (index / (gradientColors.length - 1)) * 100;
    return `${color} ${position}%`;
  }).join(', ');

  const gradientString = `${gradientDirection}${gradientStops})`;

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes gradient-shift {
            0%, 100% {
              background-position: 0% 50%;
            }
            50% {
              background-position: 100% 50%;
            }
          }
        `
      }} />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            background: gradientString,
            animation: `gradient-shift ${animationSpeed}s ease-in-out infinite`
          }}
        />
      </div>
    </>
  );
};
