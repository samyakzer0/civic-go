import React from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

interface AnimatedBackgroundProps {
  className?: string;
  lottieSrc?: string;
  intensity?: 'subtle' | 'medium' | 'intense';
}

const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({
  className = '',
  lottieSrc = "",
  intensity = 'medium'
}) => {
  const getOpacity = () => {
    switch (intensity) {
      case 'subtle': return 0.3;
      case 'medium': return 0.5;
      case 'intense': return 0.8;
      default: return 0.5;
    }
  };

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      <div className="absolute inset-0 flex items-center justify-right">
        <DotLottieReact
          src={lottieSrc = "https://lottie.host/4ad463de-f7a6-4dff-bd0c-52732ab2eaf9/5Is70O6oKS.lottie"}
          loop
          autoplay
          style={{
            width: '100%',
            height: '180%',
            opacity: getOpacity(),
            objectFit: 'cover',
          }}
        />
      </div>
    </div>
  );
};

export default AnimatedBackground;
