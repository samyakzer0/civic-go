import { Camera } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';

interface CameraButtonProps {
  className?: string;
  onNavigate: (page: string) => void;
}

const CameraButton = ({ className, onNavigate }: CameraButtonProps) => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  
  const handleCameraClick = () => {
    // Navigate to report page with camera mode active
    onNavigate('report?camera=true');
  };
  
  return (
    <motion.button
      onClick={handleCameraClick}
      className={`p-2 ${
        isDarkMode
          ? 'text-gray-300 hover:text-white'
          : 'text-gray-600 hover:text-gray-800'
      } transition-colors ${className || ''}`}
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.1 }}
      aria-label="Open camera"
    >
      <Camera size={24} />
    </motion.button>
  );
};

export default CameraButton;
