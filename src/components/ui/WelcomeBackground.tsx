import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { RetroGrid } from '../magicui/retro-grid';
import { cn } from "../../lib/utils";

interface WelcomeBackgroundProps {
  children: React.ReactNode;
  className?: string;
}

const WelcomeBackground: React.FC<WelcomeBackgroundProps> = ({ children, className }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Set up the background style for welcome page
  const backgroundStyle = isDark 
    ? {
        background: '#000000' // Pitch black for dark mode
      }
    : {
        background: '#ffffff' // Pure white for light mode
      };

  return (
    <div className={cn("min-h-screen relative overflow-hidden", className)} style={backgroundStyle}>
      {/* Retro Grid Background with different settings for welcome page */}
      <RetroGrid 
        angle={75}
        cellSize={70}
        opacity={isDark ? 0.5 : 0.5}
        lightLineColor={isDark ? "#ffffff" : "#000000"} // Pure white for dark mode, black for light mode
        darkLineColor={isDark ? "#ffffff" : "#000000"} // Pure white for dark mode, black for light mode
        className="fixed inset-0"
      />
      
      {/* Additional ambient lighting for welcome page */}
      <div className="fixed inset-0 pointer-events-none">
        <div className={`absolute top-0 left-0 w-full h-full ${
          isDark 
            ? 'bg-gradient-to-b from-blue-500/5 via-transparent to-indigo-500/5' 
            : 'bg-gradient-to-b from-gray-500/5 via-transparent to-gray-400/5'
        }`} />
        
        <div className={`absolute bottom-0 left-0 w-full h-1/3 ${
          isDark 
            ? 'bg-gradient-to-t from-blue-500/10 to-transparent' 
            : 'bg-gradient-to-t from-gray-400/10 to-transparent'
        }`} />
        
        {/* Star-like dots for dark theme */}
        {isDark && (
          <>
            <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white rounded-full opacity-60"></div>
            <div className="absolute top-1/3 left-2/3 w-1 h-1 bg-white rounded-full opacity-40"></div>
            <div className="absolute top-2/3 left-1/5 w-1.5 h-1.5 bg-white rounded-full opacity-50"></div>
            <div className="absolute top-1/5 left-3/4 w-1 h-1 bg-white rounded-full opacity-30"></div>
          </>
        )}
      </div>

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default WelcomeBackground;
