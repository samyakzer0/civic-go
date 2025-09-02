import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Upload, Mic, Search, Sparkles, Camera } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { translations } from '../utils/translations';

interface ReportPageProps {
  onNavigate: (page: string) => void;
  cameraActive?: boolean;
}

function ReportPage({ onNavigate, cameraActive = false }: ReportPageProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('123 Main St, Anytown, USA');
  const [category, setCategory] = useState('Water');
  const [image, setImage] = useState<string | null>(null);
  const { theme, language } = useTheme();
  const t = translations[language];
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    // Check if camera should be activated automatically
    if (cameraActive) {
      activateCamera();
    }
    
    // Clean up camera stream when component unmounts
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraActive]);

  const activateCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      setCameraStream(stream);
      setShowCamera(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access your camera. Please check permissions.");
    }
  };

  const takePicture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const dataUrl = canvas.toDataURL('image/jpeg');
        setImage(dataUrl);
        
        // Stop the camera stream
        if (cameraStream) {
          cameraStream.getTracks().forEach(track => track.stop());
          setCameraStream(null);
        }
        
        setShowCamera(false);
      }
    }
  };

  const categories = ['Water', 'Roads', 'Infrastructure', 'Sanitation', 'Streetlights', 'Others'];

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    // Mock submission
    alert('Report submitted successfully! You will receive updates on the status.');
    onNavigate('status');
  };

  return (
    <div>
      {/* Header */}
      <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b p-4`}>
        <div className="flex items-center gap-4">
          <button
            onClick={() => onNavigate('home')}
            className={`p-2 -ml-2 ${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'} transition-colors`}
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{t.reportIssue}</h1>
        </div>
      </div>

      <div className="p-6 pb-24 max-w-2xl mx-auto">
        <form className="space-y-6">
          {/* Title */}
          <div>
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              {t.title}
            </label>
            <div className="relative">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="AI-assisted auto-suggest"
                className={`w-full p-4 ${
                  theme === 'dark' 
                    ? 'border-gray-700 bg-gray-800 text-white focus:ring-blue-600' 
                    : 'border-gray-300 bg-white text-gray-800 focus:ring-blue-500'
                } border rounded-xl focus:ring-2 focus:border-transparent transition-all`}
              />
              <Sparkles className={`absolute right-4 top-1/2 transform -translate-y-1/2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} size={20} />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              {t.briefDescription}
            </label>
            <div className="relative">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Text or voice input"
                rows={4}
                className={`w-full p-4 ${
                  theme === 'dark' 
                    ? 'border-gray-700 bg-gray-800 text-white focus:ring-blue-600' 
                    : 'border-gray-300 bg-white text-gray-800 focus:ring-blue-500'
                } border rounded-xl focus:ring-2 focus:border-transparent transition-all resize-none`}
              />
              <button
                type="button"
                className={`absolute bottom-4 right-4 p-2 ${
                  theme === 'dark'
                    ? 'text-blue-400 hover:bg-gray-700'
                    : 'text-blue-600 hover:bg-blue-50'
                } rounded-lg transition-colors`}
              >
                <Mic size={20} />
              </button>
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t.imageUpload}
              </label>
              {!showCamera && !image && (
                <button 
                  type="button" 
                  onClick={activateCamera}
                  className={`flex items-center gap-1 text-sm ${
                    theme === 'dark' 
                      ? 'text-blue-400 hover:text-blue-300' 
                      : 'text-blue-600 hover:text-blue-500'
                  }`}
                >
                  <Camera size={16} />
                  <span>Take Photo</span>
                </button>
              )}
            </div>
            
            {showCamera ? (
              <div className="relative">
                <video 
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-48 sm:h-64 md:h-80 object-cover rounded-xl border-2 ${
                    theme === 'dark' ? 'border-blue-700' : 'border-blue-500'
                  }`}
                />
                <canvas ref={canvasRef} className="hidden" />
                <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                  <button
                    type="button"
                    onClick={takePicture}
                    className="bg-white text-gray-800 p-3 rounded-full hover:bg-gray-100 transition-colors shadow-lg"
                  >
                    <div className="w-6 h-6 border-2 border-gray-800 rounded-full" />
                  </button>
                </div>
              </div>
            ) : image ? (
              <div className="relative">
                <img
                  src={image}
                  alt="Uploaded"
                  className={`w-full h-48 sm:h-64 md:h-80 object-cover rounded-xl border-2 border-dashed ${theme === 'dark' ? 'border-gray-700' : 'border-gray-300'}`}
                />
                <button
                  type="button"
                  onClick={() => setImage(null)}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                >
                  ×
                </button>
              </div>
            ) : (
              <label className={`flex flex-col items-center justify-center w-full h-48 sm:h-64 md:h-80 border-2 border-dashed ${
                theme === 'dark'
                  ? 'border-gray-700 bg-gray-800 hover:bg-gray-700'
                  : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
              } rounded-xl cursor-pointer transition-colors`}>
                <Upload className={theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} size={32} />
                <span className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}>Upload a file</span>
                <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>or drag and drop</span>
                <span className={`${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} text-xs mt-1`}>PNG, JPG, GIF up to 10MB</span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </label>
            )}
          </div>

          {/* Location */}
          <div>
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              {t.location}
            </label>
            <div className="relative">
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className={`w-full p-4 ${
                  theme === 'dark' 
                    ? 'border-gray-700 bg-gray-800 text-white focus:ring-blue-600' 
                    : 'border-gray-300 bg-white text-gray-800 focus:ring-blue-500'
                } border rounded-xl focus:ring-2 focus:border-transparent transition-all pr-12`}
              />
              <button
                type="button"
                className={`absolute right-4 top-1/2 transform -translate-y-1/2 ${
                  theme === 'dark'
                    ? 'text-blue-400 hover:bg-gray-700'
                    : 'text-blue-600 hover:bg-blue-50'
                } p-2 rounded-lg transition-colors`}
              >
                <Search size={20} />
              </button>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              {t.category}
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={`w-full p-4 ${
                theme === 'dark' 
                  ? 'border-gray-700 bg-gray-800 text-white focus:ring-blue-600' 
                  : 'border-gray-300 bg-white text-gray-800 focus:ring-blue-500'
              } border rounded-xl focus:ring-2 focus:border-transparent transition-all appearance-none`}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="button"
            onClick={handleSubmit}
            className={`w-full ${
              theme === 'dark'
                ? 'bg-blue-700 hover:bg-blue-800'
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white py-4 rounded-xl font-semibold text-lg transition-colors shadow-lg`}
          >
            {t.submitReport}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ReportPage;