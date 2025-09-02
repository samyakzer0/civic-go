import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { RetroGrid } from '../magicui/retro-grid';
import { cn } from "../../lib/utils";

interface AnimatedBackgroundProps {
  children: React.ReactNode;
  className?: string;
}

const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({ children, className }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Set up the background style
  const backgroundStyle = isDark 
    ? {
        background: '#000000' // Pitch black for dark mode
      }
    : {
        background: '#ffffff' // Pure white for light mode
      };

  return (
    <div className={cn("min-h-screen relative overflow-hidden", className)} style={backgroundStyle}>
      {/* Retro Grid Background */}
      <RetroGrid 
        angle={60}
        cellSize={50}
        opacity={isDark ? 0.5 : 0.5}
        lightLineColor={isDark ? "#ffffff" : "#000000"} // Pure white for dark mode, black for light mode
        darkLineColor={isDark ? "#ffffff" : "#000000"} // Pure white for dark mode, black for light mode
        className="fixed inset-0"
      />
      
      {/* Additional ambient lighting effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className={`absolute top-0 left-0 w-full h-full ${
          isDark 
            ? 'bg-gradient-to-tr from-blue-500/5 via-transparent to-purple-500/5' 
            : 'bg-gradient-to-tr from-gray-300/5 via-transparent to-gray-500/5'
        }`} />
        
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/2 h-1/2 blur-3xl ${
          isDark 
            ? 'bg-blue-500/10' 
            : 'bg-gray-300/10'
        } rounded-full`} />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default AnimatedBackground;
