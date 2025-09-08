import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface GeometricShapesProps {
  shapeCount?: number;
  shapes?: ('circle' | 'square' | 'triangle')[];
  size?: 'small' | 'medium' | 'large';
  opacity?: number;
}

export const GeometricShapes: React.FC<GeometricShapesProps> = ({
  shapeCount = 8,
  shapes = ['circle', 'square', 'triangle'],
  size = 'medium',
  opacity = 0.1
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const getSize = () => {
    switch (size) {
      case 'small': return { min: 8, max: 16 };
      case 'medium': return { min: 12, max: 24 };
      case 'large': return { min: 16, max: 32 };
      default: return { min: 12, max: 24 };
    }
  };

  const sizeRange = getSize();
  const baseColor = isDark ? 'rgb(59, 130, 246)' : 'rgb(37, 99, 235)';

  const renderShape = (shape: string, size: number, x: number, y: number, rotation: number, delay: number) => {
    const style = {
      position: 'absolute' as const,
      left: `${x}%`,
      top: `${y}%`,
      width: `${size}px`,
      height: `${size}px`,
      opacity,
      transform: `rotate(${rotation}deg)`,
      animation: `shape-float ${3 + Math.random() * 2}s ease-in-out infinite`,
      animationDelay: `${delay}s`
    };

    switch (shape) {
      case 'circle':
        return (
          <div
            key={`${shape}-${x}-${y}`}
            className="rounded-full"
            style={{
              ...style,
              backgroundColor: baseColor
            }}
          />
        );
      case 'square':
        return (
          <div
            key={`${shape}-${x}-${y}`}
            style={{
              ...style,
              backgroundColor: baseColor
            }}
          />
        );
      case 'triangle':
        return (
          <div
            key={`${shape}-${x}-${y}`}
            style={{
              ...style,
              width: 0,
              height: 0,
              borderLeft: `${size/2}px solid transparent`,
              borderRight: `${size/2}px solid transparent`,
              borderBottom: `${size}px solid ${baseColor}`,
              backgroundColor: 'transparent'
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes shape-float {
            0%, 100% {
              transform: translateY(0px) rotate(0deg) scale(1);
            }
            25% {
              transform: translateY(-10px) rotate(90deg) scale(1.1);
            }
            50% {
              transform: translateY(-5px) rotate(180deg) scale(0.9);
            }
            75% {
              transform: translateY(-15px) rotate(270deg) scale(1.05);
            }
          }
        `
      }} />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: shapeCount }).map((_, i) => {
          const shape = shapes[i % shapes.length];
          const shapeSize = Math.random() * (sizeRange.max - sizeRange.min) + sizeRange.min;
          const x = Math.random() * 100;
          const y = Math.random() * 100;
          const rotation = Math.random() * 360;
          const delay = Math.random() * 3;

          return renderShape(shape, shapeSize, x, y, rotation, delay);
        })}
      </div>
    </>
  );
};
