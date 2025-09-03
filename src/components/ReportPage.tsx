import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Upload, Mic, MapPin, Camera, Loader2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { translations } from '../utils/translations';
import AIAnalysis from './AIAnalysis';
import LocationMap from './LocationMap';
import ReportConfirmationModal from './ReportConfirmationModal';
import { analyzeImage } from '../services/AIService';
import { getCurrentLocation, submitReport } from '../services/ReportService';

interface ReportPageProps {
  onNavigate: (page: string) => void;
  cameraActive?: boolean;
  userId?: string;
}

function ReportPage({ onNavigate, cameraActive = false, userId = 'anon_user' }: ReportPageProps) {
  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Water');
  const [image, setImage] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number, lng: number, address: string }>({
    lat: 28.6139, 
    lng: 77.2090, 
    address: 'Connaught Place, New Delhi, India'
  });
  
  // UI states
  const { theme, language } = useTheme();
  const t = translations[language];
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  
  // AI Analysis states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<{
    title: string;
    category: string;
    description: string;
    confidence: number;
  } | null>(null);
  
  // Location states
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [showLocationMap, setShowLocationMap] = useState(false);
  
  // Report submission states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [submittedReportId, setSubmittedReportId] = useState('');
  
  // Categories supported by the app
  const categories = ['Water', 'Electricity', 'Infrastructure', 'Sanitation', 'Roads', 'Others'];

  useEffect(() => {
    // Check if camera should be activated automatically
    if (cameraActive) {
      setTimeout(() => {
        activateCamera();
      }, 500); // Small delay to ensure component is fully mounted
    }
    
    // Try to get user's current location when component mounts
    fetchCurrentLocation();
    
    // Clean up camera stream when component unmounts
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraActive]);

  const fetchCurrentLocation = async () => {
    try {
      setIsLoadingLocation(true);
      const currentLocation = await getCurrentLocation();
      setLocation(currentLocation);
    } catch (error) {
      console.error('Error fetching location:', error);
      // Keep default location in case of error
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const activateCamera = async () => {
    try {
      // First, stop any existing stream
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }

      const constraints = { 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      setCameraStream(stream);
      setShowCamera(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(e => {
            console.error("Error playing video:", e);
          });
        };
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access your camera. Please check permissions.");
    }
  };

  const takePicture = async () => {
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
        
        // Analyze the image with AI
        analyzeWithAI(dataUrl);
      }
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result as string;
        setImage(imageData);
        
        // Analyze the uploaded image with AI
        analyzeWithAI(imageData);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeWithAI = async (imageData: string) => {
    try {
      setIsAnalyzing(true);
      console.log("Starting image analysis with Cloud Vision API...");
      
      const result = await analyzeImage(imageData);
      console.log("AI analysis result:", result);
      
      setAiResult(result);
      
      // Pre-fill the form with AI suggestions
      setTitle(result.title);
      setCategory(result.category);
      setDescription(result.description);
      
      console.log("Form pre-filled with AI suggestions");
    } catch (error) {
      console.error('Error analyzing image:', error);
      // Don't set the AI result if there's an error
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAcceptAI = () => {
    // AI suggestions already applied to form, just acknowledge
    // This could show a confirmation toast or animation
    setAiResult(null); // Hide the AI component
  };

  const handleRejectAI = () => {
    // Clear the AI suggestions
    setAiResult(null);
  };

  const handleSubmit = async () => {
    if (!title || !description || !category) {
      alert('Please fill in all required fields');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Submit the report
      const response = await submitReport(
        title,
        description,
        category,
        location,
        image,
        userId
      );
      
      if (response.success) {
        setSubmittedReportId(response.report_id);
        setShowConfirmation(true);
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLocationChange = (newLocation: { lat: number, lng: number, address: string }) => {
    setLocation(newLocation);
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b p-4 md:rounded-t-xl`}>
        <div className="flex items-center gap-4">
          <button
            onClick={() => onNavigate('home')}
            className={`p-2 ${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'} transition-colors`}
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{t.reportIssue}</h1>
        </div>
      </div>

      <div className="p-6 pb-24 max-w-2xl mx-auto">
        <form className="space-y-6">
          {/* Image Upload - Moved to top for better user flow */}
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
                  <span>{t.takePhoto}</span>
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
                <div className="absolute inset-0 flex flex-col justify-between p-4">
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        if (cameraStream) {
                          cameraStream.getTracks().forEach(track => track.stop());
                          setCameraStream(null);
                        }
                        setShowCamera(false);
                      }}
                      className="bg-gray-900/50 text-white p-2 rounded-full hover:bg-gray-900/70 transition-colors"
                    >
                      <span className="text-xl font-bold">×</span>
                    </button>
                  </div>
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={takePicture}
                      className="bg-white text-gray-800 p-4 rounded-full hover:bg-gray-100 transition-colors shadow-lg"
                    >
                      <div className="w-6 h-6 border-2 border-gray-800 rounded-full" />
                    </button>
                  </div>
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
                  onClick={() => {
                    setImage(null);
                    setAiResult(null);
                  }}
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
          
          {/* AI Analysis results */}
          {(isAnalyzing || aiResult) && (
            <AIAnalysis 
              isAnalyzing={isAnalyzing}
              result={aiResult}
              onAccept={handleAcceptAI}
              onReject={handleRejectAI}
            />
          )}

          {/* Title */}
          <div>
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              {t.title}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t.title}
              className={`w-full p-4 ${
                theme === 'dark' 
                  ? 'border-gray-700 bg-gray-800 text-white focus:ring-blue-600' 
                  : 'border-gray-300 bg-white text-gray-800 focus:ring-blue-500'
              } border rounded-xl focus:ring-2 focus:border-transparent transition-all`}
            />
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
                placeholder={t.briefDescription}
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

          {/* Location */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t.location}
              </label>
              <button
                type="button"
                onClick={fetchCurrentLocation}
                className={`flex items-center gap-1 text-sm ${
                  theme === 'dark' 
                    ? 'text-blue-400 hover:text-blue-300' 
                    : 'text-blue-600 hover:text-blue-500'
                } ${isLoadingLocation ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isLoadingLocation}
              >
                {isLoadingLocation ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <MapPin size={16} />
                )}
                <span>{t.useLocation}</span>
              </button>
            </div>
            
            {/* Location Map */}
            <div 
              onClick={() => setShowLocationMap(!showLocationMap)}
              className="mb-2 cursor-pointer"
            >
              <LocationMap 
                location={location} 
                onLocationChange={handleLocationChange} 
                editable={showLocationMap}
              />
            </div>
            
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowLocationMap(!showLocationMap)}
                className={`text-sm ${
                  theme === 'dark' 
                    ? 'text-blue-400 hover:text-blue-300' 
                    : 'text-blue-600 hover:text-blue-500'
                }`}
              >
                {showLocationMap ? t.confirmSubmit : t.changeLocation}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !title || !description || !category}
            className={`w-full ${
              theme === 'dark'
                ? 'bg-blue-700 hover:bg-blue-800'
                : 'bg-blue-600 hover:bg-blue-700'
            } ${(isSubmitting || !title || !description || !category) ? 'opacity-60 cursor-not-allowed' : ''} text-white py-4 rounded-xl font-semibold text-lg transition-colors shadow-lg flex items-center justify-center gap-2`}
          >
            {isSubmitting && <Loader2 size={20} className="animate-spin" />}
            {isSubmitting ? t.processingImage : t.submitReport}
          </button>
        </form>
      </div>

      {/* Confirmation Modal */}
      <ReportConfirmationModal
        isOpen={showConfirmation}
        onClose={() => {
          setShowConfirmation(false);
          onNavigate('home');
        }}
        reportId={submittedReportId}
        onViewStatus={() => {
          setShowConfirmation(false);
          onNavigate('status');
        }}
      />
    </div>
  );
}

export default ReportPage;