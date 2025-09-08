import React from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

interface LoaderProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
  className?: string;
  showMessage?: boolean;
}

const Loader: React.FC<LoaderProps> = ({
  size = 'medium',
  message = 'Loading...',
  className = '',
  showMessage = true
}) => {
  const getSize = () => {
    switch (size) {
      case 'small': return { width: '60px', height: '60px' };
      case 'medium': return { width: '100px', height: '100px' };
      case 'large': return { width: '150px', height: '150px' };
      default: return { width: '100px', height: '100px' };
    }
  };

  const sizeStyle = getSize();

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <DotLottieReact
        src="https://lottie.host/8aa82754-1354-48f4-9585-53782cd4c3a6/usxsxm4ty6.lottie"
        loop
        autoplay
        style={{
          width: sizeStyle.width,
          height: sizeStyle.height,
          opacity: 0.8
        }}
      />
      {showMessage && (
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
};

export default Loader;
